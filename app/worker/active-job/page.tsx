'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Upload, 
  ArrowLeft,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function WorkerActiveJobPage() {
  const [activeJob, setActiveJob] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpsActive, setGpsActive] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Work proofs
  const [beforeNotes, setBeforeNotes] = useState('Inspected circuit board; fuse terminal corroded.');
  const [afterNotes, setAfterNotes] = useState('Replaced terminal block and tested 16A MCB under load. Working normally.');

  const watchIdRef = useRef<number | null>(null);

  const fetchActiveJob = async () => {
    try {
      const res = await fetch('/api/worker/requests');
      const data = await res.json();
      if (data.success && data.activeJob) {
        setActiveJob(data.activeJob);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJob();
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Worker starts route -> activates live GPS streaming
  const handleStartRoute = async () => {
    if (!activeJob) return;
    setActionLoading(true);
    setError('');

    try {
      // 1. Update status to WORKER_ON_THE_WAY
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
      setMessage('Route started! Live GPS streaming is now broadcasting to customer.');

      // 2. Request Geolocation & Start Watch
      if (navigator.geolocation) {
        setGpsActive(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const acc = pos.coords.accuracy;
            const spd = pos.coords.speed ? pos.coords.speed * 3.6 : 26;

            setCurrentCoords({ lat, lng });

            // Send real GPS coordinate to backend
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
          },
          (err) => {
            console.warn('GPS Watch Error:', err.message);
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

  // Worker arrived
  const handleArrived = async () => {
    if (!activeJob) return;
    setActionLoading(true);

    try {
      // Stop GPS watch upon arrival
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
        setMessage('Status updated: Arrived at destination site.');
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
        setMessage('Work started! Work diagnosis logged.');
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
        setMessage('Work completed! Customer has been notified to inspect and confirm settlement.');
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
      <div className="min-h-[70vh] flex items-center justify-center bg-bg font-bold text-text-muted">
        Loading active job telemetry...
      </div>
    );
  }

  if (!activeJob) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-bg space-y-4">
        <p className="text-forest font-bold text-lg">No active job in progress.</p>
        <Link href="/worker/dashboard" className="px-5 py-2.5 rounded-xl bg-forest text-lime text-xs font-bold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/worker/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-bold bg-forest text-lime px-3 py-1 rounded-full">
            Status: {activeJob.status}
          </span>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-sage-soft text-forest text-xs font-bold border border-sage/30">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-2xl bg-status-dangerSoft text-status-danger text-xs font-bold border border-status-danger/20">
            {error}
          </div>
        )}

        {/* Customer Site & Contact Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated space-y-5">
          <div>
            <span className="text-[10px] font-black text-forest uppercase tracking-wider bg-sage-soft px-2.5 py-0.5 rounded">
              Job #{activeJob.id.slice(-6)} • {activeJob.serviceCategory}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-forest mt-1.5">
              {activeJob.serviceDescription}
            </h1>
          </div>

          <div className="p-4 bg-bg rounded-2xl border border-border space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="w-4 h-4 text-forest shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-forest block">Customer Address:</span>
                <span className="text-text-secondary">{activeJob.addressLine}, {activeJob.locality}, {activeJob.city}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted">Customer: <strong>{activeJob.customer?.fullName || 'Customer'}</strong></span>
              <a
                href={`tel:${activeJob.customer?.phoneNumber || '9911223344'}`}
                className="px-3.5 py-1.5 bg-forest text-lime rounded-lg font-bold flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" /> Call Customer
              </a>
            </div>
          </div>

          {/* Fee & Wage Summary */}
          <div className="flex justify-between items-center text-xs font-bold pt-1">
            <span className="text-text-muted">Estimated Payout:</span>
            <span className="text-xl font-black text-forest">₹{activeJob.finalAmount || activeJob.estimatedAmount}</span>
          </div>
        </div>

        {/* WORKER WORKFLOW ACTION CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated space-y-6">
          <h2 className="text-base font-black text-forest border-b border-border pb-3">
            Active Job Stage & Real-time Action
          </h2>

          {/* STAGE 1: NOT STARTED ROUTE YET */}
          {activeJob.status === 'ACCEPTED' && (
            <div className="space-y-4">
              <p className="text-xs text-text-secondary">
                Click below when you depart your location. Your real GPS telemetry will automatically begin broadcasting to the customer map.
              </p>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleStartRoute}
                className="w-full py-4 rounded-2xl bg-forest hover:bg-forest-light text-lime font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5 animate-pulse" />
                <span>START ROUTE (रास्ते पर निकलें - ON THE WAY)</span>
              </button>
            </div>
          )}

          {/* STAGE 2: ON THE WAY */}
          {activeJob.status === 'WORKER_ON_THE_WAY' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sage-soft border border-sage/30 text-xs font-semibold space-y-1">
                <div className="flex items-center gap-2 text-forest font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-ping" />
                  <span>GPS Location Broadcasting Live</span>
                </div>
                <p className="text-text-secondary">
                  Coordinates: {currentCoords ? `${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}` : 'Streaming via Geolocation API'}
                </p>
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleArrived}
                className="w-full py-4 rounded-2xl bg-forest hover:bg-forest-light text-lime font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
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
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Before-Work Fault Diagnosis (काम से पहले की स्थिति)
                </label>
                <textarea
                  rows={2}
                  value={beforeNotes}
                  onChange={(e) => setBeforeNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-bg text-xs font-medium"
                />
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleStartWork}
                className="w-full py-4 rounded-2xl bg-cta hover:bg-cta-hover text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
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
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Completed Work Summary & Replaced Parts (पूर्ण कार्य विवरण)
                </label>
                <textarea
                  rows={3}
                  value={afterNotes}
                  onChange={(e) => setAfterNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-bg text-xs font-medium"
                />
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCompleteWork}
                className="w-full py-4 rounded-2xl bg-status-success hover:bg-status-success/90 text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>MARK WORK COMPLETED (काम पूरा हुआ - COMPLETE)</span>
              </button>
            </div>
          )}

          {/* STAGE 5: COMPLETED -> AWAITING CUSTOMER CONFIRMATION */}
          {['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID'].includes(activeJob.status) && (
            <div className="p-6 rounded-2xl bg-sage-soft border border-sage/30 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
              <h3 className="font-black text-forest text-base">Work Completed Successfully!</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {activeJob.status === 'PAYMENT_PAID'
                  ? 'Payment has been settled! Check your Earnings Ledger for payout.'
                  : 'Customer has been prompted to inspect and complete payment settlement.'}
              </p>
              <div className="pt-2">
                <Link
                  href="/worker/earnings"
                  className="inline-block px-5 py-2.5 rounded-xl bg-forest text-lime text-xs font-black shadow-xs"
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
