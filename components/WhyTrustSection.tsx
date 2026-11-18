import React from 'react';
import { ShieldCheck, MapPin, CreditCard, Award, CheckCircle2, Lock } from 'lucide-react';

export default function WhyTrustSection() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: '100% Aadhaar & Skill KYC',
      titleHi: 'आधार व कौशल सत्यापन',
      description: 'Every tradesman passes government identity authentication, criminal background check, and mandatory trade skill testing before taking customer bookings.',
      tag: 'Zero Imposters',
    },
    {
      icon: MapPin,
      title: 'Live GPS Worker Tracking',
      titleHi: 'लाइव जीपीएस ट्रैकिंग',
      description: 'Once on the way, view your professional’s exact real-time location and real traffic ETA on Google Maps. No false promises or guessing arrival times.',
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
    <section className="py-16 sm:py-24 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/5 text-forest text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-cta" />
            <span>Built on Trust & Integrity • विश्वसनीयता</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-forest tracking-tight">
            Why India Trusts KaamSetu
          </h2>
          <p className="text-base text-text-secondary">
            Unlike unorganized roadside stands or unregulated platforms, KaamSetu provides complete transparency, verified worker safety, and institutional quality control.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-bg rounded-2xl p-6 border border-border hover:border-forest/40 hover:bg-white hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-forest text-lime flex items-center justify-center mb-5 shadow-xs">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-sage bg-sage-soft px-2 py-0.5 rounded mb-2">
                    {item.tag}
                  </span>
                  <h3 className="text-lg font-bold text-forest mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-muted font-medium mb-3">
                    {item.titleHi}
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-border flex items-center gap-1.5 text-xs font-bold text-forest">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
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
