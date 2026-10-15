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

  // Bank account details
  const bankName = 'OPay'
  const accountName = 'GOSPEL CHUKWUDI'
  const accountNumber = '9157004812'

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Copy failed. Please copy the account number manually.')
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
        const fileExtension = receiptFile.name.split('.').pop() || 'png'
        const filePath = `${orderId}/receipt-${Date.now()}.${fileExtension}`

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
      const message = err.message || 'Failed to place order'
      alert(message)
      setError(message)
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            How many bags?
          </label>

          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-12 w-12 rounded-full bg-gray-100 text-2xl font-bold text-gray-700"
            >
              -
            </button>

            <span className="w-16 text-center text-4xl font-bold text-cyan-600">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="h-12 w-12 rounded-full bg-gray-100 text-2xl font-bold text-gray-700"
            >
              +
            </button>
          </div>

          <p className="mt-2 text-center text-gray-500">
            ₦{pricePerBag} per bag
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-cyan-50 p-4">
          <span className="font-medium text-gray-700">Total:</span>
          <span className="text-xl font-bold text-cyan-600">
            ₦{total.toLocaleString()}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setStep(2)}
          className="w-full rounded-lg bg-cyan-600 py-3 font-semibold text-white hover:bg-cyan-700"
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
            type="button"
            onClick={() => {
              setPaymentMethod('cash')
              setStep(3)
            }}
            className="rounded-xl border-2 border-gray-200 p-6 transition-colors hover:border-cyan-500"
          >
            <span className="mb-2 block text-4xl">💵</span>
            <span className="font-semibold">Cash</span>
            <p className="text-xs text-gray-500">Pay on delivery</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentMethod('transfer')
              setStep(3)
            }}
            className="rounded-xl border-2 border-gray-200 p-6 transition-colors hover:border-cyan-500"
          >
            <span className="mb-2 block text-4xl">🏦</span>
            <span className="font-semibold">Transfer</span>
            <p className="text-xs text-gray-500">Transfer and upload receipt</p>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-sm text-gray-500 hover:underline"
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
            ? 'Bank Transfer & Receipt'
            : 'Any instructions?'}
        </h2>

        {paymentMethod === 'transfer' && (
          <div className="space-y-4">
            <div className="space-y-4 rounded-xl border-2 border-cyan-200 bg-cyan-50 p-5">
              <h3 className="text-lg font-bold text-gray-900">
                Bank Transfer Details
              </h3>

              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="font-bold text-gray-900">{bankName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Account Name</p>
                <p className="font-bold text-gray-900">{accountName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Account Number</p>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xl font-bold tracking-wide text-gray-900">
                    {accountNumber}
                  </p>

                  <button
                    type="button"
                    onClick={copyAccountNumber}
                    className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
                  >
                    {copied ? 'Copied!' : 'Copy Number'}
                  </button>
                </div>
              </div>

              <div className="border-t border-cyan-200 pt-3">
                <p className="text-sm text-gray-600">Amount to Transfer</p>
                <p className="text-2xl font-bold text-cyan-700">
                  ₦{total.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700">
              Transfer the exact amount to the account above, then upload your
              payment receipt below.
            </p>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Upload Payment Receipt
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setReceiptFile(e.target.files?.[0] || null)
                }
                className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100"
              />

              {receiptFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {receiptFile.name}
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Optional Comment
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-cyan-500"
            placeholder="e.g., Meet me at the second gate."
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => setStep(4)}
            disabled={paymentMethod === 'transfer' && !receiptFile}
            className="flex-1 rounded-lg bg-cyan-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            Review
          </button>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="space-y-6">
        <h2 className="font-bold text-gray-900">Review Order</h2>

        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Quantity:</span>
            <span className="font-semibold">{quantity} bags</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Payment:</span>
            <span className="font-semibold capitalize">{paymentMethod}</span>
          </div>

          {paymentMethod === 'transfer' && (
            <>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Bank:</span>
                <span className="font-semibold">{bankName}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Account Name:</span>
                <span className="text-right font-semibold">{accountName}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Account Number:</span>
                <span className="font-semibold">{accountNumber}</span>
              </div>
            </>
          )}

          {receiptFile && (
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Receipt:</span>
              <span className="max-w-[150px] truncate font-semibold">
                {receiptFile.name}
              </span>
            </div>
          )}

          {comment && (
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Note:</span>
              <span className="max-w-[150px] truncate font-semibold">
                {comment}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t pt-3">
            <span className="font-bold text-gray-900">Total:</span>
            <span className="font-bold text-cyan-600">
              ₦{total.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-cyan-600 py-3 font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          {loading ? 'Placing Order…' : 'Confirm & Submit'}
        </button>

        <button
          type="button"
          onClick={() => setStep(3)}
          className="w-full text-sm text-gray-500 hover:underline"
        >
          ← Back
        </button>
      </div>
    )
  }

  return null
}
```
