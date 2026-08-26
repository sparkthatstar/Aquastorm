import { createClient } from '@/lib/supabase/server'
import AvailableOrders from '@/components/vendor/available-orders'
import ActiveDeliveries from '@/components/vendor/active-deliveries'
import CashoutManager from '@/components/vendor/cashout-manager'

export default async function VendorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: vendor } = await supabase
    .from('vendors')
    .select('is_approved, aggregate_rating, rating_count, bank_name, account_number')
    .eq('profile_id', user!.id)
    .single()

  const { data: points } = await supabase.rpc('get_vendor_points_balance')

  const { data: inventory } = await supabase
    .from('inventory')
    .select('available, reserved, delivered')
    .eq('vendor_id', user!.id)
    .single()

    const { data: availableOrders } = await supabase
    .from('orders')
    .select(`
      id, quantity_ordered, total_amount, payment_method, created_at,
      customer:profiles!orders_customer_id_fkey ( full_name )
    `)
    .in('status', ['placed', 'available'])
    .order('created_at', { ascending: false })

    const { data: activeOrders } = await supabase
    .from('orders')
    .select(`
      id, status, quantity_ordered, total_amount, payment_method, comment,
      customer:profiles!orders_customer_id_fkey ( full_name ),
      payment:payments ( id, status, method )
    `)
    .eq('vendor_id', user!.id)
    .in('status', ['accepted', 'preparing', 'out_for_delivery'])
    .order('accepted_at', { ascending: false })

  if (!vendor?.is_approved) {
    return <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-6 text-center">⏳ Your account is pending approval from the Owner/Manager.</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <div className="flex gap-4 text-sm">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-center border border-gray-100">
            <p className="text-gray-500 text-xs">Rating</p>
            <p className="font-bold text-gray-900">⭐ {vendor.aggregate_rating?.toFixed(1) || '0.0'}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-center border border-gray-100">
            <p className="text-gray-500 text-xs">Aqua Points</p>
            <p className="font-bold text-cyan-600">{points || 0}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-center border border-gray-100">
            <p className="text-gray-500 text-xs">Stock</p>
            <p className="font-bold text-gray-900">{inventory?.available || 0}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Deliveries</h2>
        <ActiveDeliveries orders={activeOrders || []} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Orders</h2>
        <AvailableOrders orders={availableOrders || []} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Cash Out</h2>
        <CashoutManager balance={points || 0} bankDetails={vendor} />
      </div>
    </div>
  )
}
