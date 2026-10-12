// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FloatingChatIcon({ name, conversationId, userId, index }) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState({ x: -1, y: -1 })
  const [dragging, setDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [hasUnread, setHasUnread] = useState(false)
  const scrollRef = useRef(null)
  const movedRef = useRef(false) // Tracks if we actually dragged it

  const initial = name?.charAt(0)?.toUpperCase() || '?'

  useEffect(() => {
    if (pos.x === -1) {
      setPos({ x: window.innerWidth - 80, y: window.innerHeight - 150 - (index * 70) })
    }

    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true })
      if (data) setMessages(data)
    }
    fetchMessages()

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new])
        if (payload.new.sender_id !== userId && !isOpen) {
          setHasUnread(true)
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [conversationId, isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleStart = (clientX, clientY) => {
    setDragging(true)
    movedRef.current = false
    setStartPos({ x: clientX - pos.x, y: clientY - pos.y })
  }

  const handleMove = (clientX, clientY) => {
    if (!dragging) return
    movedRef.current = true // We are dragging!
    setPos({ x: clientX - startPos.x, y: clientY - startPos.y })
  }

  const handleEnd = (clientX, clientY) => {
    if (!dragging) return
    setDragging(false)

    if (isOpen) {
      // If open, drop it where it is, but keep it on the screen
      const w = 320 // width of chat
      const h = 384 // height of chat
      let x = clientX - startPos.x
      let y = clientY - startPos.y
      
      // Clamp to screen bounds so it doesn't get lost
      x = Math.max(10, Math.min(x, window.innerWidth - w - 10))
      y = Math.max(10, Math.min(y, window.innerHeight - h - 10))
      setPos({ x, y })
    } else {
      // If closed (icon form), snap to closest edge
      const snapX = clientX < window.innerWidth / 2 ? 20 : window.innerWidth - 70
      const snapY = Math.max(20, Math.min(clientY, window.innerHeight - 70))
      setPos({ x: snapX, y: snapY })
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: newMessage.trim()
    })
    setNewMessage('')
  }

   const handleIconClick = () => {
    // Only open/close if we didn't just drag it
    if (!movedRef.current) {
      // If we are about to open it, move it to the center of the screen
      if (!isOpen) {
        const chatWidth = 320 // w-80
        const chatHeight = 384 // h-96
        const centerX = (window.innerWidth / 2) - (chatWidth / 2)
        const centerY = (window.innerHeight / 2) - (chatHeight / 2)
        setPos({ x: centerX, y: centerY })
        setHasUnread(false)
      }
      setIsOpen(!isOpen)
    }
  }
  return (
    <div
      className="absolute pointer-events-auto"
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={(e) => handleEnd(e.clientX, e.clientY)}
      onMouseLeave={() => dragging && handleEnd(pos.x + startPos.x, pos.y + startPos.y)}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
    >
      {/* Floating Icon */}
      {!isOpen && (
        <div 
          onClick={handleIconClick}
          className="w-12 h-12 bg-cyan-600 text-white rounded-full shadow-2xl flex items-center justify-center font-bold text-xl cursor-pointer hover:scale-105 transition-transform border-2 border-white"
        >
          {initial}
          {hasUnread && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white"></span>
          )}
        </div>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-fade-in-up">
          <div 
            className="flex justify-between items-center p-3 border-b border-gray-100 bg-white/80 cursor-grab active:cursor-grabbing"
            // Make it clear you can drag by the header
          >
            <h3 className="font-bold text-gray-900">{name}</h3>
            <button onClick={handleIconClick} className="text-gray-500 hover:text-gray-900 text-lg px-2">✕</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender_id === userId ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${msg.sender_id === userId ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'}`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 px-2">{new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="p-2 border-t border-gray-100 flex gap-2 bg-white/80">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-full border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <button type="submit" className="bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-700 transition-colors">➤</button>
          </form>
        </div>
      )}
    </div>
  )
}
