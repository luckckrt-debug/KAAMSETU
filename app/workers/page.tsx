'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Crosshair, 
  Star, 
  Clock, 
  ShieldCheck, 
  Filter, 
  ArrowRight,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { WorkerProfile } from '@/lib/types';

export default function WorkersDirectoryPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#F7F7F2] py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#173D2B] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#173D2B]">Loading verified workers directory...</p>
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Search Bar */}
        <div className="bg-white rounded-3xl p-6 border border-border shadow-xs">
          <div className="flex flex-col md:flex-row items-center gap-4">
            
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchWorkers()}
                placeholder="Search by worker name, trade skill or problem (e.g. Ramesh, MCB wiring)..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-forest focus:outline-none focus:border-forest"
              >
                <option value="">All Categories (सभी श्रेणियां)</option>
                <optgroup label="🏠 Home Repair & Domestic">
                  <option value="electrician">Electrician (बिजली मिस्त्री)</option>
                  <option value="plumber">Plumber (नल मिस्त्री)</option>
                  <option value="carpenter">Carpenter (बढ़ई)</option>
                  <option value="painter">Painter (रंग मिस्त्री)</option>
                  <option value="ac-appliance-technician">AC & Appliance Technician</option>
                  <option value="water-purifier-ro-technician">RO & Water Purifier Tech</option>
                  <option value="pest-control-specialist">Pest Control Specialist</option>
                </optgroup>
                <optgroup label="🏗️ Construction & Civil Works">
                  <option value="mason">Mason / Raj Mistri (राज मिस्त्री)</option>
                  <option value="construction-labour">Labour / Beldar (मजदूर)</option>
                  <option value="steel-barbender-rebar">Steel Barbender (सरिया मिस्त्री)</option>
                  <option value="tiles-marble-granite">Tiles & Marble Specialist</option>
                  <option value="welder">Welder & Metal Fabricator</option>
                </optgroup>
                <optgroup label="⚡ Engineering & Supervision">
                  <option value="solar-inverter-technician">Solar & Inverter Engineer</option>
                  <option value="civil-engineer-supervisor">Civil Site Engineer / Supervisor</option>
                  <option value="cctv-smart-security">CCTV & Smart Security Tech</option>
                </optgroup>
                <optgroup label="🚚 Logistics & Heavy Machinery">
                  <option value="commercial-driver">Commercial Driver & Chauffeur</option>
                  <option value="heavy-machinery-jcb-operator">Heavy Machinery & JCB Operator</option>
                  <option value="warehouse-packaging-workforce">Warehouse & Packaging Workforce</option>
                </optgroup>
                <optgroup label="🏢 Facility & Security">
                  <option value="deep-cleaning-housekeeping">Deep Cleaning & Housekeeping</option>
                  <option value="security-guard-bouncers">Security Personnel & Guards</option>
                </optgroup>
                <optgroup label="🌿 Agriculture & Events">
                  <option value="gardener-mali-landscaper">Gardener / Mali & Landscaper</option>
                  <option value="event-setup-banquet-workforce">Event Setup & Banquet Staff</option>
                </optgroup>
              </select>

              <button
                type="button"
                onClick={fetchWorkers}
                className="px-6 py-3 rounded-xl bg-forest hover:bg-forest-light text-lime font-bold text-xs shadow-xs"
              >
                Search
              </button>
            </div>

          </div>
        </div>

        {/* Content Layout: Filters Sidebar + Results List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-border shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="font-bold text-sm text-forest flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-sage" /> Filters & Radius
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
                className="text-xs font-semibold text-text-muted hover:text-forest"
              >
                Reset
              </button>
            </div>

            {/* Radius Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-text-primary mb-1">
                <span>Radius: {radiusKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
                <span>5 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2 border-t border-border">
              <label className="flex items-center gap-2.5 text-xs font-bold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 accent-forest rounded"
                />
                <span>Online & Available Now</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 accent-forest rounded"
                />
                <span>Verified KYC Only (100% Verified)</span>
              </label>
            </div>

            {/* Rating Filter */}
            <div className="pt-2 border-t border-border space-y-2">
              <span className="text-xs font-bold text-text-primary block">Minimum Rating</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                {[0, 4.5, 4.8].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMinRating(val)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                      minRating === val
                        ? 'bg-forest text-lime border-forest'
                        : 'bg-bg text-text-primary border-border hover:border-forest'
                    }`}
                  >
                    {val === 0 ? 'All' : `${val}+ ★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="pt-2 border-t border-border space-y-2">
              <span className="text-xs font-bold text-text-primary block">Sort Results By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary"
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
            
            <div className="flex items-center justify-between text-xs text-text-secondary px-1">
              <span>
                Found <strong className="text-forest font-bold">{workers.length}</strong> verified professionals within {radiusKm} km
              </span>
              <span className="flex items-center gap-1 text-sage font-bold">
                <ShieldCheck className="w-4 h-4" /> Live GPS Dispatch Enabled
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-text-muted font-semibold bg-white rounded-3xl border border-border">
                Locating nearest available verified workers...
              </div>
            ) : workers.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-border space-y-3">
                <p className="text-forest font-bold text-base">No workers matching these exact criteria.</p>
                <p className="text-xs text-text-muted">Try widening your search radius or selecting &quot;All Categories&quot;.</p>
                <button
                  onClick={() => { setCategory(''); setRadiusKm(40); }}
                  className="px-4 py-2 rounded-xl bg-forest text-lime text-xs font-bold"
                >
                  Expand Radius to 40 km
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    className="bg-white rounded-2xl p-6 border border-border hover:border-forest/40 shadow-xs hover:shadow-card transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                        alt={worker.user?.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/workers/${worker.id}`} className="text-base font-black text-forest hover:text-cta transition-colors">
                            {worker.user?.fullName}
                          </Link>
                          <span title="Aadhaar & Trade Verified"><ShieldCheck className="w-4 h-4 text-status-success" /></span>
                          <span className="text-xs font-bold text-sage bg-sage-soft px-2 py-0.5 rounded">
                            {worker.skills?.[0]?.categoryName || 'Trade Professional'}
                          </span>
                        </div>

                        <p className="text-xs text-text-secondary line-clamp-1 leading-relaxed">
                          {worker.headline || worker.bio}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted pt-1">
                          <span className="flex items-center gap-1 font-bold text-forest">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            {worker.ratingAvg} ({worker.ratingCount} reviews)
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-text-primary">
                            <MapPin className="w-3.5 h-3.5 text-sage" />
                            {worker.distanceKm ? `${worker.distanceKm} km away` : worker.city}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-text-primary">
                            <Clock className="w-3.5 h-3.5 text-cta" />
                            ETA: {worker.etaMinutes ? `${worker.etaMinutes} mins` : '25 mins'}
                          </span>
                          <span>{worker.completedJobsCount} jobs completed</span>
                        </div>
                      </div>
                    </div>

                    {/* Rate & Direct Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border gap-2 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-base font-black text-forest">₹{worker.hourlyRate}</span>
                        <span className="text-xs text-text-muted">/hr</span>
                        <span className="text-[11px] text-text-muted block">(₹{worker.dailyRate}/day)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/workers/${worker.id}`}
                          className="px-3.5 py-2 rounded-xl border border-border text-xs font-bold text-text-primary hover:border-forest"
                        >
                          Profile
                        </Link>
                        <Link
                          href={`/booking/new?workerId=${worker.id}&category=${worker.skills?.[0]?.categoryId || 'cat-electrician'}`}
                          className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black shadow-xs flex items-center gap-1"
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
