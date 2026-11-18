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
  Users
} from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: UserCheck,
      title: 'Register on Kaam Setu',
      titleHi: 'काम सेतु पर पंजीकरण करें',
      description: 'Sign up in 30 seconds using your phone number and OTP. Skilled workers upload their trade experience and Aadhaar for digital verification; customers enter their location.',
      badge: 'Quick 30-Sec OTP',
      features: ['100% Free Registration', 'Aadhaar e-KYC', 'Instant Profile Activation']
    },
    {
      number: '02',
      icon: Search,
      title: 'Find Suitable Work or Workers',
      titleHi: 'काम या कारीगर खोजें',
      description: 'Customers choose trade, view nearby verified profiles, and request instant GPS dispatch. Workers receive local job alerts with guaranteed wage rates and customer address.',
      badge: 'Real GPS Dispatch',
      features: ['Upfront Transparent Rates', 'Live Arrival Map Tracking', 'Verified Skill Ratings']
    },
    {
      number: '03',
      icon: ShieldCheck,
      title: 'Connect, Complete & Secure Payment',
      titleHi: 'सुरक्षित काम व तुरंत भुगतान',
      description: 'Coordinate directly through phone call or chat. Upon satisfactory job completion, inspect the work and release payment through protected escrow with instant worker wallet credit.',
      badge: 'Escrow Protected',
      features: ['No Chowk Middlemen', 'Instant UPI Payout', '7-Day Satisfaction Guarantee']
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-[#F5FAFF] border-b border-[#D1E8F8] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#2196E8] bg-white px-3.5 py-1 rounded-full border border-[#D1E8F8] inline-block shadow-xs">
            TRANSPARENT 3-STEP PROCESS • कैसे काम करता है
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#123B5D] tracking-tight">
            How Kaam Setu Works
          </h2>
          <p className="text-sm sm:text-base text-[#4B6F8E] font-medium leading-relaxed">
            A seamless, reliable experience connecting skilled tradespeople and customers across India with total trust and zero middlemen.
          </p>
        </div>

        {/* 3 Steps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-[#D1E8F8] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between group"
              >
                <div>
                  {/* Step Number & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-[#2196E8]/30 font-mono group-hover:text-[#2196E8] transition-colors">
                      {step.number}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2196E8] bg-[#EAF6FF] px-2.5 py-1 rounded-full border border-[#D1E8F8]">
                      {step.badge}
                    </span>
                  </div>

                  {/* Icon Box */}
                  <div className="w-14 h-14 rounded-2xl bg-[#EAF6FF] text-[#2196E8] flex items-center justify-center text-2xl mb-5 group-hover:bg-[#2196E8] group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Icon className="w-7 h-7 stroke-[2]" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-black text-[#123B5D] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#7697B3] mb-4">
                    {step.titleHi}
                  </p>
                  <p className="text-xs text-[#4B6F8E] leading-relaxed mb-6 font-medium">
                    {step.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="pt-5 border-t border-[#EAF6FF] space-y-2">
                  {step.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-[#123B5D]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}

        </div>

        {/* Dual Onboarding Action Card */}
        <div className="mt-14 bg-gradient-to-r from-[#123B5D] to-[#1D4F78] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left space-y-2">
            <span className="text-xs font-bold text-[#60B5F5] uppercase tracking-wider">
              Ready to experience Kaam Setu?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Start finding work or booking skilled help today.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join thousands of workers earning daily income and customers getting trusted services on demand.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
            <Link
              href="/register/worker"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2196E8] hover:bg-[#1976D2] text-white font-bold text-xs tracking-wide shadow-md transition text-center flex items-center justify-center gap-2"
            >
              <HardHat className="w-4 h-4" />
              <span>Join as Worker (काम चाहिए)</span>
            </Link>
            <Link
              href="/register/customer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#F5FAFF] text-[#123B5D] font-bold text-xs tracking-wide shadow-md transition text-center flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-[#2196E8]" />
              <span>Hire Workers (कारीगर चाहिए)</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
