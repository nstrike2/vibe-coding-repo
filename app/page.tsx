'use client'

import { useState, useEffect, useRef } from 'react'
import ChatSidebar from '@/components/ChatSidebar'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface Chat {
  id: string
  title: string | null
  messages: Message[]
}

export default function HomePage() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', { method: 'POST' })
      const newChat = await response.json()
      setCurrentChatId(newChat.id)
      setCurrentChat({ ...newChat, messages: [] })
      setMessages([])
      setStreamingMessage('')
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  const loadChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`)
      const chat = await response.json()
      setCurrentChatId(chatId)
      setCurrentChat(chat)
      setMessages(chat.messages || [])
      setStreamingMessage('')
    } catch (error) {
      console.error('Error loading chat:', error)
    }
  }

  const sendMessage = async (content: string) => {
    if (!currentChatId) {
      await createNewChat()
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsStreaming(true)
    setStreamingMessage('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChatId,
          message: content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setIsStreaming(false)
              if (fullResponse) {
                const assistantMessage: Message = {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: fullResponse,
                  createdAt: new Date().toISOString(),
                }
                setMessages(prev => [...prev, assistantMessage])
              }
              setStreamingMessage('')
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                fullResponse += parsed.content
                setStreamingMessage(fullResponse)
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsStreaming(false)
      setStreamingMessage('')
    }
  }

  // Create initial chat on mount
  useEffect(() => {
    if (!currentChatId) {
      createNewChat()
    }
  }, [])

  return (
    <div className="flex h-full">
      <ChatSidebar
        currentChatId={currentChatId}
        onChatSelect={loadChat}
        onNewChat={createNewChat}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">OpenAI Chat with Web Search</h1>
                <p>Start a conversation to see the AI's web search capabilities in action!</p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {streamingMessage && (
                <ChatMessage
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: streamingMessage,
                    createdAt: new Date().toISOString(),
                  }}
                  isStreaming={true}
                />
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <ChatInput
          onSendMessage={sendMessage}
          disabled={isStreaming}
        />
      </div>
    </div>
  )
}