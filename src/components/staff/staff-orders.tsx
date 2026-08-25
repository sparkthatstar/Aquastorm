'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function StaffOrders({ orders, vendors, canAssign }: { orders: any[]; vendors: any[]; canAssign: boolean }) {
  const supabase = createClient()
  const router = useRouter()
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string[]>>({})

  async function updateVisibility(orderId: string, mode: string) {
    const vendorIds = mode === 'manager_and_selected_vendors' ? selectedVendors[orderId] : null
    
    const { error } = await supabase.rpc('update_order_visibility', {
      p_order_id: orderId,
      p_mode: mode,
      p_vendor_ids: vendorIds
    })
    
    if (error) alert(error.message)
    router.refresh()
  }

  const toggleVendor = (orderId: string, vendorId: string) => {
    setSelectedVendors(prev => {
      const current = prev[orderId] || []
      return { ...prev, [orderId]: current.includes(vendorId) ? current.filter(v => v !== vendorId) : [...current, vendorId] }
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left p-4 font-medium text-gray-500">Customer</th>
            <th className="text-left p-4 font-medium text-gray-500">Bags</th>
            <th className="text-left p-4 font-medium text-gray-500">Status</th>
            <th className="text-left p-4 font-medium text-gray-500">Vendor</th>
            {canAssign && <th className="text-left p-4 font-medium text-gray-500">Visibility Control</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-50">
              <td className="p-4">{order.customer?.full_name || 'Unknown'}</td>
              <td className="p-4">{order.quantity_ordered}</td>
              <td className="p-4 capitalize">{order.status.replace('_', ' ')}</td>
              <td className="p-4">{order.vendor?.full_name || '—'}</td>
              
              {canAssign && (
                <td className="p-4">
                  <select 
                    defaultValue={order.visibility_mode}
                    onChange={(e) => updateVisibility(order.id, e.target.value)}
                    className="border border-gray-200 rounded-md px-2 py-1 text-xs"
                  >
                    <option value="manager_only">Manager Only</option>
                    <option value="manager_and_all_vendors">All Vendors</option>
                    <option value="manager_and_selected_vendors">Selected Vendors</option>
                  </select>

                  {order.visibility_mode === 'manager_and_selected_vendors' && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {vendors.map(v => (
                        <button 
                          key={v.id}
                          onClick={() => toggleVendor(order.id, v.id)}
                          className={`text-xs px-2 py-1 rounded-md border ${selectedVendors[order.id]?.includes(v.id) ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                          {v.full_name}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
