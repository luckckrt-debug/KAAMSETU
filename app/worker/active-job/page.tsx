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
  Play
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Booking } from '@/lib/types';
import { MapMarker } from '@/components/InteractiveMap';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-80 w-full bg-[#E8ECE9] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#173D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function WorkerActiveJobPage() {
  const [activeJob, setActiveJob] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpsActive, setGpsActive] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Work proofs
  const [beforeNotes, setBeforeNotes] = useState('Inspected circuit board; fuse terminal corroded.');
  const [afterNotes, setAfterNotes] = useState('Replaced terminal block and tested 16A MCB under load. Working normally.');

  const watchIdRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

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

    // Socket.IO
    const socket = io();
    socketRef.current = socket;

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socket.disconnect();
    };
  }, []);

  // Broadcast coordinate to backend and socket
  const sendTelemetry = async (lat: number, lng: number, acc: number, spd: number) => {
    if (!activeJob) return;

    try {
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
        });
      }
    } catch (e) {
      console.warn('Telemetry sync error:', e);
    }
  };

  // Worker starts route -> activates live GPS streaming
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
      setMessage('Route started! Live GPS telemetry broadcasting to customer map.');

      // Start geolocation watcher
      if (navigator.geolocation) {
        setGpsActive(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const acc = Math.round(pos.coords.accuracy);
            const spd = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 26;

            setCurrentCoords({ lat, lng });
            sendTelemetry(lat, lng, acc, spd);
          },
          (err) => {
            console.warn('GPS Watch Notice:', err.message);
            // Default fallback telemetry coordinate so customer tracking stays connected
            const fallbackLat = data.booking.customerLatitude + 0.015;
            const fallbackLng = data.booking.customerLongitude - 0.012;
            setCurrentCoords({ lat: fallbackLat, lng: fallbackLng });
            sendTelemetry(fallbackLat, fallbackLng, 15, 24);
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Simulate GPS step along route (helpful for local verification without physically riding a motorcycle)
  const handleSimulateStep = () => {
    if (!activeJob || !currentCoords) return;
    const destLat = activeJob.customerLatitude;
    const destLng = activeJob.customerLongitude;

    const nextLat = currentCoords.lat + (destLat - currentCoords.lat) * 0.25;
    const nextLng = currentCoords.lng + (destLng - currentCoords.lng) * 0.25;

    setCurrentCoords({ lat: nextLat, lng: nextLng });
    sendTelemetry(nextLat, nextLng, 8, 28);
    setMessage(`Simulated GPS step sent: ${nextLat.toFixed(4)}, ${nextLng.toFixed(4)}`);
  };

  // Worker arrived
  const handleArrived = async () => {
    if (!activeJob) return;
    setActionLoading(true);

    try {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        setGpsActive(false);
      }

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
        setMessage('Work started! Job timer logged.');
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
        setMessage('Work completed! Customer prompted to inspect and confirm payment.');
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
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F7F7F2] font-bold text-gray-500">
        Loading active job telemetry...
      </div>
    );
  }

  if (!activeJob) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F7F7F2] space-y-4">
        <p className="text-[#173D2B] font-bold text-lg">No active job in progress.</p>
        <Link href="/worker/dashboard" className="px-5 py-2.5 rounded-xl bg-[#173D2B] text-[#B7E36A] text-xs font-bold">
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
    title: 'Your Location (Live)',
    type: 'worker',
  } : undefined;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 bg-[#F7F7F2] min-h-screen">
      <div className="max-w-3xl mx-auto space-y-5">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/worker/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173D2B] hover:underline bg-white px-3 py-1.5 rounded-xl border border-[#D4DED5]">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-bold bg-[#173D2B] text-[#B7E36A] px-3 py-1 rounded-full">
            Stage: {activeJob.status}
          </span>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-[#E8ECE9] text-[#173D2B] text-xs font-bold border border-[#173D2B]/20">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-100 text-red-700 text-xs font-bold border border-red-200">
            {error}
          </div>
        )}

        {/* Customer Site & Contact Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D4DED5] shadow-md space-y-4">
          <div>
            <span className="text-[10px] font-black text-[#173D2B] uppercase tracking-wider bg-[#E8ECE9] px-2.5 py-0.5 rounded">
              Job #{activeJob.id.slice(-6)} • {activeJob.serviceCategory}
            </span>
            <h1 className="text-lg sm:text-xl font-black text-[#173D2B] mt-1">
              {activeJob.serviceDescription}
            </h1>
          </div>

          <div className="p-3.5 bg-[#F7F7F2] rounded-2xl border border-[#D4DED5] space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="w-4 h-4 text-[#173D2B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#173D2B] block">Customer Address:</span>
                <span className="text-gray-600">{activeJob.addressLine}, {activeJob.locality}, {activeJob.city}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D4DED5] flex items-center justify-between text-xs">
              <span className="text-gray-500">Customer: <strong>{activeJob.customer?.fullName || 'Customer'}</strong></span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeJob.customerLatitude},${activeJob.customerLongitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-white border border-[#D4DED5] text-[#173D2B] rounded-lg font-bold flex items-center gap-1 text-[11px]"
                >
                  Turn-by-Turn <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`tel:${activeJob.customer?.phoneNumber || '9911223344'}`}
                  className="px-3.5 py-1 bg-[#173D2B] text-[#B7E36A] rounded-lg font-bold flex items-center gap-1 text-[11px]"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Customer
                </a>
              </div>
            </div>
          </div>

          {/* Fee & Wage Summary */}
          <div className="flex justify-between items-center text-xs font-bold pt-1">
            <span className="text-gray-500">Estimated Payout to Your Account:</span>
            <span className="text-lg font-black text-emerald-700">₹{activeJob.finalAmount || activeJob.estimatedAmount}</span>
          </div>
        </div>

        {/* Live Navigation Road Map for Worker */}
        <div className="bg-white rounded-3xl p-5 border border-[#D4DED5] shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-[#173D2B] tracking-wider">
              Road Route to Customer Destination
            </h3>
            {routeInfo && (
              <span className="text-xs font-bold text-[#173D2B] bg-[#E8ECE9] px-2.5 py-0.5 rounded-full">
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

        {/* WORKER WORKFLOW ACTION CARD */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#D4DED5] shadow-md space-y-5">
          <h2 className="text-sm font-black text-[#173D2B] border-b border-[#D4DED5] pb-2">
            Active Job Stage & Real-time Action
          </h2>

          {/* STAGE 1: NOT STARTED ROUTE YET */}
          {(activeJob.status === 'ACCEPTED' || activeJob.status === 'WORKER_ASSIGNED') && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Click below when you depart your location. Your real GPS telemetry will automatically begin broadcasting to the customer map.
              </p>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleStartRoute}
                className="w-full py-4 rounded-2xl bg-[#173D2B] hover:bg-[#2D6547] text-[#B7E36A] font-black text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Navigation className="w-5 h-5 animate-pulse" />
                <span>START ROUTE (रास्ते पर निकलें - ON THE WAY)</span>
              </button>
            </div>
          )}

          {/* STAGE 2: ON THE WAY */}
          {activeJob.status === 'WORKER_ON_THE_WAY' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#E8ECE9] border border-[#173D2B]/20 text-xs font-semibold space-y-2">
                <div className="flex items-center justify-between text-[#173D2B] font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>GPS Telemetry Broadcasting Live</span>
                  </div>
                  <button
                    onClick={handleSimulateStep}
                    className="text-[11px] bg-white border border-[#D4DED5] px-2 py-0.5 rounded text-[#173D2B] hover:bg-gray-50 flex items-center gap-1"
                    title="Send simulated step if GPS is static indoors"
                  >
                    <Play className="w-3 h-3" /> Advance GPS Step
                  </button>
                </div>
                <p className="text-gray-600">
                  Coordinates: {currentCoords ? `${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}` : 'Connecting Geolocation API...'}
                </p>
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleArrived}
                className="w-full py-4 rounded-2xl bg-[#173D2B] hover:bg-[#2D6547] text-[#B7E36A] font-black text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>I HAVE ARRIVED AT SITE (पहुंच गए - ARRIVED)</span>
              </button>
            </div>
          )}

          {/* STAGE 3: ARRIVED -> START WORK */}
          {activeJob.status === 'ARRIVED' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Before-Work Fault Diagnosis (काम से पहले की स्थिति)
                </label>
                <textarea
                  rows={2}
                  value={beforeNotes}
                  onChange={(e) => setBeforeNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] text-xs font-medium focus:outline-none focus:border-[#173D2B]"
                />
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleStartWork}
                className="w-full py-4 rounded-2xl bg-[#F2A65A] hover:bg-[#e09245] text-white font-black text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Clock className="w-5 h-5" />
                <span>START WORK TIMER (काम शुरू करें - START WORK)</span>
              </button>
            </div>
          )}

          {/* STAGE 4: WORK STARTED -> COMPLETE WORK */}
          {activeJob.status === 'WORK_STARTED' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs font-bold">
                Work timer active. When complete, add final notes and mark finished.
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Completed Work Summary & Replaced Parts (पूर्ण कार्य विवरण)
                </label>
                <textarea
                  rows={3}
                  value={afterNotes}
                  onChange={(e) => setAfterNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] text-xs font-medium focus:outline-none focus:border-[#173D2B]"
                />
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCompleteWork}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>MARK WORK COMPLETED (काम पूरा हुआ - COMPLETE)</span>
              </button>
            </div>
          )}

          {/* STAGE 5: COMPLETED -> AWAITING CUSTOMER CONFIRMATION */}
          {['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID'].includes(activeJob.status) && (
            <div className="p-6 rounded-2xl bg-[#E8ECE9] border border-[#173D2B]/20 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-black text-[#173D2B] text-base">Work Completed Successfully!</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                {activeJob.status === 'PAYMENT_PAID'
                  ? 'Payment has been settled! Check your Earnings Ledger for payout.'
                  : 'Customer has been prompted to inspect and complete payment settlement.'}
              </p>
              <div className="pt-2">
                <Link
                  href="/worker/earnings"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#173D2B] text-[#B7E36A] text-xs font-black shadow-xs"
                >
                  View Earnings Ledger (कमाई देखें)
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
