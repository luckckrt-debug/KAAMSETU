'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Crosshair, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Filter, 
  Zap, 
  Search,
  Navigation,
  CheckCircle2,
  Clock
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LiveDispatchModal from '@/components/LiveDispatchModal';
import { MapMarker } from '@/components/InteractiveMap';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full bg-[#EAF6FF]/50 rounded-3xl flex items-center justify-center border border-[#D1E8F8]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-[#2583D5] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#153451]">Loading Workforce Radar...</span>
      </div>
    </div>
  ),
});

const CATEGORIES = [
  { slug: 'all', name: 'All Trades (सभी काम)' },
  { slug: 'electrician', name: 'Electrician' },
  { slug: 'plumber', name: 'Plumber' },
  { slug: 'carpenter', name: 'Carpenter' },
  { slug: 'painter', name: 'Painter' },
  { slug: 'construction', name: 'Mason / Labour' },
  { slug: 'housekeeping', name: 'Housekeeping' },
  { slug: 'delivery', name: 'Delivery' },
];

export default function NearbyWorkersRadarPage() {
  const [customerLat, setCustomerLat] = useState(28.5355);
  const [customerLng, setCustomerLng] = useState(77.3910);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch('/api/workers?verifiedOnly=true');
        const data = await res.json();
        if (data.success && Array.isArray(data.workers)) {
          setWorkers(data.workers);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchWorkers();
  }, []);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLat(pos.coords.latitude);
        setCustomerLng(pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 7000 }
    );
  };

  // Filter workers based on selected trade and search term
  const filteredWorkers = workers.filter((w) => {
    const trade = (w.skills?.[0]?.categoryName || '').toLowerCase();
    const tradeSlug = (w.skills?.[0]?.categoryId || '').toLowerCase();
    const name = (w.user?.fullName || '').toLowerCase();

    const matchesTrade = selectedTrade === 'all' || trade.includes(selectedTrade) || tradeSlug.includes(selectedTrade);
    const matchesSearch = !searchTerm.trim() || name.includes(searchTerm.toLowerCase()) || trade.includes(searchTerm.toLowerCase());
    return matchesTrade && matchesSearch;
  });

  const customerMarker: MapMarker = {
    id: 'customer-pos',
    lat: customerLat,
    lng: customerLng,
    title: 'Your Location',
    subtitle: 'Service Location',
    type: 'customer',
  };

  const nearbyMarkers: MapMarker[] = filteredWorkers.map((w, index) => {
    const angle = (index * 45) * (Math.PI / 180);
    const offset = 0.007 + (index % 4) * 0.005;
    const lat = (w.latitude || customerLat) + Math.cos(angle) * offset;
    const lng = (w.longitude || customerLng) + Math.sin(angle) * offset;
    const trade = w.skills?.[0]?.categoryName || 'Electrician';

    return {
      id: w.id,
      lat,
      lng,
      title: w.user?.fullName || 'Worker',
      subtitle: `${trade} • ₹${w.hourlyRate || 350}/hr`,
      type: 'worker',
      rating: w.ratingAvg || 4.9,
      price: w.hourlyRate || 350,
      avatarUrl: w.user?.avatarUrl,
      distanceKm: Number((1.1 + (index * 0.6)).toFixed(1)),
      etaMinutes: Math.round(10 + index * 3),
    };
  });

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Nearby Workforce Radar"
      subtitle="रियल-टाइम लाइव मैप पर आस-पास के उपलब्ध कारीगर खोजें व तत्काल बुक करें"
      actions={
        <button
          onClick={() => setIsDispatchOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Auto-Dispatch Nearest</span>
        </button>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7697B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by worker name, trade or skill..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF]/60 text-xs text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
              />
            </div>

            {/* Radius Slider & GPS button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#153451]">
                <span>Radius:</span>
                <span className="text-[#2583D5] bg-[#EAF6FF] px-2.5 py-1 rounded-lg border border-[#D1E8F8]">
                  {maxDistanceKm} km
                </span>
                <input
                  type="range"
                  min="2"
                  max="25"
                  value={maxDistanceKm}
                  onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                  className="w-24 accent-[#2583D5] cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={locating}
                className="px-3.5 py-2 rounded-xl bg-[#EAF6FF] hover:bg-[#D9EEFF] text-[#2583D5] text-xs font-bold transition flex items-center gap-1"
              >
                <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Locating...' : 'My GPS'}</span>
              </button>
            </div>
          </div>

          {/* Trade Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EAF6FF]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedTrade(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedTrade === cat.slug
                    ? 'bg-[#2583D5] text-white shadow-sm'
                    : 'bg-[#F5FAFF] hover:bg-[#EAF6FF] text-[#153451] border border-[#D1E8F8]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Map Radar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D1E8F8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-black text-[#153451]">
                Interactive Geolocation Radar ({filteredWorkers.length} Active Professionals)
              </h2>
            </div>
            <span className="text-xs text-[#7697B3]">
              Click on any pin to view details and book
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#D1E8F8]">
            <InteractiveMap
              centerLat={customerLat}
              centerLng={customerLng}
              zoom={13}
              customerMarker={customerMarker}
              candidateMarkers={nearbyMarkers}
              className="h-[440px] w-full"
            />
          </div>
        </div>

        {/* Filtered Workers Card Grid */}
        <div className="space-y-4">
          <h3 className="text-base font-black text-[#153451]">
            Available Nearby Workers List
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((w, idx) => {
              const trade = w.skills?.[0]?.categoryName || 'Electrician';
              const distKm = (1.1 + (idx * 0.6)).toFixed(1);
              const etaMin = Math.round(10 + idx * 3);

              return (
                <div
                  key={w.id}
                  className="bg-white p-5 rounded-2xl border border-[#D1E8F8] shadow-sm hover:border-[#2583D5] transition-all hover:shadow-md flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={w.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
                          alt={w.user?.fullName}
                          className="w-12 h-12 rounded-xl object-cover border border-[#D1E8F8]"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="text-sm font-black text-[#153451]">
                              {w.user?.fullName || 'Worker'}
                            </h4>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#2583D5]" />
                          </div>
                          <span className="text-xs font-bold text-[#2583D5] bg-[#EAF6FF] px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {trade}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Online
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-[#F5FAFF] border border-[#EAF6FF]">
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {w.ratingAvg || 4.9}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-[#153451] font-semibold">{distKm} km away</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-emerald-600 font-bold">~{etaMin} mins</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EAF6FF] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#7697B3] font-bold block uppercase">Standard Rate</span>
                      <strong className="text-sm font-black text-[#153451]">₹{w.hourlyRate || 350}/hr</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/workers/${w.id}`}
                        className="px-3 py-1.5 rounded-xl border border-[#D1E8F8] text-[#153451] hover:text-[#2583D5] text-xs font-bold transition"
                      >
                        Profile
                      </Link>
                      <Link
                        href={`/booking/new?workerId=${w.id}&category=${w.skills?.[0]?.categoryId || 'cat-electrician'}`}
                        className="px-4 py-1.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-sm transition flex items-center gap-1"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <LiveDispatchModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        serviceCategory="cat-electrician"
        categoryName="Electrician"
        initialAddress="Noida, Uttar Pradesh"
        initialLat={customerLat}
        initialLng={customerLng}
        estimatedAmount={350}
      />
    </DashboardLayout>
  );
}
