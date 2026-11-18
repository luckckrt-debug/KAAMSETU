'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HardHat, 
  Power, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Phone, 
  DollarSign, 
  Star, 
  ShieldCheck, 
  FileText,
  Navigation,
  RefreshCw,
  Bell,
  X,
  Crosshair
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Booking } from '@/lib/types';

export default function WorkerDashboardPage() {
  const router = useRouter();

  const [worker, setWorker] = useState<any>(null);
  const [incomingRequests, setIncomingRequests] = useState<Booking[]>([]);
  const [activeJob, setActiveJob] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState('');
  const [gpsStatus, setGpsStatus] = useState<'active' | 'inactive' | 'denied'>('inactive');

  // Real-time incoming dispatch modal popup
  const [liveDispatchAlert, setLiveDispatchAlert] = useState<any | null>(null);
  const [alertCountdown, setAlertCountdown] = useState(60);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchWorkerData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      const userId = meData.user?.id || 'user-worker-1';

      const profRes = await fetch(`/api/workers/${userId}`);
      const profData = await profRes.json();
      if (profData.success) {
        setWorker(profData.worker);
      }

      const reqRes = await fetch('/api/worker/requests');
      const reqData = await reqRes.json();
      if (reqData.success) {
        setIncomingRequests(reqData.incomingRequests || []);
        setActiveJob(reqData.activeJob || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();

    // Check Geolocation permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsStatus('active'),
        () => setGpsStatus('denied'),
        { timeout: 5000 }
      );
    }

    // Connect to Socket.IO
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      if (worker?.id) {
        socket.emit('worker:join', { workerProfileId: worker.id, userId: worker.userId });
      }
    });

    // Listen for real-time incoming dispatches
    const handleNewBookingAlert = (data: any) => {
      setLiveDispatchAlert(data);
      setAlertCountdown(data.timeoutSeconds || 60);

      if (alertTimerRef.current) clearInterval(alertTimerRef.current);
      alertTimerRef.current = setInterval(() => {
        setAlertCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(alertTimerRef.current!);
            setLiveDispatchAlert(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    socket.on('booking:request:created', handleNewBookingAlert);
    socket.on('booking:request:broadcast', handleNewBookingAlert);

    const interval = setInterval(fetchWorkerData, 8000);

    return () => {
      clearInterval(interval);
      if (alertTimerRef.current) clearInterval(alertTimerRef.current);
      socket.disconnect();
    };
  }, [worker?.id]);

  const handleToggleOnline = async () => {
    if (!worker) return;
    setToggling(true);
    const newStatus = !worker.isOnline;

    try {
      const res = await fetch('/api/worker/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setWorker({ ...worker, isOnline: newStatus });
        setMessage(newStatus ? 'You are now ONLINE. Ready to receive job requests!' : 'You are now OFFLINE.');

        if (socketRef.current) {
          socketRef.current.emit('worker:availability:update', {
            workerProfileId: worker.id,
            isOnline: newStatus,
            isAvailableNow: newStatus,
          });
        }
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setToggling(false);
    }
  };

  const handleAcceptJob = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}/accept`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLiveDispatchAlert(null);
        setMessage('Job accepted! Navigating to route dispatch...');
        router.push('/worker/active-job');
      } else {
        alert(data.error || 'Failed to accept booking. Job may already be assigned.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineJob = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLiveDispatchAlert(null);
        setMessage('Job declined.');
        fetchWorkerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F7F7F2] font-bold text-gray-500">
        Loading Worker Portal (श्रमिक पोर्टल लोड हो रहा है)...
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 bg-[#F7F7F2] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Top Worker Profile & Online Switch Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D4DED5] shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <img
                src={worker?.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
                alt={worker?.user?.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#173D2B]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-[#173D2B]">
                    Namaste, {worker?.user?.fullName || 'Worker'}!
                  </h1>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> {worker?.verificationStatus || 'VERIFIED'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {worker?.skills?.[0]?.categoryName || 'Electrician'} • {worker?.locality}, {worker?.city}
                </p>
                <div className="flex items-center gap-3 text-xs font-bold mt-1">
                  <span className="text-amber-600 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {worker?.ratingAvg} ({worker?.ratingCount})
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{worker?.completedJobsCount} Jobs Done</span>
                  <span className="text-gray-400">•</span>
                  <span className={`text-[11px] flex items-center gap-1 ${gpsStatus === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    <Crosshair className="w-3 h-3" /> GPS {gpsStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Online / Offline Big Touch Button */}
            <button
              type="button"
              disabled={toggling}
              onClick={handleToggleOnline}
              className={`py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${
                worker?.isOnline
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-4 ring-emerald-500/20'
                  : 'bg-gray-400 text-white hover:bg-gray-500'
              }`}
            >
              <Power className={`w-5 h-5 ${worker?.isOnline ? 'animate-pulse' : ''}`} />
              <span>{worker?.isOnline ? 'YOU ARE ONLINE (ऑनलाइन)' : 'YOU ARE OFFLINE (ऑफलाइन)'}</span>
            </button>

          </div>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-[#E8ECE9] text-[#173D2B] text-xs font-bold border border-[#173D2B]/20 flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-gray-500 hover:text-black">✕</button>
          </div>
        )}

        {/* ACTIVE JOB BANNER (If job is in progress) */}
        {activeJob && (
          <div className="bg-[#173D2B] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-[#B7E36A]/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#B7E36A] text-[#173D2B] px-3 py-1 rounded-full animate-pulse">
                ⚡ Active Job In Progress (सक्रिय कार्य)
              </span>
              <span className="text-xs text-gray-200 font-bold">
                Status: {activeJob.status}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {activeJob.serviceDescription}
              </h2>
              <p className="text-xs sm:text-sm text-gray-200 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#B7E36A] shrink-0" />
                <span>{activeJob.addressLine}, {activeJob.city}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
              <span className="text-sm font-black text-[#B7E36A]">
                Estimated Payout: ₹{activeJob.finalAmount || activeJob.estimatedAmount}
              </span>

              <Link
                href="/worker/active-job"
                className="px-6 py-3 rounded-xl bg-[#B7E36A] hover:bg-[#a5d259] text-[#173D2B] font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>OPEN ACTIVE JOB SCREEN (मार्ग व कार्य शुरू करें)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Incoming Work Requests List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-[#173D2B] flex items-center gap-2">
              <span>Incoming Work Requests (नए कार्य अनुरोध)</span>
              <span className="text-xs font-bold bg-[#F2A65A] text-white px-2 py-0.5 rounded-full">
                {incomingRequests.length}
              </span>
            </h2>
            <button
              onClick={fetchWorkerData}
              className="text-xs font-bold text-[#173D2B] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#D4DED5] text-center text-gray-500 text-xs space-y-1">
              <p className="font-bold text-[#173D2B] text-sm">No pending requests right now.</p>
              <p>Keep your phone online. When a customer in your radius books, requests will alert here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D4DED5] shadow-xs hover:border-[#173D2B] transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D4DED5]">
                    <div>
                      <span className="text-[10px] font-black text-[#173D2B] bg-[#E8ECE9] px-2.5 py-1 rounded">
                        {req.serviceCategory}
                      </span>
                      {req.isUrgent && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded ml-2">
                          ⚡ Urgent 30-Min
                        </span>
                      )}
                      <h3 className="text-base font-black text-[#173D2B] mt-1.5">{req.serviceDescription}</h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-lg font-black text-[#173D2B]">₹{req.estimatedAmount}</span>
                      <span className="text-xs text-gray-500 block">({req.estimatedHours} hrs est.)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-4 h-4 text-[#173D2B] shrink-0" />
                    <span>{req.addressLine}, {req.city}</span>
                  </div>

                  {/* Accept / Decline Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleDeclineJob(req.id)}
                      className="py-3 rounded-xl border border-[#D4DED5] text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Decline (अस्वीकार)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptJob(req.id)}
                      className="py-3 rounded-xl bg-[#173D2B] hover:bg-[#2D6547] text-[#B7E36A] text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                    >
                      ACCEPT JOB (स्वीकार करें)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Nav Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <Link
            href="/worker/active-job"
            className="p-4 rounded-2xl bg-white border border-[#D4DED5] hover:border-[#173D2B] shadow-xs text-center space-y-1 transition"
          >
            <Navigation className="w-5 h-5 text-[#173D2B] mx-auto" />
            <h4 className="font-bold text-[#173D2B] text-xs">Active Route</h4>
            <span className="text-[10px] text-gray-500">Live GPS Telemetry</span>
          </Link>

          <Link
            href="/worker/earnings"
            className="p-4 rounded-2xl bg-white border border-[#D4DED5] hover:border-[#173D2B] shadow-xs text-center space-y-1 transition"
          >
            <DollarSign className="w-5 h-5 text-[#F2A65A] mx-auto" />
            <h4 className="font-bold text-[#173D2B] text-xs">Earnings Ledger</h4>
            <span className="text-[10px] text-gray-500">UPI Bank Payouts</span>
          </Link>

          <Link
            href="/worker/verification"
            className="p-4 rounded-2xl bg-white border border-[#D4DED5] hover:border-[#173D2B] shadow-xs text-center space-y-1 transition"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-[#173D2B] text-xs">KYC Documents</h4>
            <span className="text-[10px] text-gray-500">Aadhaar & Trade</span>
          </Link>

          <Link
            href="/tenders"
            className="p-4 rounded-2xl bg-white border border-[#D4DED5] hover:border-[#173D2B] shadow-xs text-center space-y-1 transition"
          >
            <FileText className="w-5 h-5 text-[#173D2B] mx-auto" />
            <h4 className="font-bold text-[#173D2B] text-xs">Tenders</h4>
            <span className="text-[10px] text-gray-500">Bulk Workforce</span>
          </Link>
        </div>

      </div>

      {/* Real-time Incoming Dispatch Modal Alert (Rapido / Uber style 60s countdown popup) */}
      {liveDispatchAlert && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-[#F2A65A] shadow-2xl space-y-4 relative overflow-hidden">
            
            {/* Top Countdown Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gray-200">
              <div 
                className="h-full bg-[#F2A65A] transition-all duration-1000 ease-linear"
                style={{ width: `${(alertCountdown / 60) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black uppercase text-[#F2A65A] tracking-wider">
                  New Instant Booking Request!
                </span>
              </div>
              <span className="text-xs font-black text-[#173D2B] bg-[#E8ECE9] px-2.5 py-0.5 rounded-full">
                {alertCountdown}s remaining
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                {liveDispatchAlert.serviceCategory}
              </span>
              <h3 className="text-lg font-black text-[#173D2B] mt-0.5">
                {liveDispatchAlert.serviceDescription || 'Urgent Service Call'}
              </h3>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F7F2] border border-[#D4DED5] space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Location:</span>
                <strong className="text-[#173D2B]">{liveDispatchAlert.locality || liveDispatchAlert.addressLine || 'Customer Site'}</strong>
              </div>
              {liveDispatchAlert.distanceKm && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <strong className="text-[#173D2B]">{liveDispatchAlert.distanceKm} km away (~{liveDispatchAlert.etaMinutes} min)</strong>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-[#D4DED5]">
                <span className="text-gray-600">Offered Fare:</span>
                <strong className="text-base font-black text-emerald-700">₹{liveDispatchAlert.estimatedAmount || 500}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLiveDispatchAlert(null)}
                className="py-3 rounded-xl border border-[#D4DED5] text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                Pass / Ignore
              </button>
              <button
                type="button"
                onClick={() => handleAcceptJob(liveDispatchAlert.bookingId)}
                className="py-3 rounded-xl bg-[#173D2B] hover:bg-[#2D6547] text-[#B7E36A] text-xs font-black uppercase tracking-wider shadow-md transition active:scale-95 animate-pulse"
              >
                ACCEPT (स्वीकार)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
