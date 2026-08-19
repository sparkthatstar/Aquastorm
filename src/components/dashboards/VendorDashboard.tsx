import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORDER_STATES_META } from '../../data/mockData';
import { OrderRecord, OrderState } from '../../types';
import {
  Truck,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Layers,
  ChevronRight,
  Shield,
  AlertCircle
} from 'lucide-react';

interface VendorDashboardProps {
  onNavigate: (view: string, orderId?: string) => void;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ onNavigate }) => {
  const { currentUser, orders, updateOrderStatus, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Orders assigned to this vendor rider
  const assignedOrders = orders.filter(o => o.assignedVendorId === currentUser.id);

  const activeTasks = assignedOrders.filter(
    o => o.state !== 'STATE_08_DELIVERED' && o.state !== 'STATE_09_COMPLETED' && o.state !== 'STATE_CANCELLED'
  );

  const completedTasks = assignedOrders.filter(
    o => o.state === 'STATE_08_DELIVERED' || o.state === 'STATE_09_COMPLETED'
  );

  const handleStepStatus = (orderId: string, nextState: OrderState, label: string) => {
    const res = updateOrderStatus(orderId, nextState, `Rider ${currentUser.fullName} updated status to ${label}`);
    if (!res.success) {
      showToast(res.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Mobile Vendor Header Ribbon */}
      <div className="bg-gradient-to-br from-[#03098F] to-[#00AFD5] rounded-3xl p-5 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 p-1 backdrop-blur-md border border-white/20">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.fullName}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-heading">{currentUser.fullName}</h1>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 text-cyan-200">
              Campus Delivery Rider • Active
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black font-mono">{activeTasks.length}</span>
          <span className="text-[10px] text-blue-200 block uppercase font-bold">Assigned Tasks</span>
        </div>
      </div>

      {/* Strict Vendor Guardrails Summary */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-[#03098F] flex items-center gap-2">
        <Shield className="w-4 h-4 text-[#00AFD5] flex-shrink-0" />
        <span>
          <strong>Rider Protocol:</strong> Verify room numbers carefully on arrival. Tap the phone link to call client upon reaching floor.
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-[#03098F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Deliveries ({activeTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-[#03098F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed Runs ({completedTasks.length})
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {activeTab === 'active' ? (
          activeTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">All Assigned Runs Completed</h3>
              <p className="text-xs text-slate-500">Stand by at hostel dispatch station for new assignments.</p>
            </div>
          ) : (
            activeTasks.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-xs hover:border-[#00AFD5] transition-all space-y-4 p-5"
              >
                {/* Upper ID & Status Strip */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-extrabold font-mono text-base text-[#03098F]">{order.id}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Target: {order.targetDeliveryTimeSlot}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full">
                    {ORDER_STATES_META[order.state]?.label || order.state}
                  </span>
                </div>

                {/* Big Spatial Room Coordinate Badge */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination Room</span>
                      <h2 className="text-xl font-black text-slate-900 font-mono flex items-center gap-1.5">
                        <MapPin className="w-5 h-5 text-[#00AFD5]" />
                        {order.roomIdentifier}
                      </h2>
                      <p className="text-xs font-bold text-[#03098F] mt-0.5">
                        {order.floorIndex === 0 ? 'Ground Floor' : `Floor ${order.floorIndex}`} • {order.hostelDomain}
                      </p>
                    </div>

                    {/* Direct Tap to Call */}
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Client</span>
                    </a>
                  </div>

                  {order.specialInstructions && (
                    <div className="p-2.5 bg-blue-100/60 rounded-xl text-[11px] text-blue-900 font-medium">
                      <strong>Client Note:</strong> {order.specialInstructions}
                    </div>
                  )}
                </div>

                {/* Items to Carry */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                    Cargo Manifest
                  </span>
                  {order.items.map((it, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-slate-100 text-slate-800 font-semibold">
                      <span className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-[#00AFD5]" />
                        {it.name}
                      </span>
                      <span className="font-mono font-bold text-sm bg-blue-50 px-2 py-0.5 rounded text-[#03098F]">
                        ×{it.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* State Progression Action Stepper */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                    Action Step Transition
                  </span>

                  {order.state === 'STATE_04_ASSIGNED_TO_VENDOR' && (
                    <button
                      onClick={() => handleStepStatus(order.id, 'STATE_05_VENDOR_ACCEPTED', 'Vendor Acknowledged Ticket')}
                      className="w-full py-3 bg-[#03098F] hover:bg-[#03098F]/90 text-white rounded-2xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                      <span>Accept Delivery Ticket (Confirm Assignment)</span>
                    </button>
                  )}

                  {order.state === 'STATE_05_VENDOR_ACCEPTED' && (
                    <button
                      onClick={() => handleStepStatus(order.id, 'STATE_06_PREPARING', 'Stock Packed & Loaded')}
                      className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-cyan-300" />
                      <span>Mark Prepared (Stock Loaded on Trolley)</span>
                    </button>
                  )}

                  {order.state === 'STATE_06_PREPARING' && (
                    <button
                      onClick={() => handleStepStatus(order.id, 'STATE_07_OUT_FOR_DELIVERY', 'Rider In Transit to Hostel')}
                      className="w-full py-3 bg-[#00AFD5] hover:bg-[#00AFD5]/90 text-white rounded-2xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Depart: Out For Delivery (Transiting Campus)</span>
                    </button>
                  )}

                  {order.state === 'STATE_07_OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => handleStepStatus(order.id, 'STATE_08_DELIVERED', 'Handoff Confirmed at Room Door')}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span>Confirm Handoff (Delivered at Room {order.roomIdentifier})</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        ) : (
          completedTasks.map(order => (
            <div key={order.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-[#03098F]">{order.id}</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Delivered ✓
                </span>
              </div>
              <p className="text-slate-600">
                {order.roomIdentifier} • {order.hostelDomain.split('(')[0]}
              </p>
              <div className="text-[10px] text-slate-400">
                Completed on {new Date(order.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
