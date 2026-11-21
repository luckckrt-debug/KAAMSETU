'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HardHat, 
  Building2, 
  Briefcase, 
  Download, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  ExternalLink, 
  Sparkles,
  Zap,
  Clock,
  Radio,
  Server,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';

const APPS_METADATA = [
  {
    id: 'worker',
    name: 'DigiWork Worker',
    nameHi: 'डिजीवर्क श्रमिक ऐप',
    tagline: 'For Skilled Technicians, Daily Wage Labour & Trade Specialists',
    badge: 'WORKER APP',
    colorScheme: 'from-amber-500 to-orange-600',
    iconBg: 'bg-orange-500',
    icon: HardHat,
    webUrl: '/worker/dashboard',
    registerUrl: '/register/worker',
    apkDownloadUrl: 'https://expo.dev/artifacts/eas/6Zci0-hiEwLc53RGVoY4UVPl-gaA9eF2eVLPF4TRBYo.apk',
    packageId: 'com.digiwork.worker',
    version: 'v1.0.4 Release',
    size: '64.8 MB',
    features: [
      'Instant direct payouts to Bank Account & UPI',
      'Real-time GPS live dispatch & emergency 25-min jobs',
      'Digital wallet with transparent earnings breakdown',
      'Zero chowk waiting — receive direct booking calls',
      'Police & Aadhaar verified digital ID card'
    ],
    primaryCta: 'Launch Worker Portal',
    qrData: 'https://expo.dev/artifacts/eas/6Zci0-hiEwLc53RGVoY4UVPl-gaA9eF2eVLPF4TRBYo.apk'
  },
  {
    id: 'contractor',
    name: 'DigiWork Contractor',
    nameHi: 'डिजीवर्क ठेकेदार ऐप',
    tagline: 'For Civil Contractors, Site Engineers & Workforce Tenders',
    badge: 'CONTRACTOR APP',
    colorScheme: 'from-[#0B1F3A] to-[#2563EB]',
    iconBg: 'bg-[#0B1F3A]',
    icon: Building2,
    webUrl: '/contractor',
    registerUrl: '/contractor',
    apkDownloadUrl: 'https://expo.dev/artifacts/eas/JPCBbmDl3gfGcYUuCJad-c7QV8jZ39Vt7z736lLmeq0.apk',
    packageId: 'com.digiwork.contractor',
    version: 'v1.0.4 Release',
    size: '64.8 MB',
    features: [
      'Publish commercial tenders & hire crews of 10 to 100+ workers',
      'Multi-trade requirement form (Masons, Carpenters, Welders, etc.)',
      'Digital Muster Roll & GPS geofenced daily attendance',
      'Milestone & daily wage escrow payout management',
      'Track site labor productivity & worker ratings'
    ],
    primaryCta: 'Launch Contractor Portal',
    qrData: 'https://expo.dev/artifacts/eas/JPCBbmDl3gfGcYUuCJad-c7QV8jZ39Vt7z736lLmeq0.apk'
  },
  {
    id: 'hiring',
    name: 'DigiWork Hiring Partner',
    nameHi: 'डिजीवर्क हायरिंग पार्टनर व ग्राहक ऐप',
    tagline: 'For On-demand Home Services, Customers & Business Hiring',
    badge: 'CUSTOMER APP',
    colorScheme: 'from-sky-600 to-blue-700',
    iconBg: 'bg-[#2563EB]',
    icon: Briefcase,
    webUrl: '/hiring/dashboard',
    registerUrl: '/register/customer',
    apkDownloadUrl: 'https://expo.dev/artifacts/eas/TeHenQQP18h968-pHzZ_Odnc2wlMWrzpILU7AbxpUFE.apk',
    packageId: 'com.digiwork.app',
    version: 'v1.0.4 Release',
    size: '64.8 MB',
    features: [
      'Live OpenStreetMap street discovery of nearby verified workers',
      '25-Minute emergency assistance dispatch guarantee',
      'Transparent pricing: Agreed worker wage + fixed ₹99 service fee',
      'Pay only after work completion with 100% digital escrow',
      'Real-time telemetry tracking when professional is en route'
    ],
    primaryCta: 'Launch Hiring Partner Portal',
    qrData: 'https://expo.dev/artifacts/eas/TeHenQQP18h968-pHzZ_Odnc2wlMWrzpILU7AbxpUFE.apk'
  }
];

export default function DigiWorkAppsLaunchpad() {
  const [activeTab, setActiveTab] = useState<'all' | 'worker' | 'contractor' | 'hiring'>('all');
  const [showQrModal, setShowQrModal] = useState<string | null>(null);

  const filteredApps = activeTab === 'all' 
    ? APPS_METADATA 
    : APPS_METADATA.filter(app => app.id === activeTab);

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#153451] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HERO LAUNCH HEADER */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Official Launchpad • All 3 Applications Live</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#153451] tracking-tight leading-tight">
            DigiWork 3-in-1 Ecosystem <br />
            <span className="text-[#2583D5]">Launch & Mobile APK Download Hub</span>
          </h1>

          <p className="text-sm sm:text-lg text-[#4B6F8E] max-w-2xl mx-auto leading-relaxed">
            One unified workforce network connecting India across three specialized applications: 
            <strong> DigiWork Worker</strong>, <strong>DigiWork Contractor</strong>, and <strong>DigiWork Hiring Partner</strong>. 
            Access instantly via web browser or download standalone Android APKs.
          </p>

          {/* SYSTEM HEALTH BANNER */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-bold text-[#4B6F8E]">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#D1E8F8] shadow-2xs">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Central Backend: <strong className="text-emerald-700">Online (MongoDB Atlas)</strong></span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#D1E8F8] shadow-2xs">
              <Radio className="w-3.5 h-3.5 text-[#2583D5]" />
              <span>Live Telemetry Radar: <strong className="text-[#153451]">Active</strong></span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#D1E8F8] shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Escrow & ₹99 Revenue Ledger: <strong className="text-[#153451]">Active</strong></span>
            </span>
          </div>
        </div>

        {/* APP FILTER PILLS */}
        <div className="flex items-center justify-center gap-2 max-w-md mx-auto bg-white p-1.5 rounded-2xl border border-[#D1E8F8] shadow-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            All 3 Apps
          </button>
          <button
            onClick={() => setActiveTab('worker')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'worker'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            Worker
          </button>
          <button
            onClick={() => setActiveTab('contractor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'contractor'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            Contractor
          </button>
          <button
            onClick={() => setActiveTab('hiring')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'hiring'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            Hiring Partner
          </button>
        </div>

        {/* 3 APP CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            return (
              <div 
                key={app.id}
                className="bg-white rounded-3xl border border-[#D1E8F8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Header Strip */}
                <div className={`p-6 sm:p-8 bg-gradient-to-br ${app.colorScheme} text-white relative`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md">
                      <Icon className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-black tracking-wider uppercase bg-white/20 px-2.5 py-1 rounded-full border border-white/30 backdrop-blur-xs">
                      {app.badge}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight">{app.name}</h2>
                  <p className="text-xs font-bold text-white/90 mt-0.5">{app.nameHi}</p>
                  <p className="text-xs text-white/80 mt-2 leading-relaxed">{app.tagline}</p>
                </div>

                {/* Features List */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-wider text-[#7697B3]">
                      Built-in Capabilities
                    </p>
                    <ul className="space-y-2 text-xs font-medium text-[#153451]">
                      {app.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metadata Specs */}
                  <div className="pt-4 border-t border-[#EAF6FF] grid grid-cols-2 gap-2 text-[11px] text-[#7697B3]">
                    <div>
                      <span>Version:</span>
                      <p className="font-bold text-[#153451]">{app.version}</p>
                    </div>
                    <div>
                      <span>APK Package:</span>
                      <p className="font-bold text-[#153451] truncate">{app.packageId}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-2">
                    {/* Launch Web App Button */}
                    <Link
                      href={app.webUrl}
                      className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs group"
                    >
                      <span>{app.primaryCta}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Download Android APK Button */}
                    <a
                      href={app.apkDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-[#F5FAFF] hover:bg-[#EAF6FF] border border-[#D1E8F8] hover:border-[#2583D5] text-[#153451] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group"
                    >
                      <Download className="w-4 h-4 text-[#2583D5] group-hover:-translate-y-0.5 transition-transform" />
                      <span>Download Android APK ({app.size})</span>
                    </a>

                    {/* QR Code Trigger */}
                    <button
                      onClick={() => setShowQrModal(app.qrData)}
                      className="w-full py-2 text-center text-xs font-semibold text-[#4B6F8E] hover:text-[#2583D5] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan QR Code to install on Phone</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CENTRAL ADMIN CONTROL ROOM BANNER */}
        <div className="rounded-3xl bg-[#0B1F3A] border border-[#1E3A8A] p-6 sm:p-10 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#163352] text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Super Administrator Portal</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              DigiWork Control Center
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Supervise all 3 applications from one unified command desk: live GPS telemetry radar, 
              worker KYC verification queue, platform fee revenue ledger, and instant UPI payout approvals.
            </p>
          </div>

          <Link
            href="/admin"
            className="px-6 py-3.5 rounded-xl bg-white text-[#0B1F3A] hover:bg-slate-100 font-black text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 flex items-center gap-2"
          >
            <span>Open DigiWork Control Center</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* STEP-BY-STEP SIDELOAD INSTALLATION GUIDE */}
        <div className="bg-white rounded-3xl border border-[#D1E8F8] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#EAF6FF] pb-4">
            <Smartphone className="w-5 h-5 text-[#2583D5]" />
            <h3 className="text-lg font-black text-[#153451]">
              How to Install Standalone Android APKs (3-Step Easy Guide)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F5FAFF] p-5 rounded-2xl border border-[#D1E8F8] space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#153451] text-white flex items-center justify-center font-black text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-[#153451]">Download or Scan</h4>
              <p className="text-xs text-[#4B6F8E] leading-relaxed">
                Click the <strong>Download Android APK</strong> button for your role, or scan the QR code using your Android camera.
              </p>
            </div>

            <div className="bg-[#F5FAFF] p-5 rounded-2xl border border-[#D1E8F8] space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#153451] text-white flex items-center justify-center font-black text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-[#153451]">Allow Unknown Sources</h4>
              <p className="text-xs text-[#4B6F8E] leading-relaxed">
                When prompted by Android, tap <strong>Settings</strong> and switch on <em>Allow installs from this source</em> (Standard Android APK safety prompt).
              </p>
            </div>

            <div className="bg-[#F5FAFF] p-5 rounded-2xl border border-[#D1E8F8] space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#153451] text-white flex items-center justify-center font-black text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-[#153451]">Install & Login</h4>
              <p className="text-xs text-[#4B6F8E] leading-relaxed">
                Tap <strong>Install</strong>. Once installed, log in with your mobile number & password to start receiving or posting work.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* QR CODE MODAL */}
      {showQrModal && (
        <div 
          onClick={() => setShowQrModal(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-[#D1E8F8]"
          >
            <h4 className="font-black text-base text-[#153451]">Scan with Android Camera</h4>
            <p className="text-xs text-[#4B6F8E]">Point your mobile camera at this QR code to download the APK directly onto your phone.</p>
            
            <div className="p-4 bg-white rounded-2xl border border-[#D1E8F8] inline-block shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(showQrModal)}`} 
                alt="APK QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <button
              onClick={() => setShowQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
