import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SupportForm from '@/components/customer/support-form'
import Link from 'next/link'

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 animate-fade-in-up">
      <Link href="/customer-dashboard" className="text-cyan-700 font-semibold text-sm hover:underline">← Back to Dashboard</Link>
      
      <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Support</h1>
        <p className="text-sm text-gray-700 mb-4">
          Have an issue with an order or a vendor? Let us know. 
        </p>
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 mb-6">
          <p className="text-xs text-cyan-800 font-medium">
            🔒 Your identity is completely anonymous to vendors. Only the Owner and Management can see your complaint.
          </p>
        </div>
        
        <SupportForm userId={user.id} />
      </div>
    </div>
  )
}
