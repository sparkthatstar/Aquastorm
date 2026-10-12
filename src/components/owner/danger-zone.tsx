'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DangerZone() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleReset() {
    const confirmation = prompt("⚠️ WARNING: This will permanently DELETE all orders, chats, payments, ratings, points, and notifications. Your owner account and staff accounts will be spared, but all customer/vendor history will be wiped. Type 'RESET' to confirm.")
    
    if (confirmation !== 'RESET') {
      alert('Reset canceled. You did not type RESET exactly.')
      return
    }

    setLoading(true)
    const { error } = await supabase.rpc('reset_aquastorm_data')
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('AquaStorm has been successfully reset. All history is cleared.')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-red-800 mb-2">⚠️ Danger Zone</h2>
      <p className="text-sm text-red-700 mb-4">
        This will permanently delete all orders, chats, payments, ratings, points, and notifications from the database. Customer and Vendor accounts will remain, but their history will be wiped clean. Use with extreme caution.
      </p>
      <button 
        onClick={handleReset}
        disabled={loading}
        className="bg-red-600 text-white font-bold py-2 px-6 rounded-xl shadow-md hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Wiping Database...' : 'RESET AQUASTORM'}
      </button>
    </div>
  )
}
