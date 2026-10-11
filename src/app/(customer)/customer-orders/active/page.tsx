import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ActiveOrdersList from '@/components/customer/active-orders-list'

export default async function ActiveOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch ALL active orders for this customer
  const { data: activeOrders } = await supabase
    .from('orders')
    .select(`
      id, status, quantity_ordered, total_amount, payment_method, created_at,
      vendor:profiles!orders_vendor_id_fkey ( full_name )
    `)
    .eq('customer_id', user.id)
    .in('status', ['placed', 'accepted', 'preparing', 'out_for_delivery'])
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in-up">
      <Link href="/customer-dashboard" className="text-cyan-700 font-semibold text-sm hover:underline">← Back to Dashboard</Link>
      <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>
      <ActiveOrdersList orders={activeOrders || []} />
    </div>
  )
}
