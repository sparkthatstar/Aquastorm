import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const { data: activeOrder } = await supabase
    .from('orders')
    .select('id, status, quantity_ordered, created_at')
    .eq('customer_id', user!.id)
    .in('status', ['placed', 'accepted', 'preparing', 'out_for_delivery'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hello, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm">Thirsty? Let's get you some water.</p>
      </div>

      {activeOrder && (
        <div className="bg-white border border-cyan-200 rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-3">Active Order</h2>
          <p className="text-sm text-gray-500 mb-4">
            {activeOrder.quantity_ordered} bags ordered
          </p>
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -translate-y-1/2 rounded"></div>
            <div className={`absolute left-0 top-1/2 h-1 bg-cyan-500 -translate-y-1/2 rounded transition-all ${
              activeOrder.status === 'placed' ? 'w-0' : 
              activeOrder.status === 'accepted' ? 'w-1/4' : 
              activeOrder.status === 'preparing' ? 'w-1/2' : 
              activeOrder.status === 'out_for_delivery' ? 'w-3/4' : 'w-full'
            }`}></div>
            
            <Step active icon="📝" label="Placed" />
            <Step active={['accepted', 'preparing', 'out_for_delivery', 'delivered'].includes(activeOrder.status)} icon="✅" label="Accepted" />
            <Step active={['preparing', 'out_for_delivery', 'delivered'].includes(activeOrder.status)} icon="💧" label="Preparing" />
            <Step active={['out_for_delivery', 'delivered'].includes(activeOrder.status)} icon="🚴" label="En route" />
            <Step active={activeOrder.status === 'delivered'} icon="🏠" label="Delivered" />
          </div>
          <Link href={`/customer-orders/${activeOrder.id}`} className="block text-center mt-4 text-cyan-600 font-semibold text-sm hover:underline">
            View Details
          </Link>
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg p-6 text-center text-white">
        <div className="text-6xl mb-4">💧</div>
        <h2 className="text-xl font-bold mb-1">Order Water</h2>
        <p className="text-cyan-100 text-sm mb-6">Fresh bags delivered fast.</p>
        <Link href="/customer-orders/new" className="block bg-white text-cyan-600 font-bold py-3 rounded-lg hover:bg-cyan-50 transition-colors">
          Start New Order
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/customer-orders/history" className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center border border-gray-100 hover:border-cyan-200">
          <span className="text-2xl mb-1">📜</span>
          <span className="text-sm font-semibold text-gray-700">History</span>
        </Link>
        <Link href="/settings" className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center border border-gray-100 hover:border-cyan-200">
          <span className="text-2xl mb-1">⚙️</span>
          <span className="text-sm font-semibold text-gray-700">Settings</span>
        </Link>
      </div>
    </div>
  )
}

function Step({ active, icon, label }: { active: boolean; icon: string; label: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center w-1/5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${active ? 'bg-cyan-500' : 'bg-gray-300'}`}>
        {icon}
      </div>
      <span className="text-[10px] text-gray-500 mt-1 text-center">{label}</span>
    </div>
  )
}
