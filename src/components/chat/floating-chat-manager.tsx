// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FloatingChatIcon from './floating-chat-icon'

export default function FloatingChatManager({ userId }: { userId: string }) {
  const supabase = createClient()
  const [groups, setGroups] = useState<any[]>([])

  useEffect(() => {
    async function fetchChats() {
      const { data } = await supabase
        .from('conversations')
        .select(`
          id, order_id, customer_id, vendor_id,
          customer:profiles!conversations_customer_id_fkey(full_name),
          vendor:profiles!conversations_vendor_id_fkey(full_name),
          orders:orders(status)
        `)
        .or(`customer_id.eq.${userId},vendor_id.eq.${userId}`)
        // ONLY show chats for active orders!
        .in('orders.status', ['accepted', 'preparing', 'out_for_delivery'])

      if (!data) return

      const grouped: Record<string, any> = {}
      data.forEach(c => {
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
    fetchChats()
  }, [userId])

  // Also listen for realtime updates so the icon disappears instantly when delivered
  useEffect(() => {
    const channel = supabase
      .channel('order-status-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        // Refetch chats when an order status changes
        fetchChats()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Helper to refetch (needs to be accessible in the useEffect above)
  async function fetchChats() {
    const { data } = await supabase
      .from('conversations')
      .select(`
        id, order_id, customer_id, vendor_id,
        customer:profiles!conversations_customer_id_fkey(full_name),
        vendor:profiles!conversations_vendor_id_fkey(full_name),
        orders:orders(status)
      `)
      .or(`customer_id.eq.${userId},vendor_id.eq.${userId}`)
      .in('orders.status', ['accepted', 'preparing', 'out_for_delivery'])

    if (!data) return
    const grouped: Record<string, any> = {}
    data.forEach(c => {
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
