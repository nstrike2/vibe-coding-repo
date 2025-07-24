import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const tools = [
  {
    type: "function" as const,
    function: {
      name: "web_search",
      description: "Search the web for current information, news, or real-time data on any topic",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to find current information"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "fetch_webpage",
      description: "Fetch and analyze the content of a specific website URL",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL of the webpage to fetch and analyze"
          }
        },
        required: ["url"]
      }
    }
  }
]