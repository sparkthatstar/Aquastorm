'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SupportForm({ userId }: { userId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [category, setCategory] = useState('Vendor Issue')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return alert('Please describe your issue.')
    
    setLoading(true)
    const { error } = await supabase.from('complaints').insert({
      customer_id: userId,
      category,
      description: description.trim(),
      status: 'open'
    })

    if (error) {
      alert('Error submitting complaint: ' + error.message)
    } else {
      setSuccess(true)
      setDescription('')
      router.refresh()
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-3">✅</div>
        <h3 className="text-lg font-bold text-gray-900">Complaint Submitted</h3>
        <p className="text-sm text-gray-600 mt-1">Management has been notified. We will look into this immediately.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">Category</label>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-cyan-500"
        >
          <option>Vendor Issue</option>
          <option>Payment Issue</option>
          <option>App Bug</option>
          <option>General Complaint</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">Describe your issue</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-cyan-500"
          placeholder="Please provide as much detail as possible..."
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-cyan-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Complaint'}
      </button>
    </form>
  )
}
