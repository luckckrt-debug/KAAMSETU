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
  AlertTriangle, 
  Send, 
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Crosshair,
  ArrowLeft,
  Share2,
  AlertOctagon,
  X,
  ChevronUp,
  ChevronDown,
  Compass,
  Star,
  Shield,
  ExternalLink
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { MapMarker } from '@/components/InteractiveMap';
import { formatDistance, formatEta } from '@/lib/geo';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full bg-[#E8ECE9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-[#173D2B] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#173D2B]">Initializing Satellite Map...</span>
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

    // Polling fallback every 10 seconds
    const interval = setInterval(fetchTrackingAndRoute, 10000);

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
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#173D2B] border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-sm text-[#173D2B]">Locking on live worker GPS telemetry...</p>
        </div>
      </div>
    );
  }

  const booking = trackingData?.booking;
  const worker = booking?.assignedWorker;
  const loc = trackingData?.currentLocation;

  const customerLat = booking?.customerLatitude || 28.5355;
  const customerLng = booking?.customerLongitude || 77.3910;
  const workerLat = loc?.latitude || worker?.latitude || customerLat + 0.02;
  const workerLng = loc?.longitude || worker?.longitude || customerLng - 0.02;

  // Status Lifecycle Stepper Info
  const statusSteps = [
    { key: 'REQUESTED', label: 'Requested' },
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
    title: 'Your Location',
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
    <div className="min-h-screen bg-[#F7F7F2] py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/booking/${bookingId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173D2B] hover:underline bg-white px-3 py-1.5 rounded-xl border border-[#D4DED5] shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Booking Details
          </Link>

          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${socketConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
            <span className="text-xs font-bold text-gray-700 bg-white px-3 py-1.5 rounded-xl border border-[#D4DED5]">
              {socketConnected ? 'Socket.IO Satellite Active' : 'Connecting Telemetry...'}
            </span>
          </div>
        </div>

        {/* Stale or Accuracy Alerts */}
        {trackingData?.staleWarning && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Location telemetry delayed ({trackingData.staleWarning}). Displaying last confirmed GPS fix.</span>
            </div>
            <button
              onClick={fetchTrackingAndRoute}
              className="text-amber-900 underline text-[11px] font-bold shrink-0"
            >
              Force Refresh
            </button>
          </div>
        )}

        {/* Uber / Rapido Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Main Map View Column */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#D4DED5] shadow-lg overflow-hidden flex flex-col">
            
            {/* Map Top Floating Header */}
            <div className="bg-[#173D2B] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#B7E36A] font-bold uppercase tracking-wider block">
                  {currentStatus === 'ARRIVED'
                    ? 'Worker Has Arrived at Location'
                    : currentStatus === 'WORK_STARTED'
                    ? 'Work in Progress at Site'
                    : currentStatus === 'WORK_COMPLETED'
                    ? 'Work Finished • Awaiting Confirmation'
                    : 'En Route to Destination • रास्ते में'}
                </span>
                
                <div className="text-lg sm:text-xl font-black text-white flex items-center gap-2 mt-0.5">
                  <Navigation className="w-5 h-5 text-[#F2A65A] animate-pulse" />
                  <span>
                    ETA: {trackingData?.formattedEta || routeInfo?.formattedEta || '15 mins'}
                  </span>
                  <span className="text-xs text-gray-300 font-normal">
                    ({trackingData?.formattedDistance || routeInfo?.formattedDistance || '3.2 km'} away)
                  </span>
                </div>
              </div>

              {loc && (
                <div className="text-right text-[11px] text-gray-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                  <div>GPS Accuracy: <strong className="text-white">±{loc.accuracyMeters || 10} m</strong></div>
                  <div>Live Speed: <strong className="text-white">{Math.round(loc.speed || 24)} km/h</strong></div>
                </div>
              )}
            </div>

            {/* Real Interactive Map Component with Road Route Polyline */}
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
                heightClass="h-96 sm:h-[460px]"
              />

              {/* Road Provider & Live Coordinate Pill */}
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#D4DED5] shadow-md flex items-center justify-between sm:justify-start gap-4 text-xs font-semibold z-[400]">
                <div className="flex items-center gap-1.5 text-[#173D2B]">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>
                    {loc ? `Lat: ${loc.latitude.toFixed(4)}, Lng: ${loc.longitude.toFixed(4)}` : 'GPS Calibrated'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-normal">
                  Road Engine: <strong className="text-[#173D2B] uppercase">{routeInfo?.provider || 'Urban Grid'}</strong>
                </span>
              </div>
            </div>

            {/* Destination Address Bar */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-[#D4DED5] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <MapPin className="w-4 h-4 text-[#173D2B] shrink-0" />
                <span className="text-gray-600 truncate">
                  Destination: <strong className="text-[#173D2B] font-bold">{booking?.addressLine}, {booking?.city}</strong>
                </span>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${customerLat},${customerLng}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#2D6547] font-bold hover:underline shrink-0 flex items-center gap-1"
              >
                Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

          {/* Uber / Rapido Bottom / Right Column Card */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Assigned Worker Profile Card */}
            {worker ? (
              <div className="bg-white rounded-3xl p-5 border border-[#D4DED5] shadow-md space-y-4">
                
                {/* Worker Avatar & Info */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
                      alt={worker.user?.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#173D2B]"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-[#173D2B] text-base truncate">
                        {worker.user?.fullName}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-xs text-gray-600 truncate">{worker.headline}</p>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-amber-600 font-black flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {worker.ratingAvg}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 font-semibold">
                        {worker.completedJobsCount || 42} jobs done
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons: Call & Chat */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D4DED5]">
                  <a
                    href={`tel:${worker.user?.phoneNumber || '9876543210'}`}
                    className="py-2.5 rounded-xl bg-[#173D2B] hover:bg-[#2D6547] text-[#B7E36A] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                  >
                    <Phone className="w-4 h-4" /> Call Worker
                  </a>

                  <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="py-2.5 rounded-xl bg-[#F7F7F2] hover:bg-[#E8ECE9] text-[#173D2B] border border-[#D4DED5] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat ({chatMessages.length})
                  </button>
                </div>

                {/* Safety & SOS Bar */}
                <div className="pt-2 border-t border-[#D4DED5] flex items-center justify-between text-xs">
                  <button
                    onClick={() => setIsSosModalOpen(true)}
                    className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" /> Emergency SOS
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Track My KAAMSETU Service',
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Tracking link copied to clipboard!');
                      }
                    }}
                    className="text-gray-600 hover:text-[#173D2B] font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Trip
                  </button>

                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="text-gray-500 hover:text-red-600 text-[11px] font-semibold underline"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-[#D4DED5] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#F7F7F2] border border-[#D4DED5] flex items-center justify-center mx-auto text-[#173D2B]">
                  <Compass className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="font-black text-base text-[#173D2B]">Searching Nearby Professionals</h3>
                <p className="text-xs text-gray-600">
                  We are automatically broadcasting this request to verified workers in your sector.
                </p>
              </div>
            )}

            {/* Realtime In-App Chat Box (Collapsible / Toggleable) */}
            {isChatOpen && (
              <div className="bg-white rounded-3xl border border-[#D4DED5] shadow-lg flex flex-col h-80 animate-fadeIn">
                <div className="p-3.5 border-b border-[#D4DED5] flex items-center justify-between bg-[#F7F7F2] rounded-t-3xl">
                  <span className="font-bold text-xs text-[#173D2B] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#2D6547]" /> Direct Chat with Worker
                  </span>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-400 text-[11px] py-10">
                      Send a message to share gate entry codes or landmark directions.
                    </div>
                  )}

                  {chatMessages.map((m: any, i: number) => {
                    const isMe = m.senderRole === 'CUSTOMER';
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[9px] text-gray-400 mb-0.5 font-semibold">
                          {m.senderName}
                        </span>
                        <div
                          className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                            isMe
                              ? 'bg-[#173D2B] text-[#B7E36A] rounded-br-none'
                              : 'bg-[#F7F7F2] text-[#202820] rounded-bl-none border border-[#D4DED5]'
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-2.5 border-t border-[#D4DED5] flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] text-xs font-medium focus:outline-none focus:border-[#173D2B]"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-[#173D2B] text-[#B7E36A] hover:bg-[#2D6547] transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Lifecycle Progress Stepper */}
            <div className="bg-white rounded-3xl p-5 border border-[#D4DED5] shadow-xs space-y-3">
              <h4 className="text-xs font-black uppercase text-[#173D2B] tracking-wider">
                Booking Progress Status
              </h4>

              <div className="space-y-2">
                {statusSteps.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-[#173D2B] text-[#B7E36A] ring-4 ring-[#B7E36A]/30 animate-pulse'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-xs ${
                          isCurrent
                            ? 'font-black text-[#173D2B]'
                            : isDone
                            ? 'font-semibold text-gray-700'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D4DED5] shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#173D2B]">Cancel Booking Request?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to cancel this booking? If the worker is already on the way, a nominal convenience fee may apply.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">Select Reason:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D4DED5] text-xs font-semibold focus:outline-none focus:border-[#173D2B]"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Worker taking too long">Worker taking too long</option>
                <option value="Booked by mistake">Booked by mistake</option>
                <option value="Found another solution">Found another solution</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency SOS Modal */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-300 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-red-800">KAAMSETU Emergency Safety SOS</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your safety is our highest priority. In case of emergency or safety violation, call our 24/7 dedicated trust desk or local law enforcement.
            </p>

            <div className="space-y-2 pt-2">
              <a
                href="tel:112"
                className="w-full py-3 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Phone className="w-4 h-4" /> Dial National Emergency (112)
              </a>
              <a
                href="tel:18001234567"
                className="w-full py-3 rounded-xl bg-[#173D2B] text-[#B7E36A] text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" /> Call KAAMSETU Safety Desk
              </a>
            </div>

            <button
              onClick={() => setIsSosModalOpen(false)}
              className="w-full py-2 text-xs font-semibold text-gray-500 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
