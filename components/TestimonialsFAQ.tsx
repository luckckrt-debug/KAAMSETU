'use client';

import React, { useState } from 'react';
import { Star, ChevronDown, MessageSquare, Quote, CheckCircle2 } from 'lucide-react';

export default function TestimonialsFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const testimonials = [
    {
      name: 'Ananya Deshmukh',
      role: 'Homeowner, Lotus Boulevard, Noida',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      comment: 'At 10 PM our kitchen MCB caught spark. Through DigiWork, Ramesh ji arrived in 22 minutes with a digital multimeter and replacement MCB. Live tracking gave immense relief. Super clean work!',
    },
    {
      name: 'Vikram Singh',
      role: 'Project Director, Apex Infra & Builders',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120',
      comment: 'We published a tender for 20 masons for our luxury tower project in Sector 150. Within 48 hours, Satish Kumar’s verified team of 25 workers was mobilized with full biometric attendance. Outstanding platform.',
    },
    {
      name: 'Ramesh Sharma',
      role: 'Certified Electrician (Partner Worker)',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120',
      comment: 'Earlier I waited at the local chowk every morning without guarantee of work. On DigiWork, I get 3 to 4 direct bookings daily, payment goes straight to my UPI account, and respect has doubled.',
    },
  ];

  const faqs = [
    {
      q: 'How does DigiWork verify workers and tradesmen?',
      a: 'Every worker must complete a 7-step onboarding process including government Aadhaar authentication, trade certificate verification, address proof check, and a mandatory skill test by our field operations team. Only verified profiles receive active job dispatches.',
    },
    {
      q: 'When do I have to pay for the service?',
      a: 'You never pay upfront! You can book a worker with zero advance. Once the worker arrives, completes the work, and you inspect the final job, you confirm completion on your phone and pay securely via UPI, Card, or Netbanking.',
    },
    {
      q: 'How does real-time GPS tracking work?',
      a: 'Once the worker accepts your booking and clicks "ON THE WAY", our system streams live GPS coordinates directly to your private tracking map with accurate transit ETA. Tracking automatically stops once the worker marks "ARRIVED".',
    },
    {
      q: 'Can contractors hire bulk teams and post tenders?',
      a: 'Yes! DigiWork features a dedicated Tender Marketplace. Registered contractors and builders can post workforce requirements (from 5 to 200+ workers), review team leader bids, track digital muster-roll attendance, and process milestone payouts.',
    },
    {
      q: 'What if I am not satisfied with the work done?',
      a: 'Every booking includes the DigiWork ₹25,000 Workmanship Guarantee. If you notice any issue within 7 days, you can raise a dispute directly from your dashboard. Our resolution officer will investigate, arrange a free rework, or issue a full refund.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Testimonials Block */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-black text-[#2583D5] uppercase tracking-wider bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D1E8F8] inline-block shadow-xs">
              Real Experiences • वास्तविक अनुभव
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#153451] tracking-tight">
              Loved by Customers & Workers Alike
            </h2>
            <p className="text-base sm:text-lg text-[#4B6F8E] font-medium leading-relaxed">
              Read real stories from verified homeowners, contractors, and proud tradespeople across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="glass-card rounded-3xl p-8 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B6F8E] leading-relaxed italic mb-8 font-normal">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3.5 pt-5 border-t border-[#EAF6FF]">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#153451] group-hover:text-[#2583D5] transition-colors">{t.name}</h4>
                    <p className="text-[11px] text-[#7697B3] font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Block */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <span className="text-xs font-black text-[#2583D5] uppercase tracking-wider bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D1E8F8] inline-block shadow-xs">
              Got Questions? • अक्सर पूछे जाने वाले सवाल
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#153451] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass-card rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[#153451] text-sm sm:text-base hover:bg-white/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#4B6F8E] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#2583D5]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4B6F8E] leading-relaxed border-t border-[#EAF6FF]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
