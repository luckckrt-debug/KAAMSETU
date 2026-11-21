'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  AlertCircle,
  FileText,
  DollarSign,
  Crosshair,
  ExternalLink,
  Play,
  Pause,
  Radio,
  LocateFixed,
  AlertTriangle
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Booking } from '@/lib/types';
import { MapMarker } from '@/components/InteractiveMap';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-80 w-full bg-[#EAF6FF]/40 flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#2583D5] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function WorkerActiveJobPage() {
  const [activeJob, setActiveJob] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpsActive, setGpsActive] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsSpeed, setGpsSpeed] = useState<number | null>(null);
  const [gpsHeading, setGpsHeading] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Work proofs
  const [beforeNotes, setBeforeNotes] = useState('Inspected circuit board; fuse terminal corroded.');
  const [afterNotes, setAfterNotes] = useState('Replaced terminal block and tested 16A MCB under load. Working normally.');

  const watchIdRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const lastSentPosRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  // Timer to count "seconds ago" since last GPS fix
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastUpdated) {
        setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const fetchActiveJob = async () => {
    try {
      const res = await fetch('/api/worker/requests');
      const data = await res.json();
      if (data.success && data.activeJob) {
        setActiveJob(data.activeJob);
        
        // Fetch road route to customer destination
        const routeRes = await fetch(`/api/bookings/${data.activeJob.id}/route`);
        const routeData = await routeRes.json();
        if (routeData.success) {
          setRouteInfo(routeData.route);
          if (routeData.workerLocation) {
            setCurrentCoords({
              lat: routeData.workerLocation.latitude,
              lng: routeData.workerLocation.longitude,
            });
            setGpsHeading(routeData.workerLocation.heading || 0);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJob();

    // Check Geolocation permission status
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as any })
        .then((status) => {
          setPermissionState(status.state as any);
          status.onchange = () => setPermissionState(status.state as any);
        })
        .catch(() => {});
    }

    // Socket.IO
    const socket = io();
    socketRef.current = socket;

    return () => {
      stopGpsWatch();
      socket.disconnect();
    };
  }, []);

  const stopGpsWatch = () => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);
  };

  // Broadcast coordinate to backend and socket
  const sendTelemetry = async (lat: number, lng: number, acc: number, spd: number, hdg: number) => {
    if (!activeJob) return;

    try {
      setLastUpdated(new Date());
      setGpsAccuracy(acc);
      setGpsSpeed(spd);
      setGpsHeading(hdg);

      // 1. Post to tracking endpoint
      await fetch('/api/tracking/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeJob.id,
          workerProfileId: activeJob.assignedWorkerProfileId,
          latitude: lat,
          longitude: lng,
          accuracyMeters: acc,
          speed: spd,
          heading: hdg,
        }),
      });

      // 2. Broadcast directly via socket
      if (socketRef.current) {
        socketRef.current.emit('worker:location:update', {
          bookingId: activeJob.id,
          workerProfileId: activeJob.assignedWorkerProfileId,
          latitude: lat,
          longitude: lng,
          accuracyMeters: acc,
          speed: spd,
          heading: hdg,
        });
      }
    } catch (e) {
      console.warn('Telemetry sync error:', e);
    }
  };

  // Start watching location with HTML5 Geolocation API
  const startGeolocation = (bookingData: Booking) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsActive(true);
    setError('');

    // High accuracy watchPosition (updates every ~3-5 seconds when moving)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);
        const spd = pos.coords.speed !== null && pos.coords.speed !== undefined 
          ? Math.round(pos.coords.speed * 3.6) 
          : 22;
        const hdg = pos.coords.heading !== null && pos.coords.heading !== undefined 
          ? Math.round(pos.coords.heading) 
          : 0;

        setCurrentCoords({ lat, lng });

        // Throttle to every 3 seconds unless moving significantly
        const now = Date.now();
        if (!lastSentPosRef.current || now - lastSentPosRef.current.time >= 3000) {
          lastSentPosRef.current = { lat, lng, time: now };
          sendTelemetry(lat, lng, acc, spd, hdg);
        }
      },
      (err) => {
        console.warn('GPS Notice:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission was denied. Please allow location access in your browser settings to share your route.');
          stopGpsWatch();
        } else {
          // Fallback coordinate near customer if GPS has weak satellite fix indoors
          const fallbackLat = bookingData.customerLatitude + 0.015;
          const fallbackLng = bookingData.customerLongitude - 0.012;
          setCurrentCoords({ lat: fallbackLat, lng: fallbackLng });
          sendTelemetry(fallbackLat, fallbackLng, 15, 20, 45);
        }
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
  };

  // Worker starts route -> Requests permission & activates live GPS streaming
  const handleStartRoute = async () => {
    if (!activeJob) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/bookings/${activeJob.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'WORKER_ON_THE_WAY' }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        setActionLoading(false);
        return;
      }

      setActiveJob(data.booking);
      setMessage('Route started! Live GPS telemetry is now broadcasting to customer map.');

      // Start GPS
      startGeolocation(data.booking);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Stop sharing location control
  const handleStopSharing = () => {
    stopGpsWatch();
    setMessage('Location sharing paused. You can resume sharing anytime before reaching the customer.');
  };

  // Resume sharing location control
  const handleResumeSharing = () => {
    if (activeJob) {
      startGeolocation(activeJob);
      setMessage('Location sharing resumed.');
    }
  };

  // Simulate GPS step along route (for local demo & indoor verification)
  const handleSimulateStep = () => {
    if (!activeJob) return;
    const destLat = activeJob.customerLatitude;
    const destLng = activeJob.customerLongitude;
    const originLat = currentCoords ? currentCoords.lat : (destLat + 0.02);
    const originLng = currentCoords ? currentCoords.lng : (destLng - 0.02);

    const nextLat = originLat + (destLat - originLat) * 0.25;
    const nextLng = originLng + (destLng - originLng) * 0.25;

    // Calculate heading towards destination
    const y = Math.sin((destLng - nextLng) * Math.PI / 180) * Math.cos(destLat * Math.PI / 180);
    const x = Math.cos(nextLat * Math.PI / 180) * Math.sin(destLat * Math.PI / 180) -
              Math.sin(nextLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) * Math.cos((destLng - nextLng) * Math.PI / 180);
    const headingDeg = Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360);

    setCurrentCoords({ lat: nextLat, lng: nextLng });
    sendTelemetry(nextLat, nextLng, 6, 28, headingDeg);
    setMessage(`Simulated GPS move sent: ${nextLat.toFixed(4)}, ${nextLng.toFixed(4)} (Heading ${headingDeg}°)`);
  };

  // Worker arrived
  const handleArrived = async () => {
    if (!activeJob) return;
    setActionLoading(true);

    try {
      stopGpsWatch(); // Stop sharing automatically

      const res = await fetch(`/api/bookings/${activeJob.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARRIVED' }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveJob(data.booking);
        setMessage('Status updated: Arrived at destination site. Prepare for work diagnosis.');
        if (socketRef.current) {
          socketRef.current.emit('booking:worker:arrived', { bookingId: activeJob.id });
        }
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Start work
  const handleStartWork = async () => {
    if (!activeJob) return;
    setActionLoading(true);
    stopGpsWatch(); // Ensure stopped

    try {
      const res = await fetch(`/api/bookings/${activeJob.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'WORK_STARTED',
          beforeWorkNotes: beforeNotes,
          beforeWorkImageUrl: '/uploads/jobs/before_work.jpg',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveJob(data.booking);
        setMessage('Work started! Timer and billable hours active.');
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Complete work
  const handleCompleteWork = async () => {
    if (!activeJob) return;
    setActionLoading(true);
    stopGpsWatch(); // Ensure stopped

    try {
      const res = await fetch(`/api/bookings/${activeJob.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'WORK_COMPLETED',
          afterWorkNotes: afterNotes,
          afterWorkImageUrl: '/uploads/jobs/after_work.jpg',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveJob(data.booking);
        setMessage('Work completed! Customer prompted to inspect and release payment.');
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-[#EAF6FF]/60 to-[#F5FAFF] font-bold text-[#7697B3]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2583D5] border-t-transparent rounded-full animate-spin" />
          <p>Loading active job and GPS telemetry...</p>
        </div>
      </div>
    );
  }

  if (!activeJob) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-b from-[#EAF6FF]/60 to-[#F5FAFF] space-y-4">
        <p className="text-[#153451] font-bold text-lg">No active job in progress.</p>
        <Link href="/worker/dashboard" className="px-5 py-2.5 rounded-xl bg-[#2583D5] text-white text-xs font-bold shadow-md">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const customerMarker: MapMarker = {
    id: 'cust-dest',
    lat: activeJob.customerLatitude,
    lng: activeJob.customerLongitude,
    title: 'Customer Site',
    type: 'customer',
  };

  const workerMarker: MapMarker | undefined = currentCoords ? {
    id: 'worker-self',
    lat: currentCoords.lat,
    lng: currentCoords.lng,
    title: 'You (Moving GPS)',
    type: 'worker',
    heading: gpsHeading,
  } : undefined;

  return (
    <DashboardLayout
      role="WORKER"
      title="Live GPS Job Tracking"
      subtitle="सक्रिय काम व रियल-टाइम रूट नेविगेशन"
    >
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/worker/dashboard" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#153451] hover:text-[#2583D5] bg-white px-3 py-1.5 rounded-xl border border-[#D1E8F8] shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-bold bg-[#153451] text-white px-3 py-1 rounded-full shadow-xs">
            Stage: {activeJob.status}
          </span>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {message}
            </span>
            <button onClick={() => setMessage('')} className="text-emerald-700 hover:text-black">✕</button>
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              {error}
            </span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-black">✕</button>
          </div>
        )}

        {/* Customer Site & Contact Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-[#D1E8F8] shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-black text-[#2583D5] uppercase tracking-wider bg-[#EAF6FF] px-2.5 py-0.5 rounded-md border border-[#D1E8F8]">
              Job #{activeJob.id.slice(-6)} • {activeJob.serviceCategory}
            </span>
            <h1 className="text-lg sm:text-xl font-black text-[#153451] mt-2">
              {activeJob.serviceDescription}
            </h1>
          </div>

          <div className="p-3.5 bg-[#F5FAFF] rounded-2xl border border-[#D1E8F8] space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="w-4 h-4 text-[#2583D5] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#153451] block">Customer Address:</span>
                <span className="text-[#4B6F8E]">{activeJob.addressLine}, {activeJob.locality}, {activeJob.city}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D1E8F8] flex items-center justify-between text-xs">
              <span className="text-[#7697B3]">Customer: <strong className="text-[#153451]">{activeJob.customer?.fullName || 'Customer'}</strong></span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeJob.customerLatitude},${activeJob.customerLongitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white border border-[#D1E8F8] text-[#153451] hover:border-[#2583D5] rounded-xl font-bold flex items-center gap-1 text-[11px] transition shadow-xs"
                >
                  Turn-by-Turn <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`tel:${activeJob.customer?.phoneNumber || '9911223344'}`}
                  className="px-3.5 py-1.5 bg-[#2583D5] hover:bg-[#1E70B8] text-white rounded-xl font-bold flex items-center gap-1.5 text-[11px] shadow-xs transition"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Customer
                </a>
              </div>
            </div>
          </div>

          {/* Fee & Wage Summary */}
          <div className="flex justify-between items-center text-xs font-bold pt-1">
            <span className="text-[#7697B3]">Estimated Worker Payout:</span>
            <span className="text-lg font-black text-emerald-600">₹{activeJob.finalAmount || activeJob.estimatedAmount}</span>
          </div>
        </div>

        {/* Live Navigation Road Map for Worker */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 border border-[#D1E8F8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-[#153451] tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#2583D5]" />
              Road Route to Customer Destination
            </h3>
            {routeInfo && (
              <span className="text-xs font-bold text-[#2583D5] bg-[#EAF6FF] px-2.5 py-0.5 rounded-full border border-[#D1E8F8]">
                {routeInfo.formattedDistance} • ~{routeInfo.formattedEta}
              </span>
            )}
          </div>

          <InteractiveMap
            centerLat={activeJob.customerLatitude}
            centerLng={activeJob.customerLongitude}
            zoom={14}
            customerMarker={customerMarker}
            workerMarker={workerMarker}
            routePolyline={routeInfo?.polyline}
            heightClass="h-64 sm:h-80"
          />
        </div>

        {/* WORKER REALTIME GPS TELEMETRY & STAGE ACTION */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-[#D1E8F8] shadow-xs space-y-5">
          
          <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
            <h2 className="text-sm font-black text-[#153451] flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#2583D5]" />
              Live GPS Telemetry & Job Controls
            </h2>
            {gpsActive ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live GPS Active
              </span>
            ) : (
              <span className="text-xs font-semibold text-[#7697B3]">
                GPS Inactive
              </span>
            )}
          </div>

          {/* Real-time Telemetry Dashboard (When GPS active) */}
          {gpsActive && (
            <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8] space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded-xl border border-[#D1E8F8]">
                  <span className="text-[10px] text-[#7697B3] font-semibold block">GPS Accuracy</span>
                  <span className="font-bold text-[#153451]">{gpsAccuracy ? `±${gpsAccuracy}m` : '±6m (High)'}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[#D1E8F8]">
                  <span className="text-[10px] text-[#7697B3] font-semibold block">Last Updated</span>
                  <span className="font-bold text-[#153451]">{secondsAgo}s ago</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[#D1E8F8]">
                  <span className="text-[10px] text-[#7697B3] font-semibold block">Estimated Speed</span>
                  <span className="font-bold text-[#153451]">{gpsSpeed ? `${gpsSpeed} km/h` : '24 km/h'}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[#D1E8F8]">
                  <span className="text-[10px] text-[#7697B3] font-semibold block">Heading</span>
                  <span className="font-bold text-[#153451]">{gpsHeading}°</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#D1E8F8] text-xs">
                <button
                  type="button"
                  onClick={handleStopSharing}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1.5 transition text-[11px]"
                >
                  <Pause className="w-3.5 h-3.5" /> Stop Sharing Location
                </button>
                <button
                  type="button"
                  onClick={handleSimulateStep}
                  className="px-3 py-1.5 rounded-xl border border-[#D1E8F8] bg-white hover:bg-gray-50 text-[#153451] font-bold flex items-center gap-1.5 transition text-[11px]"
                  title="Advance step along route for desktop testing"
                >
                  <Play className="w-3.5 h-3.5 text-[#2583D5]" /> Simulate Move Step
                </button>
              </div>
            </div>
          )}

          {/* STAGE 1: NOT STARTED ROUTE YET */}
          {(activeJob.status === 'ACCEPTED' || activeJob.status === 'WORKER_ASSIGNED') && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EAF6FF] border border-[#D1E8F8] space-y-2 text-xs">
                <span className="font-bold text-[#153451] flex items-center gap-1.5">
                  <LocateFixed className="w-4 h-4 text-[#2583D5]" /> Explicit Location Permission Notice
                </span>
                <p className="text-[#4B6F8E] leading-relaxed">
                  When you tap <strong>&quot;Start Route &amp; Share Live Location&quot;</strong>, your browser will ask for device location permission. Your live GPS coordinates will be shared securely only with this customer during the active trip.
                </p>
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleStartRoute}
                className="w-full py-4 rounded-2xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-sm tracking-wide shadow-md shadow-[#2583D5]/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Navigation className="w-5 h-5 animate-pulse" />
                <span>START ROUTE &amp; SHARE LIVE LOCATION (मार्ग शुरू करें)</span>
              </button>
            </div>
          )}

          {/* STAGE 2: ON THE WAY */}
          {activeJob.status === 'WORKER_ON_THE_WAY' && (
            <div className="space-y-4">
              {!gpsActive && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                  <span>Location sharing is currently paused.</span>
                  <button
                    onClick={handleResumeSharing}
                    className="px-3 py-1 rounded-xl bg-[#2583D5] text-white font-bold text-xs"
                  >
                    Resume GPS Sharing
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleArrived}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>I HAVE ARRIVED AT SITE (पहुंच गए - ARRIVED)</span>
              </button>
            </div>
          )}

          {/* STAGE 3: ARRIVED -> START WORK */}
          {activeJob.status === 'ARRIVED' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-semibold">
                ✓ Location sharing has automatically stopped. You are at the customer doorstep. Inspect work and begin service.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#153451]">Initial Work Diagnosis / Notes:</label>
                <textarea
                  value={beforeNotes}
                  onChange={(e) => setBeforeNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#D1E8F8] bg-white text-xs text-[#153451] font-medium"
                  rows={2}
                />
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleStartWork}
                className="w-full py-3.5 rounded-2xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>START WORK TIMER (कार्य शुरू करें)</span>
              </button>
            </div>
          )}

          {/* STAGE 4: WORK IN PROGRESS -> COMPLETE */}
          {activeJob.status === 'WORK_STARTED' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 rounded-2xl border border-[#D1E8F8] text-xs text-[#153451] font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2583D5] animate-spin" />
                <span>Work in progress. Complete task repairs, clean up work area, and record resolution.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#153451]">Completion Summary &amp; Parts Replaced:</label>
                <textarea
                  value={afterNotes}
                  onChange={(e) => setAfterNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#D1E8F8] bg-white text-xs text-[#153451] font-medium"
                  rows={2}
                />
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCompleteWork}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>COMPLETE JOB &amp; REQUEST PAYMENT (कार्य संपन्न)</span>
              </button>
            </div>
          )}

          {/* STAGE 5: COMPLETED */}
          {(activeJob.status === 'WORK_COMPLETED' || activeJob.status === 'CUSTOMER_CONFIRMED' || activeJob.status === 'PAYMENT_PAID') && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-black text-emerald-900">Job Finished Successfully!</h3>
              <p className="text-xs text-emerald-700 font-medium">
                Customer has been notified to inspect and release ₹{activeJob.finalAmount || activeJob.estimatedAmount} payout to your DigiWork digital wallet.
              </p>
              <Link
                href="/worker/dashboard"
                className="inline-block mt-3 px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs"
              >
                Return to Dashboard
              </Link>
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}
