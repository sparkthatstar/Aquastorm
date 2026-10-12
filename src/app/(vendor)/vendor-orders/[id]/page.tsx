import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RatingSystem from '@/components/orders/rating-system'
import Link from 'next/link'

export default async function VendorOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { id } = await params

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      quantity_ordered,
      total_amount,
      payment_method,
      comment,
      customer:profiles!orders_customer_id_fkey (
        id,
        full_name,
        customers (
          room_number
        )
      )
    `)
    .eq('id', id)
    .eq('vendor_id', user.id)
    .maybeSingle() as any

  if (orderError) {
    return (
      <div className="p-4 text-center text-red-700">
        Could not load order details: {orderError.message}
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-4 text-center text-gray-800">
        Order not found or not assigned to you.
      </div>
    )
  }

  const customer = Array.isArray(order.customer)
    ? order.customer[0]
    : order.customer

  const customerDetails = Array.isArray(customer?.customers)
    ? customer.customers[0]
    : customer?.customers

  const customerName = customer?.full_name || 'Name unavailable'
  const roomNumber = customerDetails?.room_number || 'Room number unavailable'

  const { data: existingRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('order_id', order.id)
    .eq('rater_id', user.id)
    .maybeSingle()

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in-up">
      <Link
        href="/vendor-dashboard"
        className="text-cyan-800 font-semibold text-sm hover:underline"
      >
        ← Back to Dashboard
      </Link>

      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">
          Order Details
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-700">Customer Name</p>
            <p className="font-semibold text-gray-900">
              {customerName}
            </p>
          </div>

          <div>
            <p className="text-gray-700">Room Number</p>
            <p className="font-semibold text-gray-900">
              {roomNumber}
            </p>
          </div>

          <div>
            <p className="text-gray-700">Quantity</p>
            <p className="font-semibold text-gray-900">
              {order.quantity_ordered} bags
            </p>
          </div>

          <div>
            <p className="text-gray-700">Payment Method</p>
            <p className="font-semibold text-gray-900 capitalize">
              {order.payment_method}
            </p>
          </div>

          <div>
            <p className="text-gray-700">Total Amount</p>
            <p className="font-semibold text-gray-900">
              ₦{Number(order.total_amount || 0).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-gray-700">Order Status</p>
            <p className="font-semibold text-gray-900 capitalize">
              {order.status.replaceAll('_', ' ')}
            </p>
          </div>
        </div>

        {order.comment && (
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-gray-900 mt-4">
            <p className="font-semibold text-gray-900 mb-1">
              Customer Note:
            </p>
            {order.comment}
          </div>
        )}
      </div>

      {/* Chat is handled by the Floating Chat Manager */}

      {order.status === 'delivered' && !existingRating && (
        <RatingSystem
          orderId={order.id}
          direction="vendor_to_customer"
        />
      )}
    </div>
  )
}
