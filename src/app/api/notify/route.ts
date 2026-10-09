// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Initialize Supabase Admin Client (bypasses RLS to fetch subscriptions)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Configure Web Push with your VAPID keys
webpush.setVapidDetails(
  'mailto:support@aquastorm.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Supabase webhooks send the data inside a 'record' object
    const notification = body.record
    if (!notification) {
      return NextResponse.json({ error: 'No record found' }, { status: 400 })
    }

    const { recipient_id, title, body: message } = notification

    // 1. Fetch all push subscriptions for this user
    const { data: subscriptions } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', recipient_id)

    if (!subscriptions || subscriptions.length === 0) {
      // User hasn't enabled push notifications yet, but the notification is still saved in the DB
      return NextResponse.json({ success: true, message: 'No push subscriptions found' })
    }

    const payload = JSON.stringify({ title, body: message })

    // 2. Send push to all user's devices
    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      }

      try {
        await webpush.sendNotification(pushSubscription, payload)
      } catch (error) {
        console.error('Push failed for subscription:', error)
        // If subscription expired (410 Gone), delete it from the database
        if (error instanceof webpush.WebPushError && error.statusCode === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Notify Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
