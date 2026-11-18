'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, Zap, Wrench, ShieldCheck, ArrowRight, Phone } from 'lucide-react';

export default function UrgentBookingSection() {
  return (
    <section className="py-14 bg-gradient-to-r from-forest to-forest-dark text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B7E36A_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/15 shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Urgent Left Copy */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-danger/20 text-lime border border-lime/30 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cta animate-ping"></span>
                <span>Immediate Assistance • 24x7 इमरजेंसी सर्विस</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Emergency Breakdown? <br />
                <span className="text-cta">Need a professional within 30 minutes?</span>
              </h2>

              <p className="text-gray-200 text-sm sm:text-base max-w-2xl leading-relaxed">
                Short circuits, burst water pipes, sewage backflow, or AC breakdown in Delhi NCR & major cities. Our emergency squad of verified masters is on standby with real GPS live dispatch.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2.5 bg-black/20 px-3.5 py-2.5 rounded-xl border border-white/10">
                  <Zap className="w-4 h-4 text-cta shrink-0" />
                  <span className="text-xs font-semibold text-gray-100">Electrical Hazard / MCB Tripping</span>
                </div>
                <div className="flex items-center gap-2.5 bg-black/20 px-3.5 py-2.5 rounded-xl border border-white/10">
                  <Wrench className="w-4 h-4 text-lime shrink-0" />
                  <span className="text-xs font-semibold text-gray-100">Severe Pipe Burst & Motor Fail</span>
                </div>
                <div className="flex items-center gap-2.5 bg-black/20 px-3.5 py-2.5 rounded-xl border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                  <span className="text-xs font-semibold text-gray-100">Police-Verified Night Squad</span>
                </div>
              </div>
            </div>

            {/* Urgent Action Card */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 text-text-primary shadow-xl border border-border space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2 text-status-danger font-black text-sm uppercase tracking-wide">
                  <Clock className="w-4 h-4 animate-spin text-status-danger" /> 30-Min Guarantee
                </div>
                <span className="text-xs font-bold text-forest bg-sage-soft px-2 py-0.5 rounded-md">Fixed Pricing</span>
              </div>

              <div className="space-y-2 text-xs text-text-secondary">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span>Emergency Dispatch Fee:</span>
                  <span className="font-bold text-text-primary">₹149</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span>First Hour Diagnostic Work:</span>
                  <span className="font-bold text-text-primary">₹349</span>
                </div>
                <div className="flex justify-between py-1 text-sm font-black text-forest">
                  <span>Total Base Booking:</span>
                  <span>₹498 (Pay After Work)</span>
                </div>
              </div>

              <Link
                href="/booking/new?urgent=true&category=cat-electrician"
                className="w-full py-3.5 rounded-xl bg-status-danger hover:bg-status-danger/90 text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>REQUEST URGENT DISPATCH</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="text-center pt-1">
                <a href="tel:18005226738" className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline">
                  <Phone className="w-3.5 h-3.5 text-cta" /> Or Call 24x7 Helpline: 1800-KAAMSETU
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
