# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time chat application built with Next.js that integrates with OpenAI's GPT-4o model and Web Search tool. Users can create multiple chats, each with auto-generated titles, and engage in conversations with AI that can search the web for current information.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio GUI
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **AI Integration**: OpenAI GPT-4o with Web Search tool
- **Streaming**: Server-Sent Events (SSE) for real-time responses

### Key Components
- `app/page.tsx` - Main chat interface with sidebar and message area
- `components/ChatSidebar.tsx` - Chat list and navigation
- `components/ChatMessage.tsx` - Individual message display
- `components/ChatInput.tsx` - Message input with send functionality
- `app/api/chat/route.ts` - Streaming chat API with OpenAI integration
- `app/api/chats/route.ts` - Chat CRUD operations
- `lib/openai.ts` - OpenAI client configuration
- `lib/db.ts` - Prisma database client

### Database Schema
- `Chat` - Stores chat sessions with auto-generated titles
- `Message` - Stores individual messages with role (user/assistant)

### Environment Variables
- `OPENAI_API_KEY` - OpenAI API key for GPT-4o access
- `DATABASE_URL` - SQLite database file path

## Features

- Real-time streaming responses from OpenAI
- Web search integration with two tools:
  - `web_search` - Searches for current information and news
  - `fetch_webpage` - Analyzes specific URLs and provides summaries
- Auto-generated chat titles based on first user message
- Persistent chat history with SQLite storage
- Responsive design with sidebar navigation
- Chat management (create, delete, switch between chats)

## Web Search Implementation

The application includes custom web search tools that the AI can use automatically:

1. **Web Search Tool**: Activated when users ask about current events, news, or recent information
2. **Webpage Analysis Tool**: Activated when users provide URLs to analyze

The AI will intelligently choose when to use these tools based on the user's questions.