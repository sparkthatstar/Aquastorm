import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintClassification } from '../../types';
import { AlertTriangle, Send, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetOrderId?: string;
}

const CLASSIFICATIONS: ComplaintClassification[] = [
  'Late Delivery Breach',
  'Inaccurate Bag Quantity Discrepancy',
  'Wrong Product/Mismatched Selection',
  'Poor Vendor Conduct Service Report',
  'Refund Request Initialization',
  'Generic Miscellaneous / Other'
];

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  targetOrderId = ''
}) => {
  const { currentUser, orders, submitComplaint } = useApp();
  const [orderId, setOrderId] = useState(targetOrderId);
  const [classification, setClassification] = useState<ComplaintClassification>('Late Delivery Breach');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const userOrders = orders.filter(o => o.customerId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !subject.trim()) return;

    const ticket = submitComplaint({
      orderId: orderId || (userOrders[0]?.id || 'AQ-GENERAL'),
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      classification,
      subject,
      description
    });

    setSubmittedId(ticket.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-red-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-red-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading">File Structured Support Ticket</h3>
              <p className="text-xs text-red-200">Strictly sandboxed to Admin oversight & customer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>

        {submittedId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800">Support Ticket Logged</h4>
              <p className="text-xs font-mono font-bold text-[#03098F] mt-1">{submittedId}</p>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                Your incident has been escalated directly to Platform Admin. You will receive an immediate resolution audit.
              </p>
            </div>
            <button
              onClick={() => {
                setSubmittedId(null);
                onClose();
              }}
              className="px-6 py-2.5 bg-[#03098F] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Close & Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Related Order Selection */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Target Order Identifier
              </label>
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#03098F]"
              >
                <option value="">General Platform Inquiry (No Specific Order)</option>
                {userOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.id} - {o.fulfillmentTrack.replace(/_/g, ' ').toUpperCase()} (₦{o.totalAmount})
                  </option>
                ))}
              </select>
            </div>

            {/* Operational Classification */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Operational Classification <span className="text-red-500">*</span>
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as ComplaintClassification)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#03098F]"
              >
                {CLASSIFICATIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Subject Summary <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Brief summary of the issue..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#03098F]"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Incident Details & Coordinates <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Provide exact room location, timing, or vendor interaction details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#03098F]"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Complaint Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
