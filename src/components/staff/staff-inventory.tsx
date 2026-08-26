// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function StaffInventory({ vendors }: { vendors: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [stockInput, setStockInput] = useState<Record<string, string>>({})
  const [vendorData, setVendorData] = useState<any[]>([])

  useEffect(() => {
    async function fetchDetails() {
      if (vendors.length === 0) return setVendorData([])
      
      const vendorIds = vendors.map(v => v.profile_id)
      
      // Fetch names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', vendorIds)

      // Fetch inventory
      const { data: inventories } = await supabase
        .from('inventory')
        .select('vendor_id, available, reserved, delivered')
        .in('vendor_id', vendorIds)

      // Combine them
      const combined = vendors.map(v => {
        const profile = profiles?.find(p => p.id === v.profile_id)
        const inv = inventories?.find(i => i.vendor_id === v.profile_id)
        return {
          id: v.profile_id,
          name: profile?.full_name || 'Unknown Vendor',
          available: inv?.available || 0,
          reserved: inv?.reserved || 0
        }
      })
      setVendorData(combined)
    }
    fetchDetails()
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

  if (vendorData.length === 0) {
    return <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-sm">No approved vendors found.</div>
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      {vendorData.map((v) => (
        <div key={v.id} className="flex items-center justify-between border-b pb-3 last:border-0">
          <div>
            <p className="font-medium text-gray-900">{v.name}</p>
            <p className="text-xs text-gray-500">
              Avail: {v.available} | Reserved: {v.reserved}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number"
              value={stockInput[v.id] || ''}
              onChange={(e) => setStockInput({...stockInput, [v.id]: e.target.value})}
              placeholder="+ Stock"
              className="w-20 px-2 py-1 border border-gray-200 rounded-md text-sm"
            />
            <button 
              onClick={() => addStock(v.id)}
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
