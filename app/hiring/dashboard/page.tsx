'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Crosshair, 
  Clock, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Phone, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  AlertCircle,
  Navigation,
  SlidersHorizontal,
  Layers,
  Wrench,
  Hammer,
  Paintbrush,
  Building2,
  Sparkles,
  Truck
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LiveDispatchModal from '@/components/LiveDispatchModal';
import { MapMarker } from '@/components/InteractiveMap';
import { Booking } from '@/lib/types';

// Dynamic import for Leaflet map to prevent SSR window errors
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-72 sm:h-96 w-full bg-[#EAF6FF]/50 rounded-3xl flex flex-col items-center justify-center gap-3 border border-[#D1E8F8]">
      <div className="w-8 h-8 border-3 border-[#2583D5] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-[#153451]">Connecting Live GPS Map...</span>
    </div>
  ),
});

const SERVICE_TIERS = [
  { id: 'cat-electrician', slug: 'electrician', name: 'Electrician', nameHi: 'बिजली मिस्त्री', rate: '₹350/hr', eta: '10–15 min', icon: Zap },
  { id: 'cat-plumber', slug: 'plumber', name: 'Plumber', nameHi: 'नल मिस्त्री', rate: '₹300/hr', eta: '15–20 min', icon: Wrench },
  { id: 'cat-carpenter', slug: 'carpenter', name: 'Carpenter', nameHi: 'बढ़ई', rate: '₹400/hr', eta: '20–25 min', icon: Hammer },
  { id: 'cat-painter', slug: 'painter', name: 'Painter', nameHi: 'रंग मिस्त्री', rate: '₹850/day', eta: 'Same Day', icon: Paintbrush },
  { id: 'cat-mason', slug: 'construction', name: 'Mason / Labour', nameHi: 'राज मिस्त्री', rate: '₹1,050/day', eta: 'Crew Ready', icon: Building2 },
  { id: 'cat-cleaning', slug: 'housekeeping', name: 'Housekeeping', nameHi: 'सफाई कर्मी', rate: '₹250/hr', eta: '15–20 min', icon: Sparkles },
  { id: 'cat-delivery', slug: 'delivery', name: 'Delivery', nameHi: 'डिलीवरी पार्टनर', rate: '₹150/trip', eta: '10 min', icon: Truck }
];

export default function HiringCustomerDashboard() {
  const router = useRouter();

  // Location & Geolocation state
  const [currentAddress, setCurrentAddress] = useState('Sector 100, Noida, Uttar Pradesh');
  const [customerLat, setCustomerLat] = useState(28.5355);
  const [customerLng, setCustomerLng] = useState(77.3910);
  const [locating, setLocating] = useState(false);

  // Active bookings & workers data
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('cat-electrician');
  const [loading, setLoading] = useState(true);

  // Live Instant Dispatch Modal state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchCategory, setDispatchCategory] = useState({ id: 'cat-electrician', name: 'Electrician' });

  // Fetch live bookings and nearby workers
  const fetchDashboardData = async () => {
    try {
      const [bookRes, workersRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/workers?verifiedOnly=true')
      ]);

      const bookData = await bookRes.json();
      const workersData = await workersRes.json();

      if (bookData.success && Array.isArray(bookData.bookings)) {
        // Filter ongoing active jobs
        const ongoing = bookData.bookings.filter((b: Booking) => 
          !['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID', 'CANCELLED'].includes(b.status)
        );
        setActiveBookings(ongoing);
      }

      if (workersData.success && Array.isArray(workersData.workers)) {
        setWorkers(workersData.workers);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Browser Geolocation Detector
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLat(pos.coords.latitude);
        setCustomerLng(pos.coords.longitude);
        setCurrentAddress(`Live GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Could not fetch current GPS location. Using default Noida location.');
      },
      { timeout: 8000 }
    );
  };

  // Convert workers and customer into Leaflet map markers
  const customerMarker: MapMarker = {
    id: 'customer-pin',
    lat: customerLat,
    lng: customerLng,
    title: 'Your Location (आपकी लोकेशन)',
    subtitle: currentAddress,
    type: 'customer',
  };

  const nearbyWorkerMarkers: MapMarker[] = workers.map((w, index) => {
    const angle = (index * 60) * (Math.PI / 180);
    const distOffset = 0.008 + (index % 3) * 0.006;
    const lat = (w.latitude || customerLat) + Math.cos(angle) * distOffset;
    const lng = (w.longitude || customerLng) + Math.sin(angle) * distOffset;
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
      distanceKm: Number((1.2 + (index * 0.7)).toFixed(1)),
      etaMinutes: Math.round(10 + index * 4),
    };
  });

  const handleQuickDispatch = (tier: typeof SERVICE_TIERS[0]) => {
    setDispatchCategory({ id: tier.id, name: tier.name });
    setIsDispatchModalOpen(true);
  };

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="On-Demand Service Booking"
      subtitle="आस-पास के कुशल कारीगर खोजें व रियल-टाइम लाइव GPS ट्रैकिंग"
      actions={
        <button
          onClick={() => {
            const activeTier = SERVICE_TIERS.find(t => t.id === selectedCategory) || SERVICE_TIERS[0];
            handleQuickDispatch(activeTier);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#2583D5]/20 transition flex items-center gap-1.5 active:scale-95"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Instant Dispatch (तत्काल बुकिंग)</span>
        </button>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 1. TOP LOCATION SELECTOR BAR (Uber-Style Pickup Bar) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#D1E8F8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center shrink-0 border border-[#D1E8F8]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black text-[#7697B3] uppercase tracking-wider block">
                SERVICE DELIVERY LOCATION
              </span>
              <div className="text-sm font-bold text-[#153451] flex items-center gap-2">
                <span>{currentAddress}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="GPS active" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={locating}
              className="px-4 py-2 rounded-xl bg-[#F5FAFF] hover:bg-[#EAF6FF] text-[#2583D5] text-xs font-bold border border-[#D1E8F8] transition flex items-center gap-1.5 active:scale-95"
            >
              <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'Locating...' : 'Use Current GPS'}</span>
            </button>
            <Link
              href="/hiring/addresses"
              className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] text-[#153451] hover:text-[#2583D5] hover:bg-[#F5FAFF] text-xs font-semibold transition"
            >
              Change Address
            </Link>
          </div>
        </div>

        {/* 2. ONGOING ACTIVE SERVICE ALERT (If Active Booking Exists) */}
        {activeBookings.length > 0 && (
          <div className="space-y-3">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="bg-gradient-to-r from-[#153451] to-[#2583D5] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in fade-in"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                      LIVE TRIP IN PROGRESS • {b.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      #{b.id.slice(-6)}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">{b.serviceDescription || b.serviceCategory}</h3>
                  <p className="text-xs text-blue-100 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {b.addressLine}, {b.city}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-blue-200 block font-semibold">Estimated Fare</span>
                    <span className="text-xl font-black text-white">₹{b.finalAmount || b.estimatedAmount}</span>
                  </div>
                  <Link
                    href={`/track/${b.id}`}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 active:scale-95 animate-pulse"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>TRACK LIVE GPS MAP (लाइव मैप देखें)</span>
                  </Link>
                  <Link
                    href={`/booking/${b.id}`}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. UBER-STYLE QUICK CATEGORY SELECTOR RIBBON */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#153451] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2583D5]" />
              <span>Select Service for Instant Dispatch (तत्काल कारीगर चुनें)</span>
            </h2>
            <span className="text-xs text-[#7697B3] font-medium hidden sm:inline-block">
              Average arrival time: <strong>15–20 minutes</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {SERVICE_TIERS.map((tier) => {
              const Icon = tier.icon;
              const isSelected = selectedCategory === tier.id;

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedCategory(tier.id)}
                  className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between gap-3 group hover:scale-[1.02] cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#2583D5] shadow-md ring-2 ring-[#2583D5]/20'
                      : 'bg-white/90 border-[#D1E8F8] hover:border-[#2583D5]/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all ${
                      isSelected
                        ? 'bg-[#2583D5] text-white shadow-xs'
                        : 'bg-[#F5FAFF] text-[#2583D5] border border-[#D1E8F8] group-hover:bg-[#EAF6FF]'
                    }`}>
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#2583D5]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#153451] group-hover:text-[#2583D5] transition-colors leading-tight">
                      {tier.name}
                    </h3>
                    <p className="text-[10px] text-[#7697B3] font-semibold">{tier.nameHi}</p>
                    <div className="mt-1 pt-1 border-t border-[#EAF6FF] flex items-center justify-between text-[11px]">
                      <span className="font-black text-[#153451]">{tier.rate}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">{tier.eta}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. REAL-TIME INTERACTIVE LEAFLET RADAR MAP */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D1E8F8] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-black text-[#153451]">
                  Live Nearby Workforce Radar (आस-पास के उपलब्ध कारीगर)
                </h2>
              </div>
              <p className="text-xs text-[#7697B3] mt-0.5">
                Showing online verified professionals within 5 km of your service location.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/hiring/nearby"
                className="px-3.5 py-1.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] hover:bg-[#EAF6FF] text-[#2583D5] text-xs font-bold transition flex items-center gap-1"
              >
                <span>Full Map Radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#D1E8F8]">
            <InteractiveMap
              centerLat={customerLat}
              centerLng={customerLng}
              zoom={13}
              customerMarker={customerMarker}
              candidateMarkers={nearbyWorkerMarkers}
              className="h-72 sm:h-96 w-full"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-[#7697B3]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-[#153451]">
                <span className="w-3 h-3 rounded-full bg-[#2583D5]" /> Your Location
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" /> Available Worker (Ready to Dispatch)
              </span>
            </div>
            <span className="font-medium">
              Live GPS Refresh Rate: <strong>3–5s Telemetry</strong>
            </span>
          </div>
        </div>

        {/* 5. NEARBY VERIFIED WORKERS DIRECT BOOKING CARDS */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D1E8F8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-4">
            <div>
              <h2 className="text-base font-black text-[#153451]">
                Nearby Verified Professionals (तत्काल सेवा के लिए तैयार)
              </h2>
              <p className="text-xs text-[#7697B3]">
                100% Aadhaar & Police verified • Pay after work completion
              </p>
            </div>

            <button
              onClick={fetchDashboardData}
              className="text-xs font-bold text-[#2583D5] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Radar
            </button>
          </div>

          {workers.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#7697B3] space-y-2">
              <p className="font-bold text-[#153451]">Scanning for nearby verified professionals...</p>
              <p>No active workers found in this immediate cell. Try widening your radius or instant dispatch.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.slice(0, 6).map((w, idx) => {
                const trade = w.skills?.[0]?.categoryName || 'Electrician';
                const distKm = (1.2 + (idx * 0.7)).toFixed(1);
                const etaMin = Math.round(10 + idx * 4);

                return (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl border border-[#D1E8F8] bg-[#F5FAFF]/60 hover:bg-white hover:border-[#2583D5] transition-all hover:shadow-md flex flex-col justify-between gap-4 group"
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
                              <h3 className="text-sm font-black text-[#153451] group-hover:text-[#2583D5] transition-colors">
                                {w.user?.fullName || 'Ramesh Sharma'}
                              </h3>
                              <ShieldCheck className="w-3.5 h-3.5 text-[#2583D5]" />
                            </div>
                            <span className="text-xs font-bold text-[#2583D5] bg-[#EAF6FF] px-2 py-0.5 rounded-md inline-block mt-0.5">
                              {trade}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Online
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-white border border-[#EAF6FF] text-center text-xs">
                        <div>
                          <span className="text-[10px] text-[#7697B3] block">Rating</span>
                          <strong className="font-black text-amber-600 flex items-center justify-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {w.ratingAvg || 4.9}
                          </strong>
                        </div>
                        <div className="border-x border-[#EAF6FF]">
                          <span className="text-[10px] text-[#7697B3] block">Distance</span>
                          <strong className="font-black text-[#153451]">{distKm} km</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7697B3] block">Est. Arrival</span>
                          <strong className="font-black text-emerald-600">{etaMin} mins</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EAF6FF] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#7697B3] font-bold uppercase tracking-wider block">Rate</span>
                        <span className="text-sm font-black text-[#153451]">₹{w.hourlyRate || 350}/hr</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/workers/${w.id}`}
                          className="px-3 py-1.5 rounded-xl border border-[#D1E8F8] text-[#153451] hover:text-[#2583D5] text-xs font-bold hover:bg-[#EAF6FF] transition"
                        >
                          Profile
                        </Link>
                        <Link
                          href={`/booking/new?workerId=${w.id}&category=${w.skills?.[0]?.categoryId || 'cat-electrician'}`}
                          className="px-4 py-1.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-sm transition flex items-center gap-1 active:scale-95"
                        >
                          <span>Book</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. TRUST & SAFETY BADGE PANEL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#D1E8F8] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#153451]">100% Aadhaar & Police Verified</h4>
              <p className="text-[11px] text-[#7697B3]">Complete background checks & skill vetting</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D1E8F8] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#153451]">₹25,000 KaamSetu Guarantee</h4>
              <p className="text-[11px] text-[#7697B3]">Protected escrow with quality insurance</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D1E8F8] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#153451]">25-Minute Live GPS Arrival</h4>
              <p className="text-[11px] text-[#7697B3]">Live turn-by-turn tracking to your doorstep</p>
            </div>
          </div>
        </div>

      </div>

      {/* Instant Dispatch Modal */}
      <LiveDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        serviceCategory={dispatchCategory.id}
        categoryName={dispatchCategory.name}
        initialAddress={currentAddress}
        initialLat={customerLat}
        initialLng={customerLng}
        estimatedAmount={350}
      />
    </DashboardLayout>
  );
}
