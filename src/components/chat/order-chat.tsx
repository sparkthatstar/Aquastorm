'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function OrderChat({ 
  conversationId, 
  currentUserId, 
  recipientName, 
  initialStatus 
}: { 
  conversationId: string
  currentUserId: string
  recipientName: string
  initialStatus: 'open' | 'closed'
}) {
  const supabase = createClient()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, 
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true })
    
    if (data) setMessages(data)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || status === 'closed') return

    setLoading(true)
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim()
    })
    
    if (!error) setNewMessage('')
    setLoading(false)
  }

  async function toggleChatStatus() {
    const newStatus = status === 'open' ? 'closed' : 'open'
    const { error } = await supabase
      .from('conversations')
      .update({ 
        status: newStatus, 
        closed_at: newStatus === 'closed' ? new Date().toISOString() : null 
      })
      .eq('id', conversationId)
    
    if (!error) setStatus(newStatus)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900">Chat with {recipientName}</h3>
          <span className={`text-xs font-medium ${status === 'open' ? 'text-green-500' : 'text-red-500'}`}>
            ● {status === 'open' ? 'Active' : 'Closed'}
          </span>
        </div>
        <button onClick={toggleChatStatus} className="text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-md hover:bg-gray-50">
          {status === 'open' ? 'Close Chat' : 'Reopen Chat'}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">No messages yet. Say hello!</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender_id === currentUserId ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.sender_id === currentUserId ? 'bg-cyan-500 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'}`}>
              {msg.content}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-2">
              {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={status === 'closed'}
          placeholder={status === 'closed' ? "Chat is closed" : "Type a message..."}
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim() || loading || status === 'closed'}
          className="bg-cyan-600 text-white p-3 rounded-full hover:bg-cyan-700 disabled:opacity-50 transition-colors"
        >
          ➤
        </button>
      </form>
    </div>
  )
}
