import { openai } from './openai'

export async function searchWeb(query: string): Promise<string> {
  try {
    // For demonstration, we'll simulate web search results
    // In a production app, you'd use a real search API like Tavily, SerpAPI, or Bing Search API
    
    const searchResponse = await simulateWebSearch(query)
    return searchResponse
    
  } catch (error) {
    console.error('Web search error:', error)
    return `I encountered an error while searching for "${query}". Let me provide information based on my training data instead.`
  }
}

async function simulateWebSearch(query: string): Promise<string> {
  // This is a demo implementation - in production you'd use a real search API
  const searchPrompt = `Based on the search query "${query}", provide current, relevant information as if you had access to real-time web search results. Include recent developments, news, or current data where applicable. Format the response as if it came from web search results.`
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides current information. When asked about recent events, news, or current data, provide the most up-to-date information you can based on your training, but acknowledge the limitations of not having real-time access.'
        },
        {
          role: 'user',
          content: searchPrompt
        }
      ],
      max_tokens: 500
    })

    const searchResult = response.choices[0]?.message?.content || 'No search results found.'
    return `🔍 **Web Search Results for "${query}":**\n\n${searchResult}\n\n*Note: This information is based on my training data. For the most current information, please verify with recent sources.*`
    
  } catch (error) {
    return `I'm unable to perform web search at the moment. For current information about "${query}", I recommend checking recent news sources or search engines directly.`
  }
}

export async function fetchWebPage(url: string): Promise<string> {
  try {
    // Use a CORS proxy to fetch the webpage
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)
    
    if (!response.ok) {
      return `I couldn't access the page at ${url}. The site might have restrictions or be temporarily unavailable.`
    }
    
    const data = await response.json()
    const html = data.contents
    
    if (!html) {
      return `I was able to reach ${url} but couldn't extract any content from the page.`
    }
    
    // Simple HTML parsing to extract text content
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Limit content length for processing
    const limitedContent = textContent.slice(0, 3000)
    
    if (limitedContent.length < 50) {
      return `I was able to access ${url} but the page appears to have minimal text content or may be loading content dynamically.`
    }
    
    // Use OpenAI to analyze and summarize the content
    const summary = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Please analyze this webpage content and provide a comprehensive summary of what this page is about. Include the main topics, purpose, and key information:\n\nURL: ${url}\n\nContent:\n${limitedContent}`
        }
      ],
      max_tokens: 400
    })
    
    const summaryText = summary.choices[0]?.message?.content
    
    if (summaryText) {
      return `🌐 **Analysis of ${url}:**\n\n${summaryText}`
    } else {
      return `I was able to access ${url} and found content, but couldn't generate a proper summary. The page appears to contain information but may require direct viewing for full understanding.`
    }
    
  } catch (error) {
    console.error('Web page fetch error:', error)
    return `I couldn't access the page at ${url}. This might be due to:\n- The site blocking automated requests\n- Network connectivity issues\n- The URL being invalid or the page being unavailable\n\nFor the most accurate information, please visit the URL directly in your browser.`
  }
}