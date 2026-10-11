'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
const supabase = createClient()
const router = useRouter()

const [emailOrPhone, setEmailOrPhone] = useState('')
const [password, setPassword] = useState('')
const [showPassword, setShowPassword] = useState(false)
const [error, setError] = useState<string | null>(null)
const [loading, setLoading] = useState(false)

async function handleSubmit(e: React.FormEvent) {
e.preventDefault()
setError(null)
setLoading(true)

// Allow login using an email address or phone number.
let loginEmail = emailOrPhone.trim()

if (!loginEmail.includes('@')) {
  const cleanPhone = loginEmail.replace(/\s/g, '')
  loginEmail = `${cleanPhone}@aquastorm.app`
}

const { error: signInError } = await supabase.auth.signInWithPassword({
  email: loginEmail,
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
{/* Email or Phone */}
<div>
<label className="block text-sm font-medium text-cyan-100 mb-1">
Email or Phone
</label>

    <input
      type="text"
      required
      value={emailOrPhone}
      onChange={(e) => setEmailOrPhone(e.target.value)}
      autoComplete="username"
      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all"
      placeholder="0801 234 5678"
    />
  </div>

  {/* Password with Show/Hide Eye Button */}
  <div>
    <label className="block text-sm font-medium text-cyan-100 mb-1">
      Password
    </label>

    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all"
        placeholder="Enter your password"
      />

      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        aria-pressed={showPassword}
        className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-cyan-200 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-r-xl"
      >
        {showPassword ? (
          // Eye with a slash: password is visible.
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 3l18 18" />
            <path d="M10.58 10.59a2 2 0 002.83 2.83" />
            <path d="M9.88 5.09A10.94 10.94 0 0112 4.87c5 0 8.27 4.11 9.5 7.13a11.8 11.8 0 01-3.05 4.29" />
            <path d="M6.61 6.61A12.2 12.2 0 002.5 12c.63 1.55 1.68 3.07 3.08 4.23A9.94 9.94 0 0012 19.13c1.1 0 2.15-.19 3.12-.53" />
          </svg>
        ) : (
          // Normal eye: password is hidden.
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  </div>

  {/* Error Message */}
  {error && (
    <div
      role="alert"
      className="bg-red-500/20 border border-red-400/50 text-red-200 text-sm rounded-lg p-3 backdrop-blur-sm"
    >
      {error}
    </div>
  )}

  {/* Login Button */}
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-white text-cyan-900 font-bold py-3 rounded-xl shadow-lg hover:bg-cyan-50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
  >
    {loading ? 'Logging in…' : 'Log In'}
  </button>

  {/* Signup Link */}
  <p className="text-center text-sm text-cyan-200">
    New customer?{' '}
    <a
      href="/signup"
      className="text-white font-medium hover:underline"
    >
      Sign up
    </a>
  </p>
</form>

)
}
