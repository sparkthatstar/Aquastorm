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
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToPolicies, setAgreedToPolicies] = useState(false)
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

    if (!agreedToPolicies) {
      setError(
        'Please agree to the Terms & Conditions and Privacy Policy before signing up.'
      )
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
          agreed_to_terms: true,
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
        <label className="block text-sm font-medium text-cyan-100 mb-1">
          Full Name
        </label>
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
        <label className="block text-sm font-medium text-cyan-100 mb-1">
          Room Number
        </label>
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
        <label className="block text-sm font-medium text-cyan-100 mb-1">
          Phone / WhatsApp Number
        </label>
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
        <label className="block text-sm font-medium text-cyan-100 mb-1">
          Repeat Phone Number
        </label>
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
        <label className="block text-sm font-medium text-cyan-100 mb-1">
          Password
        </label>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all"
            placeholder="Create a password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-cyan-200 hover:text-white transition-colors"
          >
            {showPassword ? (
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
                <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.3 4.5 9 7a11.8 11.8 0 01-3 4.5" />
                <path d="M6.2 6.2A12.2 12.2 0 003 12c.7 2.5 4 7 9 7a10.7 10.7 0 004.1-.8" />
              </svg>
            ) : (
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
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Required Terms & Conditions and Privacy Policy agreement */}
      <div className="rounded-xl border border-white/20 bg-white/5 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={agreedToPolicies}
            onChange={(e) => setAgreedToPolicies(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-cyan-400 cursor-pointer"
          />

          <span className="text-sm leading-6 text-white">
            I have read and agree to AquaStorm&apos;s{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-cyan-300 underline hover:text-white"
            >
              Terms &amp; Conditions
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-cyan-300 underline hover:text-white"
            >
              Privacy Policy
            </a>
            .
          </span>
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-500/20 border border-red-400/50 text-red-200 text-sm rounded-lg p-3 backdrop-blur-sm"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-cyan-900 font-bold py-3 rounded-xl shadow-lg hover:bg-cyan-50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 mt-2"
      >
        {loading ? 'Creating account…' : 'Sign Up'}
      </button>

      <p className="text-center text-sm text-cyan-200 mt-2">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-white font-medium hover:underline"
        >
          Log in
        </a>
      </p>
    </form>
  )
}
