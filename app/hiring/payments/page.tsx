'use client';

import React from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Download, 
  ArrowRight, 
  Lock, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function CustomerPaymentsPage() {
  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Payments & Escrow Protection"
      subtitle="सुरक्षित एस्क्रो भुगतान, यूपीआई / कार्ड व कार्य संतुष्टि गारंटी"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Guarantee Hero Card */}
        <div className="bg-gradient-to-r from-[#153451] to-[#2583D5] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-white/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                100% DIGIWORK ESCROW PROTECTION ACTIVE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Pay Only After Work is Completed to Satisfaction
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
            When you book a worker on DigiWork, your money stays securely held in digital escrow. The worker receives payment only when the job is verified and confirmed by you.
          </p>
        </div>

        {/* 3 Protection Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#D1E8F8] shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
            <h3 className="text-sm font-black text-[#153451]">₹25,000 Safety Cover</h3>
            <p className="text-xs text-[#7697B3]">
              Accidental damage and workmanship warranty on all verified bookings.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D1E8F8] shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2583D5] flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-[#153451]">Instant UPI & Card Escrow</h3>
            <p className="text-xs text-[#7697B3]">
              Google Pay, PhonePe, Paytm, BHIM UPI, debit and credit cards supported.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D1E8F8] shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-[#153451]">Cash After Completion</h3>
            <p className="text-xs text-[#7697B3]">
              Cash on Delivery (COD) available directly to worker after satisfaction OTP.
            </p>
          </div>
        </div>

        {/* Saved Payment Methods & History */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D1E8F8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-4">
            <h3 className="text-base font-black text-[#153451]">
              Accepted Payment Methods
            </h3>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted
            </span>
          </div>

          <div className="divide-y divide-[#EAF6FF]">
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">📱</span>
                <div>
                  <h4 className="text-xs font-bold text-[#153451]">Unified Payments Interface (UPI)</h4>
                  <p className="text-[11px] text-[#7697B3]">GPay, PhonePe, Paytm, BHIM</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">💳</span>
                <div>
                  <h4 className="text-xs font-bold text-[#153451]">Debit / Credit Cards</h4>
                  <p className="text-[11px] text-[#7697B3]">Visa, Mastercard, RuPay, Maestro</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">💵</span>
                <div>
                  <h4 className="text-xs font-bold text-[#153451]">Cash to Worker (Pay after job done)</h4>
                  <p className="text-[11px] text-[#7697B3]">Direct cash payment after OTP verification</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
