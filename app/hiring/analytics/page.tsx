'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  ShieldCheck,
  Building
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HiringAnalyticsPage() {
  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Recruitment & Staffing Analytics"
      subtitle="भर्ती गति, उम्मीदवार रूपांतरण दर व बजट उपयोग विश्लेषण"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 4 Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs">
            <span className="text-[11px] font-bold text-[#4B6F8E] uppercase block">Avg. Time to Hire</span>
            <div className="text-3xl font-black text-[#153451] mt-1">2.4 Days</div>
            <span className="text-[11px] text-emerald-600 font-bold block mt-1">45% faster than agency</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs">
            <span className="text-[11px] font-bold text-[#4B6F8E] uppercase block">Offer Acceptance</span>
            <div className="text-3xl font-black text-[#2583D5] mt-1">94.2%</div>
            <span className="text-[11px] text-emerald-600 font-bold block mt-1">Direct SMS/App alerts</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs">
            <span className="text-[11px] font-bold text-[#4B6F8E] uppercase block">Aadhaar Verified</span>
            <div className="text-3xl font-black text-emerald-700 mt-1">100%</div>
            <span className="text-[11px] text-[#4B6F8E] font-medium block mt-1">Police verification cleared</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs">
            <span className="text-[11px] font-bold text-[#4B6F8E] uppercase block">Fulfillment Rate</span>
            <div className="text-3xl font-black text-[#153451] mt-1">98.5%</div>
            <span className="text-[11px] text-emerald-600 font-bold block mt-1">Zero vacant shifts</span>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs space-y-4">
          <h3 className="font-black text-[#153451] text-base border-b border-[#D9EEFF] pb-3">
            Hiring Funnel & Conversion Pipeline
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-[#153451] mb-1">
                <span>Total Applications Received (18 Candidates)</span>
                <span>100%</span>
              </div>
              <div className="w-full h-3 bg-[#EAF6FF] rounded-full overflow-hidden">
                <div className="h-full bg-[#2583D5] rounded-full w-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-[#153451] mb-1">
                <span>Screened & Shortlisted (10 Candidates)</span>
                <span>55.5%</span>
              </div>
              <div className="w-full h-3 bg-[#EAF6FF] rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[55%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-[#153451] mb-1">
                <span>Interviewed & Trade Verified (7 Candidates)</span>
                <span>38.8%</span>
              </div>
              <div className="w-full h-3 bg-[#EAF6FF] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[38%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-[#153451] mb-1">
                <span>Final Selected & Deployed (4 Candidates)</span>
                <span>22.2%</span>
              </div>
              <div className="w-full h-3 bg-[#EAF6FF] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-[22%]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
