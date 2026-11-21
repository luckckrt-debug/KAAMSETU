'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  RefreshCw, 
  Crosshair, 
  ArrowLeft, 
  Share2, 
  AlertOctagon, 
  X, 
  Star, 
  Shield, 
  ExternalLink,
  Radio,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { MapMarker } from '@/components/InteractiveMap';
import { formatDistance, formatEta } from '@/lib/geo';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full bg-[#EAF6FF]/40 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-[#2583D5] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#153451]">Connecting Live GPS Map...</span>
      </div>
    </div>
  ),
});

export default function LiveTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [trackingData, setTrackingData] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [followWorker, setFollowWorker] = useState(true);

  // Modals & Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [actionLoading, setActionLoading] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const socketRef = useRef<Socket | null>(null);

  // 1. Fetch initial tracking status & road route
  const fetchTrackingAndRoute = async () => {
    try {
      const [trackRes, routeRes] = await Promise.all([
        fetch(`/api/tracking/${bookingId}`),
        fetch(`/api/bookings/${bookingId}/route`),
      ]);

      const trackJson = await trackRes.json();
      if (trackJson.success) {
        setTrackingData(trackJson);
      }

      const routeJson = await routeRes.json();
      if (routeJson.success) {
        setRouteInfo(routeJson.route);
      }
    } catch (e) {
      console.error('Error fetching tracking or route:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingAndRoute();

    // 2. Setup Socket.IO connection
    const socket = io({
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('booking:join', { bookingId, userId: 'customer', role: 'CUSTOMER' });
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // Worker Location Live Stream
    const handleLocationUpdate = (liveUpdate: any) => {
      setTrackingData((prev: any) => {
        if (!prev) return prev;
        const currentLoc = {
          latitude: liveUpdate.latitude,
          longitude: liveUpdate.longitude,
          accuracyMeters: liveUpdate.accuracyMeters,
          speed: liveUpdate.speed,
          heading: liveUpdate.heading,
          recordedAt: liveUpdate.recordedAt || new Date().toISOString(),
        };

        return {
          ...prev,
          liveLocationAvailable: true,
          currentLocation: currentLoc,
          distanceKm: liveUpdate.distanceKm ?? prev.distanceKm,
          formattedDistance: liveUpdate.formattedDistance ?? prev.formattedDistance,
          etaMinutes: liveUpdate.etaMinutes ?? prev.etaMinutes,
          formattedEta: liveUpdate.formattedEta ?? prev.formattedEta,
          isStale: false,
          staleWarning: null,
        };
      });
    };

    socket.on('worker:location:update', handleLocationUpdate);
    socket.on('location:stream', handleLocationUpdate);

    // Lifecycle Status Changes
    socket.on('booking:status:updated', (data: any) => {
      setTrackingData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          booking: {
            ...prev.booking,
            status: data.status,
          },
        };
      });
    });

    socket.on('booking:worker:arrived', () => {
      setTrackingData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          booking: { ...prev.booking, status: 'ARRIVED' },
        };
      });
    });

    // In-app chat messages
    socket.on('chat:received', (msg: any) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // High-frequency polling fallback (every 3.5 seconds) for real-time live GPS tracking
    const interval = setInterval(fetchTrackingAndRoute, 3500);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [bookingId]);

  // Send Chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socketRef.current) return;

    const payload = {
      bookingId,
      senderId: 'customer',
      senderName: trackingData?.booking?.customer?.fullName || 'You (Customer)',
      senderRole: 'CUSTOMER',
      message: inputMessage.trim(),
    };

    socketRef.current.emit('chat:send', payload);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        bookingId,
        senderId: 'customer',
        senderName: 'You',
        senderRole: 'CUSTOMER',
        message: inputMessage.trim(),
        sentAt: new Date().toISOString(),
      },
    ]);
    setInputMessage('');
  };

  // Cancel Booking
  const handleCancelBooking = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          cancellationReason: cancelReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCancelModalOpen(false);
        if (socketRef.current) {
          socketRef.current.emit('booking:cancelled', { bookingId, reason: cancelReason });
        }
        router.push(`/booking/${bookingId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#EAF6FF]/60 via-[#F5FAFF] to-[#EAF6FF]/40">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2583D5] border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-sm text-[#153451]">Connecting to live worker GPS telemetry...</p>
        </div>
      </div>
    );
  }

  const booking = trackingData?.booking;
  const worker = booking?.assignedWorker;
  const loc = trackingData?.currentLocation;

  const customerLat = booking?.customerLatitude || 28.5355;
  const customerLng = booking?.customerLongitude || 77.3910;
  const workerLat = loc?.latitude || worker?.latitude || customerLat + 0.018;
  const workerLng = loc?.longitude || worker?.longitude || customerLng - 0.015;

  // Status Lifecycle Stepper Info
  const statusSteps = [
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'WORKER_ON_THE_WAY', label: 'On The Way' },
    { key: 'ARRIVED', label: 'Arrived' },
    { key: 'WORK_STARTED', label: 'In Progress' },
    { key: 'WORK_COMPLETED', label: 'Completed' },
  ];

  const currentStatus = booking?.status || 'WORKER_ON_THE_WAY';
  const currentStepIndex = statusSteps.findIndex(s => s.key === currentStatus);

  // Markers for Map
  const customerMarker: MapMarker = {
    id: 'cust-marker',
    lat: customerLat,
    lng: customerLng,
    title: 'Your Location (Destination)',
    type: 'customer',
  };

  const workerMarker: MapMarker = {
    id: 'worker-marker',
    lat: workerLat,
    lng: workerLng,
    title: worker?.user?.fullName || 'Assigned Worker',
    type: 'worker',
    avatarUrl: worker?.user?.avatarUrl,
    heading: loc?.heading || 45,
    distanceKm: trackingData?.distanceKm || routeInfo?.distanceKm,
    etaMinutes: trackingData?.etaMinutes || routeInfo?.durationMinutes,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF6FF]/60 via-[#F5FAFF] to-[#EAF6FF]/40 py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Top Header Floating Strip */}
        <div className="flex items-center justify-between">
          <Link
            href={`/booking/${bookingId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#153451] hover:text-[#2583D5] bg-white px-3.5 py-2 rounded-xl border border-[#D1E8F8] shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" /> Booking Details
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#153451] bg-white px-3 py-1.5 rounded-xl border border-[#D1E8F8] shadow-xs">
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-ping' : 'bg-[#2583D5] animate-pulse'}`} />
              {socketConnected ? 'Realtime Live GPS' : 'GPS Telemetry Active'}
            </span>

            <button
              onClick={() => setIsSosModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition shadow-xs"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>SOS Safety</span>
            </button>
          </div>
        </div>

        {/* Stale or Accuracy Alerts */}
        {trackingData?.staleWarning && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{trackingData.staleWarning}. Displaying last confirmed GPS coordinates.</span>
            </div>
            <button
              onClick={fetchTrackingAndRoute}
              className="text-amber-900 underline text-[11px] font-bold shrink-0"
            >
              Force Sync
            </button>
          </div>
        )}

        {/* Uber / Rapido Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Main Map View Column */}
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-[#D1E8F8] shadow-md overflow-hidden flex flex-col">
            
            {/* Map Top Floating Header Banner */}
            <div className="bg-[#153451] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-[#60B5F5] font-black uppercase tracking-wider block">
                  {currentStatus === 'ARRIVED'
                    ? 'Worker Has Arrived at Doorstep • पहुंच गए'
                    : currentStatus === 'WORK_STARTED'
                    ? 'Work in Progress at Site • कार्य जारी है'
                    : currentStatus === 'WORK_COMPLETED'
                    ? 'Work Completed • कार्य संपन्न'
                    : 'Worker on the Way • रास्ते में'}
                </span>
                
                <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                  <Navigation className="w-5 h-5 text-[#60B5F5] animate-pulse" />
                  <span>
                    ETA: {trackingData?.formattedEta || routeInfo?.formattedEta || '15 mins'}
                  </span>
                  <span className="text-xs text-slate-300 font-normal">
                    ({trackingData?.formattedDistance || routeInfo?.formattedDistance || '3.2 km'} away)
                  </span>
                </div>
              </div>

              {loc && (
                <div className="text-right text-[11px] text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                  <div>GPS Accuracy: <strong className="text-white">±{loc.accuracyMeters || 8} m</strong></div>
                  <div>Live Speed: <strong className="text-white">{Math.round(loc.speed || 22)} km/h</strong></div>
                </div>
              )}
            </div>

            {/* Real Interactive Map Component with Blue Road Route */}
            <div className="relative">
              <InteractiveMap
                centerLat={customerLat}
                centerLng={customerLng}
                zoom={14}
                customerMarker={customerMarker}
                workerMarker={workerMarker}
                routePolyline={routeInfo?.polyline}
                followWorker={followWorker}
                onFollowToggle={(val) => setFollowWorker(val)}
                heightClass="h-96 sm:h-[480px]"
              />

              {/* Road Provider & Live Coordinates Pill */}
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#D1E8F8] shadow-md flex items-center justify-between sm:justify-start gap-4 text-xs font-semibold z-[400]">
                <div className="flex items-center gap-1.5 text-[#153451]">
                  <Crosshair className="w-3.5 h-3.5 text-[#2583D5]" />
                  <span>
                    {loc ? `Lat: ${loc.latitude.toFixed(4)}, Lng: ${loc.longitude.toFixed(4)}` : 'GPS Calibrated'}
                  </span>
                </div>
                <span className="text-[10px] text-[#7697B3] font-normal">
                  Road Engine: <strong className="text-[#2583D5] uppercase">{routeInfo?.provider || 'Urban Grid'}</strong>
                </span>
              </div>
            </div>

            {/* Destination Address Bar */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-[#EAF6FF] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <MapPin className="w-4 h-4 text-[#2583D5] shrink-0" />
                <span className="text-[#4B6F8E] truncate">
                  Destination: <strong className="text-[#153451] font-bold">{booking?.addressLine}, {booking?.city}</strong>
                </span>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${customerLat},${customerLng}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#2583D5] font-bold hover:underline shrink-0 flex items-center gap-1"
              >
                Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

          {/* Uber / Rapido Floating Bottom & Right Info Column */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* 5-Stage Job Lifecycle Stepper */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 border border-[#D1E8F8] shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#7697B3] block">
                Job Progress Status
              </span>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {statusSteps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  return (
                    <div key={step.key} className="space-y-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCurrent
                            ? 'bg-[#2583D5] ring-2 ring-[#2583D5]/30'
                            : isDone
                            ? 'bg-emerald-500'
                            : 'bg-gray-200'
                        }`} 
                      />
                      <span className={`text-[9px] block font-bold leading-tight ${isCurrent ? 'text-[#2583D5]' : isDone ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assigned Worker Profile Card */}
            {worker ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 border border-[#D1E8F8] shadow-xs space-y-4">
                
                {/* Worker Avatar & Info */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
                      alt={worker.user?.fullName}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-[#153451] text-base truncate">
                        {worker.user?.fullName}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-xs font-bold text-[#2583D5] truncate">{booking?.serviceCategory || worker.headline}</p>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-amber-600 font-black flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {worker.ratingAvg || 4.9}
                      </span>
                      <span className="text-[#D1E8F8]">•</span>
                      <span className="text-[#4B6F8E] font-semibold">
                        {worker.completedJobsCount || 42} jobs done
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons: Call & Chat */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAF6FF]">
                  <a
                    href={`tel:${worker.user?.phoneNumber || '9876543210'}`}
                    className="py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-[#2583D5]/20 transition active:scale-95"
                  >
                    <Phone className="w-4 h-4" /> Call Worker
                  </a>

                  <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="py-2.5 rounded-xl bg-white hover:bg-[#F5FAFF] text-[#153451] border border-[#D1E8F8] hover:border-[#2583D5] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4 text-[#2583D5]" /> Chat ({chatMessages.length})
                  </button>
                </div>

                {/* Security PIN & Trip Sharing Bar */}
                <div className="pt-2 border-t border-[#EAF6FF] flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Track My DigiWork Service',
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Live tracking link copied to clipboard!');
                      }
                    }}
                    className="text-[#4B6F8E] hover:text-[#2583D5] font-semibold flex items-center gap-1 text-[11px] transition"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Trip
                  </button>

                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    100% Escrow Protected
                  </span>

                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="text-gray-400 hover:text-rose-600 text-[11px] font-medium underline transition"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 border border-[#D1E8F8] shadow-xs text-center space-y-2">
                <span className="text-xs font-bold text-[#153451]">Matching nearby verified tradesperson...</span>
                <p className="text-[11px] text-[#7697B3]">Once accepted, live GPS telemetry and profile will appear here.</p>
              </div>
            )}

            {/* In-app Live Chat Drawer / Panel */}
            {isChatOpen && (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 border border-[#D1E8F8] shadow-md space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#EAF6FF]">
                  <span className="text-xs font-bold text-[#153451] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#2583D5]" /> Live Trip Chat
                  </span>
                  <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-44 overflow-y-auto space-y-2 text-xs pr-1">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-[11px]">
                      Direct messaging active. Message worker regarding landmark or entry gate.
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl max-w-[85%] ${
                          msg.senderRole === 'CUSTOMER'
                            ? 'ml-auto bg-[#2583D5] text-white'
                            : 'mr-auto bg-[#F5FAFF] border border-[#D1E8F8] text-[#153451]'
                        }`}
                      >
                        <span className="text-[9px] block opacity-75 font-semibold">{msg.senderName}</span>
                        <span>{msg.message}</span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type message to worker..."
                    className="flex-1 px-3 py-2 rounded-xl border border-[#D1E8F8] bg-white text-xs text-[#153451] focus:outline-none focus:border-[#2583D5]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Safety Guarantee Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 border border-[#D1E8F8] shadow-xs text-xs text-[#4B6F8E] space-y-2">
              <div className="flex items-center gap-2 text-[#153451] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>DigiWork Safety &amp; Trust Guarantee</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Your worker is Aadhaar verified with active police character clearance. Payments are held safely in escrow until you inspect and approve completed work.
              </p>
            </div>

          </div>

        </div>

        {/* SOS Emergency Modal */}
        {isSosModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-200">
              <div className="flex items-center gap-3 text-rose-700">
                <AlertOctagon className="w-8 h-8" />
                <div>
                  <h3 className="font-black text-base text-rose-950">Emergency Safety Support</h3>
                  <p className="text-xs text-rose-800">24/7 Immediate Assistance Hotline</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                If you feel unsafe or experience an urgent situation, contact local law enforcement or the DigiWork rapid incident team immediately.
              </p>

              <div className="space-y-2 pt-2">
                <a
                  href="tel:112"
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase text-center block tracking-wide shadow-md"
                >
                  CALL POLICE EMERGENCY (112)
                </a>
                <a
                  href="tel:18003444967"
                  className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 font-bold text-xs text-center block"
                >
                  DigiWork Trust Team: 1800-DIGIWORK
                </a>
                <button
                  type="button"
                  onClick={() => setIsSosModalOpen(false)}
                  className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-black text-center"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Booking Modal */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#D1E8F8]">
              <h3 className="font-black text-base text-[#153451]">Cancel Booking?</h3>
              <p className="text-xs text-[#4B6F8E]">
                Worker is en route. Cancellation within 5 minutes of dispatch is 100% free with zero cancellation penalty.
              </p>

              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D1E8F8] text-xs font-semibold text-[#153451] bg-[#F5FAFF]"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Booked by mistake">Booked by mistake</option>
                <option value="Issue resolved myself">Issue resolved myself</option>
                <option value="ETA too long">ETA is longer than expected</option>
              </select>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleCancelBooking}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                >
                  {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#D1E8F8] text-xs font-bold text-[#153451] hover:bg-gray-50"
                >
                  Keep Booking
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
