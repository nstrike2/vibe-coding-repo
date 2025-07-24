# OpenAI Chat with Web Search

A modern, full-stack chat application powered by OpenAI and enhanced with real-time web search capabilities. Built with Next.js 13+, TypeScript, Tailwind CSS, and Prisma.

---

## ✨ Features

- **Conversational AI**: Chat with an OpenAI-powered assistant.
- **Web Search Integration**: The assistant can search the web and fetch live information.
- **Chat History**: Persistent, timestamped chat sessions.
- **Streaming Responses**: See AI responses stream in real time.
- **Modern UI**: Responsive, accessible, and dark mode–ready.
- **MVVM Architecture**: Clean separation of concerns for maintainability.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+ (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, OpenAI API, Web Search API
- **Database**: Prisma ORM (SQLite by default)
- **Other**: SF Symbols, modern CSS, production-ready structure

---

## 🚀 Getting Started

### 1. Clone the Repo

```sh
git clone https://github.com/nstrike2/vibe-coding-repo.git
cd vibe-coding-repo
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your OpenAI API key and any web search API keys required.

```sh
cp .env.local.example .env.local
# Edit .env.local with your keys
```

### 4. Set Up the Database

```sh
npx prisma migrate dev --name init
```

### 5. Run the App

```sh
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## 🧩 Project Structure

```
app/           # Next.js app directory (pages, layout, API routes)
components/    # Reusable React components (ChatInput, ChatMessage, Sidebar, etc.)
lib/           # Utility libraries (OpenAI, DB, web search)
prisma/        # Prisma schema and migrations
public/        # Static assets
```

---

## 📝 Customization

- **Styling**: Tailwind CSS for rapid, consistent UI.
- **Database**: Swap SQLite for Postgres/MySQL by editing `prisma/schema.prisma`.
- **API Keys**: Store secrets in `.env.local` (never commit this file).

---

## 🛡️ Security & Best Practices

- Never expose API keys in the frontend.
- Validate and sanitize all user input.
- Follow Apple’s Human Interface Guidelines for UI/UX.

---

## 📄 License

MIT

---

## 🙏 Credits

- [OpenAI](https://openai.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
