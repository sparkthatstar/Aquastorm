import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderRecord } from '../../types';
import { ORDER_STATES_META } from '../../data/mockData';
import { ReminderEngineModal } from '../reminders/ReminderEngineModal';
import { ComplaintModal } from '../complaints/ComplaintModal';
import {
  User,
  Droplets,
  UtensilsCrossed,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Star,
  MapPin,
  Calendar,
  CreditCard,
  Plus,
  ArrowRight,
  ShieldAlert,
  FileText
} from 'lucide-react';

interface CustomerDashboardProps {
  onNavigate: (view: string, orderId?: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    orders,
    complaints,
    reminders,
    reorderPrevious,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'processing' | 'completed' | 'cancelled' | 'complaints'>('processing');
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [selectedOrderIdForComplaint, setSelectedOrderIdForComplaint] = useState<string>('');

  // Filter orders for current customer
  const myOrders = orders.filter(o => o.customerId === currentUser.id);
  const myComplaints = complaints.filter(c => c.customerId === currentUser.id);
  const myReminder = reminders.find(r => r.customerId === currentUser.id);

  // Categorized Monitoring Rails
  const upcomingOrders = myOrders.filter(o =>
    o.state === 'STATE_01_PENDING_PAYMENT' ||
    o.state === 'STATE_02_PAYMENT_VERIFIED' ||
    o.state === 'STATE_03_APPROVED'
  );

  const processingOrders = myOrders.filter(o =>
    o.state === 'STATE_04_ASSIGNED_TO_VENDOR' ||
    o.state === 'STATE_05_VENDOR_ACCEPTED' ||
    o.state === 'STATE_06_PREPARING' ||
    o.state === 'STATE_07_OUT_FOR_DELIVERY'
  );

  const completedOrders = myOrders.filter(o =>
    o.state === 'STATE_08_DELIVERED' ||
    o.state === 'STATE_09_COMPLETED'
  );

  const cancelledOrders = myOrders.filter(o => o.state === 'STATE_CANCELLED');

  // Compute metrics
  const totalBagsOrdered = myOrders.reduce((acc, order) => {
    const waterItems = order.items.filter(i => i.category === 'water');
    return acc + waterItems.reduce((sub, item) => sub + item.quantity, 0);
  }, 0);

  const totalSpent = myOrders.filter(o => o.state !== 'STATE_CANCELLED').reduce((acc, cur) => acc + cur.totalAmount, 0);

  const handleQuickReorder = (orderId: string) => {
    const newOrd = reorderPrevious(orderId);
    if (newOrd) {
      onNavigate('track', newOrd.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Student Profile Ribbon */}
      <div className="bg-gradient-to-r from-[#03098F] via-[#02076B] to-[#00AFD5] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/20 flex-shrink-0">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.fullName}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black font-heading tracking-tight">{currentUser.fullName}</h1>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-cyan-200 text-[10px] uppercase font-bold">
                Student Account
              </span>
            </div>
            <p className="text-xs text-blue-200 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#00AFD5]" />
              <span>{currentUser.hostelDomain || 'ESUTH Boys Hostel Block A'} • {currentUser.roomIdentifier || 'Room 204'}</span>
            </p>
          </div>
        </div>

        {/* Quick Speed Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('book-water')}
            className="px-4 py-2.5 bg-white text-[#03098F] hover:bg-slate-100 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Droplets className="w-4 h-4 text-[#00AFD5]" />
            <span>Book Water</span>
          </button>
          <button
            onClick={() => onNavigate('book-food')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Book Food</span>
          </button>
          <button
            onClick={() => setReminderModalOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4 text-cyan-300" />
            <span>Refill Scheduler</span>
          </button>
        </div>
      </div>

      {/* Consumption Statistics Rails */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Water Bags</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#03098F] font-mono">{totalBagsOrdered}</span>
            <span className="text-xs text-slate-500 font-semibold">Bags Dispensed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Expenditure</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">₦{totalSpent.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Active Deliveries</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#00AFD5] font-mono">{processingOrders.length}</span>
            <span className="text-xs text-slate-500 font-semibold">En Route</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Reminder Protocol</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${myReminder?.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span className="text-xs font-bold text-slate-800">
              {myReminder?.isEnabled ? myReminder.cadence : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Order Monitoring Rails Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tab Strip */}
        <div className="flex items-center gap-2 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          {[
            { id: 'processing', label: 'In-Transit / Processing', count: processingOrders.length, color: 'text-[#00AFD5]' },
            { id: 'upcoming', label: 'Upcoming / Pending Verification', count: upcomingOrders.length, color: 'text-amber-600' },
            { id: 'completed', label: 'Completed History', count: completedOrders.length, color: 'text-emerald-600' },
            { id: 'cancelled', label: 'Cancelled / Overrides', count: cancelledOrders.length, color: 'text-red-600' },
            { id: 'complaints', label: 'My Support Tickets', count: myComplaints.length, color: 'text-purple-600' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#03098F] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-100 ${tab.color}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content List */}
        <div className="p-6">
          {activeTab === 'complaints' ? (
            /* Support Tickets Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sandboxed Support Tickets (Customer & Admin Only)
                </h3>
                <button
                  onClick={() => setComplaintModalOpen(true)}
                  className="px-3 py-1.5 bg-red-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>File New Complaint</span>
                </button>
              </div>

              {myComplaints.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No active support disputes or complaints filed.
                </div>
              ) : (
                <div className="space-y-3">
                  {myComplaints.map(c => (
                    <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{c.id}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-[#03098F] font-bold rounded-full">
                            {c.classification}
                          </span>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{c.subject}</p>
                      <p className="text-xs text-slate-600">{c.description}</p>
                      {c.adminResolutionNotes && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                          <strong>Admin Resolution Audit:</strong> {c.adminResolutionNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Orders Tab */
            <div className="space-y-4">
              {(() => {
                const currentList =
                  activeTab === 'processing' ? processingOrders :
                  activeTab === 'upcoming' ? upcomingOrders :
                  activeTab === 'completed' ? completedOrders : cancelledOrders;

                if (currentList.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400 space-y-3">
                      <Clock className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs font-medium">No orders in this monitoring rail.</p>
                      <button
                        onClick={() => onNavigate('book-water')}
                        className="px-4 py-2 bg-[#03098F] text-white rounded-xl text-xs font-bold"
                      >
                        Book Sachet Water Now
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {currentList.map(order => (
                      <div
                        key={order.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#00AFD5] transition-all shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold font-mono text-[#03098F] text-sm">{order.id}</span>
                              <span className="text-[11px] text-slate-400">
                                • {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-slate-700">
                              {order.fulfillmentTrack === 'water_depot'
                                ? 'Sachet Water (Depot Pickup)'
                                : order.fulfillmentTrack === 'water_room_delivery'
                                ? 'Sachet Water (Room Door Delivery)'
                                : 'Hostel Food & Snacks'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#03098F] border border-blue-200 text-xs font-bold">
                              {ORDER_STATES_META[order.state]?.label || order.state}
                            </span>
                          </div>
                        </div>

                        {/* Order Details & Items */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Deliver To</span>
                            <span className="font-medium text-slate-900">{order.roomIdentifier} • {order.hostelDomain}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Window</span>
                            <span className="font-medium text-slate-900">{order.targetDeliveryDate} ({order.targetDeliveryTimeSlot})</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
                            <span className="font-mono font-extrabold text-[#03098F] text-sm">₦{order.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setSelectedOrderIdForComplaint(order.id);
                              setComplaintModalOpen(true);
                            }}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-800"
                          >
                            File Complaint
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuickReorder(order.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#03098F]" />
                              <span>Quick Reorder</span>
                            </button>
                            <button
                              onClick={() => onNavigate('track', order.id)}
                              className="px-4 py-1.5 bg-[#03098F] hover:bg-[#03098F]/90 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <span>Track Live</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Reminder Engine Modal */}
      <ReminderEngineModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        onInstantReorder={() => onNavigate('book-water')}
      />

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        targetOrderId={selectedOrderIdForComplaint}
      />
    </div>
  );
};
