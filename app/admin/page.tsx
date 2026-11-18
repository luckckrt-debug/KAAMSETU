'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  ShieldCheck, 
  Briefcase, 
  AlertTriangle, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Building2,
  RefreshCw,
  HardHat,
  Search,
  Lock,
  Radio
} from 'lucide-react';
import { AdminMetrics } from '@/lib/types';

export default function AdminBackofficePage() {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'VERIFICATION' | 'DISPUTES' | 'AUDIT'>('METRICS');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [pendingWorkers, setPendingWorkers] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAdminData = async () => {
    try {
      // 1. Real Aggregated Metrics (No fake numbers!)
      const metRes = await fetch('/api/admin/metrics');
      const metData = await metRes.json();
      if (metData.success) {
        setMetrics(metData.metrics);
      }

      // 2. Pending Verifications
      const verRes = await fetch('/api/admin/verifications');
      const verData = await verRes.json();
      if (verData.success) {
        setPendingWorkers(verData.pendingWorkers || []);
      }

      // 3. Open Disputes
      const dispRes = await fetch('/api/disputes');
      const dispData = await dispRes.json();
      if (dispData.success) {
        setDisputes(dispData.disputes || []);
      }

      // 4. Audit Logs
      const auditRes = await fetch('/api/admin/audit-logs');
      const auditData = await auditRes.json();
      if (auditData.success) {
        setAuditLogs(auditData.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewWorker = async (workerProfileId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerProfileId,
          action,
          rejectionReason: action === 'REJECT' ? 'Aadhaar / Certificate unverified or unreadable.' : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          resolutionNotes: `Dispute settled by Admin: ${status}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Dispute successfully resolved.');
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg font-bold text-text-muted">
        Loading Admin Operations Console...
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="bg-forest text-white rounded-3xl p-6 sm:p-8 shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-lime text-forest flex items-center justify-center font-black shadow-sm">
              <Lock className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  KaamSetu Central Operations Backoffice
                </h1>
                <span className="text-xs font-bold text-lime bg-lime/20 px-2 py-0.5 rounded-full">
                  SUPER_ADMIN
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Real-time marketplace oversight • Verified telemetries • Live database stats
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link
              href="/admin/operations"
              className="px-5 py-2.5 rounded-xl bg-lime hover:bg-[#a5d259] text-forest text-xs font-black flex items-center gap-2 shadow-sm transition"
            >
              <Radio className="w-4 h-4 text-forest animate-pulse" />
              <span>LIVE OPERATIONS MAP (लाइव मैप)</span>
            </Link>

            <button
              onClick={fetchAdminData}
              className="px-4 py-2.5 rounded-xl bg-forest-light text-lime text-xs font-bold flex items-center gap-2 hover:bg-forest-light/80 transition-colors justify-center"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Backend Data
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-sage-soft text-forest text-xs font-bold border border-sage/30 flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-text-muted hover:text-forest">✕</button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-border shadow-xs">
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'METRICS'
                ? 'bg-forest text-lime shadow-xs'
                : 'text-text-secondary hover:text-forest'
            }`}
          >
            Platform Overview (समग्र स्थिति)
          </button>

          <button
            onClick={() => setActiveTab('VERIFICATION')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'VERIFICATION'
                ? 'bg-forest text-lime shadow-xs'
                : 'text-text-secondary hover:text-forest'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Worker KYC Approvals ({pendingWorkers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DISPUTES')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'DISPUTES'
                ? 'bg-forest text-lime shadow-xs'
                : 'text-text-secondary hover:text-forest'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Disputes Queue ({disputes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'AUDIT'
                ? 'bg-forest text-lime shadow-xs'
                : 'text-text-secondary hover:text-forest'
            }`}
          >
            Security Audit Trail
          </button>
        </div>

        {/* TAB 1: METRICS OVERVIEW (REAL DATA) */}
        {activeTab === 'METRICS' && metrics && (
          <div className="space-y-6">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs">
                <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">Total Users</span>
                <span className="text-3xl font-black text-forest">{metrics.totalUsers}</span>
                <span className="text-[11px] text-text-muted block mt-1">Workers & Customers</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs">
                <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">Verified Workers</span>
                <span className="text-3xl font-black text-status-success">{metrics.verifiedWorkers}</span>
                <span className="text-[11px] text-text-muted block mt-1">{metrics.pendingVerifications} Pending KYC</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs">
                <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">Workers Online Now</span>
                <span className="text-3xl font-black text-cta">{metrics.workersOnline}</span>
                <span className="text-[11px] text-text-muted block mt-1">Live in radius</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs">
                <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">Active Bookings</span>
                <span className="text-3xl font-black text-forest">{metrics.activeBookings}</span>
                <span className="text-[11px] text-text-muted block mt-1">{metrics.jobsInProgress} On the way/site</span>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
              <h2 className="text-base font-black text-forest border-b border-border pb-3">
                Financial Volume & Platform Commission Ledger
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div className="p-5 rounded-2xl bg-bg border border-border">
                  <span className="text-text-muted block uppercase font-bold text-[10px]">Total Settled Payments</span>
                  <span className="text-2xl font-black text-forest mt-1 block">
                    ₹{metrics.totalPaymentsAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-text-muted mt-1 block">Client bookings & contractor payouts</span>
                </div>

                <div className="p-5 rounded-2xl bg-sage-soft border border-sage/30">
                  <span className="text-text-muted block uppercase font-bold text-[10px]">Platform Commission (10%)</span>
                  <span className="text-2xl font-black text-forest mt-1 block">
                    ₹{metrics.platformCommissionTotal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-status-success font-bold mt-1 block">Net platform revenue</span>
                </div>

                <div className="p-5 rounded-2xl bg-bg border border-border">
                  <span className="text-text-muted block uppercase font-bold text-[10px]">Pending Worker Payouts</span>
                  <span className="text-2xl font-black text-cta mt-1 block">
                    ₹{metrics.pendingPayoutsAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-text-muted mt-1 block">Awaiting instant UPI execution</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: WORKER KYC VERIFICATIONS */}
        {activeTab === 'VERIFICATION' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
            <h2 className="text-base font-black text-forest border-b border-border pb-3">
              Pending Worker KYC Document Submissions
            </h2>

            {pendingWorkers.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-xs">
                All worker KYC documents have been reviewed. Queue is clear!
              </div>
            ) : (
              <div className="space-y-4">
                {pendingWorkers.map((w: any) => (
                  <div
                    key={w.id}
                    className="p-5 rounded-2xl bg-bg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={w.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
                        alt={w.user?.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border border-border"
                      />
                      <div>
                        <h3 className="font-bold text-forest text-sm">{w.user?.fullName}</h3>
                        <p className="text-xs text-text-secondary">{w.headline || 'Worker'}</p>
                        <div className="flex items-center gap-3 text-[11px] text-text-muted mt-0.5">
                          <span>Phone: +91 {w.user?.phoneNumber}</span>
                          <span>•</span>
                          <span>{w.city}, {w.state}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleReviewWorker(w.id, 'REJECT')}
                        className="px-4 py-2 rounded-xl border border-border hover:bg-white text-status-danger text-xs font-bold"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleReviewWorker(w.id, 'APPROVE')}
                        className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black shadow-xs"
                      >
                        Approve KYC
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DISPUTES QUEUE */}
        {activeTab === 'DISPUTES' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
            <h2 className="text-base font-black text-forest border-b border-border pb-3">
              Open Customer & Worker Disputes
            </h2>

            {disputes.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-xs">
                No open disputes. All bookings operating normally.
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((d: any) => (
                  <div
                    key={d.id}
                    className="p-5 rounded-2xl bg-bg border border-border space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-status-danger bg-status-dangerSoft px-2 py-0.5 rounded">
                          {d.reason}
                        </span>
                        <h3 className="text-sm font-bold text-forest mt-1">
                          Booking #{d.bookingId.slice(-6)} • Reported by {d.customerName}
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-forest uppercase">{d.status}</span>
                    </div>

                    <p className="text-xs text-text-secondary bg-white p-3 rounded-xl border border-border">
                      {d.description}
                    </p>

                    {d.status === 'OPEN' && (
                      <div className="flex justify-end gap-2 pt-2 border-t border-border">
                        <button
                          type="button"
                          onClick={() => handleResolveDispute(d.id, 'RESOLVED_DISMISSED')}
                          className="px-3.5 py-1.5 rounded-xl border border-border hover:bg-white text-xs font-bold text-text-secondary"
                        >
                          Dismiss Dispute
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveDispute(d.id, 'RESOLVED_REFUND')}
                          className="px-4 py-1.5 rounded-xl bg-status-danger text-white text-xs font-black"
                        >
                          Approve Refund to Customer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'AUDIT' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
            <h2 className="text-base font-black text-forest border-b border-border pb-3">
              Administrative Security Audit Trail
            </h2>

            <div className="divide-y divide-border text-xs">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-forest block">{log.action}</span>
                    <span className="text-text-secondary">{log.details || 'Target: ' + log.targetType + ' #' + log.targetId}</span>
                  </div>
                  <span className="text-[11px] text-text-muted">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
