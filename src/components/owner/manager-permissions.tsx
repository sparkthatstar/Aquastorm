'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ManagerPermissions({ managers }: { managers: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function togglePermission(managerId: string, currentValue: boolean) {
    setLoadingId(managerId)
    
    const newPermissions = { can_assign_orders: !currentValue }
    
    const { error } = await supabase.rpc('update_manager_permissions', {
      p_manager_id: managerId,
      p_permissions: newPermissions
    })

    if (error) alert(error.message)
    setLoadingId(null)
    router.refresh()
  }

  if (managers.length === 0) {
    return <div className="text-gray-500 text-sm text-center py-4">No managers found.</div>
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
      {managers.map((m) => (
        <div key={m.profile_id} className="flex items-center justify-between border-b pb-3 last:border-0">
          <div>
            <p className="font-medium text-gray-900 text-sm">{m.profile?.full_name}</p>
            <p className="text-xs text-gray-500">{m.profile?.email}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-700">Can Assign Vendors</span>
            <button
              onClick={() => togglePermission(m.profile_id, m.permissions?.can_assign_orders || false)}
              disabled={loadingId === m.profile_id}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${m.permissions?.can_assign_orders ? 'bg-cyan-600' : 'bg-gray-200'} disabled:opacity-50`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${m.permissions?.can_assign_orders ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
