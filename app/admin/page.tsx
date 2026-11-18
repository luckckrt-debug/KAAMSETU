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
  Radio,
  Smartphone,
  Download,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { AdminMetrics } from '@/lib/types';
import { LogoIcon } from '@/components/Logo';

export default function AdminBackofficePage() {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'VERIFICATION' | 'DISPUTES' | 'AUDIT' | 'APKS'>('APKS');
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
            <LogoIcon size="lg" className="shadow-lg border-2 border-white/20" />
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
              href="/admin/finance"
              className="px-5 py-2.5 rounded-xl bg-cta hover:bg-[#e09346] text-white text-xs font-black flex items-center gap-2 shadow-sm transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>FINANCE & SETTLEMENTS (वित्त व निकासी)</span>
            </Link>

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

          <button
            onClick={() => setActiveTab('APKS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'APKS'
                ? 'bg-amber-500 text-forest shadow-xs font-black'
                : 'text-text-secondary hover:text-forest'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Apps & Releases (3)</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
                <h2 className="text-base font-black text-forest">
                  Financial Volume & Platform Commission Ledger
                </h2>
                <Link
                  href="/admin/finance"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-forest hover:text-forest-light bg-lime/30 hover:bg-lime/50 px-3.5 py-1.5 rounded-xl border border-lime/50 transition w-fit"
                >
                  <CreditCard className="w-3.5 h-3.5 text-forest" />
                  <span>Open Full Finance & Payout Desk →</span>
                </Link>
              </div>

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

        {/* TAB 5: MOBILE APKS & CENTRAL DIRECTORY */}
        {activeTab === 'APKS' && (
          <div className="space-y-6">
            <div className="bg-forest text-white p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800 inline-block mb-2">
                  Central Distribution & Sideloading
                </span>
                <h3 className="text-2xl font-black">All 3 Production Android APKs Ready</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Each mobile app has been compiled into an installable release APK. They are stored locally in <code className="text-amber-400 bg-black/40 px-2 py-0.5 rounded font-mono">central-directory/apks/</code> and are directly downloadable through this portal.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href="/central-directory/index.html"
                  target="_blank"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-forest text-xs font-black rounded-xl transition flex items-center space-x-1.5 shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Central Hub</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* 1. Worker App */}
              <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold">
                      <HardHat className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Release APK (64.8 MB)
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-forest">KaamSetu Worker</h4>
                  <p className="text-xs font-mono text-text-muted">com.kaamsetu.worker</p>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    Worker live GPS dispatch, duty toggle, instant UPI digital wallet, and Aadhaar KYC.
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-3">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://expo.dev/artifacts/eas/6Zci0-hiEwLc53RGVoY4UVPl-gaA9eF2eVLPF4TRBYo.apk"
                      alt="Worker QR"
                      className="w-16 h-16 rounded-xl border border-border bg-white p-1"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-forest uppercase block">Phone QR Scan</span>
                      <span className="text-[10px] text-text-muted block mt-0.5">Scan with phone camera to download directly</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <a
                    href="/apks/KaamSetu-Worker-preview.apk"
                    download="KaamSetu-Worker-preview.apk"
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Worker APK</span>
                  </a>
                  <a
                    href="https://expo.dev/artifacts/eas/6Zci0-hiEwLc53RGVoY4UVPl-gaA9eF2eVLPF4TRBYo.apk"
                    target="_blank"
                    className="w-full py-1.5 text-center text-[11px] text-text-muted hover:text-forest block"
                  >
                    EAS Cloud Mirror Link ↗
                  </a>
                </div>
              </div>

              {/* 2. Hiring App */}
              <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Release APK (64.8 MB)
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-forest">KaamSetu Hiring</h4>
                  <p className="text-xs font-mono text-text-muted">com.kaamsetu.app</p>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    Customer portal for instant job posting, applicant review desk, worker ratings, and calling.
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-3">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://expo.dev/artifacts/eas/TeHenQQP18h968-pHzZ_Odnc2wlMWrzpILU7AbxpUFE.apk"
                      alt="Hiring QR"
                      className="w-16 h-16 rounded-xl border border-border bg-white p-1"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-forest uppercase block">Phone QR Scan</span>
                      <span className="text-[10px] text-text-muted block mt-0.5">Scan with phone camera to download directly</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <a
                    href="/apks/KaamSetu-Hiring-preview.apk"
                    download="KaamSetu-Hiring-preview.apk"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Hiring APK</span>
                  </a>
                  <a
                    href="https://expo.dev/artifacts/eas/TeHenQQP18h968-pHzZ_Odnc2wlMWrzpILU7AbxpUFE.apk"
                    target="_blank"
                    className="w-full py-1.5 text-center text-[11px] text-text-muted hover:text-forest block"
                  >
                    EAS Cloud Mirror Link ↗
                  </a>
                </div>
              </div>

              {/* 3. Contractor App */}
              <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl font-bold">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Release APK (64.8 MB)
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-forest">KaamSetu Contractor</h4>
                  <p className="text-xs font-mono text-text-muted">com.kaamsetu.contractor</p>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    Commercial construction projects, muster roll attendance (P, HD, A, OT), and batch payouts.
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-3">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://expo.dev/artifacts/eas/JPCBbmDl3gfGcYUuCJad-c7QV8jZ39Vt7z736lLmeq0.apk"
                      alt="Contractor QR"
                      className="w-16 h-16 rounded-xl border border-border bg-white p-1"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-forest uppercase block">Phone QR Scan</span>
                      <span className="text-[10px] text-text-muted block mt-0.5">Scan with phone camera to download directly</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <a
                    href="/apks/KaamSetu-Contractor-preview.apk"
                    download="KaamSetu-Contractor-preview.apk"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Contractor APK</span>
                  </a>
                  <a
                    href="https://expo.dev/artifacts/eas/JPCBbmDl3gfGcYUuCJad-c7QV8jZ39Vt7z736lLmeq0.apk"
                    target="_blank"
                    className="w-full py-1.5 text-center text-[11px] text-text-muted hover:text-forest block"
                  >
                    EAS Cloud Mirror Link ↗
                  </a>
                </div>
              </div>

            </div>

            {/* ADB Command helper */}
            <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Developer & Tester ADB Commands
                </span>
                <span className="text-[11px] text-slate-400">Auto-script: <code className="text-emerald-300">central-directory\install-all-apks-adb.bat</code></span>
              </div>
              <p className="text-xs text-slate-400">
                To install all 3 applications simultaneously to a physical phone connected over USB with USB debugging enabled:
              </p>
              <div className="bg-black/60 p-4 rounded-2xl font-mono text-xs text-slate-300 space-y-1">
                <p className="text-emerald-400">adb install -r central-directory\apks\KaamSetu-Worker-preview.apk</p>
                <p className="text-blue-400">adb install -r central-directory\apks\KaamSetu-Hiring-preview.apk</p>
                <p className="text-purple-400">adb install -r central-directory\apks\KaamSetu-Contractor-preview.apk</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
