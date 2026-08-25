import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If they aren't logged in, send them to login
  if (!user) {
    redirect('/login')
  }

  // Find out what role they are
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // If their profile doesn't exist, send them to login
  if (!profile) {
    redirect('/login')
  }

  // Send them to the exact right dashboard based on their role!
  if (profile.role === 'customer') redirect('/customer-dashboard')
  if (profile.role === 'vendor') redirect('/vendor-dashboard')
  if (profile.role === 'manager') redirect('/manager-dashboard')
  if (profile.role === 'owner') redirect('/owner-dashboard')

  // Fallback just in case
  redirect('/login')
}
