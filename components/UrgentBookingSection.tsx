'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Zap, Wrench, ShieldCheck, ArrowRight, Phone, AlertCircle } from 'lucide-react';

export default function UrgentBookingSection() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Soft Blue Accent Gradient Panel */}
        <div className="relative rounded-3xl p-8 sm:p-12 lg:p-14 bg-gradient-to-br from-[#153451] via-[#1D4F78] to-[#2583D5] text-white shadow-2xl border border-white/20 overflow-hidden">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#60B5F5]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#2583D5]/25 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Urgent Left Copy */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[#93C5FD] border border-white/20 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#60B5F5] animate-pulse"></span>
                <span>Immediate 24x7 Assistance • आपातकालीन सेवा</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Emergency Breakdown? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#93C5FD] to-[#EAF6FF]">
                  Verified professional in 25 minutes.
                </span>
              </h2>

              <p className="text-slate-200 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
                Sudden short circuits, burst water pipes, overhead motor fail, or urgent door lockout. Our emergency squad is on standby with real-time GPS live dispatch across all covered cities.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15">
                  <div className="w-8 h-8 rounded-xl bg-[#2583D5]/30 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[#93C5FD]" />
                  </div>
                  <span className="text-xs font-bold text-white">Electrical / MCB Sparks</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15">
                  <div className="w-8 h-8 rounded-xl bg-[#2583D5]/30 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4 text-[#93C5FD]" />
                  </div>
                  <span className="text-xs font-bold text-white">Severe Pipe Leaks & Motor</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span className="text-xs font-bold text-white">Police-Verified Night Squad</span>
                </div>
              </div>
            </div>

            {/* Urgent Action Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-7 text-[#153451] shadow-2xl border border-white/80 space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#EAF6FF]">
                <div className="flex items-center gap-2 text-[#2583D5] font-black text-sm uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#2583D5] animate-spin" /> 25-Min Arrival Guarantee
                </div>
                <span className="text-xs font-bold text-[#153451] bg-[#EAF6FF] px-2.5 py-1 rounded-full border border-[#D1E8F8]">
                  Fixed Pricing
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-[#4B6F8E]">
                <div className="flex justify-between py-1 border-b border-[#F5FAFF]">
                  <span>Emergency Dispatch Surcharge:</span>
                  <span className="font-bold text-[#153451]">₹149</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5FAFF]">
                  <span>Diagnostic & First-Hour Work:</span>
                  <span className="font-bold text-[#153451]">₹349</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-black text-[#153451] bg-[#F5FAFF] px-3 rounded-xl border border-[#D1E8F8]">
                  <span>Total Base Booking:</span>
                  <span className="text-[#2583D5]">₹498 (Pay After Completion)</span>
                </div>
              </div>

              <Link
                href="/booking/new?urgent=true&category=cat-electrician"
                className="w-full py-4 rounded-2xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-sm tracking-wider shadow-lg shadow-[#2583D5]/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group"
              >
                <span>REQUEST EMERGENCY DISPATCH</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="text-center pt-1">
                <a 
                  href="tel:18005226738" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#153451] hover:text-[#2583D5] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#2583D5]" /> Or Call 24x7 Helpline: 1800-KAAMSETU
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
