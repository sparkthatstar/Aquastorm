import { createClient } from '@/lib/supabase/server'
import NotificationSettings from '@/components/notifications/notification-settings'

export default async function CustomerSettings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-md mx-auto">
      <NotificationSettings role={profile?.role || 'customer'} />
    </div>
  )
}
