import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, Droplets, UtensilsCrossed, CheckCircle2, Calculator, ArrowRight } from 'lucide-react';

interface PricingPageProps {
  onNavigate: (view: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const { pricingConfig } = useApp();
  const [calcBags, setCalcBags] = useState(4);
  const [calcTrack, setCalcTrack] = useState<'depot' | 'room'>('room');

  const unitRate = calcTrack === 'room' ? pricingConfig.waterRoomDeliveryPerBag : pricingConfig.waterDepotPerBag;
  const calcTotal = calcBags * unitRate;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#03098F] text-xs font-bold uppercase tracking-wider">
          <DollarSign className="w-3.5 h-3.5 text-[#00AFD5]" />
          Section 5: Static Matrix & Pricing Strategy
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900">
          Transparent Campus Pricing Matrix
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Explicit pricing rates without hidden fees, architected specifically for student campus affordability.
        </p>
      </div>

      {/* Static Pricing Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Depot Track */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
              Depot Track
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Sachet Water (Depot Collection)</h3>
            <p className="text-xs text-slate-500">
              Ground floor pickup / client direct depot collection upon batch arrival.
            </p>
            <div className="pt-2">
              <span className="text-3xl font-black text-[#03098F] font-mono">₦{pricingConfig.waterDepotPerBag}</span>
              <span className="text-xs text-slate-500 font-semibold"> / per bag</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('book-water')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Select Depot Track
          </button>
        </div>

        {/* Premium Room Delivery */}
        <div className="bg-gradient-to-b from-blue-900 to-[#03098F] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#00AFD5] text-white text-[10px] font-bold uppercase">
            Most Popular ⭐
          </span>
          <div className="space-y-3">
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-cyan-200 text-[10px] font-bold uppercase">
              Premium Track
            </span>
            <h3 className="text-lg font-bold text-white font-heading">Direct-to-Door Room Delivery</h3>
            <p className="text-xs text-slate-200">
              Delivered directly into your hostel room regardless of floor elevation (Ground to 3rd Floor).
            </p>
            <div className="pt-2">
              <span className="text-3xl font-black text-[#00AFD5] font-mono">₦{pricingConfig.waterRoomDeliveryPerBag}</span>
              <span className="text-xs text-blue-200 font-semibold"> / per bag</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('book-water')}
            className="w-full py-3 bg-[#00AFD5] hover:bg-[#00AFD5]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Book Room Delivery
          </button>
        </div>

        {/* Snacks & Hostel Meals */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
              Food Convenience
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Snacks & Hostel Meals</h3>
            <p className="text-xs text-slate-500">
              Sourced from campus restaurant partners to your room door (6h advance lead time).
            </p>
            <div className="pt-2">
              <span className="text-xl font-bold text-slate-800">Menu Price + </span>
              <span className="text-2xl font-black text-amber-700 font-mono">₦{pricingConfig.foodConvenienceFee}</span>
              <span className="text-xs text-slate-500 block">Flat Convenience Surcharge</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('book-food')}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Explore Meal Menus
          </button>
        </div>
      </div>

      {/* Interactive Hostel Volume Calculator */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 max-w-xl mx-auto space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#00AFD5]" />
          Instant Water Budget Estimator
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Select Track:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCalcTrack('depot')}
                className={`px-3 py-1 rounded-lg font-semibold ${calcTrack === 'depot' ? 'bg-[#03098F] text-white' : 'bg-white text-slate-700'}`}
              >
                Depot (₦{pricingConfig.waterDepotPerBag})
              </button>
              <button
                onClick={() => setCalcTrack('room')}
                className={`px-3 py-1 rounded-lg font-semibold ${calcTrack === 'room' ? 'bg-[#03098F] text-white' : 'bg-white text-slate-700'}`}
              >
                Room Delivery (₦{pricingConfig.waterRoomDeliveryPerBag})
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Bags Required ({calcBags} Bags):</span>
            <input
              type="range"
              min="1"
              max="20"
              value={calcBags}
              onChange={(e) => setCalcBags(parseInt(e.target.value))}
              className="w-40"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Estimated Total:</span>
            <span className="text-2xl font-black font-mono text-[#03098F]">₦{calcTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
