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
  Percent,
  FileText,
  Search,
  Plus,
  Eye,
  Check,
  X
} from 'lucide-react';
import { WalletLedgerEntry, Withdrawal, CommissionRule } from '@/lib/types';

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WITHDRAWALS' | 'TRANSACTIONS' | 'COMMISSIONS'>('OVERVIEW');
  const [summary, setSummary] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<WalletLedgerEntry[]>([]);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Filter state
  const [withdrawalFilter, setWithdrawalFilter] = useState('ALL');
  const [txFilter, setTxFilter] = useState('ALL');

  // Add / Edit Commission Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleProfession, setRuleProfession] = useState('');
  const [ruleRate, setRuleRate] = useState(10);

  const fetchFinanceData = async () => {
    try {
      const [sumRes, wdrRes, txRes, commRes] = await Promise.all([
        fetch('/api/admin/finance/summary'),
        fetch(`/api/admin/finance/withdrawals?status=${withdrawalFilter}`),
        fetch(`/api/admin/finance/transactions?type=${txFilter}`),
        fetch('/api/admin/finance/commissions'),
      ]);

      const sumData = await sumRes.json();
      if (sumData.success) setSummary(sumData.summary);

      const wdrData = await wdrRes.json();
      if (wdrData.success) setWithdrawals(wdrData.withdrawals || []);

      const txData = await txRes.json();
      if (txData.success) setTransactions(txData.transactions || []);

      const commData = await commRes.json();
      if (commData.success) setCommissionRules(commData.commissionRules || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [withdrawalFilter, txFilter]);

  const handleReviewWithdrawal = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/finance/withdrawals/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        fetchFinanceData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveCommissionRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/finance/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ruleName,
          professionSlug: ruleProfession || undefined,
          percentageRate: Number(ruleRate),
          commissionType: 'PERCENTAGE',
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsRuleModalOpen(false);
        setRuleName('');
        setRuleProfession('');
        fetchFinanceData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#173D2B] border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-sm text-[#173D2B]">Loading Admin Financial Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-3 sm:px-6 lg:px-8 bg-[#F7F7F2] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white border border-[#D4DED5] text-[#173D2B] hover:bg-[#E8ECE9] shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#173D2B]">
                  Financial Control & Settlement Desk
                </h1>
                <span className="bg-[#173D2B] text-[#B7E36A] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Admin Finance
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Audited ledger reconciliation • Withdrawal approval queue • Platform commission rules
              </p>
            </div>
          </div>

          <button
            onClick={fetchFinanceData}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#D4DED5] text-xs font-bold text-[#173D2B] hover:bg-gray-50 flex items-center gap-1.5 shadow-xs w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Records
          </button>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-emerald-700 hover:text-black">✕</button>
          </div>
        )}

        {/* 4 Macro Financial KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D4DED5] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Gross Marketplace Volume
            </span>
            <div className="text-2xl font-black text-[#173D2B]">
              ₹{(summary?.totalGrossRevenue || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">Online & Cash GMV</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D4DED5] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Worker Earnings
            </span>
            <div className="text-2xl font-black text-emerald-700">
              ₹{(summary?.totalWorkerEarnings || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-gray-500 font-semibold">Net credited to wallets</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D4DED5] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Platform Commissions
            </span>
            <div className="text-2xl font-black text-[#F2A65A]">
              ₹{(summary?.totalPlatformCommissions || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-gray-500 font-semibold">10% Platform Revenue</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D4DED5] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Pending Withdrawals
            </span>
            <div className="text-2xl font-black text-amber-600">
              ₹{(summary?.pendingWithdrawalsAmount || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-amber-700 font-semibold">
              {summary?.pendingWithdrawalsCount || 0} requests awaiting transfer
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-[#D4DED5] shadow-xs text-xs">
          {[
            { key: 'OVERVIEW', label: 'Financial Summary' },
            { key: 'WITHDRAWALS', label: `Withdrawal Queue (${withdrawals.length})` },
            { key: 'TRANSACTIONS', label: `Master Ledger (${transactions.length})` },
            { key: 'COMMISSIONS', label: `Commission Rules (${commissionRules.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl font-bold transition text-xs ${
                activeTab === tab.key
                  ? 'bg-[#173D2B] text-[#B7E36A] shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-[#D4DED5] shadow-xs space-y-3">
              <h3 className="font-black text-[#173D2B] text-sm border-b border-[#D4DED5] pb-2">
                Cash vs Online Job Reconciliation
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Total Cash Jobs GMV:</span>
                  <strong className="text-[#173D2B]">₹{(summary?.totalCashVolume || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Outstanding Commission Payable:</span>
                  <strong className="text-amber-700">₹{(summary?.totalOutstandingCashCommission || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Total Settled Bank Payouts:</span>
                  <strong className="text-emerald-700">₹{(summary?.totalWithdrawnAmount || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-600">Total Active Worker Wallets:</span>
                  <strong className="text-[#173D2B]">{summary?.totalWalletsCount || 0} Wallets</strong>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#D4DED5] shadow-xs space-y-3">
              <h3 className="font-black text-[#173D2B] text-sm border-b border-[#D4DED5] pb-2">
                Payout Gateway Integration State
              </h3>
              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#D4DED5] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-semibold">Active Gateway Provider:</span>
                  <strong className="bg-[#173D2B] text-[#B7E36A] px-2 py-0.5 rounded font-mono text-[11px]">
                    RAZORPAYX / CASHFREE
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-semibold">Automated Settlement:</span>
                  <strong className="text-emerald-700 font-bold">Enabled with Verification Lock</strong>
                </div>
                <p className="text-[11px] text-gray-500 pt-1 border-t border-[#D4DED5]">
                  Funds are atomically reserved upon worker request and released or finalized upon signed gateway webhooks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WITHDRAWALS QUEUE */}
        {activeTab === 'WITHDRAWALS' && (
          <div className="bg-white rounded-3xl border border-[#D4DED5] shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-500">Filter Status:</span>
                {['ALL', 'PROCESSING', 'SUCCESS', 'FAILED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setWithdrawalFilter(s)}
                    className={`px-3 py-1 rounded-xl font-bold transition text-[11px] ${
                      withdrawalFilter === s ? 'bg-[#173D2B] text-[#B7E36A]' : 'bg-[#F7F7F2] text-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {withdrawals.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10">No withdrawal requests found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D4DED5] text-gray-500 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Worker / Target</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Provider Ref</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-[#F7F7F2]/50">
                        <td className="py-3 px-3 text-gray-500 whitespace-nowrap text-[11px]">
                          {new Date(w.requestedAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          <strong className="text-[#173D2B] block text-xs">{w.payoutTargetMasked}</strong>
                          <span className="text-[10px] text-gray-400">ID: {w.workerProfileId}</span>
                        </td>
                        <td className="py-3 px-3 font-black text-sm whitespace-nowrap text-emerald-700">
                          ₹{w.amount}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            w.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                            w.status === 'PROCESSING' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-gray-600">
                          {w.providerPayoutId || 'pout_pending'}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {w.status === 'PROCESSING' && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleReviewWithdrawal(w.id, 'APPROVE')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReviewWithdrawal(w.id, 'REJECT')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[11px] hover:bg-red-700"
                              >
                                Reject & Restore
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MASTER LEDGER */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="bg-white rounded-3xl border border-[#D4DED5] shadow-xs p-5 sm:p-6 space-y-4">
            <h3 className="font-black text-[#173D2B] text-sm border-b border-[#D4DED5] pb-2">
              Auditable Master Transaction Ledger ({transactions.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D4DED5] text-gray-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Worker ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Gross</th>
                    <th className="py-2.5 px-3">Commission</th>
                    <th className="py-2.5 px-3">Net</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#F7F7F2]/50">
                      <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                        {tx.workerProfileId}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#173D2B] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E8ECE9]">
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-semibold">₹{tx.grossAmount}</td>
                      <td className="py-2.5 px-3 text-red-600 whitespace-nowrap">
                        {tx.commissionAmount ? `-₹${tx.commissionAmount}` : '₹0'}
                      </td>
                      <td className="py-2.5 px-3 font-black whitespace-nowrap">
                        <span className={tx.netAmount > 0 ? 'text-emerald-700' : 'text-gray-700'}>
                          {tx.netAmount > 0 ? `+₹${tx.netAmount}` : tx.netAmount === 0 ? '₹0' : `-₹${Math.abs(tx.netAmount)}`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 truncate max-w-xs">{tx.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: COMMISSION RULES */}
        {activeTab === 'COMMISSIONS' && (
          <div className="bg-white rounded-3xl border border-[#D4DED5] shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4DED5] pb-2">
              <h3 className="font-black text-[#173D2B] text-sm">
                Configured Commission Rules
              </h3>
              <button
                onClick={() => setIsRuleModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#173D2B] text-[#B7E36A] text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Rule
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {commissionRules.map((rule) => (
                <div key={rule.id} className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#D4DED5] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-[#173D2B] font-black text-sm">{rule.name}</strong>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {rule.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#F2A65A]">
                    {rule.percentageRate}%
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Scope: {rule.professionSlug ? `Profession: ${rule.professionSlug}` : 'Platform-Wide Default'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ADD COMMISSION RULE MODAL */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D4DED5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4DED5] pb-2">
              <h3 className="font-black text-[#173D2B] text-base">Configure Commission Rule</h3>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSaveCommissionRule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Rule Name:</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Promotional AC Technician Rate"
                  className="w-full p-2.5 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Profession Slug (Optional):</label>
                <input
                  type="text"
                  value={ruleProfession}
                  onChange={(e) => setRuleProfession(e.target.value)}
                  placeholder="e.g. ac-technicians, electricians (Leave blank for global)"
                  className="w-full p-2.5 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Commission Rate (%):</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={ruleRate}
                  onChange={(e) => setRuleRate(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] font-semibold"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#173D2B] text-[#B7E36A] font-bold uppercase tracking-wider"
                >
                  Save Commission Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
