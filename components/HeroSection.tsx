'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Crosshair, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Star,
  ChevronDown,
  Wrench as ToolsIcon,
  CheckCircle2,
  Sparkles,
  Zap,
  Users
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
    <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* CENTERED HERO HEADER */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-12 sm:mb-14">
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#153451] tracking-tight leading-[1.12]">
            Right People. Right Place. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2583D5] via-[#19639E] to-[#123B5D]">
              Right Work.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg lg:text-xl text-[#4B6F8E] max-w-2xl mx-auto font-medium leading-relaxed">
            Connecting India&apos;s skilled workforce with trusted job opportunities and customers. A simpler way to find work, hire professionals, and grow together.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register/worker"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-base font-black shadow-lg shadow-[#2583D5]/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group"
            >
              <span>Find Work (काम पाएं)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/workers"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/90 hover:bg-white text-[#153451] border border-[#D1E8F8] hover:border-[#2583D5] text-base font-black shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Hire Workers (कारीगर खोजें)</span>
            </Link>
          </div>

        </div>

        {/* SECTION C: FLOATING GLASSMORPHIC SEARCH PANEL */}
        <div id="quick-search" className="max-w-5xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 transition-all">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#EAF6FF] mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#2583D5] bg-[#EAF6FF] px-3.5 py-1 rounded-full border border-[#D1E8F8] inline-block mb-1.5">
                QUICK SEARCH PANEL
              </span>
              <h2 className="text-2xl font-black text-[#153451]">
                Find Skilled Workers in Your Area
              </h2>
            </div>
            <span className="text-xs text-[#4B6F8E] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Over <strong className="text-[#153451]">15,000+</strong> verified professionals ready to dispatch
            </span>
          </div>

          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* 1. Job Title / Skill */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-[#153451] uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#2583D5]" />
                  Job Title or Skill
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g. Electrician, Plumber, Painter..."
                    className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-white/90 text-sm text-[#153451] font-medium placeholder-[#7697B3] focus:outline-none focus:border-[#2583D5] focus:bg-white focus:ring-2 focus:ring-[#2583D5]/20 transition"
                  />
                </div>
              </div>

              {/* 2. Location Selector */}
              <div className="md:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#153451] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2583D5]" />
                    Location
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="text-[11px] font-bold text-[#2583D5] hover:underline flex items-center gap-0.5"
                  >
                    <Crosshair className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                    {locating ? 'GPS...' : 'Use GPS'}
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-white/90 text-sm text-[#153451] font-medium focus:outline-none focus:border-[#2583D5] focus:bg-white focus:ring-2 focus:ring-[#2583D5]/20 transition appearance-none cursor-pointer"
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
                <label className="text-xs font-bold text-[#153451] uppercase tracking-wider flex items-center gap-1.5">
                  <ToolsIcon className="w-3.5 h-3.5 text-[#2583D5]" />
                  Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-white/90 text-sm text-[#153451] font-medium focus:outline-none focus:border-[#2583D5] focus:bg-white focus:ring-2 focus:ring-[#2583D5]/20 transition appearance-none cursor-pointer"
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
                  className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-sm shadow-md shadow-[#2583D5]/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search</span>
                </button>
              </div>

            </div>
          </form>

          {/* Quick Category Tags */}
          <div className="mt-5 pt-4 border-t border-[#EAF6FF] flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#4B6F8E]">Popular Trades:</span>
            {[
              { label: '⚡ Electrician', slug: 'electrician' },
              { label: '🔧 Plumber', slug: 'plumber' },
              { label: '🪵 Carpenter', slug: 'carpenter' },
              { label: '🎨 Painter', slug: 'painter' },
              { label: '📦 Delivery', slug: 'delivery' },
              { label: '🧱 Mason', slug: 'construction' },
              { label: '🧹 Housekeeping', slug: 'housekeeping' }
            ].map(pill => (
              <button
                key={pill.slug}
                type="button"
                onClick={() => {
                  setSelectedCategory(pill.slug);
                  router.push(`/workers?category=${pill.slug}`);
                }}
                className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-[#2583D5] hover:text-white text-[#153451] font-semibold border border-[#D1E8F8] transition-all hover:scale-105 shadow-xs"
              >
                {pill.label}
              </button>
            ))}
          </div>

        </div>

        {/* TRUST RIBBON UNDER QUICK SEARCH */}
        <div className="max-w-4xl mx-auto mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-bold text-[#153451]">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#D1E8F8] shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Aadhaar & Police Verified</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#D1E8F8] shadow-xs">
            <Clock className="w-4 h-4 text-[#2583D5]" />
            <span>25-Min Live GPS Arrival</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#D1E8F8] shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#2583D5]" />
            <span>100% Escrow Protection</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#D1E8F8] shadow-xs">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>4.8/5 (15k+ Completed Jobs)</span>
          </div>
        </div>

      </div>
    </section>
  );
}
