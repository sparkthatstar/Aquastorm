import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrderChat from '@/components/chat/order-chat'
import RatingSystem from '@/components/orders/rating-system'
import Link from 'next/link'

export default async function VendorOrderDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, status, quantity_ordered, total_amount, payment_method, comment,
      customer:profiles!orders_customer_id_fkey ( id, full_name )
    `)
    .eq('id', params.id)
    .eq('vendor_id', user.id)
    .single()

  if (!order) return <div className="p-4 text-center text-gray-500">Order not found or not assigned to you.</div>

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, status')
    .eq('order_id', order.id)
    .single()

  const { data: existingRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('order_id', order.id)
    .eq('rater_id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <Link href="/vendor-dashboard" className="text-cyan-600 text-sm hover:underline">← Back to Dashboard</Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Order Details</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">Customer</p><p className="font-semibold">{order.customer?.full_name}</p></div>
          <div><p className="text-gray-500">Quantity</p><p className="font-semibold">{order.quantity_ordered} bags</p></div>
          <div><p className="text-gray-500">Payment</p><p className="font-semibold capitalize">{order.payment_method}</p></div>
          <div><p className="text-gray-500">Total</p><p className="font-semibold">₦{order.total_amount.toLocaleString()}</p></div>
        </div>
        {order.comment && (
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mt-4">
            <p className="font-medium text-gray-700 mb-1">Customer Note:</p>
            "{order.comment}"
          </div>
        )}
      </div>

      {conversation && (
        <OrderChat 
          conversationId={conversation.id}
          currentUserId={user.id}
          recipientName={order.customer?.full_name || 'Customer'}
          initialStatus={conversation.status}
        />
      )}

      {order.status === 'delivered' && !existingRating && (
        <RatingSystem orderId={order.id} direction="vendor_to_customer" />
      )}
    </div>
  )
}
