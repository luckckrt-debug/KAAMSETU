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
      comment: 'At 10 PM our kitchen MCB caught spark. Through KaamSetu, Ramesh ji arrived in 22 minutes with a digital multimeter and replacement MCB. Live tracking gave immense relief. Super clean work!',
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
      comment: 'Earlier I waited at the local chowk every morning without guarantee of work. On KaamSetu, I get 3 to 4 direct bookings daily, payment goes straight to my UPI account, and respect has doubled.',
    },
  ];

  const faqs = [
    {
      q: 'How does KaamSetu verify workers and tradesmen?',
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
      a: 'Yes! KaamSetu features a dedicated Tender Marketplace. Registered contractors and builders can post workforce requirements (from 5 to 200+ workers), review team leader bids, track digital muster-roll attendance, and process milestone payouts.',
    },
    {
      q: 'What if I am not satisfied with the work done?',
      a: 'Every booking includes the KaamSetu ₹25,000 Workmanship Guarantee. If you notice any issue within 7 days, you can raise a dispute directly from your dashboard. Our resolution officer will investigate, arrange a free rework, or issue a full refund.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Testimonials Block */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-forest uppercase tracking-wider bg-forest/5 px-3 py-1 rounded-full">
              Real Experiences • वास्तविक अनुभव
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-forest tracking-tight mt-2">
              Loved by Customers & Workers Alike
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-border shadow-xs hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed italic mb-6">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-forest">{t.name}</h4>
                    <p className="text-[11px] text-text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Block */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-forest uppercase tracking-wider bg-forest/5 px-3 py-1 rounded-full">
              Got Questions? • अक्सर पूछे जाने वाले सवाल
            </span>
            <h2 className="text-3xl font-black text-forest tracking-tight mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-border overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-forest text-sm sm:text-base hover:bg-bg/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-text-muted transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-forest' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/50">
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
