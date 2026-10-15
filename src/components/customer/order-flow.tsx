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

  // Aquastorm bank account details
  const bankName = 'OPay'
  const accountName = 'GOSPEL CHUKWUDI'
  const accountNumber = '9157004812'

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      alert(
        `Unable to copy automatically. Please copy this account number: ${accountNumber}`
      )
    }
  }

  async function handleSubmit() {
    if (!paymentMethod) {
      setError('Please select a payment method.')
      return
    }

    if (paymentMethod === 'transfer' && !receiptFile) {
      setError('Please upload your transfer receipt before submitting.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const {
        data: orderId,
        error: rpcError,
      } = await supabase.rpc('create_customer_order', {
        p_quantity: quantity,
        p_payment_method: paymentMethod,
        p_comment: comment || null,
      })

      if (rpcError) throw rpcError

      if (!orderId) {
        throw new Error('The order could not be created. Please try again.')
      }

      if (paymentMethod === 'transfer' && receiptFile) {
        const extension = receiptFile.name.split('.').pop() || 'png'
        const filePath = `${orderId}/receipt-${Date.now()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        const {
          data: paymentData,
          error: paymentError,
        } = await supabase
          .from('payments')
          .select('id')
          .eq('order_id', orderId)
          .single()

        if (paymentError) throw paymentError

        if (!paymentData) {
          throw new Error(
            'Your order was created, but its payment record could not be found. Please contact Aquastorm before placing another order.'
          )
        }

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

      router.push('/customer-dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Order Error:', err)

      setError(
        err.message ||
          'Something went wrong while processing your order. Please try again.'
      )

      setLoading(false)
    }
  }

  // STEP 1: Select quantity
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            How many bags?
          </label>

          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-12 w-12 rounded-full bg-gray-100 text-2xl font-bold text-gray-900 hover:bg-gray-200"
              aria-label="Decrease quantity"
            >
              -
            </button>

            <span className="w-16 text-center text-4xl font-bold text-cyan-700">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="h-12 w-12 rounded-full bg-gray-100 text-2xl font-bold text-gray-900 hover:bg-gray-200"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <p className="mt-2 text-center text-gray-700">
            ₦{pricePerBag.toLocaleString()} per bag
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-cyan-200 bg-cyan-50 p-4">
          <span className="font-semibold text-gray-900">Total:</span>

          <span className="text-xl font-bold text-cyan-800">
            ₦{total.toLocaleString()}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null)
            setStep(2)
          }}
          className="w-full rounded-lg bg-cyan-700 py-3 font-semibold text-white hover:bg-cyan-800"
        >
          Continue
        </button>
      </div>
    )
  }

  // STEP 2: Select payment method
  if (step === 2) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900">
          Payment Method
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('cash')
              setError(null)
              setStep(3)
            }}
            className="rounded-xl border-2 border-gray-300 p-5 text-gray-900 transition-colors hover:border-cyan-600"
          >
            <span className="mb-2 block text-4xl">💵</span>

            <span className="font-semibold">Cash</span>

            <p className="mt-1 text-xs text-gray-700">
              Pay on delivery
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentMethod('transfer')
              setError(null)
              setStep(3)
            }}
            className="rounded-xl border-2 border-cyan-500 bg-cyan-50 p-5 text-gray-900 transition-colors hover:border-cyan-700"
          >
            <span className="mb-2 block text-4xl">🏦</span>

            <span className="font-semibold">Bank Transfer</span>

            <p className="mt-1 text-xs text-gray-700">
              Transfer and upload receipt
            </p>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-sm text-gray-700 hover:underline"
        >
          ← Back
        </button>
      </div>
    )
  }

  // STEP 3: Show payment details and collect receipt
  if (step === 3) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900">
          {paymentMethod === 'transfer'
            ? 'Complete Your Bank Transfer'
            : 'Any Instructions?'}
        </h2>

        {paymentMethod === 'transfer' && (
          <div className="space-y-4">
            {/* Prominent bank account card */}
            <div className="overflow-hidden rounded-2xl border-2 border-cyan-300 bg-white shadow-sm">
              <div className="bg-cyan-700 p-4">
                <p className="text-sm font-medium text-white">
                  AQUASTORM
                </p>

                <h3 className="mt-1 text-xl font-bold text-white">
                  Payment Account
                </h3>

                <p className="mt-1 text-sm text-cyan-50">
                  Transfer the amount below to complete your order.
                </p>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Bank Name
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-950">
                    {bankName}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Account Name
                  </p>

                  <p className="mt-1 break-words text-lg font-bold text-gray-950">
                    {accountName}
                  </p>
                </div>

                <div className="rounded-xl border-2 border-cyan-200 bg-cyan-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">
                    Account Number
                  </p>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="break-all text-2xl font-extrabold tracking-wider text-gray-950">
                      {accountNumber}
                    </p>

                    <button
                      type="button"
                      onClick={copyAccountNumber}
                      className="rounded-lg bg-cyan-700 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-800"
                    >
                      {copied ? 'Copied!' : 'Copy Number'}
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-600">
                    Exact Amount to Transfer
                  </p>

                  <p className="mt-1 text-3xl font-extrabold text-cyan-800">
                    ₦{total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment instructions */}
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p className="font-bold text-amber-950">
                Important Payment Instructions
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-950">
                1. Open your banking app.
                <br />
                2. Transfer exactly ₦{total.toLocaleString()} to the OPay
                account shown above.
                <br />
                3. Confirm the recipient details before sending the money.
                <br />
                4. Upload your payment receipt below.
              </p>
            </div>

            {/* Receipt upload */}
            <div className="rounded-xl border border-gray-300 p-4">
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Upload Payment Receipt
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setReceiptFile(e.target.files?.[0] || null)
                  setError(null)
                }}
                className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-900 hover:file:bg-cyan-200"
              />

              {receiptFile && (
                <p className="mt-3 break-words text-sm font-medium text-green-800">
                  Receipt selected: {receiptFile.name}
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Optional Comment
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-950 placeholder:text-gray-600 focus:ring-2 focus:ring-cyan-600"
            placeholder="e.g., Meet me at the second gate."
          />
        </div>

        {error && (
          <div
            role="alert"
            className="break-words rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800"
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setError(null)
              setStep(2)
            }}
            className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-900 hover:bg-gray-50"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => {
              setError(null)
              setStep(4)
            }}
            disabled={paymentMethod === 'transfer' && !receiptFile}
            className="flex-1 rounded-lg bg-cyan-700 py-3 font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Review Order
          </button>
        </div>
      </div>
    )
  }

  // STEP 4: Review and submit order
  if (step === 4) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900">
          Review Order
        </h2>

        <div className="space-y-4 rounded-xl border border-gray-300 bg-white p-5 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-gray-700">Quantity:</span>

            <span className="font-semibold text-gray-950">
              {quantity} bags
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-gray-700">Payment Method:</span>

            <span className="font-semibold text-gray-950">
              {paymentMethod === 'transfer' ? 'Bank Transfer' : 'Cash'}
            </span>
          </div>

          {paymentMethod === 'transfer' && (
            <div className="space-y-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
              <h3 className="font-bold text-gray-950">
                Transfer Details
              </h3>

              <div>
                <p className="text-gray-700">Bank Name</p>
                <p className="font-bold text-gray-950">{bankName}</p>
              </div>

              <div>
                <p className="text-gray-700">Account Name</p>
                <p className="break-words font-bold text-gray-950">
                  {accountName}
                </p>
              </div>

              <div>
                <p className="text-gray-700">Account Number</p>
                <p className="break-all text-xl font-extrabold tracking-wider text-gray-950">
                  {accountNumber}
                </p>

                <button
                  type="button"
                  onClick={copyAccountNumber}
                  className="mt-2 rounded-lg bg-cyan-700 px-3 py-2 font-semibold text-white hover:bg-cyan-800"
                >
                  {copied ? 'Copied!' : 'Copy Account Number'}
                </button>
              </div>

              <div>
                <p className="text-gray-700">Amount to Transfer</p>
                <p className="text-xl font-extrabold text-cyan-800">
                  ₦{total.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {receiptFile && (
            <div className="flex justify-between gap-3">
              <span className="text-gray-700">Receipt:</span>

              <span className="max-w-[180px] break-all text-right font-semibold text-gray-950">
                {receiptFile.name}
              </span>
            </div>
          )}

          {comment && (
            <div>
              <p className="text-gray-700">Comment:</p>
              <p className="mt-1 break-words font-semibold text-gray-950">
                {comment}
              </p>
            </div>
          )}

          <div className="flex justify-between border-t border-gray-200 pt-4">
            <span className="font-bold text-gray-950">Total:</span>

            <span className="text-xl font-extrabold text-cyan-800">
              ₦{total.toLocaleString()}
            </span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="break-words rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800"
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-cyan-700 py-3 font-bold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Placing Order...' : 'Confirm & Submit'}
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null)
            setStep(3)
          }}
          disabled={loading}
          className="w-full py-2 text-sm font-medium text-gray-700 hover:underline disabled:opacity-50"
        >
          ← Back
        </button>
      </div>
    )
  }

  return null
}
