import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the "Book Today. Drink Tomorrow." model work?',
      a: 'Aquastorm aggregates student water and snack orders placed throughout the day and batches them for structured delivery the following day during your chosen time slot. This eliminates unpredictable delays and guarantees cold, fresh stock.'
    },
    {
      q: 'What is the difference between Depot Track and Premium Room Delivery?',
      a: 'The Depot Track (₦450/bag) allows students to collect their water at the designated ground floor hostel distribution center upon arrival. The Premium Track (₦500/bag) includes direct room door delivery by campus logistics personnel regardless of your floor level.'
    },
    {
      q: 'Why is there a strict 6-hour lead time on food and snack bookings?',
      a: 'Campus restaurants and food kitchens require adequate preparation windows to maintain strict hygiene standards and cook meals fresh for delivery. The 6-hour buffer ensures you receive hot, fresh food precisely on time.'
    },
    {
      q: 'How do I pay and how is my payment verified?',
      a: 'We accept direct bank transfers via OPay, Moniepoint, and PalmPay to our corporate account (09157004812). After transfer, upload your payment slip screenshot on the booking form. The Platform Manager verifies the slip within minutes to approve dispatch.'
    },
    {
      q: 'How does the Automated Stock Reminder Bot function?',
      a: 'Students can configure their checking cadence (Daily, Every 2 Days, Weekly, or Custom). Our automated system sends a proactive WhatsApp check-in. You can click YES to snooze or click NO/BOOK NOW to trigger an instant reorder to your room.'
    },
    {
      q: 'What if my delivery is late or the bag count is incorrect?',
      a: 'You can immediately file a structured support ticket directly through your portal or tracking screen under our 6 operational classifications. The Platform Admin investigates and audits all complaints with full dispute resolution.'
    }
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#03098F] text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-[#00AFD5]" />
          Knowledge Base & Logistics FAQ
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Everything you need to know about water booking, room delivery, and campus logistics.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-[#03098F]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
