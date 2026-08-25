import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NotificationBell from '@/components/notifications/notification-bell'

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) redirect('/login')
  if (profile.role !== 'vendor') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-cyan-600 text-lg">AquaStorm Vendor</span>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <form action="/auth/signout" method="post">
              <button className="text-sm text-gray-500 hover:text-gray-900">Sign out</button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
