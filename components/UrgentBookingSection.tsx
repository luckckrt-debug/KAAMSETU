'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Zap, Wrench, ShieldCheck, ArrowRight, Phone } from 'lucide-react';

export default function UrgentBookingSection() {
  return (
    <section className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Clean, Handcrafted Emergency Assistance Panel */}
        <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-[#0D2137] border border-[#1A3859] text-white shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Urgent Left Copy */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#163352] text-[#60B5F5] border border-[#224A75] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>24x7 Immediate Assistance • आपातकालीन सेवा</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Emergency Breakdown? <br className="hidden sm:inline" />
                <span className="text-[#60B5F5]">Verified professional in 25 minutes.</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Sudden short circuits, burst water pipes, overhead motor fail, or urgent door lockout. 
                Our emergency squad is on standby with real-time GPS live dispatch across all covered cities.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="flex items-center gap-2.5 bg-[#142E4A] px-3.5 py-2.5 rounded-xl border border-[#1F456E]">
                  <div className="w-7 h-7 rounded-lg bg-[#20456C] flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[#60B5F5]" />
                  </div>
                  <span className="text-xs font-bold text-white">Electrical / MCB Sparks</span>
                </div>

                <div className="flex items-center gap-2.5 bg-[#142E4A] px-3.5 py-2.5 rounded-xl border border-[#1F456E]">
                  <div className="w-7 h-7 rounded-lg bg-[#20456C] flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4 text-[#60B5F5]" />
                  </div>
                  <span className="text-xs font-bold text-white">Pipe Leaks & Motor</span>
                </div>

                <div className="flex items-center gap-2.5 bg-[#142E4A] px-3.5 py-2.5 rounded-xl border border-[#1F456E]">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-white">Police-Verified Night Squad</span>
                </div>
              </div>
            </div>

            {/* Urgent Action Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 text-[#153451] border border-white/20 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAF6FF]">
                <div className="flex items-center gap-2 text-[#153451] font-black text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#2583D5]" />
                  <span>25-Min Arrival Guarantee</span>
                </div>
                <span className="text-[11px] font-bold text-[#2583D5] bg-[#EAF6FF] px-2.5 py-0.5 rounded-full border border-[#D1E8F8]">
                  Fixed Pricing
                </span>
              </div>

              <div className="space-y-2 text-xs text-[#4B6F8E]">
                <div className="flex justify-between py-1 border-b border-[#F5FAFF]">
                  <span>Emergency Dispatch Surcharge:</span>
                  <span className="font-bold text-[#153451]">₹149</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5FAFF]">
                  <span>Diagnostic & First-Hour Work:</span>
                  <span className="font-bold text-[#153451]">₹349</span>
                </div>
                <div className="flex justify-between py-2 text-xs sm:text-sm font-black text-[#153451] bg-[#F5FAFF] px-3 rounded-xl border border-[#D1E8F8]">
                  <span>Total Base Booking:</span>
                  <span className="text-[#2583D5]">₹498 <span className="text-[10px] text-[#7697B3] font-normal">(Pay After Work)</span></span>
                </div>
              </div>

              <Link
                href="/booking/new?urgent=true&category=cat-electrician"
                className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs group"
              >
                <span>REQUEST EMERGENCY DISPATCH</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="text-center pt-0.5">
                <a 
                  href="tel:18005226738" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4B6F8E] hover:text-[#153451] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#2583D5]" />
                  <span>Or Call 24x7 Helpline: <strong className="text-[#153451]">1800-KAAMSETU</strong></span>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
