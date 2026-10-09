import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ActiveOrderTracker from '@/components/customer/active-order-tracker'
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
    .maybeSingle()

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hello, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-700 text-sm font-medium">Thirsty? Let's get you some water.</p>
      </div>

      <ActiveOrderTracker initialOrder={activeOrder} />
            
            <Step active icon="📝" label="Placed" />
            <Step active={['accepted', 'preparing', 'out_for_delivery', 'delivered'].includes(activeOrder.status)} icon="✅" label="Accepted" />
            <Step active={['preparing', 'out_for_delivery', 'delivered'].includes(activeOrder.status)} icon="💧" label="Preparing" />
            <Step active={['out_for_delivery', 'delivered'].includes(activeOrder.status)} icon="🚴" label="En route" />
            <Step active={activeOrder.status === 'delivered'} icon="🏠" label="Delivered" />
          </div>
          <Link href={`/customer-orders/${activeOrder.id}`} className="block text-center mt-4 text-cyan-700 font-semibold text-sm hover:underline">
            View Details
          </Link>
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl shadow-xl p-6 text-center text-white animate-float">
        <div className="text-6xl mb-4">💧</div>
        <h2 className="text-xl font-bold mb-1">Order Water</h2>
        <p className="text-cyan-100 text-sm mb-6">Fresh bags delivered fast.</p>
        <Link href="/customer-orders/new" className="block bg-white text-cyan-700 font-bold py-3 rounded-xl shadow-lg hover:bg-cyan-50 transition-all transform hover:scale-[1.02]">
          Start New Order
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/customer-orders/history" className="bg-white/80 backdrop-blur-md rounded-xl shadow-md p-4 flex flex-col items-center justify-center border border-white/50 hover:border-cyan-300 transition-all">
          <span className="text-2xl mb-1">📜</span>
          <span className="text-sm font-semibold text-gray-800">History</span>
        </Link>
        <Link href="/settings" className="bg-white/80 backdrop-blur-md rounded-xl shadow-md p-4 flex flex-col items-center justify-center border border-white/50 hover:border-cyan-300 transition-all">
          <span className="text-2xl mb-1">⚙️</span>
          <span className="text-sm font-semibold text-gray-800">Settings</span>
        </Link>
      </div>
    </div>
  )
}

function Step({ active, icon, label }: { active: boolean; icon: string; label: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center w-1/5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${active ? 'bg-cyan-600 scale-110' : 'bg-gray-300'}`}>
        {icon}
      </div>
      <span className="text-[10px] text-gray-800 font-medium mt-1 text-center">{label}</span>
    </div>
  )
}
