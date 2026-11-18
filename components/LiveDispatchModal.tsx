'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Search, 
  Radar, 
  ShieldCheck, 
  Clock, 
  Star, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Crosshair,
  UserCheck
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { MapMarker } from '@/components/InteractiveMap';

// Dynamically load InteractiveMap to prevent SSR issues
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-80 sm:h-[400px] w-full bg-[#E8ECE9] rounded-2xl flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#173D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface LiveDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceCategory: string;
  categoryName?: string;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
  estimatedAmount?: number;
}

export default function LiveDispatchModal({
  isOpen,
  onClose,
  serviceCategory,
  categoryName = 'Professional Service',
  initialAddress = 'Lotus Boulevard, Sector 100, Noida',
  initialLat = 28.5355,
  initialLng = 77.3910,
  estimatedAmount = 500,
}: LiveDispatchModalProps) {
  const router = useRouter();

  const [customerLat, setCustomerLat] = useState(initialLat);
  const [customerLng, setCustomerLng] = useState(initialLng);
  const [address, setAddress] = useState(initialAddress);
  const [gpsPermission, setGpsPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchRadius, setSearchRadius] = useState<number>(3);
  const [expanded, setExpanded] = useState(false);
  const [discoveredWorkers, setDiscoveredWorkers] = useState<any[]>([]);
  const [selectedWorkerPreview, setSelectedWorkerPreview] = useState<any | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [assignedWorker, setAssignedWorker] = useState<any | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(60);

  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Request actual GPS location
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCustomerLat(pos.coords.latitude);
          setCustomerLng(pos.coords.longitude);
          setAccuracyMeters(Math.round(pos.coords.accuracy));
          setGpsPermission('granted');
        },
        (err) => {
          console.warn('Geolocation denied or timed out:', err.message);
          setGpsPermission('denied');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsPermission('denied');
    }
  }, [isOpen]);

  // Start Discovery and Real-time Dispatch
  useEffect(() => {
    if (!isOpen) return;

    // Connect to Socket.IO
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[DISPATCH] Connected to Socket.IO dispatcher');
    });

    // Listen for worker assignment
    socket.on('booking:worker:assigned', (data: any) => {
      if (data.worker) {
        setAssignedWorker(data.worker);
        setTimeout(() => {
          router.push(`/track/${data.bookingId || activeBookingId}`);
        }, 1800);
      }
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, activeBookingId, router]);

  // Trigger Backend Dispatch
  const handleStartDispatch = async () => {
    setIsSearching(true);
    setSearchRadius(3);
    setExpanded(false);
    setDiscoveredWorkers([]);
    setSelectedWorkerPreview(null);
    setCountdownSeconds(60);

    try {
      const res = await fetch('/api/bookings/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceCategory,
          serviceDescription: `Instant dispatch for ${categoryName}`,
          isUrgent: true,
          addressLine: address,
          customerLatitude: customerLat,
          customerLongitude: customerLng,
          estimatedAmount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveBookingId(data.booking.id);
        setSearchRadius(data.discovery.searchRadiusKm || 3);
        setExpanded(data.discovery.expanded || false);
        setDiscoveredWorkers(data.discovery.workers || []);

        if (socketRef.current) {
          socketRef.current.emit('booking:join', {
            bookingId: data.booking.id,
            userId: 'customer',
            role: 'CUSTOMER',
          });
        }

        // Start countdown timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setCountdownSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger dispatch automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      handleStartDispatch();
    }
  }, [isOpen, customerLat, customerLng]);

  // Format Map Markers
  const customerMarker: MapMarker = {
    id: 'cust-1',
    lat: customerLat,
    lng: customerLng,
    title: 'Your Location',
    type: 'customer',
  };

  const candidateMarkers: MapMarker[] = discoveredWorkers.map((w) => ({
    id: w.id,
    lat: w.latitude,
    lng: w.longitude,
    title: w.user?.fullName || 'Worker',
    type: 'candidate',
    avatarUrl: w.user?.avatarUrl,
    rating: w.ratingAvg,
    distanceKm: w.distanceKm,
    etaMinutes: w.etaMinutes,
    price: w.hourlyRate,
    onClick: () => setSelectedWorkerPreview(w),
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFFFF] border border-[#D4DED5] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-[#173D2B] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B7E36A]/20 text-[#B7E36A] flex items-center justify-center font-bold">
              <Radar className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Live Worker Discovery & Dispatch
                </h2>
                <span className="bg-[#F2A65A] text-[#173D2B] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Real GPS
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Category: <strong className="text-[#B7E36A]">{categoryName}</strong> • Radius:{' '}
                <strong>{searchRadius} km</strong> {expanded && '(Expanded)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Status & Search Radius Banner */}
        <div className="bg-[#F7F7F2] border-b border-[#D4DED5] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[#202820]">
              {gpsPermission === 'granted'
                ? `GPS fix acquired (±${accuracyMeters || 10}m accuracy)`
                : 'Using localized sector coordinates'}
            </span>
          </div>

          <div className="flex items-center gap-3 font-semibold text-[#173D2B]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#F2A65A]" /> Request expires in:{' '}
              <strong className="text-[#F2A65A] font-black">{countdownSeconds}s</strong>
            </span>
            <span className="hidden sm:inline bg-white px-2.5 py-1 rounded-lg border border-[#D4DED5] text-[11px]">
              Found: <strong>{discoveredWorkers.length} online workers</strong>
            </span>
          </div>
        </div>

        {/* Success Modal Toast if Worker Accepted */}
        {assignedWorker && (
          <div className="p-4 bg-[#B7E36A] text-[#173D2B] flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <strong className="text-sm font-black block">
                  {assignedWorker.user?.fullName || 'Worker'} Accepted Your Booking!
                </strong>
                <span className="text-xs">Preparing live telemetry route stream...</span>
              </div>
            </div>
            <span className="text-xs font-bold underline">Redirecting to live map...</span>
          </div>
        )}

        {/* Main Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Real Interactive Map Canvas */}
          <div className="relative">
            <InteractiveMap
              centerLat={customerLat}
              centerLng={customerLng}
              zoom={searchRadius > 5 ? 13 : 14}
              customerMarker={customerMarker}
              candidateMarkers={candidateMarkers}
              searchRadiusKm={searchRadius}
              heightClass="h-72 sm:h-96"
            />

            {/* Floating Radar Pill */}
            <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D4DED5] shadow-md flex items-center gap-2 text-xs font-bold text-[#173D2B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#173D2B] animate-ping" />
              <span>
                {expanded
                  ? `Expanded search to ${searchRadius} km radius`
                  : `Scanning immediate ${searchRadius} km radius`}
              </span>
            </div>
          </div>

          {/* Discovered Candidate Workers Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase text-[#173D2B] tracking-wider">
                Matching Online Professionals Nearby ({discoveredWorkers.length})
              </h3>
              <span className="text-[11px] text-gray-500">
                Sorted by nearest road distance
              </span>
            </div>

            {discoveredWorkers.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#F7F7F2] border border-[#D4DED5] text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-[#F2A65A] mx-auto animate-pulse" />
                <p className="font-bold text-sm text-[#173D2B]">
                  No qualified workers found within {searchRadius} km.
                </p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  All workers in this category may currently be on active jobs. We are automatically broadcasting your request to surrounding sectors.
                </p>
                <button
                  onClick={handleStartDispatch}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#173D2B] text-[#B7E36A] text-xs font-bold hover:bg-[#2D6547] transition"
                >
                  Retry Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {discoveredWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    onClick={() => setSelectedWorkerPreview(worker)}
                    className="p-3 rounded-2xl bg-white border border-[#D4DED5] hover:border-[#173D2B] hover:shadow-md cursor-pointer transition flex items-center gap-3 relative group"
                  >
                    <img
                      src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
                      alt={worker.user?.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-[#D4DED5]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <strong className="text-xs font-bold text-[#173D2B] truncate">
                          {worker.user?.fullName}
                        </strong>
                        {worker.verificationStatus === 'VERIFIED' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 truncate">{worker.headline}</p>
                      
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 font-semibold">
                        <span className="text-amber-600 font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {worker.ratingAvg} ({worker.ratingCount})
                        </span>
                        <span>•</span>
                        <span className="text-[#173D2B] font-bold">
                          {worker.distanceKm} km away
                        </span>
                        <span>•</span>
                        <span>~{worker.etaMinutes} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Worker Profile Preview Modal if a candidate card or marker is clicked */}
        {selectedWorkerPreview && (
          <div className="p-4 bg-[#F7F7F2] border-t border-[#D4DED5] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={selectedWorkerPreview.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
                alt={selectedWorkerPreview.user?.fullName}
                className="w-12 h-12 rounded-2xl object-cover border border-[#D4DED5]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-[#173D2B]">
                    {selectedWorkerPreview.user?.fullName}
                  </h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Verified Pro
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {selectedWorkerPreview.headline} • {selectedWorkerPreview.yearsExperience} yrs exp
                </p>
                <span className="text-xs font-bold text-[#173D2B]">
                  ₹{selectedWorkerPreview.hourlyRate}/hr • Distance: {selectedWorkerPreview.distanceKm} km (ETA: {selectedWorkerPreview.etaMinutes} mins)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedWorkerPreview(null)}
                className="px-3 py-2 rounded-xl bg-white border border-[#D4DED5] text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  if (activeBookingId) {
                    router.push(`/track/${activeBookingId}`);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#173D2B] text-[#B7E36A] text-xs font-bold hover:bg-[#2D6547] flex items-center gap-1.5 shadow-sm"
              >
                Select This Worker <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
