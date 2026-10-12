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

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      alert(error.message)
      setLoadingId(null)
      return
    }

    router.refresh()
    setLoadingId(null)
  }

  async function confirmPayment(paymentId: string, orderId: string) {
    setLoadingId(orderId)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('payments')
      .update({
        status: 'confirmed',
        confirmed_by: user?.id,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (error) {
      alert(error.message)
      setLoadingId(null)
      return
    }

    router.refresh()
    setLoadingId(null)
  }

  async function flagSuspicious(orderId: string) {
    const reason = prompt(
      'Enter reason for flagging this payment as suspicious:'
    )

    if (!reason?.trim()) return

    setLoadingId(orderId)

    const { error } = await supabase.rpc('flag_suspicious_payment', {
      p_order_id: orderId,
      p_reason: reason.trim(),
    })

    if (error) {
      alert(error.message)
      setLoadingId(null)
      return
    }

    router.refresh()
    setLoadingId(null)
  }

  async function completeDelivery(orderId: string, orderedQty: number) {
    const qty = deliveredQty[orderId] ?? orderedQty

    if (!Number.isInteger(qty) || qty < 1) {
      alert('Enter a valid delivered quantity.')
      return
    }

    if (qty > orderedQty) {
      alert('Delivered quantity cannot exceed ordered quantity.')
      return
    }

    setLoadingId(orderId)

    const { error } = await supabase.rpc('award_points_for_delivery', {
      p_order_id: orderId,
      p_quantity_delivered: qty,
    })

    if (error) {
      alert(error.message)
      setLoadingId(null)
      return
    }

    router.refresh()
    setLoadingId(null)
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-700">
        No active deliveries.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const payment = Array.isArray(order.payment)
          ? order.payment[0]
          : order.payment

        const customer = Array.isArray(order.customer)
          ? order.customer[0]
          : order.customer

        const customerDetails = Array.isArray(customer?.customers)
          ? customer.customers[0]
          : customer?.customers

        const customerName = customer?.full_name || 'Customer name unavailable'
        const roomNumber = customerDetails?.room_number || 'Room number unavailable'

        const isDelivering = order.status === 'out_for_delivery'
        const isPreparing = order.status === 'preparing'
        const isAccepted = order.status === 'accepted'

        return (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            <Link
              href={`/vendor-orders/${order.id}`}
              className="block hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div className="flex justify-between items-start mb-4 gap-3">
                <div>
                  <span className="font-bold text-gray-900 text-lg">
                    {order.quantity_ordered} bags
                  </span>

                  <p className="text-sm text-gray-800 mt-1">
                    <span className="font-semibold">Customer:</span>{' '}
                    {customerName}
                  </p>

                  <p className="text-sm text-gray-800 mt-1">
                    <span className="font-semibold">Room:</span>{' '}
                    {roomNumber}
                  </p>

                  {order.comment && (
                    <p className="text-xs text-gray-700 mt-2 italic">
                      Note: {order.comment}
                    </p>
                  )}
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">
                  {order.status.replaceAll('_', ' ')}
                </span>
              </div>
            </Link>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p className="font-semibold text-gray-900 mb-2">
                Payment ({order.payment_method})
              </p>

              {payment?.status === 'pending' &&
                order.payment_method === 'cash' && (
                  <button
                    onClick={() => confirmPayment(payment.id, order.id)}
                    disabled={loadingId === order.id}
                    className="bg-green-700 text-white text-xs font-semibold py-2 px-3 rounded-md hover:bg-green-800 disabled:opacity-50"
                  >
                    {loadingId === order.id ? 'Processing...' : 'Received Cash'}
                  </button>
                )}

              {payment?.status === 'pending' &&
                order.payment_method === 'transfer' && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => confirmPayment(payment.id, order.id)}
                      disabled={loadingId === order.id}
                      className="bg-green-700 text-white text-xs font-semibold py-2 px-3 rounded-md hover:bg-green-800 disabled:opacity-50"
                    >
                      {loadingId === order.id
                        ? 'Processing...'
                        : 'Confirm Transfer'}
                    </button>

                    <button
                      onClick={() => flagSuspicious(order.id)}
                      disabled={loadingId === order.id}
                      className="bg-red-100 text-red-800 text-xs font-semibold py-2 px-3 rounded-md hover:bg-red-200 disabled:opacity-50"
                    >
                      Flag Suspicious
                    </button>
                  </div>
                )}

              {payment?.status === 'confirmed' && (
                <span className="text-green-700 font-semibold">
                  ✓ Payment Confirmed
                </span>
              )}

              {payment?.status === 'flagged' && (
                <span className="text-red-700 font-semibold">
                  Payment Flagged
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
              {isAccepted && (
                <button
                  onClick={() => updateStatus(order.id, 'preparing')}
                  disabled={loadingId === order.id}
                  className="w-full bg-gray-900 text-white font-semibold py-2 rounded-lg hover:bg-black text-sm disabled:opacity-50"
                >
                  {loadingId === order.id ? 'Updating...' : 'Mark as Preparing'}
                </button>
              )}

              {isPreparing && (
                <button
                  onClick={() => updateStatus(order.id, 'out_for_delivery')}
                  disabled={loadingId === order.id}
                  className="w-full bg-blue-700 text-white font-semibold py-2 rounded-lg hover:bg-blue-800 text-sm disabled:opacity-50"
                >
                  {loadingId === order.id ? 'Updating...' : 'Start Delivery'}
                </button>
              )}

              {isDelivering && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={order.quantity_ordered}
                    step="1"
                    placeholder={`Delivered Qty (Ordered: ${order.quantity_ordered})`}
                    value={deliveredQty[order.id] ?? ''}
                    onChange={(e) =>
                      setDeliveredQty({
                        ...deliveredQty,
                        [order.id]:
                          e.target.value === ''
                            ? (undefined as unknown as number)
                            : Number(e.target.value),
                      })
                    }
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm"
                  />

                  <button
                    onClick={() =>
                      completeDelivery(order.id, order.quantity_ordered)
                    }
                    disabled={loadingId === order.id}
                    className="bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-800 text-sm disabled:opacity-50"
                  >
                    {loadingId === order.id ? 'Processing...' : 'Complete'}
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
