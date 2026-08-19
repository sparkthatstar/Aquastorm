import React from 'react';
import { Shield, Target, Compass, Award, CheckCircle2, Building, MapPin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const corporateValues = [
    { value: 'Reliability', def: 'Bulletproof booking workflows, deterministic delivery scheduling, and reliable tracking frameworks.' },
    { value: 'Speed', def: 'Lightweight frontend code optimized for low-bandwidth mobile networks, ensuring zero booking delays.' },
    { value: 'Freshness', def: 'Clear communication of hygiene, quality standards, and immediate fulfillment intervals.' },
    { value: 'Integrity', def: 'Absolute financial transparency with immutable payment logging and explicit pricing models.' },
    { value: 'Convenience', def: 'Minimization of user friction—straightforward forms, saved historical parameters, and one-click reordering.' },
    { value: 'Customer Satisfaction', def: 'Integrated, real-time complaint filing pipelines and feedback loops visible to administrative oversight.' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#03098F] text-xs font-bold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-[#00AFD5]" />
          Section 1: Strategic Corporate Foundation
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900">
          About Aquastorm Enterprise
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          "Book Today. Drink Tomorrow." — Built to solve the historical inconvenience students face when sourcing clean drinking water and food items in campus environments.
        </p>
      </div>

      {/* Business Description */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-heading">Business Description</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Aquastorm is a specialized digital booking and logistics platform engineered to solve the historical inconvenience students face when sourcing clean drinking water and food items in campus environments. The platform allows residential students to conveniently book sachet water and selected food/snacks for delivery directly to their hostel rooms. By offering scheduled deliveries, proactive automated stock reminders, and an organized localized vendor distribution model, Aquastorm converts a manual, stressful errand into a reliable, touchless convenience.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The system is architected to eliminate the stress of searching for basic essentials at inconvenient times or carrying heavy loads across distances by making advance hostel bookings transparent, affordable, and punctual.
        </p>
      </div>

      {/* Corporate Statements: Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#03098F] to-[#01064D] text-white shadow-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#00AFD5]">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold font-heading">Business Mission</h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            To elevate and simplify the hostel living experience by providing ultra-reliable, fast, and structured logistics for water delivery and critical student convenience services.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#00AFD5] to-[#007A99] text-white shadow-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold font-heading">Business Vision</h3>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            To emerge as Nigeria's preeminent multi-campus hostel convenience platform, establishing operational mastery in water delivery before scaling horizontally into an omnibus marketplace for diverse campus services nationwide.
          </p>
        </div>
      </div>

      {/* Core Corporate Values Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading">
            Core Corporate Values & Operational Definitions
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {corporateValues.map((v, i) => (
            <div key={i} className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <span className="font-extrabold text-[#03098F] sm:col-span-1">{v.value}</span>
              <p className="text-slate-600 sm:col-span-3 leading-relaxed">{v.def}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
