import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RatingSystem from '@/components/orders/rating-system'
import Link from 'next/link'

export default async function CustomerOrderDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, status, quantity_ordered, total_amount, payment_method, comment, created_at,
      vendor:profiles!orders_vendor_id_fkey ( id, full_name )
    `)
    .eq('id', params.id)
    .eq('customer_id', user.id)
    .maybeSingle() as any

  if (!order) return <div className="p-4 text-center text-gray-500">Order not found.</div>

  const { data: existingRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('order_id', order.id)
    .eq('rater_id', user.id)
    .maybeSingle()

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in-up">
      <Link href="/customer-dashboard" className="text-cyan-700 font-semibold text-sm hover:underline">← Back to Dashboard</Link>
      
      <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{order.quantity_ordered} Bags</h1>
            <p className="text-sm text-gray-800 font-medium capitalize">Status: {order.status.replace('_', ' ')}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-cyan-700">₦{order.total_amount.toLocaleString()}</p>
            <p className="text-xs text-gray-600 capitalize">{order.payment_method}</p>
          </div>
        </div>
        
        {order.comment && (
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800 mt-3">
            <p className="font-medium text-gray-900 mb-1">Your Note:</p>
            "{order.comment}"
          </div>
        )}
      </div>

      {/* Chat is now handled by the Floating Chat Manager */}

      {order.status === 'delivered' && !existingRating && (
        <RatingSystem orderId={order.id} direction="customer_to_vendor" />
      )}
    </div>
  )
}
