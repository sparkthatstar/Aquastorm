import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORDER_STATES_META } from '../../data/mockData';
import { OrderRecord, OrderState } from '../../types';
import { ComplaintModal } from '../complaints/ComplaintModal';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Building,
  User,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Star,
  Receipt,
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  onNavigate: (view: string) => void;
}

const ALL_ORDER_STATES_IN_ORDER: OrderState[] = [
  'STATE_01_PENDING_PAYMENT',
  'STATE_02_PAYMENT_VERIFIED',
  'STATE_03_APPROVED',
  'STATE_04_ASSIGNED_TO_VENDOR',
  'STATE_05_VENDOR_ACCEPTED',
  'STATE_06_PREPARING',
  'STATE_07_OUT_FOR_DELIVERY',
  'STATE_08_DELIVERED',
  'STATE_09_COMPLETED'
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderId,
  onNavigate
}) => {
  const { orders, rateOrder, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState(initialOrderId || (orders[0]?.id || ''));
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Find target order
  const targetOrder = orders.find(
    o => o.id.toLowerCase() === searchTerm.trim().toLowerCase() ||
         o.customerPhone.includes(searchTerm.trim()) ||
         o.customerWhatsapp.includes(searchTerm.trim())
  ) || orders[0];

  const getStageIndex = (state: OrderState) => {
    if (state === 'STATE_CANCELLED') return -1;
    return ALL_ORDER_STATES_IN_ORDER.indexOf(state);
  };

  const currentStageIndex = targetOrder ? getStageIndex(targetOrder.state) : 0;

  const handleRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOrder) return;
    rateOrder(targetOrder.id, ratingInput, ratingComment);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header & Search Engine */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-[#03098F] text-xs font-bold uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5 text-[#00AFD5]" />
          Realtime 9-Stage Logistics Telemetry
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
          Direct Hostel Order Tracking
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Monitor your water bags or meals through every operational stage from payment verification to room handoff.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search by Order ID (e.g. AQ-2026-0801) or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-24 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#03098F] shadow-xs"
            />
            {orders.length > 1 && (
              <div className="absolute right-2 flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Recent:</span>
                <select
                  value={targetOrder?.id}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-[11px] font-bold bg-slate-100 text-slate-700 py-1 px-2 rounded-lg border-0 cursor-pointer"
                >
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>{o.id}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {targetOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Cols: 9-Stage Stepper & Status Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Status Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold font-mono text-[#03098F]">{targetOrder.id}</span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      • {new Date(targetOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {targetOrder.fulfillmentTrack === 'water_depot'
                      ? 'Water Sachet (Depot Ground Floor Pickup)'
                      : targetOrder.fulfillmentTrack === 'water_room_delivery'
                      ? 'Water Sachet (Direct-to-Door Room Delivery)'
                      : 'Campus Partner Meal & Snack Delivery'}
                  </p>
                </div>

                {/* State Badge */}
                <div>
                  {targetOrder.state === 'STATE_CANCELLED' ? (
                    <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      Cancelled & Refunded
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full bg-blue-50 text-[#03098F] border border-blue-200 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00AFD5] animate-pulse" />
                      {ORDER_STATES_META[targetOrder.state]?.label || targetOrder.state}
                    </span>
                  )}
                </div>
              </div>

              {/* 9-Stage Visual Stepper Timeline */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Deterministic 9-Stage Lifecycle Checkpoints
                </h3>

                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {ALL_ORDER_STATES_IN_ORDER.map((st, idx) => {
                    const meta = ORDER_STATES_META[st];
                    const isPassed = currentStageIndex >= idx;
                    const isCurrent = currentStageIndex === idx;
                    const historyRecord = targetOrder.stateHistory.find(h => h.state === st);

                    return (
                      <div key={st} className="relative flex items-start gap-4 text-xs">
                        {/* Step Marker */}
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                            isPassed
                              ? 'bg-[#03098F] border-[#03098F] text-white shadow-xs'
                              : 'bg-white border-slate-300 text-slate-400'
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-bold ${isCurrent ? 'text-[#03098F] text-sm' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                              STAGE 0{idx + 1}: {meta.label}
                            </span>
                            {historyRecord && (
                              <span className="text-[10px] font-mono text-slate-400">
                                {new Date(historyRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] mt-0.5 ${isCurrent ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                            {historyRecord?.note || meta.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rating & Review (Visible when Delivered or Completed) */}
            {(targetOrder.state === 'STATE_08_DELIVERED' || targetOrder.state === 'STATE_09_COMPLETED') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Delivery Experience & Vendor Rating
                  </h3>
                  {targetOrder.rating && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      ✓ Rated ({targetOrder.rating}/5)
                    </span>
                  )}
                </div>

                {targetOrder.rating ? (
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < targetOrder.rating! ? 'fill-amber-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                    {targetOrder.reviewComment && (
                      <p className="text-xs text-slate-700 italic">"{targetOrder.reviewComment}"</p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleRate} className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Your water/meal was handed off at your hostel room. Rate our rider service:
                    </p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRatingInput(num)}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                            ratingInput >= num
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${ratingInput >= num ? 'fill-amber-400 text-amber-400' : ''}`} />
                          <span>{num}</span>
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Optional feedback comment (e.g., Fast delivery, very polite rider)..."
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#03098F] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Submit Rating & Close Order
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Col: Logistics Summary, Spatial Details & Vendor */}
          <div className="space-y-6">
            {/* Spatial Location Details */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#00AFD5]" />
                Spatial Room Coordinates
              </h3>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Hostel Domain</span>
                  <strong className="text-slate-900">{targetOrder.hostelDomain}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Room Identifier</span>
                    <strong className="text-slate-900 font-mono text-sm">{targetOrder.roomIdentifier}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Floor Level</span>
                    <strong className="text-slate-900">
                      {targetOrder.floorIndex === 0 ? 'Ground Floor' : `Floor ${targetOrder.floorIndex}`}
                    </strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Schedule Window</span>
                  <strong className="text-slate-900">
                    {targetOrder.targetDeliveryDate} ({targetOrder.targetDeliveryTimeSlot})
                  </strong>
                </div>

                {targetOrder.specialInstructions && (
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-950">
                    <span className="text-[10px] text-blue-700 uppercase font-bold block">Special Notes</span>
                    <p className="text-[11px] mt-0.5">{targetOrder.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Logistics Vendor */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#00AFD5]" />
                Assigned Delivery Dispatcher
              </h3>

              {targetOrder.assignedVendorName ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#03098F] text-white flex items-center justify-center font-bold text-sm">
                      {targetOrder.assignedVendorName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{targetOrder.assignedVendorName}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Active On Campus</p>
                    </div>
                  </div>

                  <a
                    href="tel:09157004812"
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#03098F]" />
                    <span>Tap to Call Logistics Command</span>
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Manager is currently assigning the optimal floor delivery rider.
                </p>
              )}
            </div>

            {/* Itemized Total & Proof */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-slate-800">Financial Log</h3>
              <div className="space-y-1.5">
                {targetOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-slate-600">
                    <span>{it.quantity}× {it.name}</span>
                    <span className="font-mono font-bold text-slate-800">₦{(it.unitPrice * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
                {targetOrder.convenienceFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Convenience Surcharge:</span>
                    <span className="font-mono font-bold text-slate-800">₦{targetOrder.convenienceFee}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-base text-[#03098F]">₦{targetOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Support & Complaint Trigger */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setComplaintModalOpen(true)}
                  className="w-full py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-xl border border-red-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report Issue / File Complaint Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 text-sm">No orders matching your search query.</p>
        </div>
      )}

      {/* Structured Complaint Modal */}
      {complaintModalOpen && (
        <ComplaintModal
          isOpen={complaintModalOpen}
          onClose={() => setComplaintModalOpen(false)}
          targetOrderId={targetOrder?.id}
        />
      )}
    </div>
  );
};
