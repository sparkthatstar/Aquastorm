import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, MessageCircle, Smartphone, Check, Clock, Droplets, Sparkles, Send } from 'lucide-react';
import { ESUTH_HOSTEL_DOMAINS } from '../../data/mockData';

interface ReminderEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstantReorder?: () => void;
}

export const ReminderEngineModal: React.FC<ReminderEngineModalProps> = ({
  isOpen,
  onClose,
  onInstantReorder
}) => {
  const { currentUser, reminders, updateReminderSetting, showToast } = useApp();
  
  const userReminder = reminders.find(r => r.customerId === currentUser.id) || {
    id: 'rem_new',
    customerId: currentUser.id,
    cadence: 'Every 2 Days' as const,
    preferredBagCount: 3,
    preferredFulfillmentTrack: 'water_room_delivery' as const,
    preferredDeliveryTime: '09:00 AM - 11:00 AM',
    preferredHostelDomain: currentUser.hostelDomain || ESUTH_HOSTEL_DOMAINS[0],
    preferredRoomIdentifier: currentUser.roomIdentifier || 'Room 204',
    preferredFloorIndex: currentUser.floorIndex || 2,
    channel: 'WhatsApp' as const,
    isEnabled: true
  };

  const [cadence, setCadence] = useState(userReminder.cadence);
  const [customDays, setCustomDays] = useState(userReminder.customDays || 3);
  const [preferredBagCount, setPreferredBagCount] = useState(userReminder.preferredBagCount);
  const [track, setTrack] = useState(userReminder.preferredFulfillmentTrack);
  const [channel, setChannel] = useState(userReminder.channel);
  const [isEnabled, setIsEnabled] = useState(userReminder.isEnabled);
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    updateReminderSetting({
      cadence,
      customDays,
      preferredBagCount,
      preferredFulfillmentTrack: track,
      channel,
      isEnabled
    });
    onClose();
  };

  const firstName = currentUser.fullName.split(' ')[0] || 'Student';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#03098F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-[#00AFD5]">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading">Automated Stock Reminder Engine</h3>
              <p className="text-xs text-blue-200">Proactive campus refill reminders — never run dry in the hostel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <p className="font-bold text-slate-800 text-sm">Automated Refill Scheduler</p>
              <p className="text-xs text-slate-500">Receive proactive check-in messages before your sachet water runs out</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00AFD5]"></div>
            </label>
          </div>

          {/* Cadence Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Checking Cadence (Interval Protocol)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Daily', label: 'Daily Interval', desc: 'Every 24 Hours' },
                { id: 'Every 2 Days', label: 'Every Two Days', desc: 'Standard Hostel Rate' },
                { id: 'Weekly', label: 'Weekly Cycle', desc: 'Every 7 Days' },
                { id: 'Custom', label: 'Custom Metric', desc: 'Choose Days' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCadence(item.id as any)}
                  className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                    cadence === item.id
                      ? 'border-[#03098F] bg-blue-50/70 text-[#03098F] font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="font-semibold text-xs">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>

            {cadence === 'Custom' && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-medium text-slate-700">Remind me every:</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-center"
                />
                <span className="text-xs font-medium text-slate-700">Days</span>
              </div>
            )}
          </div>

          {/* Delivery Parameters for 1-Click Reorder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Default Reorder Bag Count
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setPreferredBagCount(cnt)}
                    className={`w-10 h-10 rounded-xl border font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      preferredBagCount === cnt
                        ? 'bg-[#03098F] text-white border-[#03098F]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Notification Channel
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'WhatsApp', label: 'WhatsApp', icon: <MessageCircle className="w-3.5 h-3.5" /> },
                  { id: 'SMS', label: 'SMS', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'In-App', label: 'In-App', icon: <Bell className="w-3.5 h-3.5" /> }
                ].map(ch => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id as any)}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      channel === ch.id
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {ch.icon}
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Omnichannel Script Simulation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00AFD5]" />
                Live Notification Script Mockup ({channel})
              </label>
              <span className="text-[11px] text-slate-400">Exact Specification Template</span>
            </div>

            {/* WhatsApp Phone Mockup Bubble */}
            <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-[#DAD2C7] space-y-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1 border-b border-black/5">
                <span className="font-semibold text-emerald-800 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                  Aquastorm Campus Bot
                </span>
                <span>Today, 08:00 AM</span>
              </div>

              {/* Exact Master Spec Template Bubble */}
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs shadow-xs text-xs text-slate-800 space-y-2.5 max-w-md">
                <p className="leading-relaxed">
                  "Hi <strong className="text-[#03098F]">{firstName}</strong> 👋. Do you still have enough water? Select <span className="font-bold text-amber-700">[YES]</span> to snooze, or click <span className="font-bold text-[#00AFD5]">[NO / BOOK NOW]</span> to reorder your preferred <strong className="text-slate-900">{preferredBagCount} bag pack</strong> instantly."
                </p>
                <div className="text-[10px] text-slate-400 text-right">08:00 AM ✓✓</div>
              </div>

              {/* Interactive Quick Action Buttons in WhatsApp */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedResponse('Snoozed for 24 hours. We will check on your water stock tomorrow!');
                    showToast('Snoozed: Reminder postponed by 24 hours.');
                  }}
                  className="p-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-amber-800 text-center shadow-xs transition-all cursor-pointer"
                >
                  💤 YES (Snooze 24h)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedResponse(`Instant Reorder triggered for ${preferredBagCount} bags to ${currentUser.roomIdentifier || 'Room 204'}!`);
                    if (onInstantReorder) onInstantReorder();
                  }}
                  className="p-2.5 bg-[#03098F] hover:bg-[#03098F]/90 text-white rounded-xl text-xs font-bold text-center shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Droplets className="w-3.5 h-3.5 text-[#00AFD5]" />
                  <span>NO / BOOK NOW</span>
                </button>
              </div>

              {simulatedResponse && (
                <div className="p-2.5 bg-emerald-100/80 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium animate-fade-in">
                  ✓ {simulatedResponse}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#03098F] hover:bg-[#03098F]/90 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Reminder Protocol</span>
          </button>
        </div>
      </div>
    </div>
  );
};
