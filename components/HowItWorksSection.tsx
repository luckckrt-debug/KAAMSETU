'use client';

import React from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle2,
  HardHat,
  Users,
  Sparkles
} from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: UserCheck,
      title: 'Register (पंजीकरण करें)',
      subtitle: 'Instant Mobile OTP Verification',
      description: 'Sign up in 30 seconds using your phone number and OTP. Skilled workers upload their trade experience and Aadhaar for digital verification; customers simply choose their city.',
      badge: 'Quick 30-Sec OTP',
      features: ['100% Free Registration', 'Aadhaar e-KYC Verification', 'Instant Profile Activation']
    },
    {
      number: '02',
      icon: Search,
      title: 'Find Work or Workers (मिलान)',
      subtitle: 'Geospatial Discovery & Dispatch',
      description: 'Customers browse trade categories, compare nearby verified profiles, and request instant GPS dispatch. Workers receive local job alerts with guaranteed wage rates and exact addresses.',
      badge: 'Real GPS Dispatch',
      features: ['Upfront Transparent Rates', 'Live Arrival Map Tracking', 'Verified Skill Ratings']
    },
    {
      number: '03',
      icon: ShieldCheck,
      title: 'Connect and Complete Work',
      subtitle: 'Escrow Protected Payments',
      description: 'Coordinate directly through phone call or chat. Upon satisfactory job completion, inspect the work and release payment through protected escrow with instant worker wallet credit.',
      badge: 'Escrow Protected',
      features: ['Zero Chowk Middlemen', 'Instant UPI Bank Payout', '7-Day Satisfaction Guarantee']
    }
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-[#2583D5] bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D1E8F8] inline-block shadow-xs">
            TRANSPARENT 3-STEP PROCESS • कैसे काम करता है
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#153451] tracking-tight">
            How KaamSetu Works
          </h2>
          <p className="text-base sm:text-lg text-[#4B6F8E] font-medium leading-relaxed">
            A seamless, transparent journey connecting skilled tradespeople and customers across India with total trust and zero middlemen.
          </p>
        </div>

        {/* 3 Steps Cards Grid with Connecting Visual Flow */}
        <div className="relative">
          
          {/* Subtle connecting dashed line on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-[#D1E8F8] -translate-y-12 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="glass-card rounded-3xl p-8 flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Step Number + Icon Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#EAF6FF] to-[#D9EEFF] text-[#2583D5] flex items-center justify-center group-hover:from-[#2583D5] group-hover:to-[#19639E] group-hover:text-white transition-all duration-300 shadow-sm border border-white/80">
                        <Icon className="w-8 h-8 stroke-[2.2]" />
                      </div>
                      <span className="text-3xl font-black tracking-tight text-[#D1E8F8] group-hover:text-[#2583D5] transition-colors">
                        {step.number}
                      </span>
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="mb-4">
                      <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#2583D5] bg-[#EAF6FF] border border-[#D1E8F8] mb-2 uppercase tracking-wider">
                        {step.badge}
                      </div>
                      <h3 className="text-xl font-black text-[#153451] group-hover:text-[#2583D5] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#7697B3] mt-0.5">{step.subtitle}</p>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[#4B6F8E] leading-relaxed mb-6 font-normal">
                      {step.description}
                    </p>

                    {/* Feature Ticks */}
                    <div className="space-y-2.5 pt-4 border-t border-[#EAF6FF]">
                      {step.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-[#153451]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Micro Step indicator */}
                  <div className="mt-8 pt-4 border-t border-[#EAF6FF] flex items-center justify-between text-xs font-bold text-[#2583D5]">
                    <span>Step {step.number} of 03</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Action Strip */}
        <div className="mt-14 max-w-3xl mx-auto text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register/customer"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-sm font-bold shadow-md shadow-[#2583D5]/20 transition-all hover:scale-[1.02]"
          >
            Hire a Worker Now (कारीगर बुक करें)
          </Link>
          <Link
            href="/register/worker"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/90 hover:bg-white text-[#153451] border border-[#D1E8F8] text-sm font-bold shadow-xs hover:border-[#2583D5] transition-all hover:scale-[1.02]"
          >
            Join as Skilled Worker (श्रमिक बनें)
          </Link>
        </div>

      </div>
    </section>
  );
}
