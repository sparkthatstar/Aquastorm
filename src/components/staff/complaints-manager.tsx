'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ComplaintsManager({ complaints }: { complaints: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Record<string, string>>({})

  async function handleResolve(complaintId: string) {
    const resolution = prompt('Enter internal resolution note (e.g., "Refunded customer", "Vendor warned"):')
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

  async function handleReply(complaintId: string) {
    const text = replyText[complaintId]
    if (!text || !text.trim()) return alert('Please write a reply first.')

    setLoadingId(complaintId)
    const { error } = await supabase.rpc('reply_to_complaint', {
      p_complaint_id: complaintId,
      p_reply: text.trim()
    })

    if (error) {
      alert(error.message)
    } else {
      setReplyText({ ...replyText, [complaintId]: '' })
      router.refresh()
    }
    setLoadingId(null)
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
            <span className={`text-xs font-semibold uppercase ${c.status === 'open' ? 'text-yellow-600' : c.status === 'resolved' ? 'text-green-600' : 'text-blue-600'}`}>
              {c.status.replace('_', ' ')}
            </span>
          </div>
          
          <p className="text-sm text-gray-800 mt-2 bg-gray-50 p-3 rounded-lg">"{c.description}"</p>

          {/* Owner Reply Section */}
          {c.owner_reply ? (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-bold text-blue-900 mb-1">Management Reply:</p>
              <p className="text-sm text-blue-800">{c.owner_reply}</p>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <textarea 
                value={replyText[c.id] || ''}
                onChange={(e) => setReplyText({...replyText, [c.id]: e.target.value})}
                placeholder="Type a reply to the customer..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-cyan-500"
              />
              <button 
                onClick={() => handleReply(c.id)}
                disabled={loadingId === c.id}
                className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingId === c.id ? 'Sending...' : 'Send Reply to Customer'}
              </button>
            </div>
          )}

          {c.status !== 'resolved' && (
            <button 
              onClick={() => handleResolve(c.id)}
              disabled={loadingId === c.id}
              className="w-full mt-3 bg-green-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loadingId === c.id ? 'Resolving...' : 'Mark as Fully Resolved'}
            </button>
          )}
          
          {c.status === 'resolved' && c.resolution && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-xs text-green-800 font-medium">Internal Note: {c.resolution}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
