import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORDER_STATES_META } from '../../data/mockData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  RotateCcw,
  Building,
  Truck,
  Sparkles,
  Search
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string, orderId?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    orders,
    allUsers,
    pricingConfig,
    complaints,
    cancelOrderAdminOverride,
    updatePricingConfig,
    resolveComplaint,
    toggleUserActiveStatus,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'pricing' | 'users' | 'complaints' | 'cancellations'>('analytics');
  const [timeCycle, setTimeCycle] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Price Configuration Form State
  const [depotPrice, setDepotPrice] = useState(pricingConfig.waterDepotPerBag);
  const [roomPrice, setRoomPrice] = useState(pricingConfig.waterRoomDeliveryPerBag);
  const [foodFee, setFoodFee] = useState(pricingConfig.foodConvenienceFee);
  const [minLeadHours, setMinLeadHours] = useState(pricingConfig.minFoodLeadTimeHours);
  const [hotline, setHotline] = useState(pricingConfig.supportHotline);

  // Cancellation Override State
  const [selectedCancelOrderId, setSelectedCancelOrderId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // Complaint Resolution State
  const [resolvingComplaintId, setResolvingComplaintId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Financial Analytics Calculations
  const grossRevenue = orders
    .filter(o => o.state !== 'STATE_CANCELLED' && o.state !== 'STATE_01_PENDING_PAYMENT')
    .reduce((acc, cur) => acc + cur.totalAmount, 0);

  const waterOrdersCount = orders.filter(o => o.fulfillmentTrack.includes('water')).length;
  const foodOrdersCount = orders.filter(o => o.fulfillmentTrack === 'food_delivery').length;
  const totalBagsDispensed = orders.reduce((acc, o) => {
    return acc + o.items.filter(i => i.category === 'water').reduce((s, it) => s + it.quantity, 0);
  }, 0);

  // Chart datasets
  const dailyData = [
    { period: 'Mon', revenue: 18500, orders: 12, waterBags: 34 },
    { period: 'Tue', revenue: 22400, orders: 15, waterBags: 42 },
    { period: 'Wed', revenue: 19800, orders: 14, waterBags: 38 },
    { period: 'Thu', revenue: 27500, orders: 18, waterBags: 55 },
    { period: 'Fri', revenue: 34000, orders: 24, waterBags: 68 },
    { period: 'Sat', revenue: 41200, orders: 29, waterBags: 82 },
    { period: 'Sun (Today)', revenue: 38900, orders: 26, waterBags: 74 }
  ];

  const weeklyData = [
    { period: 'Week 1', revenue: 124000, orders: 95, waterBags: 260 },
    { period: 'Week 2', revenue: 148000, orders: 112, waterBags: 310 },
    { period: 'Week 3', revenue: 165000, orders: 128, waterBags: 350 },
    { period: 'Week 4 (Current)', revenue: 202300, orders: 156, waterBags: 425 }
  ];

  const monthlyData = [
    { period: 'May 2026', revenue: 480000, orders: 380, waterBags: 980 },
    { period: 'Jun 2026', revenue: 560000, orders: 440, waterBags: 1150 },
    { period: 'Jul 2026', revenue: 690000, orders: 530, waterBags: 1420 },
    { period: 'Aug 2026 (Live)', revenue: 840000, orders: 670, waterBags: 1810 }
  ];

  const activeChartData = timeCycle === 'daily' ? dailyData : timeCycle === 'weekly' ? weeklyData : monthlyData;

  // Hostel Density Heatmap
  const hostelHotspotData = [
    { hostel: 'Boys Hostel A', orders: 48, revenue: 64000 },
    { hostel: 'Boys Hostel B', orders: 36, revenue: 48000 },
    { hostel: 'Boys Hostel C', orders: 28, revenue: 37500 },
    { hostel: 'Girls Queens Hall', orders: 54, revenue: 72000 },
    { hostel: 'Girls Silvercrest', orders: 42, revenue: 56000 },
    { hostel: 'Girls Grace Hall', orders: 31, revenue: 41000 },
    { hostel: 'Off-Campus Zone 1', orders: 19, revenue: 26000 }
  ];

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingConfig({
      waterDepotPerBag: Number(depotPrice),
      waterRoomDeliveryPerBag: Number(roomPrice),
      foodConvenienceFee: Number(foodFee),
      minFoodLeadTimeHours: Number(minLeadHours),
      supportHotline: hotline
    });
  };

  const handleCancelOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCancelOrderId || !cancelReason.trim()) {
      showToast('Please specify order ID and audit cancellation reason.');
      return;
    }
    cancelOrderAdminOverride(selectedCancelOrderId, cancelReason);
    setSelectedCancelOrderId('');
    setCancelReason('');
  };

  const handleResolveTicket = (ticketId: string) => {
    if (!resolutionNotes.trim()) {
      showToast('Please enter formal resolution notes for the audit log.');
      return;
    }
    resolveComplaint(ticketId, resolutionNotes);
    setResolvingComplaintId(null);
    setResolutionNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#03098F] text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00AFD5] text-white text-xs font-bold uppercase tracking-wider mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            God-Mode Administrative Governance Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Enterprise Command & Control
          </h1>
          <p className="text-xs text-blue-200 mt-0.5">
            Full platform authority: price configuration, user permissions, macro revenue telemetry & master cancellation overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            ESUTH Active Node: <strong>ONLINE</strong>
          </span>
        </div>
      </div>

      {/* Primary KPI Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Gross Inflow</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">₦{grossRevenue.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">+24.5% vs Last Period</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Water Dispensed</span>
          <span className="text-2xl font-black text-[#03098F] font-mono mt-1 block">{totalBagsDispensed} Bags</span>
          <span className="text-[10px] text-blue-700 font-semibold">Across 8 Hostels</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Registered Profiles</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{allUsers.length} Users</span>
          <span className="text-[10px] text-slate-500">Students, Riders, Ops</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Dispute Audit Queue</span>
          <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
            {complaints.filter(c => c.status === 'Open').length} Open
          </span>
          <span className="text-[10px] text-red-700 font-semibold">Support Tickets</span>
        </div>
      </div>

      {/* Navigation Tab Strip */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {[
          { id: 'analytics', label: 'Financial & Velocity Analytics', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'pricing', label: 'Global Price Configuration', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'complaints', label: 'Support Audit & Complaints', icon: <ShieldAlert className="w-4 h-4" /> },
          { id: 'cancellations', label: 'Master Cancellation Override', icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'users', label: 'User RBAC Profiles', icon: <Users className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#03098F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Financial & Velocity Analytics (Recharts) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Revenue Chart Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Historical Revenue Telemetry & Growth Velocity
                </h3>
                <p className="text-xs text-slate-500">Gross transaction volume across ESUTH campus network</p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['daily', 'weekly', 'monthly'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setTimeCycle(c)}
                    className={`px-3 py-1 text-xs font-bold capitalize rounded-lg transition-all ${
                      timeCycle === c ? 'bg-[#03098F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Gross Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (₦)"
                    stroke="#03098F"
                    strokeWidth={3}
                    dot={{ fill: '#00AFD5', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Hostel Hotspots Bar Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Active Hostel Delivery Hotspots & Consumption Density
            </h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hostelHotspotData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hostel" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    formatter={(val: any, name: any) => [name === 'revenue' ? `₦${Number(val).toLocaleString()}` : `${val} Orders`, name]}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="orders" name="Order Volume" fill="#00AFD5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Global Price Configuration */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold font-heading text-slate-900">
                System-Wide Price Matrix & Operational Parameters
              </h3>
              <p className="text-xs text-slate-500">
                Instantly adjust water per-bag rates, convenience surcharges, and lead times across the entire platform.
              </p>
            </div>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full">
              Admin Protected
            </span>
          </div>

          <form onSubmit={handleSavePrices} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sachet Water: Depot Track (Ground Floor Collection)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-400">₦</span>
                  <input
                    type="number"
                    required
                    value={depotPrice}
                    onChange={(e) => setDepotPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-[#03098F]"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">/ per bag</span>
                </div>
                <p className="text-[11px] text-slate-500">Default baseline rate for ground-level collection.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sachet Water: Premium Track (Room Door Delivery)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-400">₦</span>
                  <input
                    type="number"
                    required
                    value={roomPrice}
                    onChange={(e) => setRoomPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-[#00AFD5]"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">/ per bag</span>
                </div>
                <p className="text-[11px] text-slate-500">Includes direct delivery across all hostel floor elevations.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Mandatory Platform Food Convenience Surcharge
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-400">₦</span>
                  <input
                    type="number"
                    required
                    value={foodFee}
                    onChange={(e) => setFoodFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-amber-700"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">flat fee</span>
                </div>
                <p className="text-[11px] text-slate-500">Mandatory surcharge appended per unique meal order block.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Minimum Food Preparation Lead Time Threshold
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    min="1"
                    max="24"
                    value={minLeadHours}
                    onChange={(e) => setMinLeadHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">Hours Minimum</span>
                </div>
                <p className="text-[11px] text-slate-500">System programmatically blocks bookings scheduled under this lead window.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Official Corporate Support Hotline
                </label>
                <input
                  type="text"
                  required
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#03098F] hover:bg-[#03098F]/90 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Commit Global Pricing Matrix Updates</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Complaints Audit & Resolution */}
      {activeTab === 'complaints' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold font-heading text-slate-900">
                Support Tickets & Structured Complaint Resolutions
              </h3>
              <p className="text-xs text-slate-500">
                Sandboxed disputes categorized under the 6 operational classifications.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">{complaints.length} Total Incidents</span>
          </div>

          <div className="space-y-4">
            {complaints.map(ticket => (
              <div
                key={ticket.id}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold font-mono text-sm text-[#03098F]">{ticket.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                      {ticket.classification}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      • Related: {ticket.orderId}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{ticket.subject}</h4>
                  <p className="text-xs text-slate-600 mt-1">{ticket.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Filed by {ticket.customerName} on {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>

                {ticket.adminResolutionNotes ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                    <strong className="block text-[10px] uppercase tracking-wider text-emerald-800">
                      Official Admin Audit Resolution Note:
                    </strong>
                    <p>{ticket.adminResolutionNotes}</p>
                    <span className="text-[10px] text-emerald-700 block">
                      Resolved at: {new Date(ticket.resolvedAt || '').toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-200">
                    {resolvingComplaintId === ticket.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          placeholder="Type official audit resolution decision..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveTicket(ticket.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                          >
                            Commit Resolution
                          </button>
                          <button
                            onClick={() => setResolvingComplaintId(null)}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolvingComplaintId(ticket.id)}
                        className="px-3 py-1.5 bg-[#03098F] text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Resolve & File Corporate Log
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Master Cancellation Override Tool */}
      {activeTab === 'cancellations' && (
        <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-red-100">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-red-950">
                Master Cancellation & Financial Refund Override Tool
              </h3>
              <p className="text-xs text-red-700">
                Exclusive to Platform Admin profile. Authorizes emergency order termination and financial rollback.
              </p>
            </div>
          </div>

          <form onSubmit={handleCancelOverride} className="p-5 bg-red-50/60 rounded-2xl border border-red-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-red-900">
                  Select Active Order for Master Cancellation <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={selectedCancelOrderId}
                  onChange={(e) => setSelectedCancelOrderId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-red-300 rounded-xl text-xs font-semibold"
                >
                  <option value="">Select an order to terminate...</option>
                  {orders.filter(o => o.state !== 'STATE_CANCELLED').map(o => (
                    <option key={o.id} value={o.id}>
                      {o.id} - {o.customerName} (₦{o.totalAmount} • {o.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-red-900">
                  Audit Reason & Financial Refund Reference <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student relocated room / refund reversed via OPay"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-red-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Execute Master Cancellation Override</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 5: User Profiles Management */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-extrabold font-heading text-slate-900">
            Platform Users Roster & Access Controls
          </h3>

          <div className="divide-y divide-slate-100">
            {allUsers.map(user => (
              <div key={user.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{user.fullName}</p>
                    <p className="text-slate-500 text-[11px]">{user.email} • {user.mobileNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full uppercase font-bold text-[10px] bg-slate-100 text-slate-700">
                    {user.role}
                  </span>
                  <button
                    onClick={() => toggleUserActiveStatus(user.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      user.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-red-100 hover:text-red-800'
                        : 'bg-red-100 text-red-800 hover:bg-emerald-100 hover:text-emerald-800'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Suspended'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
