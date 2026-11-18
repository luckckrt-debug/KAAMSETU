'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  RefreshCw
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function WorkerDashboardPage() {
  const [worker, setWorker] = useState<any>(null);
  const [incomingRequests, setIncomingRequests] = useState<Booking[]>([]);
  const [activeJob, setActiveJob] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState('');

  const fetchWorkerData = async () => {
    try {
      // 1. Get current session
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      
      const userId = meData.user?.id || 'user-worker-1';

      // 2. Get worker profile
      const profRes = await fetch(`/api/workers/${userId}`);
      const profData = await profRes.json();
      if (profData.success) {
        setWorker(profData.worker);
      }

      // 3. Get incoming requests & active job
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
    const interval = setInterval(fetchWorkerData, 6000);
    return () => clearInterval(interval);
  }, []);

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
        setMessage(newStatus ? 'You are now ONLINE. Ready for jobs!' : 'You are now OFFLINE.');
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
        setMessage('Job accepted! Prepare to start route.');
        fetchWorkerData();
      } else {
        alert(data.error);
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
        setMessage('Job declined.');
        fetchWorkerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg font-bold text-text-muted">
        Loading Worker Portal (श्रमिक पोर्टल लोड हो रहा है)...
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Worker Status & Online Switch */}
        <div className="bg-white rounded-3xl p-6 border border-border shadow-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <img
                src={worker?.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
                alt={worker?.user?.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-border"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-forest">
                    Namaste, {worker?.user?.fullName || 'Worker'}!
                  </h1>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-status-success bg-status-successSoft px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> {worker?.verificationStatus || 'VERIFIED'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {worker?.skills?.[0]?.categoryName || 'Electrician'} • {worker?.locality}, {worker?.city}
                </p>
                <div className="flex items-center gap-3 text-xs text-text-muted font-bold mt-1">
                  <span className="text-amber-500 flex items-center gap-0.5">★ {worker?.ratingAvg}</span>
                  <span>{worker?.completedJobsCount} Jobs Done</span>
                </div>
              </div>
            </div>

            {/* Online / Offline Big Touch Button */}
            <button
              type="button"
              disabled={toggling}
              onClick={handleToggleOnline}
              className={`py-3.5 px-6 rounded-2xl font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                worker?.isOnline
                  ? 'bg-status-success text-white hover:bg-status-success/90 ring-4 ring-status-success/20'
                  : 'bg-text-muted text-white hover:bg-text-secondary'
              }`}
            >
              <Power className={`w-5 h-5 ${worker?.isOnline ? 'animate-pulse' : ''}`} />
              <span>{worker?.isOnline ? 'YOU ARE ONLINE (ऑनलाइन)' : 'YOU ARE OFFLINE (ऑफलाइन)'}</span>
            </button>

          </div>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-sage-soft text-forest text-xs font-bold border border-sage/30 flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-text-muted hover:text-forest">✕</button>
          </div>
        )}

        {/* ACTIVE JOB BANNER (If job is in progress) */}
        {activeJob && (
          <div className="bg-forest text-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-lime/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider bg-lime text-forest px-3 py-1 rounded-full animate-pulse">
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
                <MapPin className="w-4 h-4 text-lime shrink-0" />
                <span>{activeJob.addressLine}, {activeJob.city}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-forest-light">
              <span className="text-sm font-black text-lime">
                Earnings: ₹{activeJob.finalAmount || activeJob.estimatedAmount}
              </span>

              <Link
                href="/worker/active-job"
                className="px-6 py-3 rounded-xl bg-lime hover:bg-lime-hover text-forest font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>OPEN ACTIVE JOB SCREEN (मार्ग व कार्य शुरू करें)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Incoming Work Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-forest flex items-center gap-2">
              <span>Incoming Work Requests (नए कार्य अनुरोध)</span>
              <span className="text-xs font-bold bg-cta text-white px-2 py-0.5 rounded-full">
                {incomingRequests.length}
              </span>
            </h2>
            <button onClick={fetchWorkerData} className="text-xs font-bold text-sage hover:underline flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-border text-center text-text-muted text-xs space-y-1">
              <p className="font-bold text-forest text-sm">No pending requests right now.</p>
              <p>Keep your phone online. When a customer in your radius books, requests will alert here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-6 border border-border shadow-xs hover:border-forest/40 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                    <div>
                      <span className="text-[10px] font-black text-forest bg-sage-soft px-2.5 py-1 rounded">
                        {req.serviceCategory}
                      </span>
                      {req.isUrgent && (
                        <span className="text-[10px] font-bold text-status-danger bg-status-dangerSoft px-2 py-0.5 rounded ml-2">
                          ⚡ Urgent 30-Min
                        </span>
                      )}
                      <h3 className="text-base font-black text-forest mt-1.5">{req.serviceDescription}</h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-lg font-black text-forest">₹{req.estimatedAmount}</span>
                      <span className="text-xs text-text-muted block">({req.estimatedHours} hrs est.)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <MapPin className="w-4 h-4 text-sage shrink-0" />
                    <span>{req.addressLine}, {req.city}</span>
                  </div>

                  {/* Accept / Decline Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleDeclineJob(req.id)}
                      className="py-3 rounded-xl border border-border text-xs font-bold text-text-secondary hover:bg-bg transition-colors"
                    >
                      Decline (अस्वीकार)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptJob(req.id)}
                      className="py-3 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black uppercase tracking-wider shadow-sm transition-all"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <Link
            href="/worker/active-job"
            className="p-5 rounded-2xl bg-white border border-border hover:border-forest shadow-xs text-center space-y-1 transition-all"
          >
            <Navigation className="w-6 h-6 text-sage mx-auto" />
            <h4 className="font-bold text-forest text-xs">Active Route</h4>
            <span className="text-[10px] text-text-muted">GPS Telemetry</span>
          </Link>

          <Link
            href="/worker/earnings"
            className="p-5 rounded-2xl bg-white border border-border hover:border-forest shadow-xs text-center space-y-1 transition-all"
          >
            <DollarSign className="w-6 h-6 text-cta mx-auto" />
            <h4 className="font-bold text-forest text-xs">Earnings Ledger</h4>
            <span className="text-[10px] text-text-muted">UPI Payouts</span>
          </Link>

          <Link
            href="/worker/verification"
            className="p-5 rounded-2xl bg-white border border-border hover:border-forest shadow-xs text-center space-y-1 transition-all"
          >
            <ShieldCheck className="w-6 h-6 text-status-success mx-auto" />
            <h4 className="font-bold text-forest text-xs">KYC Documents</h4>
            <span className="text-[10px] text-text-muted">Aadhaar & Trade</span>
          </Link>

          <Link
            href="/tenders"
            className="p-5 rounded-2xl bg-white border border-border hover:border-forest shadow-xs text-center space-y-1 transition-all"
          >
            <FileText className="w-6 h-6 text-forest mx-auto" />
            <h4 className="font-bold text-forest text-xs">Tenders</h4>
            <span className="text-[10px] text-text-muted">Bulk Workforce</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
