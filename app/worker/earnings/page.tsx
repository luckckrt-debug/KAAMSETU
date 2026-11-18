'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function WorkerEarningsPage() {
  const [worker, setWorker] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchEarnings = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      const userId = meData.user?.id || 'user-worker-1';

      const profRes = await fetch(`/api/workers/${userId}`);
      const profData = await profRes.json();
      if (profData.success) {
        setWorker(profData.worker);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleRequestPayout = async (payoutId: string) => {
    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/payments/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        fetchEarnings();
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
        Loading ledger data...
      </div>
    );
  }

  // Realistic sample calculations based on completed jobs
  const completedJobs = worker?.completedJobsCount || 112;
  const avgJobEarnings = 650;
  const lifetimeGross = completedJobs * avgJobEarnings;
  const platformFee = Math.round(lifetimeGross * 0.1);
  const lifetimeNet = lifetimeGross - platformFee;
  const pendingAmount = 630; // 1 latest job pending

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/worker/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-bold text-text-secondary">
            Daily Automated Settlement
          </span>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-status-successSoft text-status-success text-xs font-bold border border-status-success/20">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-2xl bg-status-dangerSoft text-status-danger text-xs font-bold border border-status-danger/20">
            {error}
          </div>
        )}

        {/* Top Earnings Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-border shadow-xs">
            <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">
              Available for Payout (निकासी योग्य राशि)
            </span>
            <span className="text-3xl font-black text-cta">₹{pendingAmount}</span>
            <span className="text-xs text-text-muted block mt-1">Ready for instant UPI transfer</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-border shadow-xs">
            <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">
              Lifetime Net Earned (कुल कमाई)
            </span>
            <span className="text-3xl font-black text-forest">₹{lifetimeNet.toLocaleString('en-IN')}</span>
            <span className="text-xs text-status-success font-bold block mt-1">100% Settled to Bank</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-border shadow-xs">
            <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">
              Jobs Completed
            </span>
            <span className="text-3xl font-black text-forest">{completedJobs}</span>
            <span className="text-xs text-text-muted block mt-1">Avg ₹650 net per job</span>
          </div>
        </div>

        {/* Payout Action Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-forest" />
              <h2 className="text-base font-black text-forest">Instant UPI Payout Transfer</h2>
            </div>
            <p className="text-xs text-text-secondary">
              Transfer pending ₹{pendingAmount} directly to UPI ID: <strong className="text-forest font-bold">{worker?.upiId || 'ramesh.sharma@okaxis'}</strong>
            </p>
          </div>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() => handleRequestPayout('payout-demo-1')}
            className="px-6 py-3.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <span>{actionLoading ? 'PROCESSING...' : 'TRANSFER ₹630 TO UPI NOW'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Ledger Transactions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
          <h2 className="text-base font-black text-forest border-b border-border pb-3">
            Completed Job Ledger (लेजर विवरण)
          </h2>

          <div className="divide-y divide-border text-xs">
            
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-forest block">Job #9921 - MCB Short Circuit Repair</span>
                <span className="text-[11px] text-text-muted">Lotus Boulevard, Noida • Today</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-forest">Gross: ₹700 (Fee 10%: -₹70)</span>
                <span className="text-sm font-black text-status-success block">Net: +₹630</span>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-forest block">Job #9842 - 3-Phase Inverter Battery Wiring</span>
                <span className="text-[11px] text-text-muted">Sector 18, Noida • Yesterday</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-forest">Gross: ₹900 (Fee 10%: -₹90)</span>
                <span className="text-sm font-black text-status-success block">Net: +₹810</span>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-forest block">Job #9714 - Switchboard & Ceiling Fan Fitting</span>
                <span className="text-[11px] text-text-muted">Dwarka Sector 10, Delhi • 3 days ago</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-forest">Gross: ₹600 (Fee 10%: -₹60)</span>
                <span className="text-sm font-black text-status-success block">Net: +₹540</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
