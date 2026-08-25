'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CashoutManager({ balance, bankDetails }: { balance: number; bankDetails: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [amount, setAmount] = useState(1000)
  const [isUrgent, setIsUrgent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function requestCashout() {
    if (amount < 1000) return alert('Minimum cashout is 1000 points.')
    if (amount > balance) return alert('Insufficient balance.')
    
    setLoading(true)
    const { error } = await supabase.rpc('request_cashout', {
      p_points: amount,
      p_is_urgent: isUrgent
    })

    if (error) alert(error.message)
    else {
      alert('Cashout requested successfully!')
      setAmount(1000)
      setIsUrgent(false)
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Cash Out Aqua Points</h2>
      <p className="text-sm text-gray-500 mb-1">Available Balance: <span className="font-bold text-cyan-600">{balance} Points</span></p>
      <p className="text-xs text-gray-400 mb-4">Bank: {bankDetails?.bank_name || 'Not Set'} - {bankDetails?.account_number || '******'}</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Min 1000)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            min="1000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="rounded" />
          Urgent Processing (Costs 5 extra points)
        </label>

        <button
          onClick={requestCashout}
          disabled={loading || balance < 1000}
          className="w-full bg-cyan-600 text-white font-semibold py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Request ₦${amount.toLocaleString()} Cashout`}
        </button>
      </div>
    </div>
  )
}
