import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SupportForm from '@/components/customer/support-form'
import Link from 'next/link'

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the customer's previous complaints to see replies
  const { data: myComplaints } = await supabase
    .from('complaints')
    .select('id, category, description, status, owner_reply, created_at')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

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

      {/* Customer's Complaint History */}
      {myComplaints && myComplaints.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your Complaint History</h2>
          <div className="space-y-4">
            {myComplaints.map((c) => (
              <div key={c.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{c.category}</span>
                  <span className={`text-xs font-semibold uppercase ${c.status === 'open' ? 'text-yellow-600' : c.status === 'resolved' ? 'text-green-600' : 'text-blue-600'}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-800 mt-1 bg-gray-50 p-2 rounded-lg">"{c.description}"</p>
                
                {c.owner_reply ? (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <p className="text-xs font-bold text-blue-900 mb-1">Management Reply:</p>
                    <p className="text-sm text-blue-800">{c.owner_reply}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-2 italic">Awaiting reply from management...</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
