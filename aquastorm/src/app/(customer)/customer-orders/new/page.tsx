import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrderFlow from '@/components/customer/order-flow'

export default async function NewOrderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Order</h1>
      <OrderFlow />
    </div>
  )
}
