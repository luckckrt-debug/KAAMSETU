'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2,
  Calendar
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ContractorPaymentsPage() {
  const milestones = [
    {
      id: 'ms-1',
      project: 'Commercial High-Rise Flooring & Masonry',
      phase: 'Phase 1 - Ground & 1st Floor Tiling Complete',
      amount: 45000,
      status: 'SETTLED',
      date: '14 Nov 2026',
    },
    {
      id: 'ms-2',
      project: 'Basement High-Voltage Cabling',
      phase: 'Phase 2 - Distribution Panels & Conduit Run',
      amount: 60000,
      status: 'ESCROW_LOCKED',
      date: 'Estimated 28 Nov 2026',
    },
    {
      id: 'ms-3',
      project: 'Logistics Facility Drainage',
      phase: 'Phase 1 - Excavation & Pipeline Laying',
      amount: 35000,
      status: 'ESCROW_LOCKED',
      date: 'Estimated 05 Dec 2026',
    },
  ];

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Payments & Project Budget Escrow"
      subtitle="परियोजना बजट, एस्क्रो फंड्स सुरक्षा व माइलस्टोन भुगतान ट्रैकर"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-forest text-white p-6 rounded-3xl shadow-md border border-white/10 space-y-1">
            <span className="text-xs uppercase font-bold text-lime flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Escrow Locked Funds
            </span>
            <div className="text-3xl font-black text-white">₹95,000</div>
            <p className="text-[11px] text-slate-300">Protected in KaamSetu digital escrow for upcoming milestones</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#D9EEFF] shadow-xs space-y-1">
            <span className="text-xs uppercase font-bold text-[#4B6F8E]">Total Paid Out</span>
            <div className="text-3xl font-black text-emerald-700">₹45,000</div>
            <p className="text-[11px] text-[#4B6F8E]">Released directly to verified site workers</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#D9EEFF] shadow-xs space-y-1">
            <span className="text-xs uppercase font-bold text-[#4B6F8E]">Total Committed Budget</span>
            <div className="text-3xl font-black text-[#153451]">₹1,40,000</div>
            <p className="text-[11px] text-[#4B6F8E]">Across 3 active commercial contracts</p>
          </div>
        </div>

        {/* Milestone Settlements */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs space-y-4">
          <h3 className="font-black text-[#153451] text-base border-b border-[#D9EEFF] pb-3">
            Milestone Payment Releases
          </h3>

          <div className="divide-y divide-[#D9EEFF]">
            {milestones.map((ms) => (
              <div key={ms.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#153451] text-sm">{ms.project}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ms.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ms.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B6F8E]">{ms.phase}</p>
                  <span className="text-[11px] text-[#4B6F8E] block">{ms.date}</span>
                </div>

                <div className="text-right sm:self-center shrink-0">
                  <span className="text-base font-black text-[#153451] block">
                    ₹{ms.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">100% Escrow Guaranteed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
