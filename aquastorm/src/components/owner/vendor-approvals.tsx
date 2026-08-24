'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function VendorApprovals({ requests }: { requests: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleResolve(requestId: string, approve: boolean) {
    setLoadingId(requestId)
    const { error } = await supabase.rpc('resolve_vendor_removal', { 
      p_request_id: requestId, 
      p_approve: approve 
    })
    if (error) alert(error.message)
    setLoadingId(null)
    router.refresh()
  }

  if (requests.length === 0) {
    return <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-sm">No pending removal requests.</div>
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-900">
            <span className="font-bold">{req.manager?.full_name}</span> requested to remove vendor <span className="font-bold">{req.vendor?.full_name}</span>.
          </p>
          <p className="text-xs text-gray-500 mt-1">Reason: {req.metadata?.reason || 'No reason provided'}</p>
          
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => handleResolve(req.id, true)}
              disabled={loadingId === req.id}
              className="flex-1 bg-red-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Approve Removal
            </button>
            <button 
              onClick={() => handleResolve(req.id, false)}
              disabled={loadingId === req.id}
              className="flex-1 border border-gray-300 text-gray-700 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Reject Request
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
