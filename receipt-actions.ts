'use server'

import { createClient } from '@/lib/supabase/server'

export async function getReceiptSignedUrl(storagePath: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'owner') {
    return { error: 'Only owners can view receipts' }
  }

  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(storagePath, 300)

  if (error) return { error: error.message }

  return { url: data.signedUrl }
}
