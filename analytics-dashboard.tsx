export default function AnalyticsDashboard({ stats }: { stats: any }) {
  const cards = [
    { label: 'Total Orders', value: stats.totalOrders, color: 'bg-cyan-500' },
    { label: 'Active Deliveries', value: stats.activeDeliveries, color: 'bg-blue-500' },
    { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
    { label: 'Revenue (₦)', value: stats.revenue.toLocaleString(), color: 'bg-emerald-600' },
    { label: 'Cash Orders', value: stats.cashOrders, color: 'bg-gray-700' },
    { label: 'Transfer Orders', value: stats.transferOrders, color: 'bg-indigo-500' },
    { label: 'Pending Cashouts', value: stats.pendingCashouts, color: 'bg-yellow-500' },
    { label: 'Low Ratings', value: stats.lowRatings, color: 'bg-red-500' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`${card.color} text-white rounded-xl p-4 shadow-sm`}>
          <p className="text-xs uppercase tracking-wider font-medium opacity-80">{card.label}</p>
          <p className="text-2xl font-bold mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
