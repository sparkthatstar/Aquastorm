// @ts-nocheck
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
    if (qty === 0) return alert("Please enter a quantity greater than 0.")

    const { error } = await supabase.rpc('adjust_inventory', {
      p_vendor_id: vendorId,
      p_quantity: qty,
      p_note: 'Manual stock addition by staff'
    })
    
    if (error) {
      alert("Error adding stock: " + error.message)
    } else {
      alert(`Successfully added ${qty} bags to inventory!`)
      setStockInput({ ...stockInput, [vendorId]: '' })
      router.refresh()
    }
  }

  if (vendors.length === 0) {
    return <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-sm">No approved vendors found.</div>
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      {vendors.map((v) => {
        // Read the nested data directly
        const name = v.profile?.full_name || 'Unknown Vendor'
        const inv = v.inventory?.[0] || v.inventory

        return (
          <div key={v.profile_id} className="flex items-center justify-between border-b pb-3 last:border-0">
            <div>
              <p className="font-medium text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">
                Avail: {inv?.available || 0} | Reserved: {inv?.reserved || 0}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                value={stockInput[v.profile_id] || ''}
                onChange={(e) => setStockInput({...stockInput, [v.profile_id]: e.target.value})}
                placeholder="+ Stock"
                className="w-20 px-2 py-1 border border-gray-200 rounded-md text-sm"
              />
              <button 
                onClick={() => addStock(v.profile_id)}
                className="bg-cyan-600 text-white text-sm py-1 px-3 rounded-md hover:bg-cyan-700"
              >
                Add
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
