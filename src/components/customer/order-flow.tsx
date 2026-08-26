'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OrderFlow() {
  const supabase = createClient()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [quantity, setQuantity] = useState(5)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pricePerBag = 450
  const total = quantity * pricePerBag

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      const { data: orderId, error: rpcError } = await supabase.rpc('create_customer_order', {
        p_quantity: quantity,
        p_payment_method: paymentMethod,
        p_comment: comment || null
      })

      if (rpcError) throw rpcError

      if (paymentMethod === 'transfer' && receiptFile) {
        const filePath = `${orderId}/receipt-${Date.now()}.png`
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        const { data: paymentData } = await supabase
          .from('payments')
          .select('id')
          .eq('order_id', orderId)
          .single()

        if (paymentData) {
          const { data: { user } } = await supabase.auth.getUser()
          await supabase.from('payment_receipts').insert({
            payment_id: paymentData.id,
            storage_path: filePath,
            original_filename: receiptFile.name,
            content_type: receiptFile.type,
            file_size_bytes: receiptFile.size,
            uploaded_by: user?.id
          })
        }
      }

      router.push('/dashboard')
      router.refresh()
        } catch (err: any) {
      console.error("Order Error:", err)
      alert(err.message || 'Failed to place order')
      setError(err.message || 'Failed to place order')
      setLoading(false)
    }
  }

  if (step === 1) return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How many bags?</label>
        <div className="flex items-center justify-center gap-6">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-full bg-gray-100 text-2xl font-bold text-gray-700">-</button>
          <span className="text-4xl font-bold text-cyan-600 w-16 text-center">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 rounded-full bg-gray-100 text-2xl font-bold text-gray-700">+</button>
        </div>
        <p className="text-center text-gray-500 mt-2">₦{pricePerBag} per bag</p>
      </div>
      
      <div className="bg-cyan-50 p-4 rounded-lg flex justify-between items-center">
        <span className="font-medium text-gray-700">Total:</span>
        <span className="text-xl font-bold text-cyan-600">₦{total.toLocaleString()}</span>
      </div>

      <button onClick={() => setStep(2)} className="w-full bg-cyan-600 text-white font-semibold py-3 rounded-lg hover:bg-cyan-700">
        Continue
      </button>
    </div>
  )

  if (step === 2) return (
    <div className="space-y-6">
      <h2 className="font-bold text-gray-900">Payment Method</h2>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => { setPaymentMethod('cash'); setStep(3) }} className="border-2 border-gray-200 rounded-xl p-6 hover:border-cyan-500 transition-colors">
          <span className="text-4xl block mb-2">💵</span>
          <span className="font-semibold">Cash</span>
          <p className="text-xs text-gray-500">Pay on delivery</p>
        </button>
        <button onClick={() => { setPaymentMethod('transfer'); setStep(3) }} className="border-2 border-gray-200 rounded-xl p-6 hover:border-cyan-500 transition-colors">
          <span className="text-4xl block mb-2">🏦</span>
          <span className="font-semibold">Transfer</span>
          <p className="text-xs text-gray-500">Upload receipt</p>
        </button>
      </div>
      <button onClick={() => setStep(1)} className="text-gray-500 text-sm hover:underline">← Back</button>
    </div>
  )

  if (step === 3) return (
    <div className="space-y-6">
      <h2 className="font-bold text-gray-900">{paymentMethod === 'transfer' ? 'Upload Receipt' : 'Any instructions?'}</h2>
      
      {paymentMethod === 'transfer' && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Transfer ₦{total.toLocaleString()} to the business account. Upload the proof below.</p>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Optional Comment</label>
        <textarea 
          value={comment} 
          onChange={(e) => setComment(e.target.value)} 
          rows={3} 
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500" 
          placeholder="e.g., Meet me at the second gate."
        />
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

      <div className="flex gap-3">
        <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg">Back</button>
        <button onClick={() => setStep(4)} disabled={paymentMethod === 'transfer' && !receiptFile} className="flex-1 bg-cyan-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50">
          Review
        </button>
      </div>
    </div>
  )

  if (step === 4) return (
    <div className="space-y-6">
      <h2 className="font-bold text-gray-900">Review Order</h2>
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Quantity:</span> <span className="font-semibold">{quantity} bags</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Payment:</span> <span className="font-semibold capitalize">{paymentMethod}</span></div>
        {receiptFile && <div className="flex justify-between"><span className="text-gray-500">Receipt:</span> <span className="font-semibold truncate max-w-[150px]">{receiptFile.name}</span></div>}
        {comment && <div className="flex justify-between"><span className="text-gray-500">Note:</span> <span className="font-semibold truncate max-w-[150px]">{comment}</span></div>}
        <div className="border-t pt-3 flex justify-between"><span className="font-bold text-gray-900">Total:</span> <span className="font-bold text-cyan-600">₦{total.toLocaleString()}</span></div>
      </div>

      <button onClick={handleSubmit} disabled={loading} className="w-full bg-cyan-600 text-white font-semibold py-3 rounded-lg hover:bg-cyan-700 disabled:opacity-50">
        {loading ? 'Placing Order…' : 'Confirm & Submit'}
      </button>
      <button onClick={() => setStep(3)} className="w-full text-gray-500 text-sm hover:underline">← Back</button>
    </div>
  )

  return null
}
