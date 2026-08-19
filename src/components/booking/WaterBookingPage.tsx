import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ESUTH_HOSTEL_DOMAINS } from '../../data/mockData';
import { ReceiptUploader } from '../common/ReceiptUploader';
import {
  Droplets,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  Building,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WaterBookingPageProps {
  onOrderCreated: (orderId: string) => void;
  onNavigate: (view: string) => void;
}

export const WaterBookingPage: React.FC<WaterBookingPageProps> = ({
  onOrderCreated,
  onNavigate
}) => {
  const { currentUser, pricingConfig, createOrder } = useApp();

  // Tomorrow by default ("Book Today. Drink Tomorrow.")
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  // Form State
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(currentUser.mobileNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser.whatsappNumber || '');
  const [email, setEmail] = useState(currentUser.email || '');

  const [hostelDomain, setHostelDomain] = useState(
    currentUser.hostelDomain || ESUTH_HOSTEL_DOMAINS[0]
  );
  const [roomIdentifier, setRoomIdentifier] = useState(currentUser.roomIdentifier || 'Room 204');
  const [floorIndex, setFloorIndex] = useState<number>(currentUser.floorIndex ?? 2);

  const [bagCount, setBagCount] = useState(3);
  const [fulfillmentTrack, setFulfillmentTrack] = useState<'water_depot' | 'water_room_delivery'>(
    'water_room_delivery'
  );

  const [targetDate, setTargetDate] = useState(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 11:00 AM');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const unitPrice = fulfillmentTrack === 'water_room_delivery'
    ? pricingConfig.waterRoomDeliveryPerBag
    : pricingConfig.waterDepotPerBag;
  const itemsSubtotal = bagCount * unitPrice;
  const totalAmount = itemsSubtotal; // Water has no extra surcharge

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!paymentReceiptUrl) {
      setErrorMsg('Mandatory Field: Please upload or select your bank transfer payment receipt screenshot before submitting.');
      return;
    }

    const newOrder = createOrder({
      customerId: currentUser.id,
      customerName: fullName,
      customerPhone: mobileNumber,
      customerWhatsapp: whatsappNumber,
      customerEmail: email,
      hostelDomain,
      roomIdentifier,
      floorIndex,
      fulfillmentTrack,
      targetDeliveryDate: targetDate,
      targetDeliveryTimeSlot: timeSlot,
      specialInstructions,
      items: [
        {
          id: `w_${Date.now()}`,
          name: fulfillmentTrack === 'water_room_delivery'
            ? 'Pure Sachet Water Bag (Direct Room Delivery)'
            : 'Pure Sachet Water Bag (Depot Ground Floor Pickup)',
          category: 'water',
          unitPrice,
          quantity: bagCount
        }
      ],
      itemsSubtotal,
      convenienceFee: 0,
      totalAmount,
      paymentMethod: 'bank_transfer',
      paymentReceiptUrl
    });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch { /* ignore */ }

    onOrderCreated(newOrder.id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Page Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-[#03098F] text-xs font-bold uppercase tracking-wider">
          <Droplets className="w-3.5 h-3.5 text-[#00AFD5]" />
          Deterministic Campus Logistics
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
          Book Sachet Water Delivery
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          "Book Today. Drink Tomorrow." Select your hostel coordinates, choose delivery tier, and have fresh cold sachet water brought right to your door.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Fulfillment Track Selection (Depot vs Direct Room Delivery) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#00AFD5]" />
              1. Select Delivery Track & Fulfillment Strategy
            </h2>
            <span className="text-xs text-slate-500 font-medium">Standard Pricing Matrix</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Depot Track */}
            <div
              onClick={() => setFulfillmentTrack('water_depot')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                fulfillmentTrack === 'water_depot'
                  ? 'border-[#03098F] bg-blue-50/50 shadow-xs ring-2 ring-[#03098F]/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded mb-1.5">
                    Depot Collection
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">Ground Floor Pickup</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Collect directly from the hostel ground floor distribution hub upon arrival.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#03098F] font-mono">
                    ₦{pricingConfig.waterDepotPerBag}
                  </span>
                  <span className="text-[10px] text-slate-500 block">/ per bag</span>
                </div>
              </div>
            </div>

            {/* Premium Room Delivery */}
            <div
              onClick={() => setFulfillmentTrack('water_room_delivery')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                fulfillmentTrack === 'water_room_delivery'
                  ? 'border-[#00AFD5] bg-sky-50/50 shadow-xs ring-2 ring-[#00AFD5]/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-cyan-100 text-cyan-800 text-[10px] font-bold uppercase rounded mb-1.5">
                    Recommended ⭐ Premium
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">Direct-to-Door Room Delivery</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Delivered directly into your hostel room regardless of floor elevation.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#00AFD5] font-mono">
                    ₦{pricingConfig.waterRoomDeliveryPerBag}
                  </span>
                  <span className="text-[10px] text-slate-500 block">/ per bag</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Spatial Hostel Coordinates */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#00AFD5]" />
            2. Campus Hostel Domain & Spatial Coordinates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Hostel Dropdown */}
            <div className="sm:col-span-3 space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Hostel Domain <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={hostelDomain}
                onChange={(e) => setHostelDomain(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#03098F]"
              >
                {ESUTH_HOSTEL_DOMAINS.map((h, i) => (
                  <option key={i} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Room Identifier */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Explicit Room Identifier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Room 204, Flat 3B"
                value={roomIdentifier}
                onChange={(e) => setRoomIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#03098F]"
              />
            </div>

            {/* Floor Index */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Floor Index (Level) <span className="text-red-500">*</span>
              </label>
              <select
                value={floorIndex}
                onChange={(e) => setFloorIndex(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#03098F]"
              >
                <option value={0}>Ground Floor (Level 0)</option>
                <option value={1}>1st Floor (Level 1)</option>
                <option value={2}>2nd Floor (Level 2)</option>
                <option value={3}>3rd Floor (Level 3)</option>
              </select>
            </div>

            {/* Bag Quantity Integer Counter */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Volumetric Bags <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setBagCount(Math.max(1, bagCount - 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-extrabold text-sm font-mono text-[#03098F]">
                  {bagCount} {bagCount === 1 ? 'Bag' : 'Bags'}
                </span>
                <button
                  type="button"
                  onClick={() => setBagCount(bagCount + 1)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Identity & Scheduling Protocol */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00AFD5]" />
            3. Recipient Identity & Scheduling Protocol
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Client Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#03098F]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Active Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-[#03098F]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-[#03098F]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="Optional receipt copy"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#03098F]"
              />
            </div>

            {/* Target Delivery Date */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Target Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#03098F]"
              />
            </div>

            {/* Delivery Time Range */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Target Delivery Time Range <span className="text-red-500">*</span>
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#03098F]"
              >
                <option value="07:30 AM - 09:00 AM">Morning Early: 07:30 AM - 09:00 AM</option>
                <option value="09:00 AM - 11:00 AM">Morning Standard: 09:00 AM - 11:00 AM</option>
                <option value="11:30 AM - 01:30 PM">Afternoon Slot: 11:30 AM - 01:30 PM</option>
                <option value="02:00 PM - 04:30 PM">Mid-Day Slot: 02:00 PM - 04:30 PM</option>
                <option value="05:00 PM - 07:30 PM">Evening Slot: 05:00 PM - 07:30 PM</option>
              </select>
            </div>

            {/* Special Instructions */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Dynamic Special Delivery Context Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Please leave beside Room 204 door if studying at library, or call on arrival"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#03098F]"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Financial Processing & Bank Transfer Receipt */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#00AFD5]" />
              4. Financial Settlement & Bank Transfer Proof
            </h2>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Zero Transaction Fees
            </span>
          </div>

          {/* Official Settlement Account Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#03098F] to-[#01064D] text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-200">
                Official Corporate Account
              </span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">OPay / Moniepoint</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-300 text-[10px] block">Bank Name</span>
                <strong className="text-white">OPay Digital Services</strong>
              </div>
              <div>
                <span className="text-slate-300 text-[10px] block">Account Number</span>
                <strong className="text-cyan-200 font-mono text-base">09157004812</strong>
              </div>
              <div>
                <span className="text-slate-300 text-[10px] block">Account Name</span>
                <strong className="text-white">Aquastorm Enterprise</strong>
              </div>
            </div>
          </div>

          {/* Receipt Uploader */}
          <ReceiptUploader
            receiptUrl={paymentReceiptUrl}
            onReceiptChange={setPaymentReceiptUrl}
            required={true}
          />

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Order Summary & Pricing Calculation */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Water Volume ({bagCount} Bags @ ₦{unitPrice}/bag):</span>
              <span className="font-mono font-bold text-slate-800">₦{itemsSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Delivery Logistics Fee:</span>
              <span className="text-emerald-700 font-semibold">Included</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Payable Amount:</span>
              <span className="font-mono text-xl text-[#03098F]">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            className="w-full py-4 bg-[#03098F] hover:bg-[#03098F]/95 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-5 h-5 text-[#00AFD5]" />
            <span>Submit Water Booking & Commit Transfer Slip</span>
          </button>
        </div>
      </form>
    </div>
  );
};
