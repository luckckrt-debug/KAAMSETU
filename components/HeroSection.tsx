'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
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
  Users,
  Compass,
  Wrench,
  Hammer,
  Paintbrush,
  Truck,
  Building2,
  Layers,
  Radio
} from 'lucide-react';

// Dynamic SSR-safe import for Leaflet OpenStreetMap component
const OpenStreetTracker = dynamic(() => import('@/components/OpenStreetTracker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] rounded-3xl bg-[#EAF6FF]/50 border border-[#D1E8F8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-[#2583D5]">
        <div className="w-8 h-8 border-3 border-[#2583D5] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#153451]">Loading OpenStreetMap Live Street GPS...</span>
      </div>
    </div>
  ),
});

const POPULAR_LOCATIONS = [
  'Delhi NCR',
  'Noida, UP',
  'Gurugram, Haryana',
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

// Clean Popular Trades with professional SVG icons (Zero Emojis)
const POPULAR_TRADES = [
  { label: 'Electrician', slug: 'electrician', icon: Zap },
  { label: 'Plumber', slug: 'plumber', icon: Wrench },
  { label: 'Carpenter', slug: 'carpenter', icon: Hammer },
  { label: 'Painter', slug: 'painter', icon: Paintbrush },
  { label: 'Delivery', slug: 'delivery', icon: Truck },
  { label: 'Mason', slug: 'construction', icon: Building2 },
  { label: 'Housekeeping', slug: 'housekeeping', icon: Sparkles }
];

export default function HeroSection() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Delhi NCR');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locating, setLocating] = useState(false);

  // View Mode: 'FORM' or 'STREET_MAP'
  const [viewMode, setViewMode] = useState<'FORM' | 'STREET_MAP'>('FORM');
  const [activeStreetTrade, setActiveStreetTrade] = useState<string>('all');

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
        // Automatically open the OpenStreetMap live street radar
        setViewMode('STREET_MAP');
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

  const handleTradeClick = (tradeSlug: string) => {
    setSelectedCategory(tradeSlug);
    setActiveStreetTrade(tradeSlug);
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
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black hover:bg-zinc-900 text-white text-base font-black shadow-lg shadow-black/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group border border-black/10"
            >
              <span>Find Work (काम पाएं)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/workers"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/90 hover:bg-white text-black border border-[#D1E8F8] hover:border-black text-base font-black shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Hire Workers (कारीगर खोजें)</span>
            </Link>
          </div>

        </div>

        {/* SECTION C: QUICK SEARCH & LIVE OPENSTREETMAP STREET RADAR PANEL */}
        <div id="quick-search" className="max-w-5xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 transition-all">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#EAF6FF] mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#153451]">
                Find Skilled Workers on Your Street
              </h2>
            </div>

            {/* VIEW MODE TOGGLE BUTTONS */}
            <div className="flex items-center w-full sm:w-auto justify-center bg-[#F5FAFF] p-1.5 rounded-2xl border border-[#D1E8F8] text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('FORM')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === 'FORM'
                    ? 'bg-white text-[#2583D5] shadow-xs font-black'
                    : 'text-[#4B6F8E] hover:text-[#153451]'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Form</span>
              </button>
              
              <button
                type="button"
                onClick={() => setViewMode('STREET_MAP')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === 'STREET_MAP'
                    ? 'bg-[#2583D5] text-white shadow-xs font-black'
                    : 'text-[#4B6F8E] hover:text-[#153451]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Live GPS Street Map</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: SEARCH FORM */}
          {viewMode === 'FORM' && (
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
                      className="text-[11px] font-bold text-[#2583D5] hover:underline flex items-center gap-0.5 cursor-pointer"
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
                    className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-sm shadow-md shadow-[#2583D5]/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    <span>Search</span>
                  </button>
                </div>

              </div>
            </form>
          )}

          {/* VIEW MODE 2: LIVE OPENSTREETMAP STREET RADAR */}
          {viewMode === 'STREET_MAP' && (
            <div className="space-y-4">
              <OpenStreetTracker
                selectedTrade={activeStreetTrade}
                onTradeSelect={(trade) => setActiveStreetTrade(trade)}
              />
            </div>
          )}

          {/* POPULAR TRADES PILLS: CLEAN SVG ICONS & ZERO EMOJIS */}
          <div className="mt-5 pt-4 border-t border-[#EAF6FF] flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#4B6F8E] flex items-center gap-1">
              <span>Popular Trades:</span>
            </span>

            {/* 'All Trades' option when in street map mode */}
            {viewMode === 'STREET_MAP' && (
              <button
                type="button"
                onClick={() => setActiveStreetTrade('all')}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all shadow-xs border cursor-pointer ${
                  activeStreetTrade === 'all'
                    ? 'bg-[#153451] text-white border-[#153451] shadow-md'
                    : 'bg-white/90 hover:bg-[#2583D5] hover:text-white text-[#153451] border-[#D1E8F8]'
                }`}
              >
                All Street Trades
              </button>
            )}

            {POPULAR_TRADES.map((pill) => {
              const Icon = pill.icon;
              const isSelected = viewMode === 'STREET_MAP' 
                ? activeStreetTrade === pill.slug 
                : selectedCategory === pill.slug;

              return (
                <button
                  key={pill.slug}
                  type="button"
                  onClick={() => {
                    handleTradeClick(pill.slug);
                    if (viewMode === 'FORM') {
                      router.push(`/workers?category=${pill.slug}`);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all shadow-xs border flex items-center gap-1.5 cursor-pointer hover:scale-105 ${
                    isSelected
                      ? 'bg-[#2583D5] text-white border-[#2583D5] shadow-md shadow-[#2583D5]/25'
                      : 'bg-white/95 text-[#153451] border-[#D1E8F8] hover:border-[#2583D5] hover:bg-[#F5FAFF]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#2583D5]'}`} />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
