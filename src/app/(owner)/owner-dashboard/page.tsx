import { createClient } from '@/lib/supabase/server'
import ManagerManagement from '@/components/owner/manager-management'
import VendorApprovals from '@/components/owner/vendor-approvals'
import AuditLogViewer from '@/components/owner/audit-log-viewer'
import PaymentOversight from '@/components/owner/payment-oversight'
import UserManagement from '@/components/owner/user-management'
import ManagerPermissions from '@/components/owner/manager-permissions'
import CashoutApproval from '@/components/staff/cashout-approval'
import AnalyticsDashboard from '@/components/staff/analytics-dashboard'
import StaffOrders from '@/components/staff/staff-orders'
import StaffInventory from '@/components/staff/staff-inventory'

export default async function OwnerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

    const { data: removalRequests } = await supabase
    .from('manager_action_requests')
    .select(`
      id, metadata, created_at,
      manager:profiles!manager_id ( full_name ),
      vendor:profiles!target_id ( full_name )
    `)
    .eq('action_type', 'vendor_removal')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select(`
      action, target_type, created_at, metadata,
      actor:profiles ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(15)

  const { data: allUsers } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, bank_name, account_number')
    .neq('role', 'owner')
    .order('full_name', { ascending: true })

  const { data: managers } = await supabase
    .from('managers')
    .select(`
      profile_id, permissions,
      profile:profiles ( full_name, email )
    `)

  const { data: paymentsToReview } = await supabase
    .from('payments')
    .select(`
      id, amount, method, status, order_id,
      receipts:payment_receipts ( storage_path )
    `)
    .or('status.eq.pending,status.eq.flagged')
    .eq('method', 'transfer')
    .order('created_at', { ascending: false })

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
      is_approved, 
      profile_id,
      profile:profiles!profile_id ( full_name ),
      inventory:inventory ( available, reserved, delivered )
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
        <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
        <p className="text-gray-500 text-sm">System governance and oversight.</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Business Analytics</h2>
        <AnalyticsDashboard stats={stats} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Cashout Approvals</h2>
        <CashoutApproval requests={cashoutRequests || []} userRole="owner" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders & Dispatch</h2>
        <StaffOrders orders={orders || []} vendors={vendors?.map(v => v.profile).filter(Boolean) || []} canAssign={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Vendor Removals</h2>
          <VendorApprovals requests={removalRequests || []} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Manager</h2>
          <ManagerManagement />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment & Receipt Oversight</h2>
        <PaymentOversight payments={paymentsToReview || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">User Role Management</h2>
          <UserManagement users={allUsers || []} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Manager Permissions</h2>
          <ManagerPermissions managers={managers || []} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Vendor Inventory</h2>
        <StaffInventory vendors={vendors || []} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">System Audit Log</h2>
        <AuditLogViewer logs={auditLogs || []} />
      </div>
    </div>
  )
}
