import { createClient } from '@/lib/supabase/server'
import StaffOrders from '@/components/staff/staff-orders'
import StaffInventory from '@/components/staff/staff-inventory'
import CashoutApproval from '@/components/staff/cashout-approval'
import AnalyticsDashboard from '@/components/staff/analytics-dashboard'

export default async function ManagerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isOwner = profile?.role === 'owner'

  const { data: managerProfile } = await supabase
    .from('managers')
    .select('permissions')
    .eq('profile_id', user!.id)
    .single()

  const canAssign = isOwner || managerProfile?.permissions?.can_assign_orders === true

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, status, quantity_ordered, total_amount, visibility_mode, created_at,
      customer:profiles!orders_customer_id_fkey ( full_name ),
      vendor:profiles!orders_vendor_id_fkey ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

      const { data: vendors } = await supabase
    .from('vendors')
    .select(`
      profile_id, 
      is_approved, 
      profile:profiles!vendors_profile_id_fkey ( id, full_name )
    `)
    .eq('is_approved', true)

  const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: activeDeliveries } = await supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['accepted', 'preparing', 'out_for_delivery'])
  const { count: completed } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered')
  const { data: revenueData } = await supabase.from('orders').select('total_amount').eq('status', 'delivered')
  const revenue = revenueData?.reduce((sum, o) => sum + o.total_amount, 0) || 0
  
  const { count: cashOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('payment_method', 'cash')
  const { count: transferOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('payment_method', 'transfer')
  
  const { count: pendingCashouts } = await supabase.from('cashout_requests').select('*', { count: 'exact', head: true }).in('status', ['processing', 'manager_validated'])
  const { count: lowRatings } = await supabase.from('ratings').select('*', { count: 'exact', head: true }).lte('stars', 2)

  const stats = { totalOrders, activeDeliveries, completed, revenue, cashOrders, transferOrders, pendingCashouts, lowRatings }

  const { data: cashoutRequests } = await supabase
    .from('cashout_requests')
    .select(`id, points_amount, is_urgent, status, vendor_id, vendor:profiles!cashout_requests_vendor_id_fkey ( full_name, bank_name, account_name, account_number )`)
    .in('status', ['processing', 'manager_validated'])
    .order('requested_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Business Analytics</h2>
        <AnalyticsDashboard stats={stats} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Cashout Approvals</h2>
        <CashoutApproval requests={cashoutRequests || []} userRole={profile?.role || 'manager'} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders & Dispatch</h2>
        <StaffOrders orders={orders || []} vendors={vendors?.map(v => v.profile).filter(Boolean) || []} canAssign={canAssign} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Vendor Inventory</h2>
        <StaffInventory vendors={vendors || []} />
      </div>
    </div>
  )
}
