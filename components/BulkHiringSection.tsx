'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HardHat, Users, CheckSquare, ArrowRight, ShieldCheck, Building2, Calculator, ChevronRight } from 'lucide-react';

export default function BulkHiringSection() {
  const [workerCount, setWorkerCount] = useState<number>(20);
  const [selectedTrade, setSelectedTrade] = useState<string>('Masons');
  const [days, setDays] = useState<number>(15);

  const tradeDailyRates: Record<string, number> = {
    'Masons': 1050,
    'Electricians': 1100,
    'Carpenters': 1000,
    'Construction Labourers': 650,
    'Steel Barbenders & Rebar': 1100,
    'Painters & Polishers': 850,
    'Welders & Fabricators': 1150,
    'Tiles & Marble Setters': 1100,
    'Civil Site Supervisors': 1800,
    'Heavy Machinery / JCB Operators': 1500,
    'Security Guards & Bouncers': 850,
    'Deep Housekeeping Crew': 750,
    'Warehouse & Packaging Staff': 700,
  };

  const currentRate = tradeDailyRates[selectedTrade] || 850;
  const estimatedTotal = workerCount * currentRate * days;

  return (
    <section className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[#2583D5] text-xs font-bold uppercase tracking-wider border border-[#D1E8F8]">
              <Building2 className="w-4 h-4 text-[#2583D5]" />
              <span>Institutional Workforce • बड़े ठेके व बिल्डर्स</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#153451] tracking-tight leading-[1.15]">
              Bulk Workforce Deployment for Contractors & Builders
            </h2>

            <p className="text-base sm:text-lg text-[#4B6F8E] leading-relaxed font-normal">
              Need 10 to 100+ verified tradesmen on your site tomorrow? KaamSetu connects prime contractors directly with organized workforce teams, registered labour contractors, and certified team leaders.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="glass-card p-5 rounded-2xl flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#153451] text-sm">Digital Muster-Roll Attendance</h4>
                  <p className="text-xs text-[#4B6F8E] mt-0.5 leading-relaxed">Biometric & GPS daily attendance synced directly to your contractor dashboard.</p>
                </div>
              </div>
              <div className="glass-card p-5 rounded-2xl flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#153451] text-sm">ESIC & Statutory Compliance</h4>
                  <p className="text-xs text-[#4B6F8E] mt-0.5 leading-relaxed">Safety equipment check, daily wage slips, and GST tax invoice support.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/contractor"
                className="px-7 py-4 rounded-2xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-sm tracking-wide shadow-lg shadow-[#2583D5]/25 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <span>REGISTER AS CONTRACTOR (ठेकेदार बनें)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tenders"
                className="px-7 py-4 rounded-2xl bg-white/90 hover:bg-white border border-[#D1E8F8] hover:border-[#2583D5] text-[#153451] font-bold text-sm shadow-xs transition-all hover:scale-[1.02]"
              >
                Browse Active Tenders
              </Link>
            </div>
          </div>

          {/* Right Interactive Bulk Calculator */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAF6FF] mb-6">
              <div className="flex items-center gap-2 text-[#153451] font-black text-base">
                <Calculator className="w-5 h-5 text-[#2583D5]" /> Workforce Cost Estimator
              </div>
              <span className="text-xs font-bold text-[#2583D5] bg-[#EAF6FF] px-2.5 py-1 rounded-full border border-[#D1E8F8]">
                Instant Estimate
              </span>
            </div>

            <div className="space-y-5">
              {/* Trade Select */}
              <div>
                <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-2">
                  Select Trade Skill
                </label>
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-white text-sm text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5] focus:ring-2 focus:ring-[#2583D5]/20 transition"
                >
                  {Object.keys(tradeDailyRates).map((trade) => (
                    <option key={trade} value={trade}>
                      {trade} (₹{tradeDailyRates[trade]}/day)
                    </option>
                  ))}
                </select>
              </div>

              {/* Workers Count Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-[#153451] uppercase tracking-wider">Number of Workers</span>
                  <span className="text-[#2583D5] bg-[#EAF6FF] px-2 py-0.5 rounded-md font-black">{workerCount} Workers</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={workerCount}
                  onChange={(e) => setWorkerCount(Number(e.target.value))}
                  className="w-full h-2 bg-[#D1E8F8] rounded-lg appearance-none cursor-pointer accent-[#2583D5]"
                />
              </div>

              {/* Project Days Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-[#153451] uppercase tracking-wider">Project Duration</span>
                  <span className="text-[#2583D5] bg-[#EAF6FF] px-2 py-0.5 rounded-md font-black">{days} Days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="90"
                  step="1"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full h-2 bg-[#D1E8F8] rounded-lg appearance-none cursor-pointer accent-[#2583D5]"
                />
              </div>

              {/* Estimated Result Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#EAF6FF] to-[#D9EEFF] border border-[#D1E8F8] space-y-2">
                <div className="flex justify-between items-center text-xs text-[#4B6F8E]">
                  <span>Estimated Total Budget:</span>
                  <span className="text-2xl font-black text-[#153451]">
                    ₹{estimatedTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-[#7697B3]">
                  Includes standard wage rates, digital muster-roll logging & platform guarantee.
                </p>
              </div>

              <Link
                href={`/contractor/dashboard`}
                className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span>DEPLOY THIS WORKFORCE (श्रमिक टीम बुक करें)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
