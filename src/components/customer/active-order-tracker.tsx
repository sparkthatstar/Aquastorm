'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ActiveOrderTracker({ initialOrder }: { initialOrder: any }) {
  const supabase = createClient()
  const [order, setOrder] = useState(initialOrder)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!initialOrder) return

    const fetchLatestStatus = async () => {
      setIsRefreshing(true)
      
      // Fetch the absolute latest status from the database
      const { data } = await supabase
        .from('orders')
        .select('id, status, quantity_ordered')
        .eq('id', initialOrder.id)
        .single()

      if (data) {
        setOrder(data)
      }
      
      // Keep the wave shimmering for half a second to look nice
      setTimeout(() => setIsRefreshing(false), 500)
    }

    // Poll every 2 seconds
    const timer = setInterval(fetchLatestStatus, 2000)

    return () => clearInterval(timer)
  }, [initialOrder])

  if (!order) return null

  return (
    <div className={`bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-5 transition-all ${isRefreshing ? 'glassy-wave' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-gray-900">Active Order</h2>
      </div>
      <p className="text-sm text-gray-800 font-medium mb-4">
        {order.quantity_ordered} bags ordered
      </p>
      <div className="flex justify-between items-center relative">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -translate-y-1/2 rounded"></div>
        <div className={`absolute left-0 top-1/2 h-1 bg-cyan-600 -translate-y-1/2 rounded transition-all duration-500 ${
          order.status === 'placed' ? 'w-0' : 
          order.status === 'accepted' ? 'w-1/4' : 
          order.status === 'preparing' ? 'w-1/2' : 
          order.status === 'out_for_delivery' ? 'w-3/4' : 'w-full'
        }`}></div>
        
        <Step active icon="📝" label="Placed" />
        <Step active={['accepted', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status)} icon="✅" label="Accepted" />
        <Step active={['preparing', 'out_for_delivery', 'delivered'].includes(order.status)} icon="💧" label="Preparing" />
        <Step active={['out_for_delivery', 'delivered'].includes(order.status)} icon="🚴" label="En route" />
        <Step active={order.status === 'delivered'} icon="🏠" label="Delivered" />
      </div>
      <Link href={`/customer-orders/${order.id}`} className="block text-center mt-4 text-cyan-700 font-semibold text-sm hover:underline">
        View Details
      </Link>
    </div>
  )
}

function Step({ active, icon, label }: { active: boolean; icon: string; label: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center w-1/5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${active ? 'bg-cyan-600 scale-110' : 'bg-gray-300'}`}>
        {icon}
      </div>
      <span className="text-[10px] text-gray-800 font-medium mt-1 text-center">{label}</span>
    </div>
  )
}
