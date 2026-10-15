import { createClient } from '@/lib/supabase/server'

import VendorApprovals from '@/components/owner/vendor-approvals'
import AuditLogViewer from '@/components/owner/audit-log-viewer'
import PaymentOversight from '@/components/owner/payment-oversight'
import UserManagement from '@/components/owner/user-management'
import ManagerPermissions from '@/components/owner/manager-permissions'
import CashoutApproval from '@/components/staff/cashout-approval'
import AnalyticsDashboard from '@/components/staff/analytics-dashboard'
import StaffOrders from '@/components/staff/staff-orders'
import ComplaintsManager from '@/components/staff/complaints-manager'
import AquaLedger from '@/components/owner/aqua-ledger'
import DangerZone from '@/components/owner/danger-zone'

export const dynamic = 'force-dynamic'

export default async function OwnerDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: removalRequests } = await supabase
    .from('manager_action_requests')
    .select(`
      id,
      metadata,
      created_at,
      manager:profiles!manager_id ( full_name ),
      vendor:profiles!target_id ( full_name )
    `)
    .eq('action_type', 'vendor_removal')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select(`
      action,
      target_type,
      created_at,
      metadata,
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
      profile_id,
      permissions,
      profile:profiles ( full_name, email )
    `)

  // PAYMENT & RECEIPT OVERSIGHT
  // Include transfers of every status so confirmed receipts
  // are not excluded by a pending/flagged-only filter.
  const {
    data: paymentsToReview,
    error: paymentsError,
  } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      method,
      status,
      order_id,
      created_at,
      receipts:payment_receipts (
        id,
        storage_path,
        original_filename,
        content_type,
        file_size_bytes,
        uploaded_at
      )
    `)
    .eq('method', 'transfer')
    .order('created_at', { ascending: false })

  if (paymentsError) {
    console.error(
      'Failed to load owner payment receipts:',
      paymentsError.message
    )
  }

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      quantity_ordered,
      total_amount,
      visibility_mode,
      created_at,
      customer:profiles!orders_customer_id_fkey ( full_name ),
      vendor:profiles!orders_vendor_id_fkey ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch approved vendors separately.
  const { data: vendorsRaw } = await supabase
    .from('vendors')
    .select('profile_id')
    .eq('is_approved', true)

  let vendors: any[] = []

  if (vendorsRaw && vendorsRaw.length > 0) {
    const vendorIds = vendorsRaw.map((vendor) => vendor.profile_id)

    const { data: vendorProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', vendorIds)

    const { data: vendorInventories } = await supabase
      .from('inventory')
      .select('vendor_id, available, reserved, delivered')
      .in('vendor_id', vendorIds)

    vendors = vendorIds.map((id) => {
      const profile = vendorProfiles?.find((item) => item.id === id)
      const inventory = vendorInventories?.find(
        (item) => item.vendor_id === id
      )

      return {
        profile_id: id,
        name: profile?.full_name || 'Unknown',
        available: inventory?.available || 0,
        reserved: inventory?.reserved || 0,
      }
    })
  }

  // Fetch Aqua Store total stock.
  const { data: storeData } = await supabase
    .from('aqua_store')
    .select('total_stock')
    .limit(1)
    .single()

  const storeStock = storeData?.total_stock || 0

  const {
    count: totalOrders,
  } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const {
    count: activeDeliveries,
  } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['accepted', 'preparing', 'out_for_delivery'])

  const {
    count: completed,
  } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'delivered')

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'delivered')

  const revenue =
    revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  const {
    count: cashOrders,
  } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('payment_method', 'cash')

  const {
    count: transferOrders,
  } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('payment_method', 'transfer')

  const {
    count: pendingCashouts,
  } = await supabase
    .from('cashout_requests')
    .select('*', { count: 'exact', head: true })
    .in('status', ['processing', 'manager_validated'])

  const {
    count: lowRatings,
  } = await supabase
    .from('ratings')
    .select('*', { count: 'exact', head: true })
    .lte('stars', 2)

  const stats = {
    totalOrders,
    activeDeliveries,
    completed,
    revenue,
    cashOrders,
    transferOrders,
    pendingCashouts,
    lowRatings,
  }

  const { data: cashoutRequests } = await supabase
    .from('cashout_requests')
    .select(`
      id,
      points_amount,
      is_urgent,
      status,
      vendor_id,
      vendor:profiles!cashout_requests_vendor_id_fkey (
        full_name,
        bank_name,
        account_name,
        account_number
      )
    `)
    .in('status', ['processing', 'manager_validated'])
    .order('requested_at', { ascending: false })

  const { data: complaints } = await supabase
    .from('complaints')
    .select(`
      id,
      category,
      description,
      status,
      resolution,
      created_at,
      owner_reply,
      replied_at,
      customer:profiles!complaints_customer_id_fkey ( full_name )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Owner Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          System governance and oversight.
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Business Analytics
        </h2>
        <AnalyticsDashboard stats={stats} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Aqua Ledger & Store Control
        </h2>
        <AquaLedger vendors={vendors} storeStock={storeStock} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Cashout Approvals
        </h2>
        <CashoutApproval
          requests={cashoutRequests || []}
          userRole="owner"
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Recent Orders & Dispatch
        </h2>
        <StaffOrders
          orders={orders || []}
          vendors={allUsers || []}
          canAssign={true}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Pending Vendor Removals
          </h2>
          <VendorApprovals requests={removalRequests || []} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Payment & Receipt Oversight
        </h2>
        <PaymentOversight payments={paymentsToReview || []} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Customer Support / Complaints
        </h2>
        <ComplaintsManager complaints={complaints || []} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            User Role Management
          </h2>
          <UserManagement users={allUsers || []} />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Manager Permissions
          </h2>
          <ManagerPermissions managers={managers || []} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          System Audit Log
        </h2>
        <AuditLogViewer logs={auditLogs || []} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          System Controls
        </h2>
        <DangerZone />
      </div>
    </div>
  )
}
