import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, MessageCircle, Mail, MapPin, Clock, Send, CheckCircle2, Shield } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { pricingConfig, showToast } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your inquiry has been received by Aquastorm Campus Logistics Command.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#03098F] text-xs font-bold uppercase tracking-wider">
          <Phone className="w-3.5 h-3.5 text-[#00AFD5]" />
          Section 9: Public Engagement & Support Operations
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900">
          Aquastorm Contact Center
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Reach our campus operations team instantly for order modifications, inquiries, or bulk hostel reservations.
        </p>
      </div>

      {/* Operational Hours Strip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#03098F] to-[#00AFD5] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">Official Operational Hours</p>
            <p className="text-sm font-semibold">Mon – Sat: 07:00 AM – 09:00 PM • Sun: 08:00 AM – 06:00 PM</p>
          </div>
        </div>
        <span className="text-xs italic bg-white/10 px-3 py-1.5 rounded-full border border-white/20 font-medium">
          "We typically respond within a few minutes during operating hours."
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Instant Phone & WhatsApp Launcher */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-base font-bold font-heading text-slate-900">
              Direct Campus Hotline & Social Gateway
            </h3>

            {/* Tap-to-Call Primary Card */}
            <a
              id="contact-page-tap-to-call"
              href={`tel:${pricingConfig.supportHotline}`}
              className="p-5 rounded-2xl bg-blue-50/80 border-2 border-blue-200 hover:border-[#03098F] transition-all flex items-center justify-between gap-4 block group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#03098F] text-white flex items-center justify-center shadow-md">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Direct Telephone Call Link</span>
                  <strong className="text-lg font-mono font-black text-[#03098F] group-hover:text-[#00AFD5] transition-colors">
                    {pricingConfig.supportHotline}
                  </strong>
                  <span className="text-xs text-slate-500 block">Click to initiate instant phone call</span>
                </div>
              </div>
            </a>

            {/* WhatsApp Thread Launcher Card */}
            <a
              id="contact-page-whatsapp-btn"
              href={`https://wa.me/${pricingConfig.supportWhatsapp.replace('+', '')}?text=${encodeURIComponent('Hello Aquastorm Enterprise! Inquiring from ESUTH campus regarding water/food logistics.')}`}
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-200 hover:border-emerald-500 transition-all flex items-center justify-between gap-4 block group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">WhatsApp Direct Thread</span>
                  <strong className="text-lg font-mono font-black text-emerald-900 group-hover:text-emerald-700 transition-colors">
                    Launch WhatsApp Chat
                  </strong>
                  <span className="text-xs text-emerald-700 block">Instant response during operating hours</span>
                </div>
              </div>
            </a>

            {/* Physical Logistics Post */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-[#00AFD5] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">ESUTH Campus Logistics Center:</strong>
                <p>Boys & Girls Hostel Ground Distribution Terminal, Agbani Campus, Enugu State, Nigeria.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Minimalist Messaging Web Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Message Dispatched Successfully</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Thank you for contacting Aquastorm Enterprise. An operations supervisor will reach back on {phone || 'your phone'} promptly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2 bg-[#03098F] text-white rounded-xl text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold font-heading text-slate-900">
                Direct Messaging Web Form
              </h3>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">Active Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="080..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-700">Message / Inquiry Details *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your inquiry, delivery modification, or bulk order..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#03098F] hover:bg-[#03098F]/90 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry to Command Team</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
