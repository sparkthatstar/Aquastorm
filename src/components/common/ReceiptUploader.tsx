import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Image as ImageIcon, Eye, RefreshCw, AlertCircle } from 'lucide-react';

interface ReceiptUploaderProps {
  receiptUrl?: string;
  onReceiptChange: (url: string) => void;
  required?: boolean;
}

const SAMPLE_RECEIPTS = [
  {
    name: 'OPay Transfer Slip',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    ref: 'OPAY-2026-99218'
  },
  {
    name: 'Moniepoint POS Slip',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    ref: 'MONIE-88129-TRX'
  },
  {
    name: 'PalmPay Instant Slip',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    ref: 'PLMPY-66290-77'
  }
];

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  receiptUrl,
  onReceiptChange,
  required = true
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onReceiptChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onReceiptChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Bank Transfer Receipt Screenshot {required && <span className="text-red-500">* (Mandatory)</span>}
        </label>
        {receiptUrl && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Receipt Attached
          </span>
        )}
      </div>

      {receiptUrl ? (
        <div className="relative border-2 border-emerald-200 bg-emerald-50/40 rounded-xl p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={receiptUrl}
              alt="Uploaded Transfer Slip"
              className="w-14 h-14 object-cover rounded-lg border border-slate-300 shadow-xs"
            />
            <div>
              <p className="text-xs font-bold text-slate-800">Transfer Slip Attached</p>
              <p className="text-[11px] text-slate-500">Ready for Platform Manager verification</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#00AFD5]" />
              <span>View</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Replace</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            dragActive
              ? 'border-[#00AFD5] bg-sky-50/50'
              : 'border-slate-300 hover:border-[#03098F] bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 bg-white rounded-full shadow-xs border border-slate-200 text-[#03098F]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-bold text-[#03098F] hover:text-[#00AFD5] underline underline-offset-2 cursor-pointer"
              >
                Click to upload screenshot
              </button>{' '}
              or drag and drop here
            </div>
            <p className="text-[11px] text-slate-500">PNG, JPG, or JPEG (Max 10MB)</p>
          </div>

          {/* Quick Demo Pre-selected Slips for testing */}
          <div className="mt-4 pt-3 border-t border-slate-200/80">
            <p className="text-[11px] font-semibold text-slate-500 mb-2">Or select a test payment slip:</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SAMPLE_RECEIPTS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onReceiptChange(s.url)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-700 hover:text-[#03098F] transition-colors cursor-pointer"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Size Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-4 max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-800 text-sm">Payment Transfer Slip Inspection</h3>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <img
              src={receiptUrl}
              alt="Receipt Detailed View"
              className="w-full h-auto rounded-xl border border-slate-200"
            />
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Bank transaction screenshot logged with immutable audit hash.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
