import React from 'react';
import {
  Droplets,
  UtensilsCrossed,
  Search,
  Phone,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Award,
  HeartHandshake,
  BadgePercent,
  CheckCircle2,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { pricingConfig, orders } = useApp();

  const sevenPillars = [
    { title: 'Fast Delivery', desc: 'Deterministic batch routing across all hostel wings.', icon: <Zap className="w-5 h-5 text-[#00AFD5]" /> },
    { title: 'Fresh Products', desc: 'Guaranteed hygienic, sealed, cold sachet bags and fresh meals.', icon: <Sparkles className="w-5 h-5 text-emerald-500" /> },
    { title: 'Scheduled Booking', desc: '"Book Today. Drink Tomorrow." Proactive morning delivery.', icon: <Clock className="w-5 h-5 text-[#03098F]" /> },
    { title: 'Trusted Service', desc: 'Verified campus delivery staff and structured room handoffs.', icon: <ShieldCheck className="w-5 h-5 text-purple-500" /> },
    { title: 'Reliable Support', desc: 'Closed-loop complaint resolution with direct Admin audit.', icon: <HeartHandshake className="w-5 h-5 text-rose-500" /> },
    { title: 'Affordable Convenience', desc: '₦450 Depot / ₦500 Room door rates tailored for student budgets.', icon: <BadgePercent className="w-5 h-5 text-amber-500" /> },
    { title: 'Always Available', desc: 'Automated stock reminder bots keeping your dispensers filled.', icon: <Award className="w-5 h-5 text-cyan-600" /> }
  ];

  const howItWorksSteps = [
    { step: 1, text: 'User establishes validated account profile via Registration.' },
    { step: 2, text: 'Selects primary fulfillment track: [Water Booking] or [Food Booking].' },
    { step: 3, text: 'Specifies localized campus hostel domain (e.g. Boys Block A / Queens Hall).' },
    { step: 4, text: 'Declares explicit space coordinates (Room Number and Floor Level).' },
    { step: 5, text: 'Maps required fulfillment window using delivery calendar picker.' },
    { step: 6, text: 'Authenticates payment (submits bank transfer proof).' },
    { step: 7, text: 'Platform Manager verifies payment validity and unlocks order.' },
    { step: 8, text: 'Assigned Delivery Vendor conveys items securely to room door.' },
    { step: 9, text: 'Order closes successfully and client rates the experience.' }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Block */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-[#03098F] to-[#01064D] text-white pt-12 pb-20 px-4 sm:px-6">
        {/* Background Overlay Motif */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00AFD5_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-200 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#00AFD5] animate-ping" />
              ESUTH Campus Pilot Operational
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-tight">
              Never Run Out of <span className="text-[#00AFD5]">Water Again.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl mx-auto lg:mx-0">
              "Book clean sachet water and hostel meals in advance and have them delivered directly to your hostel exactly when you need them."
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                id="hero-book-water-btn"
                onClick={() => onNavigate('book-water')}
                className="px-6 py-3.5 bg-[#00AFD5] hover:bg-[#00AFD5]/90 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Droplets className="w-4 h-4" />
                <span>Book Sachet Water</span>
              </button>

              <button
                id="hero-book-food-btn"
                onClick={() => onNavigate('book-food')}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Book Food & Snacks</span>
              </button>

              <button
                id="hero-track-order-btn"
                onClick={() => onNavigate('track')}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-cyan-300" />
                <span>Track Order</span>
              </button>
            </div>

            <div className="pt-2 text-xs text-blue-200 flex items-center justify-center lg:justify-start gap-4">
              <span>Need instant help?</span>
              <button
                onClick={() => onNavigate('contact')}
                className="text-cyan-300 hover:text-white font-bold underline underline-offset-4 flex items-center gap-1 cursor-pointer"
              >
                <span>Contact Support Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hero Visual Card / Pilot Metric */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Live Campus Dispatch</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Enugu State Univ.
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden h-48 relative border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80"
                  alt="ESUTH Campus Students Receiving Deliveries"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <p className="text-xs text-white font-medium">Direct-to-hostel handoffs across Boys & Girls wings</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-blue-200 block">Depot Ground Collection</span>
                  <strong className="text-cyan-300 font-mono text-base">₦{pricingConfig.waterDepotPerBag}</strong>
                  <span className="text-[10px] text-slate-300 block">/ per bag</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-blue-200 block">Room Door Delivery</span>
                  <strong className="text-white font-mono text-base">₦{pricingConfig.waterRoomDeliveryPerBag}</strong>
                  <span className="text-[10px] text-slate-300 block">/ all floor levels</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Corporate Pillars Value Proposition Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#03098F]">
            The 7 Operational Pillars
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Engineered for Campus Living
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Aquastorm replaces chaotic campus water hauling with structured, predictable, and hygienic delivery logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sevenPillars.map((p, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#00AFD5] transition-all space-y-2.5 ${
                i === 6 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {p.icon}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Operational Flow: "How It Works" 9 Steps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00AFD5]">Deterministic Workflow</span>
            <h3 className="text-2xl sm:text-3xl font-black font-heading">
              How Aquastorm Operates (9-Step Protocol)
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              From your initial booking to door handoff, every checkpoint is validated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {howItWorksSteps.map((s) => (
              <div key={s.step} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="w-7 h-7 rounded-lg bg-[#00AFD5] text-white font-mono font-bold text-xs flex items-center justify-center">
                  0{s.step}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => onNavigate('book-water')}
              className="px-8 py-3.5 bg-[#00AFD5] hover:bg-[#00AFD5]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
            >
              Begin Your Advance Booking Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
