// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationBell() {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [pushStatus, setPushStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
    
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchNotifications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  async function markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', user.id)
      .eq('is_read', false)

    setUnreadCount(0)
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  async function subscribeToPush() {
    setPushStatus('Requesting permission...')
    
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Push notifications are not supported in this browser.')
        setPushStatus(null)
        return
      }

      // 1. Trigger the browser's native permission popup
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('You blocked notifications. Please enable them in your browser settings to receive pushes.')
        setPushStatus(null)
        return
      }

      setPushStatus('Registering service worker...')
      // 2. Register the service worker
      const sw = await navigator.serviceWorker.register('/sw.js')
      
      // 3. Convert the VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        alert('VAPID public key is missing from environment variables!')
        setPushStatus(null)
        return
      }
      const convertedKey = urlBase64ToUint8Array(vapidKey)

            // Clear any old subscriptions with the old key
      const oldSubscription = await sw.pushManager.getSubscription()
      if (oldSubscription) {
        await oldSubscription.unsubscribe()
      }

      setPushStatus('Subscribing to push...')
      // 4. Subscribe using the converted key
      const subscription = await sw.pushManager.subscribe({

      // 5. Save to database
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('User not logged in.')
        setPushStatus(null)
        return
      }

      const { error: upsertError } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
      }, { onConflict: 'endpoint' })

      if (upsertError) {
        alert('Failed to save push subscription: ' + upsertError.message)
        setPushStatus(null)
        return
      }

      setPushStatus('Enabled!')
      alert('Push notifications enabled successfully!')
      setPushStatus(null)
    } catch (error) {
      console.error('Push subscription error:', error)
      alert('Failed to enable push: ' + error.message)
      setPushStatus(null)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => { setOpen(!open); if (unreadCount > 0) markAllAsRead(); }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
            <button onClick={subscribeToPush} className="text-xs text-cyan-600 font-medium hover:underline">
              {pushStatus ? pushStatus : 'Enable Push'}
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-400 text-sm">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!n.is_read ? 'bg-cyan-50' : ''}`}>
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
