'use client';

import React from 'react';
import Link from 'next/link';
import { 
  HardHat, 
  Building2, 
  Briefcase, 
  Download, 
  ArrowRight, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck,
  QrCode
} from 'lucide-react';

export default function AppsLaunchSection() {
  return (
    <section id="launch-apps" className="py-16 sm:py-24 relative bg-gradient-to-b from-white via-[#F5FAFF] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Launch Center • सभी 3 ऐप्स लाइव</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#153451] tracking-tight">
            Launch KaamSetu 3-in-1 Ecosystem
          </h2>

          <p className="text-sm sm:text-base text-[#4B6F8E] font-medium leading-relaxed">
            One platform, three powerful apps. Use directly on web or install standalone Android APKs on your smartphone.
          </p>
        </div>

        {/* 3 Apps Quick Launch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* APP 1: WORKER */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D1E8F8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                  <HardHat className="w-7 h-7 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200">
                  Worker App
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#153451]">KaamSetu Worker</h3>
                <p className="text-xs font-bold text-[#2583D5]">काम सेतु श्रमिक ऐप</p>
                <p className="text-xs text-[#4B6F8E] mt-2 leading-relaxed">
                  Daily local jobs, instant UPI/bank payouts, emergency dispatch radar, and 0% chowk commission.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-[#153451] font-semibold pt-2 border-t border-[#F5FAFF]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instant UPI Wallet Settlement</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Live GPS Emergency Dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Police-Verified Digital ID</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/worker/dashboard"
                className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs group"
              >
                <span>Launch Worker App</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://expo.dev/artifacts/eas/6Zci0-hiEwLc53RGVoY4UVPl-gaA9eF2eVLPF4TRBYo.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#F5FAFF] hover:bg-[#EAF6FF] text-[#153451] border border-[#D1E8F8] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-[#2583D5]" />
                <span>Download APK (64 MB)</span>
              </a>
            </div>
          </div>

          {/* APP 2: CONTRACTOR */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D1E8F8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#153451] to-[#2583D5] text-white flex items-center justify-center shadow-md shadow-[#2583D5]/20">
                  <Building2 className="w-7 h-7 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                  Contractor App
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#153451]">KaamSetu Contractor</h3>
                <p className="text-xs font-bold text-[#2583D5]">काम सेतु ठेकेदार ऐप</p>
                <p className="text-xs text-[#4B6F8E] mt-2 leading-relaxed">
                  Post multi-trade commercial tenders, hire structured crews of 10 to 100+ workers, and manage site attendance.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-[#153451] font-semibold pt-2 border-t border-[#F5FAFF]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Bulk Workforce Recruitment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Digital Muster Roll Attendance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Milestone & Daily Wage Escrow</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/contractor"
                className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs group"
              >
                <span>Launch Contractor App</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://expo.dev/artifacts/eas/JPCBbmDl3gfGcYUuCJad-c7QV8jZ39Vt7z736lLmeq0.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#F5FAFF] hover:bg-[#EAF6FF] text-[#153451] border border-[#D1E8F8] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-[#2583D5]" />
                <span>Download APK (64 MB)</span>
              </a>
            </div>
          </div>

          {/* APP 3: HIRING PARTNER */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D1E8F8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2583D5] to-[#1E70B8] text-white flex items-center justify-center shadow-md shadow-[#2583D5]/20">
                  <Briefcase className="w-7 h-7 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-200">
                  Customer App
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#153451]">KaamSetu Hiring Partner</h3>
                <p className="text-xs font-bold text-[#2583D5]">काम सेतु ग्राहक ऐप</p>
                <p className="text-xs text-[#4B6F8E] mt-2 leading-relaxed">
                  Book verified doorstep technicians in 25 mins, discover live GPS street radar, and pay fixed ₹99 service fee.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-[#153451] font-semibold pt-2 border-t border-[#F5FAFF]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>25-Min Doorstep Arrival</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Fixed ₹99 Platform Fee</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Live Street Worker Radar</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/hiring/dashboard"
                className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs group"
              >
                <span>Launch Hiring App</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://expo.dev/artifacts/eas/TeHenQQP18h968-pHzZ_Odnc2wlMWrzpILU7AbxpUFE.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#F5FAFF] hover:bg-[#EAF6FF] text-[#153451] border border-[#D1E8F8] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-[#2583D5]" />
                <span>Download APK (64 MB)</span>
              </a>
            </div>
          </div>

        </div>

        {/* View Full Launchpad & QR Hub Link */}
        <div className="text-center pt-2">
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-[#F5FAFF] border border-[#D1E8F8] text-[#153451] font-bold text-xs uppercase tracking-wider shadow-xs transition-all hover:scale-[1.02]"
          >
            <Smartphone className="w-4 h-4 text-[#2583D5]" />
            <span>Open Complete Launchpad & QR Code Hub</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#4B6F8E]" />
          </Link>
        </div>

      </div>
    </section>
  );
}
