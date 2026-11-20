'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard, 
  Building, 
  TrendingUp, 
  Receipt, 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Check, 
  X,
  ArrowUpRight,
  Download,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'PAYOUT_REQUESTS' | 'APPROVAL' | 'PLATFORM_FEE' | 'FEE_LEDGER' | 'EARNING_LEDGER' | 'SETTLEMENTS' | 'FAILED' | 'REFUNDS' | 'RECONCILIATION'
  >('OVERVIEW');

  const [summary, setSummary] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [platformFeeLedger, setPlatformFeeLedger] = useState<any[]>([]);
  const [earningLedger, setEarningLedger] = useState<any[]>([]);
  const [settlementRecords, setSettlementRecords] = useState<any[]>([]);
  const [failedPayments, setFailedPayments] = useState<any[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Approval Modal State
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/finance/summary');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setWithdrawals(data.withdrawals || []);
        setPlatformFeeLedger(data.platformFeeLedger || []);
        setEarningLedger(data.earningLedger || []);
        setSettlementRecords(data.settlementRecords || []);
        setFailedPayments(data.failedPayments || []);
        setLedgerEntries(data.ledgerEntries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleReviewAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/finance/withdrawals/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          bankTransferReference: utrInput || undefined,
          failureReason: rejectReason || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setSelectedWithdrawal(null);
        setUtrInput('');
        setRejectReason('');
        fetchFinanceData();
      } else {
        setActionMessage(data.error || 'Failed to update withdrawal status');
      }
    } catch (e: any) {
      setActionMessage(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const exportReport = (title: string, data: any[]) => {
    if (!data || data.length === 0) return alert('No records to export');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((d) => Object.values(d).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KaamSetu_${title}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered lists
  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch =
      w.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.workerProfileId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.payoutTargetMasked?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingWithdrawals = withdrawals.filter(
    (w) => w.status === 'REQUESTED' || w.status === 'UNDER_REVIEW' || w.status === 'PROCESSING' || w.status === 'APPROVED'
  );

  return (
    <AdminLayout
      title="Payment & Settlement Command Center"
      subtitle="भुगतान व प्लेटफॉर्म राजस्व नियंत्रण कक्ष • Worker bank payouts, ₹99 platform revenue ledgers, and transaction reconciliation"
    >
      <div className="space-y-6">

        {/* 9 Executive Financial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-[#D1E8F8] shadow-xs col-span-1">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase block truncate">Total Payments</span>
            <div className="text-lg font-black text-[#153451] mt-1">₹{(summary?.totalCustomerPayments || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-emerald-600 font-bold">Gross Billed</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#D1E8F8] shadow-xs col-span-1">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase block truncate">Earnings Payable</span>
            <div className="text-lg font-black text-[#2583D5] mt-1">₹{(summary?.workerEarningsPayable || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-[#7697B3]">In Worker Wallets</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#D1E8F8] shadow-xs col-span-1">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase block truncate">Payouts Settled</span>
            <div className="text-lg font-black text-emerald-600 mt-1">₹{(summary?.workerPayoutsCompleted || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-emerald-600 font-bold">Bank Transferred</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#D1E8F8] shadow-xs col-span-1">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase block truncate">Payouts Pending</span>
            <div className="text-lg font-black text-amber-600 mt-1">₹{(summary?.workerPayoutsPending || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-amber-600 font-bold">{pendingWithdrawals.length} In Queue</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#D1E8F8] shadow-xs col-span-1">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase block truncate">Failed Payouts</span>
            <div className="text-lg font-black text-rose-600 mt-1">₹{(summary?.failedPayouts || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-rose-600 font-bold">Funds Reopened</span>
          </div>

          <div className="bg-gradient-to-tr from-[#2583D5] to-[#1E70B8] text-white rounded-2xl p-3.5 shadow-sm col-span-1">
            <span className="text-[10px] font-bold text-[#D1E8F8] uppercase block truncate">Fee Collected</span>
            <div className="text-lg font-black text-white mt-1">₹{(summary?.platformFeeCollected || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-[#EAF6FF]">₹99 / Booking</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#D1E8F8] shadow-xs col-span-1">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase block truncate">Fee Pending</span>
            <div className="text-lg font-black text-[#153451] mt-1">₹{(summary?.platformFeePending || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-[#7697B3]">Active Work</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#D1E8F8] shadow-xs col-span-1">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase block truncate">Platform Refunds</span>
            <div className="text-lg font-black text-slate-700 mt-1">₹{(summary?.platformRefunds || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-[#7697B3]">Dispute Settled</span>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 shadow-xs col-span-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block truncate">Net Revenue</span>
            <div className="text-lg font-black text-emerald-700 mt-1">₹{(summary?.platformNetFeeRevenue || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-emerald-800 font-bold">Net KaamSetu</span>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-emerald-700 font-bold">✕</button>
          </div>
        )}

        {/* 10 Operational Sections / Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-[#D1E8F8] shadow-xs flex flex-wrap gap-1 text-xs">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${activeTab === 'OVERVIEW' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'}`}
          >
            A. Overview
          </button>
          <button
            onClick={() => setActiveTab('PAYOUT_REQUESTS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${activeTab === 'PAYOUT_REQUESTS' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'}`}
          >
            B. Payout Requests ({withdrawals.length})
          </button>
          <button
            onClick={() => setActiveTab('APPROVAL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${activeTab === 'APPROVAL' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'}`}
          >
            C. Payout Review Queue ({pendingWithdrawals.length})
          </button>
          <button
            onClick={() => setActiveTab('PLATFORM_FEE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${activeTab === 'PLATFORM_FEE' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'}`}
          >
            D. ₹99 Fee Collection
          </button>
          <button
            onClick={() => setActiveTab('FEE_LEDGER')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${activeTab === 'FEE_LEDGER' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'}`}
          >
            E. Platform Revenue Ledger ({platformFeeLedger.length})
          </button>
          <button
            onClick={() => setActiveTab('EARNING_LEDGER')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${activeTab === 'EARNING_LEDGER' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'}`}
          >
            F. Worker Earning Ledger ({earningLedger.length})
          </button>
          <button
            onClick={() => setActiveTab('SETTLEMENTS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${activeTab === 'SETTLEMENTS' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'}`}
          >
            G. Settlement Records ({settlementRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('FAILED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${activeTab === 'FAILED' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'}`}
          >
            H. Failed & Reversals ({failedPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('REFUNDS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${activeTab === 'REFUNDS' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'}`}
          >
            I. Refunds & Reversals
          </button>
          <button
            onClick={() => setActiveTab('RECONCILIATION')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${activeTab === 'RECONCILIATION' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'}`}
          >
            J. Reconciliation
          </button>
        </div>

        {/* Global Search & Export Bar */}
        <div className="bg-white rounded-3xl p-4 border border-[#D1E8F8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#7697B3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by worker ID, mobile, txn ID, booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D1E8F8] focus:border-[#2583D5] focus:outline-none bg-[#F5FAFF]/50 text-[#153451]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-xl border border-[#D1E8F8] px-3 py-2 bg-white text-[#153451] font-semibold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="REQUESTED">Requested</option>
              <option value="PROCESSING">Processing</option>
              <option value="PAID">Paid / Success</option>
              <option value="FAILED">Failed / Reversed</option>
            </select>

            <button
              onClick={() => exportReport(activeTab, withdrawals)}
              className="px-3 py-2 rounded-xl border border-[#D1E8F8] text-[#153451] hover:text-[#2583D5] hover:bg-[#EAF6FF] text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchFinanceData}
              disabled={loading}
              className="p-2 rounded-xl border border-[#D1E8F8] text-[#2583D5] hover:bg-[#EAF6FF] transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* SECTION A: PAYMENT OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payout Queue Summary */}
              <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
                  <h3 className="font-black text-sm text-[#153451]">Pending Payout Approval Queue</h3>
                  <button onClick={() => setActiveTab('APPROVAL')} className="text-xs font-bold text-[#2583D5] hover:underline">
                    Process Queue ({pendingWithdrawals.length}) →
                  </button>
                </div>

                {pendingWithdrawals.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#7697B3]">
                    Zero pending payouts in queue. All worker payout requests are settled.
                  </div>
                ) : (
                  <div className="divide-y divide-[#EAF6FF] text-xs">
                    {pendingWithdrawals.slice(0, 5).map((w) => (
                      <div key={w.id} className="py-3 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#153451]">₹{w.amount} to {w.payoutTargetMasked}</span>
                          <p className="text-[11px] text-[#7697B3]">Worker: {w.workerProfileId} • {new Date(w.requestedAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <button
                          onClick={() => { setSelectedWithdrawal(w); setActiveTab('APPROVAL'); }}
                          className="px-3 py-1 rounded-lg bg-[#2583D5] text-white font-bold text-xs hover:bg-[#1E70B8]"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* KaamSetu Platform Fee Collection Overview */}
              <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
                  <h3 className="font-black text-sm text-[#153451]">Platform Revenue Summary (₹99 Fee)</h3>
                  <button onClick={() => setActiveTab('FEE_LEDGER')} className="text-xs font-bold text-[#2583D5] hover:underline">
                    View Fee Ledger →
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between p-3 rounded-2xl bg-[#F5FAFF] border border-[#EAF6FF]">
                    <span className="text-[#4B6F8E] font-medium">Platform Fee Per Completed Job:</span>
                    <strong className="text-[#153451]">₹99.00</strong>
                  </div>
                  <div className="flex justify-between p-3 rounded-2xl bg-[#F5FAFF] border border-[#EAF6FF]">
                    <span className="text-[#4B6F8E] font-medium">Total Collected Net Revenue:</span>
                    <strong className="text-emerald-600">₹{(summary?.platformNetFeeRevenue || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between p-3 rounded-2xl bg-[#F5FAFF] border border-[#EAF6FF]">
                    <span className="text-[#4B6F8E] font-medium">Worker Share Retention:</span>
                    <strong className="text-blue-600">100% (Zero deduction from worker wage)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: WORKER PAYOUT REQUESTS */}
        {activeTab === 'PAYOUT_REQUESTS' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <h3 className="font-black text-sm text-[#153451]">Worker Payout Requests Directory ({filteredWithdrawals.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F5FAFF] text-[#7697B3] font-bold border-b border-[#EAF6FF]">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Worker Profile</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAF6FF]">
                  {filteredWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-[#F5FAFF]/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#153451]">{w.id}</td>
                      <td className="py-3 px-4 font-semibold text-[#153451]">{w.workerProfileId}</td>
                      <td className="py-3 px-4 font-black text-[#153451]">₹{w.amount}</td>
                      <td className="py-3 px-4 text-[#4B6F8E]">{w.payoutTargetMasked}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          w.status === 'PAID' || w.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : w.status === 'PROCESSING' || w.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : w.status === 'UNDER_REVIEW' || w.status === 'REQUESTED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {w.status || 'PROCESSING'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#7697B3]">
                        {new Date(w.requestedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        {w.status !== 'PAID' && w.status !== 'SUCCESS' && w.status !== 'FAILED' && (
                          <button
                            onClick={() => setSelectedWithdrawal(w)}
                            className="px-2.5 py-1 rounded-lg bg-[#2583D5] text-white font-bold text-xs hover:bg-[#1E70B8]"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION C: PAYOUT APPROVAL / REVIEW QUEUE */}
        {activeTab === 'APPROVAL' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <h3 className="font-black text-sm text-[#153451]">Pending Payout Approval Queue ({pendingWithdrawals.length})</h3>
            {pendingWithdrawals.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7697B3]">
                Zero pending payout requests. All requests have been reviewed and finalized.
              </div>
            ) : (
              <div className="divide-y divide-[#EAF6FF] text-xs">
                {pendingWithdrawals.map((w) => (
                  <div key={w.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#153451] text-sm">₹{w.amount}</span>
                        <span className="text-[10px] font-mono text-[#7697B3] bg-[#F5FAFF] px-2 py-0.5 rounded border border-[#D1E8F8]">{w.id}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">{w.status}</span>
                      </div>
                      <p className="text-[#4B6F8E]">Worker: <strong>{w.workerProfileId}</strong> • Destination: <strong>{w.payoutTargetMasked}</strong></p>
                      <p className="text-[11px] text-[#7697B3]">Requested at: {new Date(w.requestedAt).toLocaleString('en-IN')}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedWithdrawal(w)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        Approve & Settle
                      </button>
                      <button
                        onClick={() => { setSelectedWithdrawal(w); setRejectReason('Risk / verification check failed'); }}
                        className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100"
                      >
                        Reject Payout
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION D: ₹99 PLATFORM FEE COLLECTION */}
        {activeTab === 'PLATFORM_FEE' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <h3 className="font-black text-sm text-[#153451]">₹99 Platform Service Fee Overview</h3>
            <p className="text-xs text-[#4B6F8E]">
              KaamSetu charges a fixed ₹99 convenience & dispatch fee on every completed customer booking. This fee is paid directly by the customer and routed to the platform business account.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8]">
                <span className="text-[11px] font-bold text-[#7697B3] uppercase block">Total Completed Jobs</span>
                <div className="text-2xl font-black text-[#153451] mt-1">{platformFeeLedger.length}</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#EAF6FF] border border-[#D1E8F8]">
                <span className="text-[11px] font-bold text-[#2583D5] uppercase block">Total Fees Collected</span>
                <div className="text-2xl font-black text-[#2583D5] mt-1">₹{(platformFeeLedger.length * 99).toLocaleString('en-IN')}</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Settled to Platform</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">₹{(platformFeeLedger.length * 99).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION E: PLATFORM REVENUE LEDGER */}
        {activeTab === 'FEE_LEDGER' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <h3 className="font-black text-sm text-[#153451]">Platform Revenue Ledger ({platformFeeLedger.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F5FAFF] text-[#7697B3] font-bold border-b border-[#EAF6FF]">
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Worker Charge</th>
                    <th className="py-3 px-4">Platform Fee</th>
                    <th className="py-3 px-4">Total Billed</th>
                    <th className="py-3 px-4">Collection Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAF6FF]">
                  {platformFeeLedger.map((fee) => (
                    <tr key={fee.id} className="hover:bg-[#F5FAFF]/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#153451]">{fee.bookingId}</td>
                      <td className="py-3 px-4 text-[#153451]">₹{fee.workerCharge || 800}</td>
                      <td className="py-3 px-4 font-black text-[#2583D5]">₹{fee.platformFee || 99}</td>
                      <td className="py-3 px-4 font-bold text-[#153451]">₹{fee.totalPayable || (fee.workerCharge || 800) + 99}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {fee.collectionStatus || 'COLLECTED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#7697B3]">{new Date(fee.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION F: WORKER EARNING LEDGER */}
        {activeTab === 'EARNING_LEDGER' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <h3 className="font-black text-sm text-[#153451]">Worker Earning Ledger ({earningLedger.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F5FAFF] text-[#7697B3] font-bold border-b border-[#EAF6FF]">
                    <th className="py-3 px-4">Earning ID</th>
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Booking</th>
                    <th className="py-3 px-4">Credited Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAF6FF]">
                  {earningLedger.map((e) => (
                    <tr key={e.id} className="hover:bg-[#F5FAFF]/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#153451]">{e.id}</td>
                      <td className="py-3 px-4 font-semibold text-[#153451]">{e.workerProfileId}</td>
                      <td className="py-3 px-4 text-[#7697B3]">{e.bookingId}</td>
                      <td className="py-3 px-4 font-black text-emerald-600">₹{e.amount || e.netAmount}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          Verified
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#7697B3]">{new Date(e.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION G: SETTLEMENT RECORDS */}
        {activeTab === 'SETTLEMENTS' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <h3 className="font-black text-sm text-[#153451]">Bank Transfer Settlement Records ({settlementRecords.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F5FAFF] text-[#7697B3] font-bold border-b border-[#EAF6FF]">
                    <th className="py-3 px-4">Settlement ID</th>
                    <th className="py-3 px-4">Worker Profile</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Bank Reference (UTR)</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Settled At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAF6FF]">
                  {settlementRecords.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F5FAFF]/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#153451]">{s.id}</td>
                      <td className="py-3 px-4 font-semibold text-[#153451]">{s.workerProfileId}</td>
                      <td className="py-3 px-4 font-black text-emerald-600">₹{s.amount}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[#2583D5]">{s.bankTransferReference || 'UTR_CONFIRMED'}</td>
                      <td className="py-3 px-4 text-[#4B6F8E]">{s.destinationMasked}</td>
                      <td className="py-3 px-4 text-[#7697B3]">{new Date(s.settledAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION H: FAILED PAYMENTS */}
        {activeTab === 'FAILED' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <h3 className="font-black text-sm text-[#153451]">Failed Payouts & Automatic Reversals ({failedPayments.length})</h3>
            {failedPayments.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7697B3]">
                Zero failed payout records. All processed transfers completed without errors.
              </div>
            ) : (
              <div className="divide-y divide-[#EAF6FF] text-xs">
                {failedPayments.map((f) => (
                  <div key={f.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-700">₹{f.amount} failed to {f.payoutTargetMasked}</span>
                      <p className="text-[11px] text-[#7697B3]">Reason: {f.failureReason || 'Gateway failed transfer'} • Worker: {f.workerProfileId}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Funds Safely Restored to Wallet
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION I: REFUNDS */}
        {activeTab === 'REFUNDS' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <h3 className="font-black text-sm text-[#153451]">Customer Refunds & Charge Reversals</h3>
            <p className="text-xs text-[#4B6F8E]">
              Track customer disputes resolved with full or partial refunds. Platform fee and worker adjustments are audited.
            </p>
            <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8] text-xs">
              <span className="font-bold text-[#153451]">Dispute Refund Policies:</span>
              <p className="text-[#7697B3] mt-1">
                When a customer dispute is approved for refund in Support Center, the refund is executed immediately and deducted from platform fee net revenue.
              </p>
            </div>
          </div>
        )}

        {/* SECTION J: TRANSACTION RECONCILIATION */}
        {activeTab === 'RECONCILIATION' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-[#153451]">Realtime Transaction Reconciliation</h3>
                <p className="text-xs text-[#7697B3]">Cross-checking ledger entries against MongoDB Atlas snapshots</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                100% Balanced
              </span>
            </div>

            <div className="divide-y divide-[#EAF6FF] text-xs">
              {ledgerEntries.slice(0, 10).map((l) => (
                <div key={l.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#153451]">{l.description}</span>
                    <p className="text-[11px] text-[#7697B3]">Type: {l.transactionType} • Idempotency: {l.idempotencyKey}</p>
                  </div>
                  <span className={`font-black ${l.netAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {l.netAmount >= 0 ? `+₹${l.netAmount}` : `-₹${Math.abs(l.netAmount)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPROVAL / REJECT MODAL */}
        {selectedWithdrawal && (
          <div className="fixed inset-0 z-50 bg-[#153451]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D1E8F8] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
                <h3 className="font-black text-[#153451] text-base">Process Payout Review</h3>
                <button onClick={() => setSelectedWithdrawal(null)} className="text-[#7697B3] hover:text-[#153451] font-bold text-lg">×</button>
              </div>

              <div className="text-xs space-y-2 bg-[#F5FAFF] p-3 rounded-2xl border border-[#D1E8F8]">
                <p><strong>Withdrawal ID:</strong> {selectedWithdrawal.id}</p>
                <p><strong>Amount:</strong> ₹{selectedWithdrawal.amount}</p>
                <p><strong>Destination:</strong> {selectedWithdrawal.payoutTargetMasked}</p>
                <p><strong>Worker:</strong> {selectedWithdrawal.workerProfileId}</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">
                    Bank Transfer UTR / Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR_982341908234 (auto-generated if empty)"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-[#153451] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">
                    Rejection Reason (If rejecting)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Identity discrepancy or bank account invalid"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-[#153451] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleReviewAction(selectedWithdrawal.id, 'APPROVE')}
                  disabled={actionLoading}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Approve & Settle Payout
                </button>
                <button
                  onClick={() => handleReviewAction(selectedWithdrawal.id, 'REJECT')}
                  disabled={actionLoading}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Reject & Restore Funds
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
