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
  const [clearing, setClearing] = useState(false)

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

  async function handleClearHistory() {
    if (!confirm('This will permanently delete all DELIVERED and CANCELLED orders, receipts, and chats to save storage space. Active/Pending orders will not be affected. Proceed?')) return
    
    setClearing(true)
    const { error } = await supabase.rpc('clear_old_transactions')
    if (error) alert(error.message)
    setClearing(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Clear History Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleClearHistory}
          disabled={clearing}
          className="mb-4 bg-gray-100 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {clearing ? 'Clearing...' : 'Clear Old History'}
        </button>
      </div>

      {/* Receipt Viewer Modal */}
      {receiptUrl && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReceiptUrl(null)}>
          <div className="bg-white p-2 rounded-xl max-w-md w-full">
            <img src={receiptUrl} alt="Receipt" className="rounded-lg w-full h-auto" />
            <p className="text-center text-xs text-gray-500 mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-sm">No payments require review.</div>
      ) : (
        payments.map((payment
