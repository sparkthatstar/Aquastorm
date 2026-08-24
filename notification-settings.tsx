'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ROLE_CATEGORIES = {
  customer: ['order_updates', 'delivery_updates', 'chat_messages', 'rating_reminders', 'support_responses', 'manager_announcements'],
  vendor: ['new_orders', 'order_updates', 'chat_messages', 'payment_confirmations', 'aqua_points', 'cashout_updates', 'manager_announcements', 'support'],
  manager: ['new_orders', 'delayed_orders', 'complaints', 'vendor_issues', 'cashout_requests', 'inventory_alerts', 'owner_notifications', 'system_alerts'],
  owner: ['manager_actions', 'suspicious_payments', 'complaints', 'cashouts', 'inventory_alerts', 'vendor_actions', 'manager_changes', 'system_alerts']
}

export default function NotificationSettings({ role }: { role: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrefs()
  }, [])

  async function fetchPrefs() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notification_preferences')
      .select('category, enabled')
      .eq('user_id', user.id)

    const defaultPrefs: Record<string, boolean> = {}
    ROLE_CATEGORIES[role]?.forEach(cat => defaultPrefs[cat] = true)

    data?.forEach(p => defaultPrefs[p.category] = p.enabled)
    setPrefs(defaultPrefs)
    setLoading(false)
  }

  async function togglePreference(category: string, enabled: boolean) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setPrefs({ ...prefs, [category]: enabled })

    await supabase
      .from('notification_preferences')
      .upsert({ 
        user_id: user.id, 
        category, 
        enabled 
      }, { onConflict: 'user_id,category' })
    
    router.refresh()
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-xl"></div>

  const categories = ROLE_CATEGORIES[role] || []

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
      <p className="text-sm text-gray-500 -mt-2">Manage what alerts you receive.</p>
      
      <div className="divide-y divide-gray-100">
        {categories.map(cat => (
          <div key={cat} className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-gray-700 capitalize">
              {cat.replace(/_/g, ' ')}
            </span>
            <button
              onClick={() => togglePreference(cat, !prefs[cat])}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs[cat] ? 'bg-cyan-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs[cat] ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
