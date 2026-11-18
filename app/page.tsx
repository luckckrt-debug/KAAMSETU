import React from 'react';
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
    <div className="flex flex-col min-h-screen bg-[#EAF6FF] text-[#123B5D]">
      
      {/* SECTION B & C: Hero Section ("Connecting Skills with Opportunities") & Quick Search Panel */}
      <HeroSection />

      {/* SECTION D: Categories Section (9 Core Structured Category Cards) */}
      <CategoriesSection />

      {/* SECTION E: How Kaam Setu Works (3 Simple Steps) */}
      <HowItWorksSection />

      {/* Real-time Nearby Verified Workers (Real Database & GPS Dispatch) */}
      <NearbyWorkersList initialWorkers={workers} />

      {/* Urgent 15-Minute Booking Dispatch */}
      <UrgentBookingSection />

      {/* Why Trust KaamSetu */}
      <WhyTrustSection />

      {/* Bulk Workforce Hiring for Contractors */}
      <BulkHiringSection />

      {/* Commercial Workforce Tenders Showcase */}
      <TendersShowcase initialTenders={tenders} />

      {/* Dual Partner Registration CTA */}
      <section className="py-16 bg-[#123B5D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Worker CTA Card */}
            <div className="bg-[#1D4F78]/60 rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#2196E8] text-white flex items-center justify-center font-bold mb-4 shadow-md">
                  <HardHat className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  Join as a Verified Skilled Worker
                </h3>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed font-medium">
                  Electricians, plumbers, masons, carpenters, technicians: get daily local jobs, weekly bonuses, direct UPI wallet payouts, and zero chowk waiting.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#60B5F5] font-semibold">
                  <span>✓ Daily Direct Payouts</span>
                  <span>•</span>
                  <span>✓ 100% Free Registration</span>
                  <span>•</span>
                  <span>✓ Accidental Insurance</span>
                </div>
              </div>

              <Link
                href="/register/worker"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2196E8] hover:bg-[#1976D2] text-white font-bold text-sm text-center tracking-wide transition-all shadow-md"
              >
                Start Worker Registration (श्रमिक पंजीकरण)
              </Link>
            </div>

            {/* Contractor CTA Card */}
            <div className="bg-[#1D4F78]/60 rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white text-[#123B5D] flex items-center justify-center font-bold mb-4 shadow-md">
                  <Building2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  Register as Contractor / Tender Owner
                </h3>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed font-medium">
                  Publish commercial workforce tenders, hire structured crews of 10 to 100+ workers, and manage site attendance digitally.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#60B5F5] font-semibold">
                  <span>✓ Verified Trade Crews</span>
                  <span>•</span>
                  <span>✓ Digital Muster Roll</span>
                  <span>•</span>
                  <span>✓ GST Compliant</span>
                </div>
              </div>

              <Link
                href="/contractor"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#F5FAFF] text-[#123B5D] font-bold text-sm text-center tracking-wide transition-all shadow-md"
              >
                Register as Contractor (ठेकेदार पंजीकरण)
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* About Us & Contact Us Sections (Anchors #about-us and #contact-us) */}
      <AboutContactSection />

      {/* Testimonials & FAQs */}
      <TestimonialsFAQ />

    </div>
  );
}
