'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createManager(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'owner') return { error: 'Only owners can create managers' }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const bankName = formData.get('bankName') as string
  const accountName = formData.get('accountName') as string
  const accountNumber = formData.get('accountNumber') as string

  if (!email || !password || !fullName || !bankName || !accountName || !accountNumber) {
    return { error: 'All fields including bank details are required' }
  }

  const adminClient = createAdminClient()

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
    app_metadata: { role: 'manager' }
  })

  if (error) return { error: error.message }

  await adminClient
    .from('profiles')
    .update({ bank_name: bankName, account_name: accountName, account_number: accountNumber })
    .eq('id', data.user.id)

  revalidatePath('/dashboard')
  return { success: 'Manager created successfully!' }
}
