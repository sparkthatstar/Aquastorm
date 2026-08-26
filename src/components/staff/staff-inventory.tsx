'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function StaffInventory({ vendors, profiles }: { vendors: any[]; profiles: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [stockInput, setStockInput] = useState<Record<string, string>>({})
  const [inventoryMap, setInventoryMap] = useState<Record<string, any>>({})

  // Fetch inventory for each vendor separately to avoid 400 errors
  useEffect(() => {
    async function fetchInventory() {
      if (vendors.length === 0) return
      const vendorIds = vendors.map(v => v.profile_id)
      const { data } = await supabase
        .from('inventory')
        .select('vendor_id, available, reserved, delivered')
        .in('vendor_id', vendorIds)
      
      if (data) {
        const map: Record<string, any> = {}
        data.forEach(inv => { map[inv.vendor_id] = inv })
        setInventoryMap(map)
      }
    }
    fetchInventory()
  }, [vendors])

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
        const profile = profiles.find(p => p.id === v.profile_id)
        const name = profile?.full_name || 'Unknown Vendor'
        const inv = inventoryMap[v.profile_id]

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
