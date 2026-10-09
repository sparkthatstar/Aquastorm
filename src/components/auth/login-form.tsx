'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-1">Email or Phone</label>
        <input
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-1">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all"
        />
      </div>

      {error && <div className="bg-red-500/20 border border-red-400/50 text-red-200 text-sm rounded-lg p-3 backdrop-blur-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-cyan-900 font-bold py-3 rounded-xl shadow-lg hover:bg-cyan-50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
      >
        {loading ? 'Logging in…' : 'Log In'}
      </button>

      <p className="text-center text-sm text-cyan-200">
        New customer?{' '}
        <a href="/signup" className="text-white font-medium hover:underline">Sign up</a>
      </p>
    </form>
  )
}
