'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ActiveDeliveries({ orders }: { orders: any[] }) {
  const supabase = createClient()
  const router = useRouter()

  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null)
  const [deliveredQty, setDeliveredQty] = useState<Record<string, number>>({})

  async function viewReceipt(paymentId: string, orderId: string) {
    setReceiptLoadingId(orderId)

    // Open a tab immediately so the browser is less likely to block it.
    const receiptWindow = window.open('', '_blank')

    if (!receiptWindow) {
      alert('Please allow pop-ups for this website to view receipts.')
      setReceiptLoadingId(null)
      return
    }

    receiptWindow.document.title = 'Opening payment receipt'
    receiptWindow.document.body.innerHTML =
      '<p style="font-family:sans-serif;padding:24px">Loading receipt...</p>'

    try {
      const { data: receipt, error: receiptError } = await supabase
        .from('payment_receipts')
        .select('storage_path, original_filename')
        .eq('payment_id', paymentId)
        .maybeSingle()

      if (receiptError) throw receiptError

      if (!receipt?.storage_path) {
        throw new Error(
          'No receipt was found for this payment. Ask the customer to upload the receipt again.'
        )
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from('receipts')
        .createSignedUrl(receipt.storage_path, 60)

      if (signedError) throw signedError

      if (!signedData?.signedUrl) {
        throw new Error('Could not generate a link for this receipt.')
      }

      receiptWindow.location.href = signedData.signedUrl
    } catch (err: any) {
      receiptWindow.close()
      alert(err.message || 'Unable to open the payment receipt.')
    } finally {
      setReceiptLoadingId(null)
    }
  }

  async function updateStatus(orderId: string, status: string) {
    setLoadingId(orderId)

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      alert(error.message)
      setLoadingId(null)
      return
    }

    router.refresh()
    setLoadingId(null)
  }

  async function confirmPayment(paymentId: string, orderId: string) {
    setLoadingId(orderId)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('payments')
      .update({
        status: 'confirmed',
        confirmed_by: user?.id,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (error) {
      alert(error.message)
      setLoadingId(null)
      return
    }

    router.refresh()
    setLoadingId(null)
  }

  async function flagSuspicious(orderId: string) {
    const reason = prompt(
      'Enter reason for flagging this payment as suspicious:'
    )

    if (!reason?.trim()) return

    setLoadingId(orderId)

    const { error } = await supabase.rpc('flag_suspicious_payment', {
      p_order_id: orderId,
      p_reason: reason.trim(),
    })

    if (error) {
      alert(error.message)
      setLoadingId(null)
      return
    }

    router.refresh()
    setLoadingId(null)
  }

  async function completeDelivery(orderId: string, orderedQty: number) {
    const qty = deliveredQty[orderId] ?? orderedQty

    if (!Number.isInteger(qty) || qty < 1) {
      alert('Enter a valid delivered quantity.')
      return
    }

    if (qty > orderedQty) {
      alert('Delivered quantity cannot exceed ordered quantity.')
      return
    }

    setLoadingId(orderId)

    const { error } = await supabase.rpc('award_points_for_delivery', {
      p_order_id: orderId,
      p_quantity_delivered: qty,
    })

    if (error) {
      alert(error.message)
      setLoadingId(null)
      return
    }

    router.refresh()
    setLoadingId(null)
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-700">
        No active deliveries.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const payment = Array.isArray(order.payment)
          ? order.payment[0]
          : order.payment

        const customer = Array.isArray(order.customer)
          ? order.customer[0]
          : order.customer

        const customerDetails = Array.isArray(customer?.customers)
          ? customer.customers[0]
          : customer?.customers

        const customerName =
          customer?.full_name || 'Customer name unavailable'

        const roomNumber =
          customerDetails?.room_number || 'Room number unavailable'

        const isDelivering = order.status === 'out_for_delivery'
        const isPreparing = order.status === 'preparing'
        const isAccepted = order.status === 'accepted'

        const isTransfer = order.payment_method === 'transfer'

        return (
          <div
            key={order.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <Link
              href={`/vendor-orders/${order.id}`}
              className="block rounded-lg transition-colors hover:bg-gray-50"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    {order.quantity_ordered} bags
                  </span>

                  <p className="mt-1 text-sm text-gray-800">
                    <span className="font-semibold">Customer:</span>{' '}
                    {customerName}
                  </p>

                  <p className="mt-1 text-sm text-gray-800">
                    <span className="font-semibold">Room:</span>{' '}
                    {roomNumber}
                  </p>

                  {order.comment && (
                    <p className="mt-2 text-xs italic text-gray-700">
                      Note: {order.comment}
                    </p>
                  )}
                </div>

                <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-800">
                  {order.status.replaceAll('_', ' ')}
                </span>
              </div>
            </Link>

            <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm">
              <p className="mb-2 font-semibold text-gray-900">
                Payment ({order.payment_method})
              </p>

              {/*
                The receipt button appears in the payment card,
                before payment confirmation.
              */}
              {isTransfer && payment?.id && (
                <button
                  type="button"
                  onClick={() => viewReceipt(payment.id, order.id)}
                  disabled={receiptLoadingId === order.id}
                  className="mb-3 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {receiptLoadingId === order.id
                    ? 'Opening Receipt...'
                    : 'View Receipt'}
                </button>
              )}

              {payment?.status === 'pending' &&
                order.payment_method === 'cash' && (
                  <button
                    type="button"
                    onClick={() => confirmPayment(payment.id, order.id)}
                    disabled={loadingId === order.id}
                    className="rounded-md bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    {loadingId === order.id
                      ? 'Processing...'
                      : 'Received Cash'}
                  </button>
                )}

              {payment?.status === 'pending' && isTransfer && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => confirmPayment(payment.id, order.id)}
                    disabled={loadingId === order.id}
                    className="rounded-md bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    {loadingId === order.id
                      ? 'Processing...'
                      : 'Confirm Transfer'}
                  </button>

                  <button
                    type="button"
                    onClick={() => flagSuspicious(order.id)}
                    disabled={loadingId === order.id}
                    className="rounded-md bg-red-100 px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-200 disabled:opacity-50"
                  >
                    Flag Suspicious
                  </button>
                </div>
              )}

              {payment?.status === 'confirmed' && (
                <span className="font-semibold text-green-700">
                  ✓ Payment Confirmed
                </span>
              )}

              {payment?.status === 'flagged' && (
                <span className="font-semibold text-red-700">
                  Payment Flagged
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
              {isAccepted && (
                <button
                  type="button"
                  onClick={() => updateStatus(order.id, 'preparing')}
                  disabled={loadingId === order.id}
                  className="w-full rounded-lg bg-gray-900 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
                >
                  {loadingId === order.id
                    ? 'Updating...'
                    : 'Mark as Preparing'}
                </button>
              )}

              {isPreparing && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(order.id, 'out_for_delivery')
                  }
                  disabled={loadingId === order.id}
                  className="w-full rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {loadingId === order.id
                    ? 'Updating...'
                    : 'Start Delivery'}
                </button>
              )}

              {isDelivering && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={order.quantity_ordered}
                    step="1"
                    placeholder={`Delivered Qty (Ordered: ${order.quantity_ordered})`}
                    value={deliveredQty[order.id] ?? ''}
                    onChange={(e) =>
                      setDeliveredQty((previous) => ({
                        ...previous,
                        [order.id]:
                          e.target.value === ''
                            ? (undefined as unknown as number)
                            : Number(e.target.value),
                      }))
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      completeDelivery(order.id, order.quantity_ordered)
                    }
                    disabled={loadingId === order.id}
                    className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
                  >
                    {loadingId === order.id ? 'Processing...' : 'Complete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
