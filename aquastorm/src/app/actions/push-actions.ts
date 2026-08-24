'use server'

import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

webpush.setVapidDetails(
  'mailto:support@aquastorm.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(pRecipientId: string, pTitle: string, pBody: string) {
  const adminClient = createAdminClient()

  const { data: subscriptions } = await adminClient
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', pRecipientId)

  if (!subscriptions || subscriptions.length === 0) {
    return { success: false, message: 'No push subscriptions found' }
  }

  const payload = JSON.stringify({ title: pTitle, body: pBody })

  for (const sub of subscriptions) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth }
    }

    try {
      await webpush.sendNotification(pushSubscription, payload)
    } catch (error) {
      console.error('Push failed for subscription:', error)
      if (error instanceof webpush.WebPushError && error.statusCode === 410) {
        await adminClient.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      }
    }
  }

  return { success: true }
}
