'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ActiveOrdersList({ orders }: { orders: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleCancel(orderId: string) {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setLoadingId(orderId)
    const { error } = await supabase.rpc('cancel_order', { p_order_id: orderId })
    if (error) alert(error.message)
    router.refresh()
  }

  if (orders.length === 0) {
    return <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-8 text-center text-gray-700 font-medium shadow-md">You have no active orders.</div>
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="font-bold text-gray-900 text-lg">{order.quantity_ordered} bags</span>
              <p className="text-sm text-gray-800 font-medium capitalize">Status: {order.status.replace('_', ' ')}</p>
              {order.vendor ? (
                <p className="text-xs text-gray-600 mt-1">Vendor: {order.vendor.full_name}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1 italic">Waiting for vendor to accept...</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-cyan-700">₦{order.total_amount.toLocaleString()}</p>
              <p className="text-xs text-gray-600 capitalize">{order.payment_method}</p>
            </div>
          </div>
          <button 
            onClick={() => handleCancel(order.id)}
            disabled={loadingId === order.id}
            className="w-full mt-2 bg-red-600 text-white font-bold py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 text-sm shadow-md"
          >
            {loadingId === order.id ? 'Canceling...' : 'Cancel Order'}
          </button>
        </div>
      ))}
    </div>
  )
}
