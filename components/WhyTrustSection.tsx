import React from 'react';
import { ShieldCheck, MapPin, CreditCard, Award, CheckCircle2, Lock } from 'lucide-react';

export default function WhyTrustSection() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: '100% Aadhaar & Skill KYC',
      titleHi: 'आधार व कौशल सत्यापन',
      description: 'Every tradesman passes government identity authentication, criminal background check, and mandatory trade skill verification before taking customer bookings.',
      tag: 'Zero Imposters',
    },
    {
      icon: MapPin,
      title: 'Live GPS Worker Tracking',
      titleHi: 'लाइव जीपीएस ट्रैकिंग',
      description: 'Once on the way, view your professional’s exact real-time location and real traffic ETA on live maps. No false promises or guessing arrival times.',
      tag: 'Real Coordinates',
    },
    {
      icon: CreditCard,
      title: 'Escrow-Safe Payment Settlement',
      titleHi: 'सुरक्षित एस्क्रो भुगतान',
      description: 'Funds are securely held in trust. Payment is only released to the worker when you inspect and confirm 100% job satisfaction on your screen.',
      tag: 'Pay After Satisfaction',
    },
    {
      icon: Award,
      title: '₹25,000 KaamSetu Guarantee',
      titleHi: '₹25,000 सुरक्षा गारंटी',
      description: 'Full damage protection and free 7-day rework guarantee on every service booked through KaamSetu. Dedicated dispute resolution officer on call.',
      tag: 'Workmanship Insured',
    },
  ];

  return (
    <section className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[#2583D5] text-xs font-bold uppercase tracking-wider border border-[#D1E8F8]">
            <Lock className="w-3.5 h-3.5 text-[#2583D5]" />
            <span>Built on Trust & Integrity • विश्वसनीयता</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#153451] tracking-tight">
            Why India Trusts KaamSetu
          </h2>
          <p className="text-base sm:text-lg text-[#4B6F8E] font-medium leading-relaxed">
            Unlike unorganized roadside stands or unregulated aggregators, KaamSetu provides complete transparency, verified worker safety, and institutional quality control.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-3xl p-7 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#EAF6FF] to-[#D9EEFF] text-[#2583D5] flex items-center justify-center mb-5 group-hover:from-[#2583D5] group-hover:to-[#19639E] group-hover:text-white transition-all duration-300 shadow-sm border border-white/80">
                    <Icon className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#2583D5] bg-[#EAF6FF] px-2.5 py-0.5 rounded-md mb-2 border border-[#D1E8F8]">
                    {item.tag}
                  </span>
                  <h3 className="text-lg font-black text-[#153451] mb-0.5 group-hover:text-[#2583D5] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#7697B3] font-semibold mb-3">
                    {item.titleHi}
                  </p>
                  <p className="text-xs sm:text-sm text-[#4B6F8E] leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EAF6FF] flex items-center gap-1.5 text-xs font-bold text-[#153451]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Platform Standard</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
