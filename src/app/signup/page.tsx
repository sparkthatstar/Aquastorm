import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignupForm from '@/components/auth/signup-form'

export default async function SignupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile) redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-float">💧</div>
          <h1 className="text-3xl font-bold text-white">AquaStorm</h1>
          <p className="text-cyan-200 mt-1">Fresh water, delivered fast.</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
