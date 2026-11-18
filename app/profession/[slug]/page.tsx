'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  Wrench, 
  Hammer, 
  Boxes, 
  Paintbrush, 
  Fan, 
  ShieldAlert, 
  Users, 
  ClipboardCheck, 
  Sparkles, 
  Truck, 
  Shield, 
  TreePine, 
  Car, 
  Package, 
  Layers, 
  PartyPopper, 
  ArrowRight, 
  Search, 
  MapPin, 
  Crosshair, 
  Star, 
  Clock, 
  ShieldCheck, 
  PhoneCall, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronDown,
  HelpCircle,
  Tag,
  BadgeCheck,
  AlertCircle
} from 'lucide-react';
import { getProfessionBySlug, getAllProfessions, ProfessionData } from '@/lib/professions';
import { WorkerProfile } from '@/lib/types';

export default function ProfessionPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-bg py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-forest">Loading profession marketplace...</p>
        </div>
      </div>
    }>
      <ProfessionContent />
    </React.Suspense>
  );
}

function ProfessionContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = (params.slug as string) || '';
  const profession = useMemo(() => getProfessionBySlug(slug), [slug]);

  // Search & Filter State
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [locationName, setLocationName] = useState(searchParams.get('location') || 'Noida, Uttar Pradesh');
  const [latitude, setLatitude] = useState<number>(28.5355);
  const [longitude, setLongitude] = useState<number>(77.3910);
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [locating, setLocating] = useState<boolean>(false);

  const [minExp, setMinExp] = useState<number>(0);
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'DISTANCE' | 'RATING' | 'PRICE' | 'EXPERIENCE'>('DISTANCE');

  const [workers, setWorkers] = useState<Array<WorkerProfile & { distanceKm?: number; etaMinutes?: number }>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch workers matching this profession
  const fetchProfessionWorkers = async () => {
    if (!profession) return;
    setLoading(true);
    try {
      const urlParams = new URLSearchParams();
      urlParams.set('category', profession.slug);
      if (latitude && longitude) {
        urlParams.set('lat', latitude.toString());
        urlParams.set('lng', longitude.toString());
        urlParams.set('radius', radiusKm.toString());
      }
      if (verifiedOnly) urlParams.set('verified', 'true');
      if (availableOnly) urlParams.set('available', 'true');
      if (query) urlParams.set('q', query);

      const res = await fetch(`/api/workers?${urlParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        let list = data.workers || [];

        // Apply subcategory client filter
        if (selectedSubcategory !== 'ALL') {
          const sub = profession.subcategories.find(s => s.id === selectedSubcategory);
          if (sub) {
            const term = sub.name.toLowerCase();
            list = list.filter((w: any) => 
              w.headline?.toLowerCase().includes(term) ||
              w.bio?.toLowerCase().includes(term) ||
              w.skills?.some((s: any) => s.categoryName?.toLowerCase().includes(term))
            );
          }
        }

        // Experience filter
        if (minExp > 0) {
          list = list.filter((w: any) => w.yearsExperience >= minExp);
        }

        // Sorting
        if (sortBy === 'DISTANCE') {
          list.sort((a: any, b: any) => (a.distanceKm || 0) - (b.distanceKm || 0));
        } else if (sortBy === 'RATING') {
          list.sort((a: any, b: any) => b.ratingAvg - a.ratingAvg);
        } else if (sortBy === 'PRICE') {
          list.sort((a: any, b: any) => a.hourlyRate - b.hourlyRate);
        } else if (sortBy === 'EXPERIENCE') {
          list.sort((a: any, b: any) => b.yearsExperience - a.yearsExperience);
        }

        setWorkers(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionWorkers();
  }, [profession, selectedSubcategory, minExp, availableOnly, verifiedOnly, radiusKm, sortBy]);

  // GPS Detector
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setLocationName(`Current GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setLocating(false);
        fetchProfessionWorkers();
      },
      () => {
        setLocating(false);
        alert('Could not retrieve current GPS coordinates.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  if (!profession) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-bg text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 border border-border shadow-elevated space-y-4">
          <AlertCircle className="w-12 h-12 text-cta mx-auto" />
          <h1 className="text-2xl font-black text-forest">Profession Not Found</h1>
          <p className="text-xs text-text-secondary">
            The requested trade &quot;{slug}&quot; could not be found. Explore our 25 verified professions below.
          </p>
          <Link
            href="/services"
            className="inline-block px-6 py-2.5 rounded-xl bg-forest text-lime text-xs font-bold"
          >
            Explore All Professions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen">
      
      {/* ============================================================== */}
      {/* A. PROFESSION HERO                                             */}
      {/* ============================================================== */}
      <section className="relative bg-forest text-white overflow-hidden py-12 lg:py-20 border-b border-forest-light/30">
        <div className="absolute inset-0 opacity-20">
          <img
            src={profession.coverImage}
            alt={profession.name}
            className="w-full h-full object-cover filter blur-xs"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/95 to-forest/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/#explore-professions"
                  className="text-xs font-bold text-lime-light hover:underline flex items-center gap-1"
                >
                  &larr; All Professions
                </Link>
                <span className="text-white/40">•</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-lime border border-white/15">
                  {profession.sector}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cta text-forest">
                  {profession.workerCountEstimate}
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  {profession.name}
                </h1>
                <p className="text-lg sm:text-2xl text-lime font-bold mt-1">
                  {profession.nameHi}
                </p>
              </div>

              <p className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed">
                {profession.intro}
              </p>

              {/* Quick Trust Badges */}
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-white/90">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                  <ShieldCheck className="w-4 h-4 text-lime" />
                  <span>100% Aadhaar & Police Verified</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                  <Tag className="w-4 h-4 text-cta" />
                  <span>Starting at ₹{profession.baseHourlyRate}/hr (₹{profession.baseDailyRate}/day)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                  <Clock className="w-4 h-4 text-lime-light" />
                  <span>Avg. Arrival: 25 Mins</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href={`/booking/new?category=${profession.id}`}
                  className="px-6 py-3 rounded-xl bg-lime hover:bg-lime/90 text-forest font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
                >
                  <span>Book an {profession.singular} Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register/worker"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
                >
                  Join as an {profession.singular}
                </Link>
              </div>
            </div>

            {/* Right Hero: Dedicated Search & Location Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 text-text-primary shadow-elevated border border-border">
                <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                  <h3 className="text-base font-black text-forest">
                    Search {profession.name}
                  </h3>
                  <span className="text-xs font-bold text-status-success bg-status-successSoft px-2.5 py-0.5 rounded-full">
                    GPS Active
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Keyword search */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-primary uppercase tracking-wider mb-1">
                      Specific Skill / Problem
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchProfessionWorkers()}
                        placeholder={`e.g. ${profession.popularSkills[0] || 'Installation'}, ${profession.popularSkills[1] || 'Repair'}...`}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-xs font-semibold focus:outline-none focus:border-forest"
                      />
                    </div>
                  </div>

                  {/* Location with GPS */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
                        Locality / PIN Code
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectGPS}
                        disabled={locating}
                        className="text-xs font-bold text-sage hover:text-forest flex items-center gap-1"
                      >
                        <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin text-cta' : ''}`} />
                        <span>{locating ? 'Detecting...' : 'Use My GPS'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="e.g. Sector 18, Noida or PIN 201301"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-xs font-semibold focus:outline-none focus:border-forest"
                      />
                    </div>
                  </div>

                  {/* Radius slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-text-primary mb-1">
                      <span>Search Radius: <strong className="text-forest">{radiusKm} km</strong></span>
                      <span className="text-text-muted">तय दूरी</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="40"
                      step="1"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="w-full accent-forest cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={fetchProfessionWorkers}
                    className="w-full py-3 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-sm transition-all"
                  >
                    Apply Filters & Find Workers
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* B. SUB-CATEGORIES TABS & WORKER FILTERS                         */}
      {/* ============================================================== */}
      <section className="sticky top-16 z-20 bg-white border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Subcategory Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedSubcategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSubcategory === 'ALL'
                    ? 'bg-forest text-lime shadow-xs'
                    : 'bg-bg hover:bg-forest/5 text-text-secondary border border-border'
                }`}
              >
                All Services (सभी)
              </button>

              {profession.subcategories.map((sub) => {
                const active = selectedSubcategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcategory(sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-forest text-lime shadow-xs'
                        : 'bg-bg hover:bg-forest/5 text-text-secondary border border-border'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span className="text-[10px] opacity-75 font-normal">({sub.avgPrice})</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Sort & Verification filter */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-border bg-bg text-xs font-bold text-forest focus:outline-none"
              >
                <option value="DISTANCE">Nearest First (दूरी अनुसार)</option>
                <option value="RATING">Highest Rated (रेटिंग अनुसार)</option>
                <option value="PRICE">Price: Low to High (दर अनुसार)</option>
                <option value="EXPERIENCE">Most Experienced (अनुभव अनुसार)</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs font-bold text-forest cursor-pointer select-none bg-bg px-2.5 py-1.5 rounded-xl border border-border">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-3.5 h-3.5 accent-forest"
                />
                <span>Online Now</span>
              </label>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* C. PROFESSION WORKERS LISTING                                  */}
      {/* ============================================================== */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-forest">
              Available Verified {profession.name}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Showing certified professionals matching your filters near {locationName}.
            </p>
          </div>
          <span className="text-xs font-bold text-text-muted bg-white px-3 py-1 rounded-full border border-border">
            {workers.length} {workers.length === 1 ? 'Worker' : 'Workers'} Found
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-text-muted">Loading verified {profession.name}...</p>
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-border p-8 space-y-3">
            <Search className="w-10 h-10 text-text-muted mx-auto opacity-40" />
            <h3 className="text-base font-bold text-forest">No {profession.name} Matched Your Filters</h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Try adjusting your search radius, turning off &quot;Online Now&quot;, or searching for general keywords.
            </p>
            <button
              onClick={() => {
                setSelectedSubcategory('ALL');
                setQuery('');
                setAvailableOnly(false);
                setRadiusKm(40);
              }}
              className="mt-3 px-5 py-2 rounded-xl bg-forest text-lime text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-3xl p-6 border border-border hover:border-forest/40 shadow-xs hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Avatar, Name, Rating */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                      alt={worker.user?.fullName || 'Worker'}
                      className="w-16 h-16 rounded-2xl object-cover border border-border shadow-2xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-base font-black text-forest truncate">
                          {worker.user?.fullName}
                        </h4>
                        <span title="Aadhaar KYC Verified">
                          <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                        </span>
                      </div>

                      <p className="text-xs text-forest font-semibold line-clamp-1 mt-0.5">
                        {worker.headline || `${profession.singular} Specialist`}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-xs">
                        <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{worker.ratingAvg.toFixed(1)}</span>
                          <span className="text-[10px] text-text-muted font-normal">({worker.ratingCount})</span>
                        </div>
                        <span className="text-[11px] text-text-muted font-medium">
                          {worker.completedJobsCount} jobs done
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-1.5 mb-3 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-md bg-forest/5 text-forest border border-forest/10">
                      {worker.yearsExperience}+ Years Exp
                    </span>
                    {worker.emergencyAvailable && (
                      <span className="px-2 py-0.5 rounded-md bg-status-dangerSoft text-status-danger border border-status-danger/20 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> Emergency 30-min
                      </span>
                    )}
                    {worker.isAvailableNow && (
                      <span className="px-2 py-0.5 rounded-md bg-status-successSoft text-status-success border border-status-success/20">
                        Available Today
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-3">
                    {worker.bio}
                  </p>

                  {/* Distance and Location */}
                  <div className="flex items-center justify-between text-xs text-text-muted py-2 border-t border-border/60">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-sage shrink-0" />
                      <span className="truncate">{worker.locality}, {worker.city}</span>
                    </span>
                    {worker.distanceKm !== undefined && (
                      <span className="font-bold text-forest whitespace-nowrap bg-bg px-2 py-0.5 rounded-md">
                        {worker.distanceKm.toFixed(1)} km ({worker.etaMinutes} mins)
                      </span>
                    )}
                  </div>

                  {/* Tools snippet */}
                  {worker.toolsAvailable && worker.toolsAvailable.length > 0 && (
                    <div className="pt-2 text-[11px] text-text-muted">
                      <strong className="text-forest">Tools: </strong>
                      {worker.toolsAvailable.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>

                {/* Footer: Price + Book Action */}
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Rate</span>
                    <span className="text-base font-black text-forest">
                      ₹{worker.hourlyRate}<span className="text-xs text-text-muted font-normal">/hr</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/workers/${worker.id}`}
                      className="px-3 py-2 rounded-xl bg-bg hover:bg-forest hover:text-lime text-forest text-xs font-bold transition-all border border-border"
                    >
                      Profile
                    </Link>
                    <Link
                      href={`/booking/new?workerId=${worker.id}&category=${profession.id}`}
                      className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>

      {/* ============================================================== */}
      {/* D. POPULAR SERVICES & PRICING GUIDE                            */}
      {/* ============================================================== */}
      <section className="py-16 bg-white border-t border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-forest uppercase tracking-wider bg-forest/5 px-3 py-1 rounded-full">
              Standard Rates • तय पारदर्शी दरें
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">
              {profession.name} Standard Pricing & Common Jobs
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Fixed fair labor pricing with zero hidden charges. Pay after work is inspected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {profession.pricingGuide.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-bg border border-border hover:border-forest/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <h4 className="text-sm font-bold text-forest">
                      {item.service}
                    </h4>
                    <span className="text-sm font-black text-forest bg-white px-2.5 py-0.5 rounded-lg border border-border">
                      {item.rate}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sage" /> Approx. {item.timeEst}
                  </span>
                  <Link
                    href={`/booking/new?category=${profession.id}`}
                    className="font-bold text-forest hover:text-cta flex items-center gap-0.5"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* E. REQUIRED TOOLS & CERTIFICATIONS                             */}
      {/* ============================================================== */}
      <section className="py-16 bg-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Tools Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-forest">Standard Diagnostic Toolkits</h3>
                  <p className="text-xs text-text-muted">What certified {profession.name} bring to your site</p>
                </div>
              </div>
              <ul className="space-y-2.5 pt-2">
                {profession.requiredTools.map((tool, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                    <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Certifications Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-forest">Verification Standards</h3>
                  <p className="text-xs text-text-muted">Mandatory background & credential checks</p>
                </div>
              </div>
              <ul className="space-y-2.5 pt-2">
                {profession.certifications.map((cert, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                    <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* F. DIRECT BOOKING CTA & FAQ                                    */}
      {/* ============================================================== */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Emergency CTA Banner */}
          <div className="rounded-3xl bg-forest p-8 sm:p-10 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-danger text-white text-[10px] font-bold uppercase tracking-wider">
                <Zap className="w-3 h-3 fill-white" /> Emergency 30-Minute Dispatch
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Need an {profession.singular} Right Now?
              </h3>
              <p className="text-xs sm:text-sm text-lime-light/80 max-w-lg">
                Book with urgent dispatch flag. The closest verified {profession.singular} is alerted instantly with real-time GPS tracking.
              </p>
            </div>

            <Link
              href={`/booking/new?category=${profession.id}&urgent=true`}
              className="px-6 py-3.5 rounded-xl bg-cta hover:bg-cta/90 text-forest font-black text-xs uppercase tracking-wider shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              Request Urgent {profession.singular}
            </Link>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-forest text-center">
              Frequently Asked Questions About {profession.name}
            </h3>

            <div className="space-y-3 pt-2">
              {profession.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-bg border border-border space-y-1.5"
                >
                  <h4 className="text-sm font-bold text-forest flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-cta shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Other Professions Explorer */}
          <div className="pt-6 border-t border-border text-center">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
              Explore Other Professions
            </h4>
            <div className="flex flex-wrap justify-center gap-2">
              {getAllProfessions()
                .filter(p => p.slug !== profession.slug)
                .slice(0, 10)
                .map((p) => (
                  <Link
                    key={p.slug}
                    href={`/profession/${p.slug}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-bg hover:bg-forest hover:text-lime text-text-secondary border border-border transition-all"
                  >
                    {p.name}
                  </Link>
                ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
