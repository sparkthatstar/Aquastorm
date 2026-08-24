'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CashoutApproval({ requests, userRole }: { requests: any[]; userRole: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [ledgerData, setLedgerData] = useState<any[] | null>(null)

  async function handleAction(id: string, action: 'validate' | 'pay' | 'reject') {
    setLoadingId(id)
    let rpcName = ''
    let params: any = { p_cashout_id: id }

    if (action === 'validate') rpcName = 'validate_cashout'
    if (action === 'pay') rpcName = 'pay_cashout'
    if (action === 'reject') {
      rpcName = 'reject_cashout'
      const reason = prompt('Enter rejection reason:')
      if (!reason) { setLoadingId(null); return }
      params.p_reason = reason
    }

    const { error } = await supabase.rpc(rpcName, params)
    if (error) alert(error.message)
    setLoadingId(null)
    router.refresh()
  }

  async function viewHistory(vendorId: string) {
    setLoadingId(vendorId)
    const { data, error } = await supabase
      .from('aqua_points_ledger')
      .select('entry_type, amount, note, created_at')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(15)
    
    if (error) alert(error.message)
    if (data) setLedgerData(data)
    setLoadingId(null)
  }

  function closeModal() {
    setLedgerData(null)
  }

  return (
    <div className="space-y-4">
      {ledgerData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Points History</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="max-h-80 overflow-y-auto space-y-3 border-t pt-3">
              {ledgerData.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 capitalize">{entry.entry_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleString()}</p>
                    {entry.note && <p className="text-xs text-gray-400 italic mt-1">{entry.note}</p>}
                  </div>
                  <span className={`font-bold ${entry.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {requests.length === 0 && <div className="text-gray-500 text-sm text-center py-4">No pending cashouts.</div>}
      
      {requests.map((req) => (
        <div key={req.id} className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-bold text-gray-900">{req.vendor?.full_name}</p>
              <p className="text-sm text-cyan-600 font-semibold">
                ₦{req.points_amount.toLocaleString()} 
                {req.is_urgent && <span className="text-red-500 text-xs ml-2">(URGENT)</span>}
              </p>
              <p className="text-xs text-gray-500">Status: <span className="capitalize">{req.status.replace('_', ' ')}</span></p>
              
              <div className="mt-2 bg-gray-50 border border-gray-200 rounded-md p-2 text-xs text-gray-700">
                <p className="font-semibold text-gray-800">🏦 Payout Details:</p>
                <p>{req.vendor?.bank_name || 'N/A'}</p>
                <p>{req.vendor?.account_name || 'N/A'}</p>
                <p>{req.vendor?.account_number || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 items-end">
              <button 
                onClick={() => viewHistory(req.vendor_id)} 
                disabled={loadingId === req.vendor_id}
                className="text-xs text-gray-600 border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50"
              >
                View History
              </button>
              
              <div className="flex gap-2">
                {userRole === 'manager' && req.status === 'processing' && (
                  <button onClick={() => handleAction(req.id, 'validate')} disabled={loadingId === req.id} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md hover:bg-blue-700">Validate</button>
                )}
                {userRole === 'owner' && req.status === 'manager_validated' && (
                  <>
                    <button onClick={() => handleAction(req.id, 'pay')} disabled={loadingId === req.id} className="bg-green-600 text-white text-xs px-3 py-1 rounded-md hover:bg-green-700">Mark Paid</button>
                    <button onClick={() => handleAction(req.id, 'reject')} disabled={loadingId === req.id} className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-md hover:bg-red-200">Reject</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
