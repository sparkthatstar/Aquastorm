'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ComplaintsManager({ complaints }: { complaints: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleResolve(complaintId: string) {
    const resolution = prompt('Enter resolution note (e.g., "Refunded customer", "Vendor warned"):')
    if (!resolution) return

    setLoadingId(complaintId)
    const { error } = await supabase
      .from('complaints')
      .update({ status: 'resolved', resolution, resolved_at: new Date().toISOString() })
      .eq('id', complaintId)

    if (error) alert(error.message)
    setLoadingId(null)
    router.refresh()
  }

  if (complaints.length === 0) {
    return <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-sm">No active complaints.</div>
  }

  return (
    <div className="space-y-4">
      {complaints.map((c) => (
        <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs font-semibold bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">{c.category}</span>
              <p className="text-xs text-gray-500 mt-1">From: {c.customer?.full_name || 'Unknown Customer'}</p>
            </div>
            <span className={`text-xs font-semibold uppercase ${c.status === 'open' ? 'text-yellow-600' : 'text-green-600'}`}>
              {c.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-800 mt-2 bg-gray-50 p-3 rounded-lg">"{c.description}"</p>

          {c.status === 'open' && (
            <button 
              onClick={() => handleResolve(c.id)}
              disabled={loadingId === c.id}
              className="w-full mt-3 bg-green-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loadingId === c.id ? 'Resolving...' : 'Mark as Resolved'}
            </button>
          )}
          
          {c.status === 'resolved' && c.resolution && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-xs text-green-800 font-medium">Resolution: {c.resolution}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
