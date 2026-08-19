import React from 'react';
import { Shield, FileText, X } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#03098F] rounded-xl">
              {type === 'terms' ? <FileText className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900">
                {type === 'terms' ? 'Operational Terms & Conditions' : 'Privacy Safeguard Statement'}
              </h3>
              <p className="text-xs text-slate-500">Aquastorm Enterprise • ESUTH Operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {type === 'terms' ? (
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-900">1. Advance Booking Principle</h4>
            <p>
              Under the "Book Today. Drink Tomorrow." paradigm, all standard sachet water and meal orders are queued for structured fulfillment during the next day's allocated morning or afternoon slot. Same-day emergency requests are subject to campus depot inventory availability.
            </p>

            <h4 className="font-bold text-slate-900">2. Pricing & Convenience Rates</h4>
            <p>
              Standard Sachet Water is fixed at ₦450 per bag for Depot Ground Collection and ₦500 per bag for Room Door Delivery. Food and snack orders incur a mandatory ₦300 flat convenience and packaging surcharge.
            </p>

            <h4 className="font-bold text-slate-900">3. Lead Times & Meal Cancellations</h4>
            <p>
              Food bookings require a strict minimum 6-hour advance preparation buffer. Once an order is marked as "In Kitchen Preparation", cancellation and refunds can only be authorized via direct Admin programmatic override.
            </p>

            <h4 className="font-bold text-slate-900">4. Delivery Coordinates</h4>
            <p>
              Students must provide precise room identifiers and floor levels. Delivery riders will make up to two contact attempts via telephone upon arrival at the designated hostel floor.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-900">1. Information Collection</h4>
            <p>
              Aquastorm collects student names, active WhatsApp contact numbers, and hostel room coordinates solely for logistics fulfillment and automated stock reminder check-ins.
            </p>

            <h4 className="font-bold text-slate-900">2. Financial Data Confidentiality</h4>
            <p>
              Payment verification slips are reviewed exclusively by authorized Platform Managers and Administrators. Bank transaction references are never sold or shared with external third-party advertisers.
            </p>

            <h4 className="font-bold text-slate-900">3. Reminder Opt-Out</h4>
            <p>
              Automated stock refill check-in notifications can be toggled on or off at any time directly through the Refill Scheduler panel in the user dashboard.
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#03098F] text-white font-bold text-xs rounded-xl"
          >
            I Acknowledge & Understand
          </button>
        </div>
      </div>
    </div>
  );
};
