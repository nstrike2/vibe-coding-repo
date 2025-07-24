import { NextRequest, NextResponse } from 'next/server'
import { openai, tools } from '@/lib/openai'
import { prisma } from '@/lib/db'
import { searchWeb, fetchWebPage } from '@/lib/webSearch'

export async function POST(req: NextRequest) {
  try {
    const { chatId, message } = await req.json()

    // Save user message
    await prisma.message.create({
      data: {
        chatId,
        role: 'user',
        content: message,
      },
    })

    // Get chat history
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Format messages for OpenAI
    const messages = chat.messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // First, check if we need to use tools
    const initialResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools,
      tool_choice: 'auto',
    })

    const responseMessage = initialResponse.choices[0]?.message
    let toolResults: any[] = []

    // Handle tool calls if any
    if (responseMessage?.tool_calls) {
      toolResults = await Promise.all(
        responseMessage.tool_calls.map(async (toolCall) => {
          const { name, arguments: args } = toolCall.function
          const parsedArgs = JSON.parse(args)

          let result = ''
          if (name === 'web_search') {
            result = await searchWeb(parsedArgs.query)
          } else if (name === 'fetch_webpage') {
            result = await fetchWebPage(parsedArgs.url)
          }

          return {
            tool_call_id: toolCall.id,
            role: 'tool' as const,
            content: result,
          }
        })
      )

      // Add tool results to messages
      messages.push(responseMessage)
      messages.push(...toolResults)
    }

    // Create streaming response with updated messages
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      stream: true,
    })

    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta
            
            if (delta?.content) {
              fullResponse += delta.content
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`)
              )
            }
          }

          // Save assistant response
          if (fullResponse) {
            await prisma.message.create({
              data: {
                chatId,
                role: 'assistant',
                content: fullResponse,
              },
            })

            // Generate title if this is the first exchange
            if (chat.messages.length === 1 && !chat.title) {
              const titleResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                  {
                    role: 'user',
                    content: `Generate a short, descriptive title (max 6 words) for a chat that starts with: "${message}"`
                  }
                ],
                max_tokens: 20,
              })

              const title = titleResponse.choices[0]?.message?.content?.trim()
              if (title) {
                await prisma.chat.update({
                  where: { id: chatId },
                  data: { title },
                })
              }
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}