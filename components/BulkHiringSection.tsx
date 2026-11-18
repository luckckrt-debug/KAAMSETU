'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HardHat, Users, CheckSquare, ArrowRight, ShieldCheck, Building2, Calculator } from 'lucide-react';

export default function BulkHiringSection() {
  const [workerCount, setWorkerCount] = useState<number>(20);
  const [selectedTrade, setSelectedTrade] = useState<string>('Masons');
  const [days, setDays] = useState<number>(15);

  const tradeDailyRates: Record<string, number> = {
    'Masons': 1050,
    'Electricians': 1100,
    'Carpenters': 1000,
    'Construction Labourers': 650,
    'Painters': 850,
    'Welders': 1150,
  };

  const currentRate = tradeDailyRates[selectedTrade] || 850;
  const estimatedTotal = workerCount * currentRate * days;

  return (
    <section className="py-16 sm:py-24 bg-bg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/5 text-forest text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-cta" />
              <span>Institutional Workforce • बड़े ठेके व बिल्डर्स</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-forest tracking-tight">
              Bulk Workforce Deployment for Contractors & Builders
            </h2>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
              Need 10 to 100+ verified tradesmen on your site tomorrow? KaamSetu connects prime contractors directly with organized workforce teams, registered labour contractors, and certified team leaders.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-border">
                <CheckSquare className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-forest text-sm">Digital Muster-Roll Attendance</h4>
                  <p className="text-xs text-text-secondary mt-0.5">Biometric & GPS daily attendance synced directly to your dashboard.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-border">
                <ShieldCheck className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-forest text-sm">ESIC & Statutory Compliance</h4>
                  <p className="text-xs text-text-secondary mt-0.5">Complete safety equipment, wage slips, and legal documentation support.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/contractor"
                className="px-6 py-3.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-sm tracking-wide shadow-md transition-all flex items-center gap-2"
              >
                <span>REGISTER AS CONTRACTOR (ठेकेदार बनें)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tenders"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-bg border border-border text-forest font-bold text-sm transition-all"
              >
                Browse Active Tenders
              </Link>
            </div>
          </div>

          {/* Right Interactive Bulk Calculator */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div className="flex items-center gap-2 text-forest font-black text-base">
                <Calculator className="w-5 h-5 text-cta" /> Workforce Cost Estimator
              </div>
              <span className="text-xs font-bold text-text-muted bg-bg px-2.5 py-1 rounded-md">
                Live Estimates
              </span>
            </div>

            <div className="space-y-5">
              {/* Trade Select */}
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Select Trade Skill
                </label>
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold text-text-primary focus:outline-none focus:border-forest"
                >
                  {Object.keys(tradeDailyRates).map((trade) => (
                    <option key={trade} value={trade}>{trade} (₹{tradeDailyRates[trade]}/day)</option>
                  ))}
                </select>
              </div>

              {/* Workers Count Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-text-primary mb-1.5">
                  <span>Number of Workers:</span>
                  <span className="text-forest text-sm font-black">{workerCount} Workers</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={workerCount}
                  onChange={(e) => setWorkerCount(Number(e.target.value))}
                  className="w-full accent-forest cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                  <span>5 Workers</span>
                  <span>50 Workers</span>
                  <span>150+ Crew</span>
                </div>
              </div>

              {/* Duration Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-text-primary mb-1.5">
                  <span>Project Duration:</span>
                  <span className="text-forest text-sm font-black">{days} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="90"
                  step="1"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-forest cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                  <span>1 Day</span>
                  <span>30 Days</span>
                  <span>90 Days</span>
                </div>
              </div>

              {/* Calculation Summary Box */}
              <div className="bg-sage-soft p-4 rounded-2xl border border-sage/20 space-y-2">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Base Rate:</span>
                  <span className="font-semibold text-forest">₹{currentRate} / worker / day</span>
                </div>
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Workforce Scale:</span>
                  <span className="font-semibold text-forest">{workerCount} Workers × {days} Days</span>
                </div>
                <div className="pt-2 border-t border-sage/30 flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase text-forest">Estimated Wage Budget:</span>
                  <span className="text-xl font-black text-forest">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href={`/tenders/create?trade=${encodeURIComponent(selectedTrade)}&count=${workerCount}`}
                className="w-full py-3.5 rounded-xl bg-cta hover:bg-cta-hover text-white font-black text-sm tracking-wide shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>PUBLISH TENDER FOR THIS CREW</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
