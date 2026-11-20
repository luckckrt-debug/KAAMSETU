'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import { WorkerProfile } from '@/lib/types';
import { MASTER_CATEGORIES } from '@/lib/professions-master';

export default function WorkersDirectoryPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#EAF6FF]/40 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2583D5] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#153451]">Loading verified workers directory...</p>
        </div>
      </div>
    }>
      <WorkersDirectoryContent />
    </React.Suspense>
  );
}

function WorkersDirectoryContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : 28.5355;
  const initialLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : 77.3910;
  const initialRadius = searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 25;

  const [workers, setWorkers] = useState<Array<WorkerProfile & { distanceKm?: number; etaMinutes?: number }>>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState('');
  const [query, setQuery] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [radiusKm, setRadiusKm] = useState(initialRadius);
  const [sortBy, setSortBy] = useState<'DISTANCE' | 'RATING' | 'PRICE' | 'EXPERIENCE'>('DISTANCE');

  const fetchWorkers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (query) params.set('q', query);
    if (minRating > 0) params.set('minRating', minRating.toString());
    if (availableOnly) params.set('available', 'true');
    if (verifiedOnly) params.set('verified', 'true');
    params.set('lat', initialLat.toString());
    params.set('lng', initialLng.toString());
    params.set('radius', radiusKm.toString());

    try {
      const res = await fetch(`/api/workers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let list = data.workers || [];

        // Client-side sorting
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [category, minRating, availableOnly, verifiedOnly, radiusKm, sortBy]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EAF6FF]/60 via-[#F5FAFF] to-[#EAF6FF]/40 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Search Bar */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-[#D1E8F8] shadow-xs">
          <div className="flex flex-col md:flex-row items-center gap-4">
            
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-[#7697B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchWorkers()}
                placeholder="Search by worker name, trade skill or problem (e.g. Ramesh, MCB wiring)..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-white text-sm font-semibold text-[#153451] placeholder-[#7697B3] focus:outline-none focus:border-[#2583D5]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-[#D1E8F8] bg-white text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
              >
                <option value="">All Categories (सभी 26 श्रेणियां)</option>
                {MASTER_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.slug}>
                    [{cat.code}] {cat.name} ({cat.nameHi})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={fetchWorkers}
                className="px-6 py-3 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-bold text-xs shadow-xs transition"
              >
                Search
              </button>
            </div>

          </div>
        </div>

        {/* Content Layout: Filters Sidebar + Results List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-3 bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAF6FF]">
              <span className="font-bold text-sm text-[#153451] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#2583D5]" /> Filters & Radius
              </span>
              <button
                type="button"
                onClick={() => {
                  setCategory('');
                  setMinRating(0);
                  setAvailableOnly(false);
                  setVerifiedOnly(false);
                  setRadiusKm(30);
                }}
                className="text-xs font-semibold text-[#7697B3] hover:text-[#2583D5]"
              >
                Reset
              </button>
            </div>

            {/* Radius Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#153451] mb-1">
                <span>Radius: {radiusKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-[#2583D5] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7697B3] mt-0.5">
                <span>5 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2 border-t border-[#EAF6FF]">
              <label className="flex items-center gap-2.5 text-xs font-bold text-[#153451] cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#2583D5] rounded"
                />
                <span>Online & Available Now</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-[#153451] cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#2583D5] rounded"
                />
                <span>Verified KYC Only (100% Verified)</span>
              </label>
            </div>

            {/* Rating Filter */}
            <div className="pt-2 border-t border-[#EAF6FF] space-y-2">
              <span className="text-xs font-bold text-[#153451] block">Minimum Rating</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                {[0, 4.5, 4.8].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMinRating(val)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                      minRating === val
                        ? 'bg-[#2583D5] text-white border-[#2583D5]'
                        : 'bg-white text-[#153451] border-[#D1E8F8] hover:border-[#2583D5]'
                    }`}
                  >
                    {val === 0 ? 'All' : `${val}+ ★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="pt-2 border-t border-[#EAF6FF] space-y-2">
              <span className="text-xs font-bold text-[#153451] block">Sort Results By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#D1E8F8] bg-white text-xs font-bold text-[#153451]"
              >
                <option value="DISTANCE">Closest Distance (दूरी अनुसार)</option>
                <option value="RATING">Highest Rated (रेटिंग अनुसार)</option>
                <option value="PRICE">Lowest Price (कम कीमत)</option>
                <option value="EXPERIENCE">Years of Experience (अनुभव)</option>
              </select>
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-9 space-y-4">
            
            <div className="flex items-center justify-between text-xs text-[#4B6F8E] px-1">
              <span>
                Found <strong className="text-[#153451] font-bold">{workers.length}</strong> verified professionals within {radiusKm} km
              </span>
              <span className="flex items-center gap-1 text-[#2583D5] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Live GPS Dispatch Enabled
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-[#7697B3] font-semibold bg-white/80 rounded-3xl border border-[#D1E8F8]">
                Locating nearest available verified workers...
              </div>
            ) : workers.length === 0 ? (
              <div className="p-12 text-center bg-white/80 rounded-3xl border border-[#D1E8F8] space-y-3">
                <p className="text-[#153451] font-bold text-base">No workers matching these exact criteria.</p>
                <p className="text-xs text-[#7697B3]">Try widening your search radius or selecting &quot;All Categories&quot;.</p>
                <button
                  onClick={() => { setCategory(''); setRadiusKm(40); }}
                  className="px-4 py-2 rounded-xl bg-[#2583D5] text-white text-xs font-bold"
                >
                  Expand Radius to 40 km
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-[#D1E8F8] hover:border-[#2583D5]/50 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative shrink-0">
                        <img
                          src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                          alt={worker.user?.fullName}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-xs"
                        />
                        {worker.isAvailableNow && (
                          <span 
                            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200" 
                            title="Online"
                          />
                        )}
                      </div>
                      
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/workers/${worker.id}`} className="text-base font-black text-[#153451] hover:text-[#2583D5] transition-colors">
                            {worker.user?.fullName}
                          </Link>
                          <span title="Aadhaar & Trade Verified"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /></span>
                          <span className="text-xs font-bold text-[#2583D5] bg-[#EAF6FF] px-2.5 py-0.5 rounded-md">
                            {worker.skills?.[0]?.categoryName || 'Trade Professional'}
                          </span>
                        </div>

                        <p className="text-xs text-[#4B6F8E] line-clamp-1 leading-relaxed">
                          {worker.headline || worker.bio}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#7697B3] pt-1">
                          <span className="flex items-center gap-1 font-bold text-[#153451]">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            {worker.ratingAvg} ({worker.ratingCount})
                          </span>
                          <span className="text-[#D1E8F8]">•</span>
                          <span className="flex items-center gap-1 font-semibold text-[#153451]">
                            <MapPin className="w-3.5 h-3.5 text-[#2583D5]" />
                            {worker.distanceKm ? `${worker.distanceKm} km away` : worker.city}
                          </span>
                          <span className="text-[#D1E8F8]">•</span>
                          <span className="flex items-center gap-1 font-semibold text-[#153451]">
                            <Clock className="w-3.5 h-3.5 text-[#2583D5]" />
                            ETA: {worker.etaMinutes ? `${worker.etaMinutes} mins` : '25 mins'}
                          </span>
                          <span className="text-[#D1E8F8]">•</span>
                          <span>{worker.completedJobsCount} jobs completed</span>
                        </div>
                      </div>
                    </div>

                    {/* Rate & Direct Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#EAF6FF] gap-2 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-lg font-black text-[#153451]">₹{worker.hourlyRate}</span>
                        <span className="text-xs text-[#7697B3]">/hr</span>
                        <span className="text-[11px] text-[#7697B3] block">₹{worker.dailyRate}/day</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/workers/${worker.id}`}
                          className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] text-xs font-bold text-[#153451] hover:border-[#2583D5] hover:text-[#2583D5] transition bg-white"
                        >
                          Profile
                        </Link>
                        <Link
                          href={`/booking/new?workerId=${worker.id}&category=${worker.skills?.[0]?.categoryId || 'cat-electrician'}`}
                          className="px-4 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold shadow-xs transition flex items-center gap-1"
                        >
                          <span>Book</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
