'use client'

import { useState } from 'react'
import { createManager } from '@/app/actions/staff-actions'

export default function ManagerManagement() {
  const [state, setState] = useState<{ error?: string; success?: string }>({})

  return (
    <form action={async (formData) => {
      const res = await createManager({}, formData)
      setState(res)
    }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      
      {state.error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-2">{state.error}</div>}
      {state.success && <div className="bg-green-50 text-green-600 text-sm rounded-lg p-2">{state.success}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input name="fullName" required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input name="email" required type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
        <input name="password" required type="password" minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      </div>
      
      <div className="border-t pt-4 mt-4">
        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Payout Details</p>
        <div className="space-y-3">
          <input name="bankName" required type="text" placeholder="Bank Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input name="accountName" required type="text" placeholder="Account Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input name="accountNumber" required type="text" placeholder="Account Number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
      </div>

      <button type="submit" className="w-full bg-cyan-600 text-white font-semibold py-2 rounded-lg hover:bg-cyan-700 text-sm">
        Create Manager Account
      </button>
    </form>
  )
}
