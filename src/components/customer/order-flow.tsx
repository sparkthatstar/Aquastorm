```tsx
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
  const [copied, setCopied] = useState(false)

  const pricePerBag = 450
  const total = quantity * pricePerBag

  const bankName = 'OPay'
  const accountName = 'GOSPEL CHUKWUDI'
  const accountNumber = '9157004812'

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      alert('Unable to copy automatically. Please copy the account number manually.')
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      const { data: orderId, error: rpcError } = await supabase.rpc(
        'create_customer_order',
        {
          p_quantity: quantity,
          p_payment_method: paymentMethod,
          p_comment: comment || null,
        }
      )

      if (rpcError) throw rpcError

      if (paymentMethod === 'transfer' && receiptFile) {
        const filePath = `${orderId}/receipt-${Date.now()}.${receiptFile.name.split('.').pop() || 'png'}`

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('id')
          .eq('order_id', orderId)
          .single()

        if (paymentError) throw paymentError

        if (paymentData) {
          const {
            data: { user },
          } = await supabase.auth.getUser()

          const { error: receiptError } = await supabase
            .from('payment_receipts')
            .insert({
              payment_id: paymentData.id,
              storage_path: filePath,
              original_filename: receiptFile.name,
              content_type: receiptFile.type,
              file_size_bytes: receiptFile.size,
              uploaded_by: user?.id,
            })

          if (receiptError) throw receiptError
        }
      }

      router.push('/customer-dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Order Error:', err)
      setError(err.message || 'Failed to place order')
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            How many bags?
          </label>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 rounded-full bg-gray-100 text-2xl font-bold text-gray-800"
            >
              -
            </button>

            <span className="text-4xl font-bold text-cyan-700 w-16 text-center">
              {quantity}
            </span>

            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 rounded-full bg-gray-100 text-2xl font-bold text-gray-800"
            >
              +
            </button>
          </div>

          <p className="text-center text-gray-700 mt-2">
            ₦{pricePerBag.toLocaleString()} per bag
          </p>
        </div>

        <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-lg flex justify-between items-center">
          <span className="font-semibold text-gray-800">Total:</span>
          <span className="text-xl font-bold text-cyan-800">
            ₦{total.toLocaleString()}
          </span>
        </div>

        <button
          onClick={() => setStep(2)}
          className="w-full bg-cyan-700 text-white font-semibold py-3 rounded-lg hover:bg-cyan-800"
        >
          Continue
        </button>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <h2 className="font-bold text-gray-900">Payment Method</h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setPaymentMethod('cash')
              setStep(3)
            }}
            className="border-2 border-gray-300 rounded-xl p-6 hover:border-cyan-600 transition-colors text-gray-900"
          >
            <span className="text-4xl block mb-2">💵</span>
            <span className="font-semibold">Cash</span>
            <p className="text-xs text-gray-700 mt-1">Pay on delivery</p>
          </button>

          <button
            onClick={() => {
              setPaymentMethod('transfer')
              setStep(3)
            }}
            className="border-2 border-gray-300 rounded-xl p-6 hover:border-cyan-600 transition-colors text-gray-900"
          >
            <span className="text-4xl block mb-2">🏦</span>
            <span className="font-semibold">Bank Transfer</span>
            <p className="text-xs text-gray-700 mt-1">Transfer and upload receipt</p>
          </button>
        </div>

        <button
          onClick={() => setStep(1)}
          className="text-gray-700 text-sm hover:underline"
        >
          ← Back
        </button>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="space-y-6">
        <h2 className="font-bold text-gray-900">
          {paymentMethod === 'transfer'
            ? 'Bank Transfer Details'
            : 'Any Instructions?'}
        </h2>

        {paymentMethod === 'transfer' && (
          <div className="space-y-4">
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                AQUASTORM PAYMENT
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-700">Bank Name</p>
                  <p className="font-bold text-gray-900">{bankName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-700">Account Name</p>
                  <p className="font-bold text-gray-900">{accountName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-700">Account Number</p>

                  <div className="flex items-center justify-between gap-3 mt-1">
                    <p className="text-xl font-bold tracking-wider text-gray-900">
                      {accountNumber}
                    </p>

                    <button
                      type="button"
                      onClick={copyAccountNumber}
                      className="shrink-0 bg-cyan-700 text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-cyan-800"
                    >
                      {copied ? 'Copied!' : 'Copy Number'}
                    </button>
                  </div>
                </div>

                <div className="border-t border-cyan-200 pt-4">
                  <p className="text-sm text-gray-700">Amount to Transfer</p>
                  <p className="text-2xl font-bold text-cyan-800">
                    ₦{total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-900">
                Important Payment Instructions
              </p>
              <p className="text-sm text-amber-900 mt-2">
                Transfer the exact amount shown above to the account details
                provided. After completing your transfer, upload your payment
                receipt below.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Upload Payment Receipt
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setReceiptFile(e.target.files?.[0] || null)
                }
                className="block w-full text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-100 file:text-cyan-900 hover:file:bg-cyan-200"
              />

              {receiptFile && (
                <p className="text-sm text-green-800 mt-2">
                  Selected: {receiptFile.name}
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Optional Comment
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-cyan-600"
            placeholder="e.g., Meet me at the second gate."
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep(2)}
            className="flex-1 border border-gray-300 text-gray-900 font-semibold py-3 rounded-lg"
          >
            Back
          </button>

          <button
            onClick={() => setStep(4)}
            disabled={paymentMethod === 'transfer' && !receiptFile}
            className="flex-1 bg-cyan-700 text-white font-semibold py-3 rounded-lg hover:bg-cyan-800 disabled:opacity-50"
          >
            Review Order
          </button>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="space-y-6">
        <h2 className="font-bold text-gray-900">Review Order</h2>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-gray-700">Quantity:</span>
            <span className="font-semibold text-gray-900">
              {quantity} bags
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-gray-700">Payment:</span>
            <span className="font-semibold text-gray-900 capitalize">
              {paymentMethod === 'transfer' ? 'Bank Transfer' : paymentMethod}
            </span>
          </div>

          {paymentMethod === 'transfer' && (
            <div className="bg-cyan-50 rounded-lg p-3 space-y-1">
              <p className="font-semibold text-gray-900">
                Transfer to {bankName}
              </p>
              <p className="text-gray-800">{accountName}</p>
              <p className="font-bold text-gray-900">{accountNumber}</p>
            </div>
          )}

          {receiptFile && (
            <div className="flex justify-between gap-3">
              <span className="text-gray-700">Receipt:</span>
              <span className="font-semibold text-gray-900 truncate max-w-[150px]">
                {receiptFile.name}
              </span>
            </div>
          )}

          {comment && (
            <div className="flex justify-between gap-3">
              <span className="text-gray-700">Note:</span>
              <span className="font-semibold text-gray-900 break-words">
                {comment}
              </span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="font-bold text-gray-900">Total:</span>
            <span className="font-bold text-cyan-800">
              ₦{total.toLocaleString()}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-cyan-700 text-white font-semibold py-3 rounded-lg hover:bg-cyan-800 disabled:opacity-50"
        >
          {loading ? 'Placing Order...' : 'Confirm & Submit'}
        </button>

        <button
          onClick={() => setStep(3)}
          className="w-full text-gray-700 text-sm hover:underline"
        >
          ← Back
        </button>
      </div>
    )
  }

  return null
}
```
