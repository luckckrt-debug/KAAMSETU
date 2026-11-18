import React from 'react';
import HeroSearch from '@/components/HeroSearch';
import PopularCategories from '@/components/PopularCategories';
import NearbyWorkersList from '@/components/NearbyWorkersList';
import UrgentBookingSection from '@/components/UrgentBookingSection';
import WhyTrustSection from '@/components/WhyTrustSection';
import BulkHiringSection from '@/components/BulkHiringSection';
import TendersShowcase from '@/components/TendersShowcase';
import TestimonialsFAQ from '@/components/TestimonialsFAQ';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  HardHat, 
  Building2, 
  Clock, 
  CreditCard 
} from 'lucide-react';
import { dbStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const workers = dbStore.getWorkers({ radiusKm: 30, verifiedOnly: true }).slice(0, 6);
  const tenders = dbStore.getTenders().slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1 & 2. Hero Section & Search Services */}
      <HeroSearch />

      {/* 3. Popular Service Categories */}
      <PopularCategories />

      {/* 4. Nearby Verified Workers */}
      <NearbyWorkersList initialWorkers={workers} />

      {/* 5. How KaamSetu Works */}
      <section className="py-16 sm:py-24 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold text-forest uppercase tracking-wider bg-forest/5 px-3 py-1 rounded-full">
              Simple 4-Step Process • कैसे काम करता है
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-forest tracking-tight">
              How KaamSetu Works
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Book skilled help in under 60 seconds with complete peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="text-center space-y-3 p-6 rounded-2xl bg-bg border border-border">
              <div className="w-14 h-14 rounded-2xl bg-forest text-lime font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                1
              </div>
              <h3 className="text-base font-bold text-forest">Choose Trade & Location</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Select your required skill, enter your locality, or use one-tap GPS detection.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-3 p-6 rounded-2xl bg-bg border border-border">
              <div className="w-14 h-14 rounded-2xl bg-forest text-lime font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                2
              </div>
              <h3 className="text-base font-bold text-forest">Instant Match & Dispatch</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                The nearest available verified worker accepts the request with fixed hourly/daily rates.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-3 p-6 rounded-2xl bg-bg border border-border">
              <div className="w-14 h-14 rounded-2xl bg-forest text-lime font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                3
              </div>
              <h3 className="text-base font-bold text-forest">Live GPS Route Tracking</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Watch the worker move toward your site on live map with accurate arrival ETA.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center space-y-3 p-6 rounded-2xl bg-bg border border-border">
              <div className="w-14 h-14 rounded-2xl bg-forest text-lime font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                4
              </div>
              <h3 className="text-base font-bold text-forest">Inspect & Pay After Work</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Verify the finished work, confirm completion, and pay securely with 7-day guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Urgent Booking Section */}
      <UrgentBookingSection />

      {/* 7. Why Trust KaamSetu */}
      <WhyTrustSection />

      {/* 9. Bulk Workforce Hiring */}
      <BulkHiringSection />

      {/* 10. Active Tenders */}
      <TendersShowcase initialTenders={tenders} />

      {/* 11 & 12. Dual Partner Registration CTA */}
      <section className="py-16 bg-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Worker CTA Card */}
            <div className="bg-forest-light/60 rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-lime text-forest flex items-center justify-center font-bold mb-4">
                  <HardHat className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  Join as a Verified Skilled Worker
                </h3>
                <p className="text-sm text-gray-200 mt-2 leading-relaxed">
                  Electricians, plumbers, masons, carpenters, technicians: get daily jobs, weekly bonuses, direct UPI payouts, and safety gear.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-lime font-semibold">
                  <span>✓ Daily Direct Payouts</span>
                  <span>•</span>
                  <span>✓ No Chowk Waiting</span>
                  <span>•</span>
                  <span>✓ Zero Commission First Month</span>
                </div>
              </div>

              <Link
                href="/register/worker"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-lime hover:bg-lime-hover text-forest font-bold text-sm text-center tracking-wide transition-all shadow-md"
              >
                Start Worker Registration (श्रमिक पंजीकरण)
              </Link>
            </div>

            {/* Contractor CTA Card */}
            <div className="bg-forest-light/60 rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cta text-white flex items-center justify-center font-bold mb-4">
                  <Building2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  Register as Contractor / Tender Owner
                </h3>
                <p className="text-sm text-gray-200 mt-2 leading-relaxed">
                  Publish commercial workforce tenders, hire structured crews of 10 to 100+ workers, and manage attendance digitally.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-cta font-semibold">
                  <span>✓ Verified Trade Crews</span>
                  <span>•</span>
                  <span>✓ Digital Attendance</span>
                  <span>•</span>
                  <span>✓ GST Invoicing</span>
                </div>
              </div>

              <Link
                href="/contractor"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-cta hover:bg-cta-hover text-white font-bold text-sm text-center tracking-wide transition-all shadow-md"
              >
                Register as Contractor (ठेकेदार पंजीकरण)
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 13 & 14. Testimonials & FAQ */}
      <TestimonialsFAQ />

    </div>
  );
}
