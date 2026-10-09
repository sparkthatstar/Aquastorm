'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupForm() {
  const supabase = createClient()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneConfirm, setPhoneConfirm] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (phone !== phoneConfirm) {
      setError('Phone numbers do not match.')
      return
    }

    if (phone.length < 7) {
      setError('Please enter a valid phone number.')
      return
    }

    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email: `${phone}@aquastorm.app`,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          room_number: roomNumber,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-1">Full Name</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all"
          placeholder="Enter name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-1">Room Number</label>
        <input
          type="text"
          required
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all"
          placeholder="A-101"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-1">Phone / WhatsApp Number</label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all"
          placeholder="0801 234 5678"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-1">Repeat Phone Number</label>
        <input
          type="tel"
          required
          value={phoneConfirm}
          onChange={(e) => setPhoneConfirm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all"
          placeholder="0801 234 5678"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-1">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all"
        />
      </div>

      {error && <div className="bg-red-500/20 border border-red-400/50 text-red-200 text-sm rounded-lg p-3 backdrop-blur-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-cyan-900 font-bold py-3 rounded-xl shadow-lg hover:bg-cyan-50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 mt-2"
      >
        {loading ? 'Creating account…' : 'Sign Up'}
      </button>

      <p className="text-center text-sm text-cyan-200 mt-2">
        Already have an account?{' '}
        <a href="/login" className="text-white font-medium hover:underline">Log in</a>
      </p>
    </form>
  )
}
