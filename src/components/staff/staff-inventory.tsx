'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function StaffInventory({ vendors }: { vendors: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [stockInput, setStockInput] = useState<Record<string, string>>({})

  async function addStock(vendorId: string) {
    const qty = parseInt(stockInput[vendorId] || '0')
    if (qty === 0) return

    await supabase.rpc('adjust_inventory', {
      p_vendor_id: vendorId,
      p_quantity: qty,
      p_note: 'Manual stock addition'
    })
    
    setStockInput({ ...stockInput, [vendorId]: '' })
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      {vendors.map((v) => (
        <div key={v.profile.id} className="flex items-center justify-between border-b pb-3 last:border-0">
          <div>
            <p className="font-medium text-gray-900">{v.profile.full_name}</p>
            <p className="text-xs text-gray-500">
              Avail: {v.inventory?.available || 0} | Reserved: {v.inventory?.reserved || 0}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number"
              value={stockInput[v.profile.id] || ''}
              onChange={(e) => setStockInput({...stockInput, [v.profile.id]: e.target.value})}
              placeholder="+ Stock"
              className="w-20 px-2 py-1 border border-gray-200 rounded-md text-sm"
            />
            <button 
              onClick={() => addStock(v.profile.id)}
              className="bg-cyan-600 text-white text-sm py-1 px-3 rounded-md hover:bg-cyan-700"
            >
              Add
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
