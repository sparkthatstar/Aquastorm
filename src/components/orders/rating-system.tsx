'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RatingSystem({ orderId, direction }: { orderId: string; direction: 'customer_to_vendor' | 'vendor_to_customer' }) {
  const supabase = createClient()
  const router = useRouter()
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function submit() {
    if (stars === 0) return alert('Please select a star rating.')
    if (stars <= 2 && !reason) return alert('A reason is required for low ratings.')

    setLoading(true)
    const { error } = await supabase.rpc('submit_rating', {
      p_order_id: orderId,
      p_stars: stars,
      p_reason: reason || null,
      p_direction: direction
    })

    if (error) alert(error.message)
    else setSubmitted(true)
    
    setLoading(false)
    router.refresh()
  }

  if (submitted) return <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center text-sm">Thank you for your feedback!</div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
      <h3 className="font-bold text-gray-900 mb-2">{direction === 'customer_to_vendor' ? 'Rate Vendor' : 'Rate Customer'}</h3>
      
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(star)}
            className={`text-3xl transition-colors ${(hover || stars) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>

      {stars > 0 && stars <= 2 && (
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please tell us why you left a low rating..."
          className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-3"
          rows={3}
        />
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-cyan-600 text-white font-semibold py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 text-sm"
      >
        {loading ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  )
}
