'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';
import { 
  Search, 
  MapPin, 
  Crosshair, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Wrench, 
  Hammer, 
  Paintbrush, 
  Truck, 
  Building2, 
  Sparkles, 
  Monitor, 
  Wrench as ToolsIcon,
  CheckCircle2,
  Star,
  Users,
  HardHat,
  ChevronDown
} from 'lucide-react';

const POPULAR_LOCATIONS = [
  'Delhi NCR',
  'Patna, Bihar',
  'Lucknow, UP',
  'Mumbai, Maharashtra',
  'Bengaluru, Karnataka',
  'Ranchi, Jharkhand',
  'Varanasi, UP',
  'Jaipur, Rajasthan'
];

const CATEGORIES_LIST = [
  { slug: 'electrician', name: 'Electrician (बिजली मिस्त्री)' },
  { slug: 'plumber', name: 'Plumber (नल मिस्त्री)' },
  { slug: 'carpenter', name: 'Carpenter (बढ़ई)' },
  { slug: 'painter', name: 'Painter (पेंटर)' },
  { slug: 'delivery', name: 'Delivery Partner (डिलीवरी)' },
  { slug: 'construction', name: 'Construction / Mason (निर्माण श्रमिक)' },
  { slug: 'housekeeping', name: 'Housekeeping (हाउसकीपिंग)' },
  { slug: 'computer-operator', name: 'Computer Operator (कंप्यूटर ऑपरेटर)' },
  { slug: 'other', name: 'Other Services (अन्य सेवाएं)' }
];

export default function HeroSection() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Delhi NCR');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locating, setLocating] = useState(false);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedLocation(`GPS (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Could not retrieve current location.');
      },
      { timeout: 7000 }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedCategory) params.set('category', selectedCategory);
    router.push(`/workers?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EAF6FF] via-[#F5FAFF] to-[#EAF6FF] pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#D1E8F8]">
      {/* Background radial blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2196E8]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[#60B5F5]/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO CONTENT: Left Text + Right Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-12">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D1E8F8] shadow-xs text-xs font-bold text-[#123B5D]">
              <span className="w-2 h-2 rounded-full bg-[#2196E8] animate-pulse"></span>
              <span className="text-[#2196E8]">#1 Indian Workforce Marketplace</span>
              <span className="text-[#4B6F8E]">• 100% Aadhaar Verified</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#123B5D] tracking-tight leading-[1.12]">
              Connecting Skills with <span className="text-[#2196E8]">Opportunities.</span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-[#4B6F8E] max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Kaam Setu connects local skilled professionals, artisans, daily wage workers, and contractors with homeowners and companies. Fair daily wages, instant GPS dispatch, and transparent escrow payments with zero middlemen.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/register/worker"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#2196E8] hover:bg-[#1976D2] text-white text-base font-black shadow-lg shadow-[#2196E8]/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Find Work (काम पाएं)</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/workers"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-[#F5FAFF] text-[#123B5D] border-2 border-[#D1E8F8] hover:border-[#2196E8] text-base font-black shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Hire Workers (कारीगर खोजें)</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-[#123B5D]">
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#D1E8F8] shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Aadhaar & Skill Verified</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#D1E8F8] shadow-xs">
                <Clock className="w-4 h-4 text-[#2196E8]" />
                <span>Average Arrival: 25 Minutes</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#D1E8F8] shadow-xs">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>4.8/5 Customer Satisfaction</span>
              </div>
            </div>

          </div>

          {/* Right Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Visual Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-[#D1E8F8] relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-[#EAF6FF] mb-4">
                  <div className="flex items-center gap-3">
                    <LogoIcon size="md" />
                    <div>
                      <h3 className="text-base font-black text-[#123B5D]">Verified Indian Workforce</h3>
                      <p className="text-xs text-[#4B6F8E]">Active across 120+ Indian cities</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live Dispatch
                  </span>
                </div>

                {/* Worker Preview Highlights */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2196E8] text-white flex items-center justify-center font-bold text-sm">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#123B5D]">Electricians & Techs</p>
                        <p className="text-[11px] text-[#4B6F8E]">1,420+ Online • ₹350/hr</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#2196E8] bg-white px-2.5 py-1 rounded-lg border border-[#D1E8F8]">
                      Ready
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#123B5D]">Plumbing & Pipe Fitters</p>
                        <p className="text-[11px] text-[#4B6F8E]">980+ Online • ₹300/hr</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#2196E8] bg-white px-2.5 py-1 rounded-lg border border-[#D1E8F8]">
                      Ready
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                        <Hammer className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#123B5D]">Masons & Construction</p>
                        <p className="text-[11px] text-[#4B6F8E]">2,150+ Online • ₹1,050/day</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#2196E8] bg-white px-2.5 py-1 rounded-lg border border-[#D1E8F8]">
                      Ready
                    </span>
                  </div>
                </div>

                {/* Footer Micro stats */}
                <div className="mt-4 pt-3 border-t border-[#EAF6FF] flex items-center justify-between text-xs text-[#4B6F8E]">
                  <span className="font-semibold">⚡ Instant OTP Booking</span>
                  <span className="font-semibold text-emerald-600">✓ 100% Escrow Protection</span>
                </div>
              </div>

              {/* Floating Floating Stat Badge */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-white p-3.5 rounded-2xl border border-[#D1E8F8] shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#123B5D]">Govt. ID Verified</p>
                  <p className="text-[10px] text-[#4B6F8E]">Police Clearance Passed</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* SECTION C: QUICK SEARCH PANEL */}
        <div id="quick-search" className="bg-white rounded-3xl shadow-xl border-2 border-[#D1E8F8] p-6 sm:p-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#EAF6FF] mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#2196E8] bg-[#EAF6FF] px-3 py-1 rounded-full border border-[#D1E8F8] inline-block mb-1.5">
                QUICK SEARCH PANEL
              </span>
              <h2 className="text-2xl font-black text-[#123B5D]">
                Find Skilled Workers in Your Area
              </h2>
            </div>
            <span className="text-xs text-[#4B6F8E] font-medium">
              Over <strong className="text-[#123B5D]">15,000+</strong> verified professionals ready to dispatch
            </span>
          </div>

          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* 1. Job Title / Skill */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-[#123B5D] uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#2196E8]" />
                  Job Title or Skill
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g. Electrician, Plumber, Painter..."
                    className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-sm text-[#123B5D] font-medium placeholder-[#7697B3] focus:outline-none focus:border-[#2196E8] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* 2. Location Selector */}
              <div className="md:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#123B5D] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2196E8]" />
                    Location
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="text-[11px] font-bold text-[#2196E8] hover:underline flex items-center gap-0.5"
                  >
                    <Crosshair className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                    {locating ? 'GPS...' : 'Use GPS'}
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-sm text-[#123B5D] font-medium focus:outline-none focus:border-[#2196E8] focus:bg-white transition appearance-none cursor-pointer"
                  >
                    {POPULAR_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#4B6F8E] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 3. Category Selector */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-[#123B5D] uppercase tracking-wider flex items-center gap-1.5">
                  <ToolsIcon className="w-3.5 h-3.5 text-[#2196E8]" />
                  Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-sm text-[#123B5D] font-medium focus:outline-none focus:border-[#2196E8] focus:bg-white transition appearance-none cursor-pointer"
                  >
                    <option value="">All Categories (सभी श्रेणियां)</option>
                    {CATEGORIES_LIST.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#4B6F8E] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 4. Search Button */}
              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#2196E8] hover:bg-[#1976D2] text-white font-black text-sm shadow-md shadow-[#2196E8]/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search</span>
                </button>
              </div>

            </div>
          </form>

          {/* Quick Category Tags */}
          <div className="mt-4 pt-4 border-t border-[#EAF6FF] flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#4B6F8E]">Trending Trades:</span>
            {[
              { label: '⚡ Electrician', slug: 'electrician' },
              { label: '🔧 Plumber', slug: 'plumber' },
              { label: '🪵 Carpenter', slug: 'carpenter' },
              { label: '🎨 Painter', slug: 'painter' },
              { label: '📦 Delivery', slug: 'delivery' },
              { label: '🧱 Mason', slug: 'construction' }
            ].map(pill => (
              <button
                key={pill.slug}
                type="button"
                onClick={() => {
                  setSelectedCategory(pill.slug);
                  router.push(`/workers?category=${pill.slug}`);
                }}
                className="px-3 py-1 rounded-full bg-[#EAF6FF] hover:bg-[#2196E8] hover:text-white text-[#123B5D] font-semibold border border-[#D1E8F8] transition"
              >
                {pill.label}
              </button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
