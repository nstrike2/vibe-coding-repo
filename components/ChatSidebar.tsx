'use client'

import { useState, useEffect } from 'react'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import clsx from 'clsx'

interface Chat {
  id: string
  title: string | null
  createdAt: string
  updatedAt: string
}

interface ChatSidebarProps {
  currentChatId: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
}

export default function ChatSidebar({ currentChatId, onChatSelect, onNewChat }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats')
      const data = await response.json()
      setChats(data)
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this chat?')) return

    try {
      await fetch(`/api/chats/${chatId}`, { method: 'DELETE' })
      setChats(chats.filter(chat => chat.id !== chatId))
      if (currentChatId === chatId) {
        onNewChat()
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-gray-400">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-gray-400">No chats yet</div>
        ) : (
          <div className="space-y-1 px-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={clsx(
                  'group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-800 transition-colors',
                  currentChatId === chat.id && 'bg-gray-800'
                )}
                onClick={() => onChatSelect(chat.id)}
              >
                <MessageSquare size={16} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {chat.title || 'New Chat'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(chat.updatedAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => deleteChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}