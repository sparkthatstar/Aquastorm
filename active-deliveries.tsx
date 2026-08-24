'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ActiveDeliveries({ orders }: { orders: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deliveredQty, setDeliveredQty] = useState<Record<string, number>>({})

  async function updateStatus(orderId: string, status: string) {
    setLoadingId(orderId)
    await supabase.from('orders').update({ status }).eq('id', orderId)
    router.refresh()
  }

  async function confirmPayment(paymentId: string, orderId: string) {
    setLoadingId(orderId)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('payments').update({ 
      status: 'confirmed', 
      confirmed_by: user?.id, 
      confirmed_at: new Date().toISOString() 
    }).eq('id', paymentId)
    router.refresh()
  }

  async function flagSuspicious(orderId: string) {
    const reason = prompt("Enter reason for flagging this payment as suspicious:")
    if (!reason) return
    
    setLoadingId(orderId)
    await supabase.rpc('flag_suspicious_payment', { p_order_id: orderId, p_reason: reason })
    router.refresh()
  }

  async function completeDelivery(orderId: string, orderedQty: number) {
    const qty = deliveredQty[orderId] ?? orderedQty
    if (qty > orderedQty) return alert("Delivered quantity cannot exceed ordered quantity.")
    
    setLoadingId(orderId)
    const { error } = await supabase.rpc('award_points_for_delivery', { 
      p_order_id: orderId, 
      p_quantity_delivered: qty 
    })
    
    if (error) alert(error.message)
    router.refresh()
  }

  if (orders.length === 0) {
    return <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">No active deliveries.</div>
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const payment = order.payment
        const isDelivering = order.status === 'out_for_delivery'
        const isPreparing = order.status === 'preparing'
        const isAccepted = order.status === 'accepted'

        return (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <Link href={`/orders/${order.id}`} className="block hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-bold text-gray-900 text-lg">{order.quantity_ordered} bags</span>
                  <p className="text-sm text-gray-500">Room {order.customer.room_number}</p>
                  {order.comment && <p className="text-xs text-gray-400 mt-1 italic">"Note: {order.comment}"</p>}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </Link>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium text-gray-700 mb-2">Payment ({order.payment_method})</p>
              {payment?.status === 'pending' && order.payment_method === 'cash' && (
                <button onClick={() => confirmPayment(payment.id, order.id)} disabled={loadingId === order.id} className="bg-green-600 text-white text-xs font-semibold py-1 px-3 rounded-md hover:bg-green-700">
                  Received Cash
                </button>
              )}
              {payment?.status === 'pending' && order.payment_method === 'transfer' && (
                <div className="flex gap-2">
                  <button onClick={() => confirmPayment(payment.id, order.id)} disabled={loadingId === order.id} className="bg-green-600 text-white text-xs font-semibold py-1 px-3 rounded-md hover:bg-green-700">
                    Confirm Transfer
                  </button>
                  <button onClick={() => flagSuspicious(order.id)} disabled={loadingId === order.id} className="bg-red-100 text-red-700 text-xs font-semibold py-1 px-3 rounded-md hover:bg-red-200">
                    Flag Suspicious
                  </button>
                </div>
              )}
              {payment?.status === 'confirmed' && <span className="text-green-600 font-semibold">✓ Payment Confirmed</span>}
              {payment?.status === 'flagged' && <span className="text-red-600 font-semibold">🚩 Payment Flagged</span>}
            </div>

            <div className="flex flex-col gap-3 border-t pt-4">
              {isAccepted && (
                <button onClick={() => updateStatus(order.id, 'preparing')} disabled={loadingId === order.id} className="w-full bg-gray-800 text-white font-semibold py-2 rounded-lg hover:bg-gray-900 text-sm">
                  Mark as Preparing
                </button>
              )}
              {isPreparing && (
                <button onClick={() => updateStatus(order.id, 'out_for_delivery')} disabled={loadingId === order.id} className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 text-sm">
                  Start Delivery
                </button>
              )}
              {isDelivering && (
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder={`Delivered Qty (Ordered: ${order.quantity_ordered})`}
                    value={deliveredQty[order.id] ?? ''}
                    onChange={(e) => setDeliveredQty({...deliveredQty, [order.id]: parseInt(e.target.value)})}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm"
                  />
                  <button 
                    onClick={() => completeDelivery(order.id, order.quantity_ordered)} 
                    disabled={loadingId === order.id} 
                    className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-700 text-sm disabled:opacity-50"
                  >
                    Complete
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
