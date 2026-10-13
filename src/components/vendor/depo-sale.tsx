'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DepoSale() {
  const supabase = createClient()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')
  const [loading, setLoading] = useState(false)

  async function handleSale(e: React.FormEvent) {
    e.preventDefault()
    if (quantity <= 0) return alert('Quantity must be at least 1.')

    setLoading(true)
    const { data, error } = await supabase.rpc('create_depo_sale', {
      p_quantity: Number(quantity),
      p_payment_method: paymentMethod
    })

    if (error) {
      alert('Error logging sale: ' + error.message)
    } else {
      alert('Depo sale logged successfully! Stock deducted, points awarded, and ledger updated.')
      setQuantity(1)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Depo Sales (Walk-in)</h2>
      <p className="text-sm text-gray-600 mb-4">Log physical purchases. Stock, points, and Aqua Ledger update instantly.</p>
      
      <form onSubmit={handleSale} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Quantity (Bags)</label>
          <input 
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Payment Method</label>
          <select 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'transfer')}
            className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-cyan-500"
          >
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {loading ? 'Logging Sale...' : 'Log Walk-in Sale'}
        </button>
      </form>
    </div>
  )
}
