'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AvailableOrders({ orders }: { orders: any[] }) {
const supabase = createClient()
const router = useRouter()

const [loadingId, setLoadingId] = useState<string | null>(null)
const [error, setError] = useState<string | null>(null)

async function handleAccept(orderId: string) {
setLoadingId(orderId)
setError(null)

const { error: rpcError } = await supabase.rpc('accept_order', {
  p_order_id: orderId,
})

if (rpcError) {
  setError(rpcError.message)
  setLoadingId(null)
  return
}

router.refresh()

}

if (orders.length === 0) {
return (
<div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
No orders available right now.
</div>
)
}

return (
<div className="space-y-4">
{error && (
<div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
{error}
</div>
)}

  {orders.map((order) => {
    const customer = Array.isArray(order.customer)
      ? order.customer[0]
      : order.customer

    const customerDetails = Array.isArray(customer?.customers)
      ? customer.customers[0]
      : customer?.customers

    const customerName = customer?.full_name || 'Unknown Customer'
    const roomNumber = customerDetails?.room_number || 'N/A'

    return (
      <div
        key={order.id}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex justify-between items-center gap-4"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-bold text-gray-900 text-lg">
              {order.quantity_ordered} bags
            </span>

            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700 capitalize">
              {order.payment_method}
            </span>
          </div>

          <p className="text-sm text-gray-800">
            <span className="font-semibold">Customer:</span>{' '}
            {customerName}
          </p>

          <p className="text-sm text-gray-800 mt-1">
            <span className="font-semibold">Room Number:</span>{' '}
            {roomNumber}
          </p>

          <p className="text-xs text-gray-600 mt-2">
            ₦{Number(order.total_amount || 0).toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => handleAccept(order.id)}
          disabled={loadingId === order.id}
          className="bg-cyan-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {loadingId === order.id ? 'Accepting...' : 'Accept'}
        </button>
      </div>
    )
  })}
</div>

)
}
