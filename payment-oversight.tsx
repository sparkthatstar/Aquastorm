'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getReceiptSignedUrl } from '@/app/actions/receipt-actions'

export default function PaymentOversight({ payments }: { payments: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)

  async function viewReceipt(storagePath: string) {
    setReceiptUrl(null)
    const { url, error } = await getReceiptSignedUrl(storagePath)
    if (error) alert(error)
    if (url) setReceiptUrl(url)
  }

  async function resolveFlag(paymentId: string, isFraud: boolean) {
    const note = prompt(`Enter resolution note for ${isFraud ? 'FRAUD' : 'CLEAN'}:`)
    if (!note) return

    setLoadingId(paymentId)
    const { error } = await supabase.rpc('resolve_suspicious_payment', {
      p_payment_id: paymentId,
      p_is_fraud: isFraud,
      p_resolution_note: note
    })
    
    if (error) alert(error.message)
    setLoadingId(null)
    router.refresh()
  }

  if (payments.length === 0) {
    return <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-sm">No payments require review.</div>
  }

  return (
    <div className="space-y-4">
      {receiptUrl && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReceiptUrl(null)}>
          <div className="bg-white p-2 rounded-xl max-w-md w-full">
            <img src={receiptUrl} alt="Receipt" className="rounded-lg w-full h-auto" />
            <p className="text-center text-xs text-gray-500 mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}

      {payments.map((payment) => (
        <div key={payment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-bold text-gray-900">₦{payment.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 capitalize">
                {payment.method} • Status: <span className={`font-semibold ${payment.status === 'flagged' ? 'text-red-600' : 'text-yellow-600'}`}>{payment.status.replace('_', ' ')}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Order: {payment.order_id.substring(0, 8)}...</p>
            </div>
            
            {payment.status === 'flagged' && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Suspicious</span>
            )}
          </div>

          {payment.receipts && payment.receipts.length > 0 && (
            <button 
              onClick={() => viewReceipt(payment.receipts[0].storage_path)}
              className="text-sm text-cyan-600 font-semibold hover:underline mb-3 flex items-center gap-1"
            >
              🖼️ View Receipt
            </button>
          )}

          {payment.status === 'flagged' && (
            <div className="flex gap-2 mt-2 border-t pt-3">
              <button 
                onClick={() => resolveFlag(payment.id, true)}
                disabled={loadingId === payment.id}
                className="flex-1 bg-red-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Mark as Fraud
              </button>
              <button 
                onClick={() => resolveFlag(payment.id, false)}
                disabled={loadingId === payment.id}
                className="flex-1 bg-green-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Resolve as Clean
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
