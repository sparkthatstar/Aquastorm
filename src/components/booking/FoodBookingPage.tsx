import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ESUTH_HOSTEL_DOMAINS } from '../../data/mockData';
import { ReceiptUploader } from '../common/ReceiptUploader';
import { FoodItem } from '../../types';
import {
  UtensilsCrossed,
  Clock,
  AlertTriangle,
  Plus,
  Minus,
  MapPin,
  Calendar,
  CheckCircle,
  CreditCard,
  Building,
  Store,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FoodBookingPageProps {
  onOrderCreated: (orderId: string) => void;
  onNavigate: (view: string) => void;
}

export const FoodBookingPage: React.FC<FoodBookingPageProps> = ({
  onOrderCreated,
  onNavigate
}) => {
  const { currentUser, pricingConfig, restaurants, foodItems, createOrder } = useApp();

  // Selected Restaurant
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cart state: Record<itemId, quantity>
  const [cart, setCart] = useState<Record<string, number>>({});

  // Spatial & Personal coordinates
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(currentUser.mobileNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser.whatsappNumber || '');
  const [hostelDomain, setHostelDomain] = useState(currentUser.hostelDomain || ESUTH_HOSTEL_DOMAINS[0]);
  const [roomIdentifier, setRoomIdentifier] = useState(currentUser.roomIdentifier || 'Room 204');
  const [floorIndex, setFloorIndex] = useState<number>(currentUser.floorIndex ?? 2);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Default target date/time: Next day or 8 hours from now
  const now = new Date();
  const defaultDeliveryDate = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState(defaultDeliveryDate);
  const [targetTime, setTargetTime] = useState('13:00'); // 1:00 PM

  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filter food items
  const filteredItems = foodItems.filter(item => {
    const matchesRest = selectedRestaurantId === 'all' || item.restaurantId === selectedRestaurantId;
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesRest && matchesCat;
  });

  const categories = ['all', 'Rice & Pasta', 'Swallow & Soups', 'Grills & Shawarma', 'Snacks & Pastries', 'Drinks & Smoothies'];

  // Modify cart
  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  // Compute Cart items & prices
  const cartItemsList = Object.entries(cart).map(([itemId, qty]) => {
    const item = foodItems.find(f => f.id === itemId)!;
    return { ...item, qty };
  });

  const itemsSubtotal = cartItemsList.reduce((acc, cur) => acc + cur.price * cur.qty, 0);
  const convenienceFee = itemsSubtotal > 0 ? pricingConfig.foodConvenienceFee : 0; // Flat N300
  const totalAmount = itemsSubtotal + convenienceFee;

  // 6-HOUR MINIMUM LEAD TIME GUARDRAIL CHECK
  const checkLeadTimeValidity = (): { isValid: boolean; hoursDifference: number } => {
    const targetDateTime = new Date(`${targetDate}T${targetTime}:00`);
    const currentDateTime = new Date();
    const diffMs = targetDateTime.getTime() - currentDateTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return {
      isValid: diffHours >= pricingConfig.minFoodLeadTimeHours,
      hoursDifference: Math.max(0, parseFloat(diffHours.toFixed(1)))
    };
  };

  const leadTimeCheck = checkLeadTimeValidity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cartItemsList.length === 0) {
      setErrorMsg('Your tray is empty! Please select at least one hostel meal or snack.');
      return;
    }

    // Programmatic enforcement of 6-hour lead time
    if (!leadTimeCheck.isValid) {
      setErrorMsg(
        `Critical Operational Policy: Food orders require a strict minimum 6-hour advance preparation lead time. Your selected slot is only ${leadTimeCheck.hoursDifference} hours from now. Please adjust your target time.`
      );
      return;
    }

    if (!paymentReceiptUrl) {
      setErrorMsg('Mandatory Field: Please upload or select your bank transfer payment receipt screenshot before submitting.');
      return;
    }

    const orderItems = cartItemsList.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category.toLowerCase().includes('drink') ? ('drink' as const) : ('food' as const),
      unitPrice: c.price,
      quantity: c.qty,
      vendorName: c.restaurantName
    }));

    const newOrder = createOrder({
      customerId: currentUser.id,
      customerName: fullName,
      customerPhone: mobileNumber,
      customerWhatsapp: whatsappNumber,
      hostelDomain,
      roomIdentifier,
      floorIndex,
      fulfillmentTrack: 'food_delivery',
      targetDeliveryDate: targetDate,
      targetDeliveryTimeSlot: `${targetTime} Delivery Window`,
      specialInstructions,
      items: orderItems,
      itemsSubtotal,
      convenienceFee,
      totalAmount,
      paymentMethod: 'bank_transfer',
      paymentReceiptUrl
    });

    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch { /* ignore */ }

    onOrderCreated(newOrder.id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
          Campus Partner Restaurants & Snacks
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
          Book Hostel Meals & Snacks
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Freshly prepared student meals from verified campus food joints, delivered directly to your hostel room floor.
        </p>
      </div>

      {/* 6-HOUR LEAD TIME WARNING BANNER */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-extrabold uppercase tracking-wide text-amber-900">
              Critical Technical Guardrail: 6-Hour Advance Lead Time
            </p>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              To guarantee hygienic meal preparation and timely batch delivery, all food bookings must be placed at least <strong>6 hours before</strong> your desired fulfillment time.
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold whitespace-nowrap">
          ₦300 Flat Platform Convenience Fee
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Menu & Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Restaurant & Category Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            {/* Restaurant Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#00AFD5]" />
                Partner Vendor Selection:
              </label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="all">All Campus Kitchens ({restaurants.length} Active)</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.cuisine})</option>
                ))}
              </select>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#03098F] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Dishes' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map(item => {
              const inCartQty = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="h-36 relative overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {item.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400 block mt-1">
                        By {item.restaurantName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="font-extrabold text-[#03098F] font-mono text-base">
                        ₦{item.price.toLocaleString()}
                      </span>

                      {/* Quantity Modifier */}
                      {inCartQty > 0 ? (
                        <div className="flex items-center gap-2 bg-blue-50 border border-[#03098F]/30 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-[#03098F] hover:bg-blue-100 rounded"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-[#03098F] px-1 font-mono">{inCartQty}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-[#03098F] hover:bg-blue-100 rounded"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-3 py-1.5 bg-[#03098F] hover:bg-[#03098F]/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Tray</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Logistics, 6h Lead Time Check & Checkout */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tray Summary */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                <span>Selected Meal Tray</span>
                <span className="text-slate-500 font-mono">({cartItemsList.length} items)</span>
              </h2>

              {cartItemsList.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                  <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Your meal tray is currently empty.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Select dishes from the campus kitchens to proceed.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {cartItemsList.map(c => (
                    <div key={c.id} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                      <div className="max-w-[65%]">
                        <p className="font-bold text-slate-800 line-clamp-1">{c.name}</p>
                        <span className="text-[10px] text-slate-500">{c.qty} × ₦{c.price}</span>
                      </div>
                      <span className="font-bold text-[#03098F] font-mono">₦{(c.price * c.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Logistics Timing & 6-Hour Validator */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#00AFD5]" />
                    Delivery Timing
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    leadTimeCheck.isValid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {leadTimeCheck.isValid ? `✓ ${leadTimeCheck.hoursDifference}h Lead Time (Valid)` : `⚠️ ${leadTimeCheck.hoursDifference}h Lead Time (Too Soon)`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Target Date</span>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Target Time</span>
                    <input
                      type="time"
                      required
                      value={targetTime}
                      onChange={(e) => setTargetTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>

                {!leadTimeCheck.isValid && (
                  <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                    Lead time policy requires <strong>6+ hours advance notice</strong> for kitchen preparation. Please select a time slot at least 6 hours ahead.
                  </p>
                )}
              </div>

              {/* Spatial Coordinates */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#00AFD5]" />
                  Hostel Coordinates
                </label>
                <select
                  value={hostelDomain}
                  onChange={(e) => setHostelDomain(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  {ESUTH_HOSTEL_DOMAINS.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Room Number (e.g. 204)"
                    value={roomIdentifier}
                    onChange={(e) => setRoomIdentifier(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  <select
                    value={floorIndex}
                    onChange={(e) => setFloorIndex(parseInt(e.target.value))}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value={0}>Ground Floor</option>
                    <option value={1}>1st Floor</option>
                    <option value={2}>2nd Floor</option>
                    <option value={3}>3rd Floor</option>
                  </select>
                </div>
              </div>

              {/* Bank Transfer Receipt */}
              <div className="pt-3 border-t border-slate-200">
                <ReceiptUploader
                  receiptUrl={paymentReceiptUrl}
                  onReceiptChange={setPaymentReceiptUrl}
                  required={true}
                />
              </div>

              {/* Totals Calculation */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Meal Items Subtotal:</span>
                  <span className="font-mono font-bold text-slate-800">₦{itemsSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Mandatory Platform Convenience Surcharge:</span>
                  <span className="font-mono font-bold text-slate-800">₦{convenienceFee}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>Total Amount:</span>
                  <span className="font-mono text-lg text-[#03098F]">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!leadTimeCheck.isValid || cartItemsList.length === 0}
                className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  leadTimeCheck.isValid && cartItemsList.length > 0
                    ? 'bg-[#03098F] hover:bg-[#03098F]/90 text-white shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-[#00AFD5]" />
                <span>Submit Food Booking & Lock Order</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
