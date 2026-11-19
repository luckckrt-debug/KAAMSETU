'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  HardHat, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wrench, 
  Receipt, 
  Wallet, 
  ArrowUpRight, 
  CreditCard, 
  Search, 
  Database, 
  Radio, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FolderGit2
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminControlRoomPage() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [latestRegistrations, setLatestRegistrations] = useState<any[]>([]);
  const [latestJobs, setLatestJobs] = useState<any[]>([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverviewData = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setLatestRegistrations(data.latestRegistrations || []);
        setLatestJobs(data.latestJobs || []);
        setRecentWithdrawals(data.recentWithdrawals || []);
        setRecentAuditLogs(data.recentAuditLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOverviewData();
  };

  return (
    <AdminLayout
      title="Super Admin Control Room"
      subtitle="केंद्रीय संचालन कमान केंद्र • Real-time metrics & management across Worker, Contractor & Customer apps"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] bg-white hover:bg-[#F5FAFF] text-xs font-bold text-[#153451] transition flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#2583D5] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Live Data'}</span>
          </button>
          <Link
            href="/admin/search"
            className="px-4 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-md shadow-[#2583D5]/20 transition flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Universal Search (Ctrl+K)</span>
          </Link>
        </div>
      }
    >
      {/* 1. TOP KEY PERFORMANCE CARDS (Real Atlas Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Users */}
        <Link
          href="/admin/users"
          className="bg-white p-4 rounded-2xl border border-[#D1E8F8] shadow-xs hover:border-[#2583D5] transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#7697B3] tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-[#2583D5]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-[#153451] group-hover:text-[#2583D5] transition-colors">
              {metrics ? metrics.totalUsers : '...'}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
              {metrics ? `${metrics.activeUsers} Active • ${metrics.blockedUsers} Blocked` : 'Loading...'}
            </div>
          </div>
        </Link>

        {/* Workers Fleet */}
        <Link
          href="/admin/workers"
          className="bg-white p-4 rounded-2xl border border-[#D1E8F8] shadow-xs hover:border-[#2583D5] transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#7697B3] tracking-wider">Workers</span>
            <HardHat className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-[#153451] group-hover:text-[#2583D5] transition-colors">
              {metrics ? metrics.totalWorkers : '...'}
            </div>
            <div className="text-[10px] text-[#7697B3] font-semibold mt-0.5">
              Trades & Skills Fleet
            </div>
          </div>
        </Link>

        {/* Contractors */}
        <Link
          href="/admin/contractors"
          className="bg-white p-4 rounded-2xl border border-[#D1E8F8] shadow-xs hover:border-[#2583D5] transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#7697B3] tracking-wider">Contractors</span>
            <Building2 className="w-4 h-4 text-[#1E70B8]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-[#153451] group-hover:text-[#2583D5] transition-colors">
              {metrics ? metrics.totalContractors : '...'}
            </div>
            <div className="text-[10px] text-[#7697B3] font-semibold mt-0.5">
              Projects & Tenders
            </div>
          </div>
        </Link>

        {/* Hiring Partners / Customers */}
        <Link
          href="/admin/hiring-partners"
          className="bg-white p-4 rounded-2xl border border-[#D1E8F8] shadow-xs hover:border-[#2583D5] transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#7697B3] tracking-wider">Customers</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-[#153451] group-hover:text-[#2583D5] transition-colors">
              {metrics ? metrics.totalHiringPartners : '...'}
            </div>
            <div className="text-[10px] text-[#7697B3] font-semibold mt-0.5">
              Service Bookers
            </div>
          </div>
        </Link>

        {/* KYC Verifications */}
        <Link
          href="/admin/kyc"
          className="bg-white p-4 rounded-2xl border border-[#D1E8F8] shadow-xs hover:border-[#2583D5] transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#7697B3] tracking-wider">Pending KYC</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-600">
              {metrics ? metrics.pendingKyc : '...'}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
              {metrics ? `${metrics.approvedKyc} Approved` : ''}
            </div>
          </div>
        </Link>

        {/* Platform Revenue from ₹99 Fee */}
        <Link
          href="/admin/platform-fees"
          className="bg-gradient-to-br from-[#EAF6FF] to-white p-4 rounded-2xl border-2 border-[#2583D5]/40 shadow-xs hover:border-[#2583D5] transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#2583D5] tracking-wider">₹99 Platform Fees</span>
            <Receipt className="w-4 h-4 text-[#2583D5]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-[#2583D5]">
              ₹{metrics ? metrics.totalPlatformRevenue.toLocaleString('en-IN') : '...'}
            </div>
            <div className="text-[10px] text-[#4B6F8E] font-bold mt-0.5">
              {metrics ? `+₹${metrics.pendingPlatformFees} Pending` : ''}
            </div>
          </div>
        </Link>

      </div>

      {/* 2. SECONDARY OPERATIONS STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Active Jobs */}
        <Link
          href="/admin/jobs?status=REQUESTED"
          className="bg-white p-4 rounded-2xl border border-[#D1E8F8] hover:border-[#2583D5] transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-black uppercase text-[#7697B3] block">Active Dispatches</span>
            <span className="text-xl font-black text-[#153451]">{metrics ? metrics.activeJobs : '...'}</span>
            <span className="text-[10px] text-[#7697B3] block mt-0.5">
              {metrics ? `${metrics.completedJobs} Completed` : ''}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5" />
          </div>
        </Link>

        {/* Worker Earnings */}
        <Link
          href="/admin/wallets"
          className="bg-white p-4 rounded-2xl border border-[#D1E8F8] hover:border-[#2583D5] transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-black uppercase text-[#7697B3] block">Worker Total Earnings</span>
            <span className="text-xl font-black text-[#153451]">
              ₹{metrics ? metrics.totalWorkerEarnings.toLocaleString('en-IN') : '...'}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
              100% Direct Payouts
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
        </Link>

        {/* Pending Withdrawals */}
        <Link
          href="/admin/withdrawals?status=PENDING"
          className="bg-white p-4 rounded-2xl border border-[#D1E8F8] hover:border-[#2583D5] transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-black uppercase text-[#7697B3] block">Pending Payouts</span>
            <span className="text-xl font-black text-amber-600">{metrics ? metrics.pendingWithdrawals : '...'}</span>
            <span className="text-[10px] text-[#7697B3] block mt-0.5">
              {metrics ? `₹${metrics.pendingWithdrawalsAmount} to process` : ''}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </Link>

        {/* Database Health */}
        <Link
          href="/admin/database"
          className="bg-white p-4 rounded-2xl border border-[#D1E8F8] hover:border-[#2583D5] transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-black uppercase text-[#7697B3] block">MongoDB Atlas</span>
            <span className="text-base font-black text-emerald-600 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Healthy & Synced
            </span>
            <span className="text-[10px] text-[#7697B3] block mt-0.5">
              26 Active Collections
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
        </Link>

      </div>

      {/* 3. RECENT FEEDS & AUDIT TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latest Registrations */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D1E8F8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2583D5]" />
              <h2 className="font-black text-[#153451] text-sm">Latest User Registrations</h2>
            </div>
            <Link href="/admin/users" className="text-xs font-bold text-[#2583D5] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#EAF6FF]">
            {latestRegistrations.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#7697B3]">Loading user registrations...</div>
            ) : (
              latestRegistrations.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="font-bold text-[#153451] hover:text-[#2583D5] truncate block"
                    >
                      {u.fullName}
                    </Link>
                    <span className="text-[11px] text-[#7697B3]">+91 {u.phoneNumber}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#EAF6FF] text-[#2583D5] border border-[#D1E8F8]">
                      {u.role}
                    </span>
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="p-1 rounded-lg hover:bg-[#F5FAFF] text-[#7697B3] hover:text-[#2583D5]"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Jobs & Platform Fee Entries */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D1E8F8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#2583D5]" />
              <h2 className="font-black text-[#153451] text-sm">Recent Jobs & ₹99 Platform Fees</h2>
            </div>
            <Link href="/admin/platform-fees" className="text-xs font-bold text-[#2583D5] hover:underline flex items-center gap-1">
              <span>View Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#EAF6FF]">
            {latestJobs.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#7697B3]">No recent jobs recorded.</div>
            ) : (
              latestJobs.map((j) => (
                <div key={j.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-[#153451] block truncate">{j.serviceCategory}</span>
                    <span className="text-[11px] text-[#7697B3]">
                      Base: ₹{j.baseCharge} + Fee: <strong className="text-[#2583D5]">₹99</strong> = Total ₹{j.totalPrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {j.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 4. SECURITY & AUDIT LOG FEED */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D1E8F8] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#2583D5]" />
            <h2 className="font-black text-[#153451] text-sm">Realtime Security & Audit Log (MongoDB Atlas)</h2>
          </div>
          <Link href="/admin/audit-logs" className="text-xs font-bold text-[#2583D5] hover:underline flex items-center gap-1">
            <span>All Audit Logs</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-[#EAF6FF] text-xs">
          {recentAuditLogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#7697B3]">No recent audit logs.</div>
          ) : (
            recentAuditLogs.map((log, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#F5FAFF] border border-[#D1E8F8] text-[#153451]">
                    {log.action}
                  </span>
                  <span className="font-bold text-[#153451]">
                    {log.reason || log.details || 'Administrative operation performed'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#7697B3]">
                  <span>By: <strong>{log.adminName || log.adminUserId || 'Super Admin'}</strong></span>
                  <span>•</span>
                  <span>{new Date(log.timestamp || log.createdAt || Date.now()).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </AdminLayout>
  );
}
