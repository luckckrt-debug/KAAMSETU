import React from 'react';
import AtmosphericBackground from '@/components/AtmosphericBackground';
import HeroSection from '@/components/HeroSection';
import CategoriesSection from '@/components/CategoriesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import NearbyWorkersList from '@/components/NearbyWorkersList';
import UrgentBookingSection from '@/components/UrgentBookingSection';
import WhyTrustSection from '@/components/WhyTrustSection';
import BulkHiringSection from '@/components/BulkHiringSection';
import TendersShowcase from '@/components/TendersShowcase';
import AboutContactSection from '@/components/AboutContactSection';
import TestimonialsFAQ from '@/components/TestimonialsFAQ';
import Link from 'next/link';
import { HardHat, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { dbStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const workers = dbStore.getWorkers({ radiusKm: 30, verifiedOnly: true }).slice(0, 6);
  const tenders = dbStore.getTenders().slice(0, 2);

  return (
    <div className="relative flex flex-col min-h-screen text-[#153451] selection:bg-[#2583D5] selection:text-white">
      
      {/* ATMOSPHERIC BACKGROUND: Soft flowing ambient lighting & lightweight drifting particles */}
      <AtmosphericBackground />

      {/* PANEL 1: Hero & Floating Search Panel */}
      <HeroSection />

      {/* PANEL 2: Popular Categories (9 Core Structured Category Cards) */}
      <CategoriesSection />

      {/* PANEL 3: How KaamSetu Works (01 – Register, 02 – Find Work/Workers, 03 – Connect & Complete) */}
      <HowItWorksSection />

      {/* PANEL 4: Nearby Workers (Real Database & GPS Telemetry Grid) */}
      <NearbyWorkersList initialWorkers={workers} />

      {/* PANEL 5: Emergency Services (Soft Blue Accent Gradient, 25-Min Dispatch) */}
      <UrgentBookingSection />

      {/* PANEL 6: Contractor & Bulk Workforce (Crew Cost Estimator & Tenders) */}
      <BulkHiringSection />
      <TendersShowcase initialTenders={tenders} />

      {/* DUAL PARTNER REGISTRATION CTA STRIP */}
      <section className="py-20 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Worker CTA Card */}
            <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#123B5D] to-[#1D4F78] text-white shadow-xl border border-white/15 flex flex-col justify-between space-y-6">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#2583D5] text-white flex items-center justify-center font-bold mb-5 shadow-md shadow-[#2583D5]/30">
                  <HardHat className="w-7 h-7 stroke-[2.2]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Join as a Verified Skilled Worker
                </h3>
                <p className="text-sm sm:text-base text-slate-200 mt-2.5 leading-relaxed font-normal">
                  Electricians, plumbers, masons, carpenters, technicians: get daily local jobs, weekly bonuses, direct UPI wallet payouts, and zero chowk waiting.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#93C5FD] font-semibold">
                  <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ Daily Direct Payouts</span>
                  <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ 100% Free Registration</span>
                  <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ Accidental Insurance</span>
                </div>
              </div>

              <Link
                href="/register/worker"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-zinc-700 hover:bg-zinc-800 text-white font-bold text-sm text-center tracking-wide transition-all shadow-sm border border-zinc-600/30 hover:scale-[1.01]"
              >
                Start Worker Registration (श्रमिक पंजीकरण)
              </Link>
            </div>

            {/* Contractor CTA Card */}
            <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#123B5D] to-[#1D4F78] text-white shadow-xl border border-white/15 flex flex-col justify-between space-y-6">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white text-[#123B5D] flex items-center justify-center font-bold mb-5 shadow-md">
                  <Building2 className="w-7 h-7 stroke-[2.2]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Register as Contractor / Tender Owner
                </h3>
                <p className="text-sm sm:text-base text-slate-200 mt-2.5 leading-relaxed font-normal">
                  Publish commercial workforce tenders, hire structured crews of 10 to 100+ workers, and manage site attendance digitally.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#93C5FD] font-semibold">
                  <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ Verified Trade Crews</span>
                  <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ Digital Muster Roll</span>
                  <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ GST Compliant</span>
                </div>
              </div>

              <Link
                href="/contractor"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-[#F5FAFF] text-[#123B5D] font-bold text-sm text-center tracking-wide transition-all shadow-lg hover:scale-[1.02]"
              >
                Register as Contractor (ठेकेदार पंजीकरण)
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* PANEL 7: Trust & Why KaamSetu */}
      <WhyTrustSection />

      {/* PANEL 8: Testimonials & Community Impact */}
      <TestimonialsFAQ />

      {/* PANEL 9: About Us & Contact Us (Footer in layout.tsx completes Panel 9) */}
      <AboutContactSection />

    </div>
  );
}
