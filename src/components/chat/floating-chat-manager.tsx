// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FloatingChatIcon from './floating-chat-icon'

export default function FloatingChatManager({ userId }: { userId: string }) {
  const supabase = createClient()
  const [groups, setGroups] = useState<any[]>([])

  async function fetchChats() {
    const { data } = await supabase
      .from('conversations')
      .select(`
        id, order_id, customer_id, vendor_id,
        customer:profiles!conversations_customer_id_fkey(full_name),
        vendor:profiles!conversations_vendor_id_fkey(full_name),
        order:orders(status)
      `)
      .or(`customer_id.eq.${userId},vendor_id.eq.${userId}`)

    if (!data) return

    const activeStatuses = ['accepted', 'preparing', 'out_for_delivery']
    const activeConversations = data.filter(c => {
      const orderStatus = Array.isArray(c.order) ? c.order[0]?.status : c.order?.status
      return activeStatuses.includes(orderStatus)
    })

    const grouped: Record<string, any> = {}
    activeConversations.forEach(c => {
      const isCustomer = c.customer_id === userId
      const otherId = isCustomer ? c.vendor_id : c.customer_id
      const vendorName = Array.isArray(c.vendor) ? c.vendor[0]?.full_name : c.vendor?.full_name
      const customerName = Array.isArray(c.customer) ? c.customer[0]?.full_name : c.customer?.full_name
      const otherName = isCustomer ? vendorName : customerName

      if (!grouped[otherId]) {
        grouped[otherId] = { otherId, name: otherName || 'User', conversationId: c.id }
      }
    })

    setGroups(Object.values(grouped))
  }

  useEffect(() => {
    fetchChats()

    // 1. Listen for instant realtime updates
    const channel = supabase
      .channel('order-status-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        fetchChats()
      })
      .subscribe()

    // 2. Safe fallback: check every 5 seconds in case the realtime event misses
    const timer = setInterval(() => {
      fetchChats()
    }, 5000)

    return () => { 
      supabase.removeChannel(channel)
      clearInterval(timer)
    }
  }, [userId])

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {groups.map((g, index) => (
        <FloatingChatIcon 
          key={g.otherId} 
          name={g.name} 
          conversationId={g.conversationId} 
          userId={userId}
          index={index}
        />
      ))}
    </div>
  )
}
