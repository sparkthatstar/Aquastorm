import React from 'react';
import { Logo } from './Logo';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenPrivacy,
  onOpenTerms
}) => {
  const { pricingConfig } = useApp();

  return (
    <footer className="bg-[#03098F] text-white border-t border-blue-900/60 mt-auto">
      {/* Upper Footer: Value Highlight Strip */}
      <div className="border-b border-white/10 bg-black/15 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-[#00AFD5]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs uppercase tracking-wider">Campus Target Pilot</p>
              <p className="text-slate-300 text-xs">Enugu State University of Technology (ESUTH) Hostels</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs uppercase tracking-wider">Operational Response</p>
              <p className="text-slate-300 text-xs">We typically respond within a few minutes during active hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-[#00AFD5]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs uppercase tracking-wider">Corporate Standard</p>
              <p className="text-slate-300 text-xs">Deterministic 9-stage fulfillment & quality guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" inverted={true} />
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Nigeria's preeminent multi-campus hostel convenience platform. Solving student water and food logistics through deterministic scheduled deliveries right to your room door.
            </p>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-cyan-200">
              <span className="font-semibold text-white">Master Slogan:</span> "Book Today. Drink Tomorrow."
            </div>
          </div>

          {/* Quick Booking */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300">Fulfillment Tracks</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('book-water')}
                  className="hover:text-[#00AFD5] transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#00AFD5]" />
                  <span>Sachet Water (Depot ₦450)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('book-water')}
                  className="hover:text-[#00AFD5] transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#00AFD5]" />
                  <span>Room Delivery (₦500/bag)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('book-food')}
                  className="hover:text-[#00AFD5] transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#00AFD5]" />
                  <span>Campus Partner Meals</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-[#00AFD5] transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#00AFD5]" />
                  <span>Live 9-Stage Tracker</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300">Platform Portal</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About Us & Blueprint
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">
                  Pricing Matrix
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  FAQ Knowledge Base
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact Center
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-[#00AFD5] text-cyan-300 font-medium transition-colors">
                  Workspace Login
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300">Instant Connect</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <a
                href={`tel:${pricingConfig.supportHotline}`}
                className="flex items-center gap-2 p-2 bg-white/10 rounded-lg hover:bg-white/15 transition-all text-white font-medium"
              >
                <Phone className="w-4 h-4 text-[#00AFD5]" />
                <span>Call: {pricingConfig.supportHotline}</span>
              </a>
              <a
                href={`https://wa.me/${pricingConfig.supportWhatsapp.replace('+', '')}?text=${encodeURIComponent('Hello Aquastorm Enterprise! Inquiring from ESUTH campus.')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 bg-emerald-600/30 border border-emerald-500/40 rounded-lg hover:bg-emerald-600/40 transition-all text-emerald-300 font-medium"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Instant Chat</span>
              </a>
              <p className="text-[11px] text-slate-400 pt-1">
                Boys & Girls Hostel Command Post, Agbani Campus, Enugu State.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Legal Strip */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Aquastorm Enterprise. All rights reserved. Registered under Nigerian Commercial Laws.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Privacy Safeguard Statement
            </button>
            <button
              onClick={onOpenTerms}
              className="hover:text-white transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Operational Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
