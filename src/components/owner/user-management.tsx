'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UserManagement({ users }: { users: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleRoleChange(userId: string, currentRole: string, newRole: string) {
    if (currentRole === newRole) return
    
    let bankName = null
    let accountName = null
    let accountNumber = null

    if (newRole === 'vendor' || newRole === 'manager') {
      bankName = prompt(`Enter Bank Name for this ${newRole}:`)
      if (!bankName) return alert('Bank name is required to set this role.')
      
      accountName = prompt('Enter Account Name:')
      if (!accountName) return alert('Account name is required.')
      
      accountNumber = prompt('Enter Account Number:')
      if (!accountNumber) return alert('Account number is required.')
    }

    if (!confirm(`Change role to ${newRole} with the provided bank details?`)) return
    
    setLoadingId(userId)
    const { error } = await supabase.rpc('change_user_role', { 
      p_user_id: userId, 
      p_new_role: newRole,
      p_bank_name: bankName,
      p_account_name: accountName,
      p_account_number: accountNumber
    })
    
    if (error) alert(error.message)
    setLoadingId(null)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3 max-h-[500px] overflow-y-auto">
      {users.length === 0 && <p className="text-gray-500 text-sm">No users found.</p>}
      
      {users.map((u) => (
        <div key={u.id} className="flex items-center justify-between border-b pb-3 last:border-0">
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {u.full_name} 
              <span className="ml-2 text-xs font-normal text-gray-400 capitalize">({u.role})</span>
            </p>
            <p className="text-xs text-gray-500">{u.email}</p>
            {(u.role === 'vendor' || u.role === 'manager') && u.bank_name && (
              <p className="text-xs text-gray-400 mt-1">🏦 {u.bank_name} - {u.account_number}</p>
            )}
          </div>
          
          <select
            defaultValue={u.role}
            onChange={(e) => handleRoleChange(u.id, u.role, e.target.value)}
            disabled={loadingId === u.id}
            className="border border-gray-200 rounded-md px-2 py-1 text-xs capitalize disabled:opacity-50"
          >
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="manager">Manager</option>
          </select>
        </div>
      ))}
    </div>
  )
}
