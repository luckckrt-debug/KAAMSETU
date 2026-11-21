'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  AlertCircle,
  Building,
  Smartphone,
  Info,
  Calendar,
  X,
  Radio,
  FileText
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { WorkerEarningSummary, WalletLedgerEntry, Withdrawal, PayoutAccount } from '@/lib/types';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function WorkerEarningsPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSACTIONS' | 'JOBS' | 'WITHDRAWALS' | 'ACCOUNTS'>('OVERVIEW');
  const [summary, setSummary] = useState<WorkerEarningSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletLedgerEntry[]>([]);
  const [jobEarnings, setJobEarnings] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state for transactions
  const [txFilter, setTxFilter] = useState<string>('ALL');

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>(500);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawSuccessInfo, setWithdrawSuccessInfo] = useState<Withdrawal | null>(null);
  const [withdrawError, setWithdrawError] = useState('');

  // Add Payout Account Modal State
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccountType, setNewAccountType] = useState<'BANK_ACCOUNT' | 'UPI'>('BANK_ACCOUNT');
  const [newHolderName, setNewHolderName] = useState('Ramesh Sharma');
  const [newBankName, setNewBankName] = useState('HDFC Bank');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [newUpiId, setNewUpiId] = useState('');
  const [accountSubmitting, setAccountSubmitting] = useState(false);
  const [accountError, setAccountError] = useState('');

  // Status message toast
  const [toastMessage, setToastMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);

  // Fetch all financial data
  const fetchAllFinancialData = async () => {
    try {
      const [sumRes, txRes, jobsRes, wdrRes, accRes] = await Promise.all([
        fetch('/api/worker/earnings/summary'),
        fetch(`/api/worker/wallet/transactions?filter=${txFilter}`),
        fetch('/api/worker/earnings/history'),
        fetch('/api/worker/withdrawals'),
        fetch('/api/worker/payout-accounts'),
      ]);

      const sumData = await sumRes.json();
      if (sumData.success) setSummary(sumData.summary);

      const txData = await txRes.json();
      if (txData.success) setTransactions(txData.transactions || []);

      const jobsData = await jobsRes.json();
      if (jobsData.success) setJobEarnings(jobsData.jobEarnings || []);

      const wdrData = await wdrRes.json();
      if (wdrData.success) setWithdrawals(wdrData.withdrawals || []);

      const accData = await accRes.json();
      if (accData.success) {
        setPayoutAccounts(accData.payoutAccounts || []);
        const primary = accData.payoutAccounts?.find((p: any) => p.isPrimary) || accData.payoutAccounts?.[0];
        if (primary && !selectedAccountId) setSelectedAccountId(primary.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFinancialData();

    // Setup Real-time WebSocket connection
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('wallet:subscribe', { workerProfileId: 'worker-prof-1' });
    });

    // Real-time wallet credit & balance update
    socket.on('wallet:balance:updated', (data: any) => {
      setSummary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            availableBalance: data.availableBalance,
            reservedBalance: data.reservedBalance,
          },
          withdrawableAmount: data.availableBalance,
        };
      });
    });

    socket.on('wallet:earning:credited', (data: any) => {
      setToastMessage(
        data.isCash
          ? `Cash job recorded: ₹${data.grossAmount}. Commission payable: ₹${data.commissionAmount}`
          : `🎉 ₹${data.netAmount} successfully credited to your wallet!`
      );
      fetchAllFinancialData();
    });

    socket.on('wallet:withdrawal:created', () => fetchAllFinancialData());
    socket.on('wallet:withdrawal:updated', () => fetchAllFinancialData());

    const interval = setInterval(fetchAllFinancialData, 12000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [txFilter]);

  // Handle Withdrawal Submission
  const handleConfirmWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0 || !selectedAccountId) {
      setWithdrawError('Please enter a valid amount and choose a payout account');
      return;
    }

    setWithdrawSubmitting(true);
    setWithdrawError('');

    try {
      const res = await fetch('/api/worker/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutAccountId: selectedAccountId,
          amount: Number(withdrawAmount),
          idempotencyKey: `wdr_req_${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWithdrawSuccessInfo(data.withdrawal);
        setToastMessage(`Withdrawal of ₹${data.withdrawal.amount} requested successfully.`);
        fetchAllFinancialData();
      } else {
        setWithdrawError(data.error || 'Withdrawal failed. Check balance.');
      }
    } catch (e: any) {
      setWithdrawError(e.message || 'Network error');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  // Handle Add Payout Account
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSubmitting(true);
    setAccountError('');

    try {
      const res = await fetch('/api/worker/payout-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType: newAccountType,
          accountHolderName: newHolderName,
          bankName: newAccountType === 'BANK_ACCOUNT' ? newBankName : undefined,
          accountNumberMasked: newAccountType === 'BANK_ACCOUNT' ? `•••• •••• ${newAccountNumber.slice(-4)}` : undefined,
          ifscCode: newAccountType === 'BANK_ACCOUNT' ? newIfsc.toUpperCase() : undefined,
          upiId: newAccountType === 'UPI' ? newUpiId : undefined,
          isPrimary: payoutAccounts.length === 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddAccountModalOpen(false);
        setToastMessage('New verified payout account added.');
        setNewAccountNumber('');
        setNewIfsc('');
        setNewUpiId('');
        fetchAllFinancialData();
      } else {
        setAccountError(data.error || 'Failed to add payout account.');
      }
    } catch (e: any) {
      setAccountError(e.message || 'Network error');
    } finally {
      setAccountSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#173D2B] border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-sm text-[#173D2B]">Loading digital wallet & immutable ledger...</p>
        </div>
      </div>
    );
  }

  const wallet = summary?.wallet;
  const availableBal = wallet?.availableBalance || 0;
  const reservedBal = wallet?.reservedBalance || 0;
  const pendingBal = wallet?.pendingBalance || 0;
  const commissionPayable = wallet?.commissionPayable || 0;

  return (
    <DashboardLayout
      role="WORKER"
      title="Worker Earnings & Digital Wallet"
      subtitle="दैनिक व मासिक पारिश्रमिक • UPI डिजिटल वॉलेट व तत्काल बैंक निकासी"
    >
      <div className="max-w-5xl mx-auto space-y-5">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/worker/dashboard"
              className="p-2 rounded-xl bg-white border border-[#D4DED5] text-[#173D2B] hover:bg-[#E8ECE9] shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#153451]">
                  Worker Earnings & Digital Wallet
                </h1>
                <span className="bg-[#EAF6FF] text-[#2583D5] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#D1E8F8]">
                  <Radio className="w-3 h-3 animate-pulse" /> Live Settlement
                </span>
              </div>
              <p className="text-xs text-[#7697B3]">
                100% fair wage retention • ₹99 platform convenience fee paid separately by customer • Zero hidden deductions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllFinancialData}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#D4DED5] text-xs font-bold text-[#173D2B] hover:bg-gray-50 flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Balance
            </button>
            <button
              onClick={() => {
                setWithdrawError('');
                setWithdrawSuccessInfo(null);
                setIsWithdrawModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#2583D5]/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw Money (निकासी)
            </button>
          </div>
        </div>

        {/* Realtime Toast Banner */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:text-black">✕</button>
          </div>
        )}

        {/* Main Balance Hero Card */}
        <div className="bg-gradient-to-tr from-[#123B5D] to-[#1E5785] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#60B5F5] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> Available for Withdrawal (निकासी योग्य शेष)
              </span>
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
                <span>₹{availableBal.toLocaleString('en-IN')}</span>
                <span className="text-xs font-bold text-slate-300">INR</span>
              </div>
              <p className="text-xs text-slate-300 pt-1">
                Settles immediately to your verified primary payout account with 0 fee.
              </p>
            </div>

            {/* Quick Metrics Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6 text-xs">
              <div>
                <span className="text-slate-300 block text-[11px] font-semibold">Reserved in Payout:</span>
                <strong className="text-lg font-black text-amber-400">₹{reservedBal}</strong>
                <span className="text-[10px] text-slate-300 block">Processing transfer</span>
              </div>

              <div>
                <span className="text-slate-300 block text-[11px] font-semibold">Lifetime Net Earned:</span>
                <strong className="text-lg font-black text-white">₹{summary?.lifetimeEarnings.toLocaleString('en-IN') || 0}</strong>
                <span className="text-[10px] text-emerald-400 block">100% verified</span>
              </div>

              {commissionPayable > 0 && (
                <div>
                  <span className="text-amber-300 block text-[11px] font-semibold">Cash Commission Due:</span>
                  <strong className="text-lg font-black text-amber-400">₹{commissionPayable}</strong>
                  <span className="text-[10px] text-slate-300 block">From cash jobs</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Time-series Analytics KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#D4DED5] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Today's Net Earnings
            </span>
            <div className="text-2xl font-black text-[#173D2B]">
              ₹{summary?.todayEarnings.toLocaleString('en-IN') || 0}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">Credited today</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D4DED5] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              This Week (7 Days)
            </span>
            <div className="text-2xl font-black text-[#173D2B]">
              ₹{summary?.thisWeekEarnings.toLocaleString('en-IN') || 0}
            </div>
            <span className="text-[10px] text-gray-500 font-semibold">Weekly performance</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D4DED5] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              This Month
            </span>
            <div className="text-2xl font-black text-[#173D2B]">
              ₹{summary?.thisMonthEarnings.toLocaleString('en-IN') || 0}
            </div>
            <span className="text-[10px] text-gray-500 font-semibold">Current cycle</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D4DED5] shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Withdrawn
            </span>
            <div className="text-2xl font-black text-[#2D6547]">
              ₹{summary?.totalWithdrawn.toLocaleString('en-IN') || 0}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Paid out to bank</span>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-[#D4DED5] shadow-xs text-xs">
          {[
            { key: 'OVERVIEW', label: 'Financial Overview & Analytics' },
            { key: 'TRANSACTIONS', label: `Transactions Ledger (${transactions.length})` },
            { key: 'JOBS', label: `Job Earnings (${jobEarnings.length})` },
            { key: 'WITHDRAWALS', label: `Withdrawals (${withdrawals.length})` },
            { key: 'ACCOUNTS', label: `Payout Accounts (${payoutAccounts.length})` },
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

        {/* TAB 1: FINANCIAL OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Transparent Fee Transparency Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#D4DED5] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#D4DED5] pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-[#173D2B] text-sm">
                  Transparent Earning Breakdown (पारदर्शी कटौती नियम)
                </h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                DIGIWORK fair pricing guarantees 100% of your agreed charge belongs to you. Platform fees are paid by customers. Zero silent deductions on completed jobs, and 0 withdrawal fees on UPI or bank transfers.
              </p>

              <div className="p-3.5 bg-[#F7F7F2] rounded-2xl border border-[#D4DED5] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Standard Job (e.g. ₹1,000):</span>
                  <strong className="text-[#173D2B]">₹1,000 Gross</strong>
                </div>
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Platform Commission (10%):</span>
                  <span>- ₹100</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-black border-t border-[#D4DED5] pt-1.5 text-sm">
                  <span>Your Net Credited Earning:</span>
                  <span>₹900</span>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 italic">
                * Earnings are credited to your available balance the exact second the customer payment is verified.
              </div>
            </div>

            {/* Performance Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#D4DED5] shadow-xs space-y-4">
              <h3 className="font-black text-[#173D2B] text-sm border-b border-[#D4DED5] pb-3">
                Lifetime Marketplace Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Total Completed Jobs:</span>
                  <strong className="text-[#173D2B]">{summary?.totalCompletedJobs || 0} jobs</strong>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Average Earning per Job:</span>
                  <strong className="text-[#173D2B]">₹{summary?.averageEarningPerJob || 0} / job</strong>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Total Platform Commission Paid:</span>
                  <strong className="text-gray-800">₹{summary?.commissionDeductions.toLocaleString('en-IN') || 0}</strong>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Refunds or Adjustments:</span>
                  <strong className="text-gray-800">₹{summary?.refundsAdjustments || 0}</strong>
                </div>

                <div className="flex justify-between py-1 pt-2">
                  <span className="text-gray-600 font-bold">Verified Payout Methods:</span>
                  <strong className="text-emerald-700 font-black">
                    {payoutAccounts.length} Verified Accounts
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS LEDGER */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="bg-white rounded-3xl border border-[#D4DED5] shadow-xs p-5 sm:p-6 space-y-4">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-gray-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                {['ALL', 'EARNINGS', 'WITHDRAWALS', 'COMPLETED', 'PENDING', 'FAILED'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTxFilter(f)}
                    className={`px-3 py-1 rounded-xl font-bold transition text-[11px] ${
                      txFilter === f
                        ? 'bg-[#173D2B] text-[#B7E36A]'
                        : 'bg-[#F7F7F2] text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <span className="text-gray-500 font-semibold text-[11px]">
                Showing {transactions.length} immutable entries
              </span>
            </div>

            {/* Ledger Table */}
            {transactions.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10">No transactions matching filter.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D4DED5] text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Gross</th>
                      <th className="py-2.5 px-3">Net Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => {
                      const isCredit = tx.netAmount > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-[#F7F7F2]/50 transition">
                          <td className="py-3 px-3 text-gray-500 whitespace-nowrap text-[11px]">
                            {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#173D2B] whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E8ECE9]">
                              {tx.transactionType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-700 max-w-xs truncate">
                            {tx.description}
                          </td>
                          <td className="py-3 px-3 text-gray-600 font-semibold whitespace-nowrap">
                            ₹{tx.grossAmount}
                          </td>
                          <td className="py-3 px-3 font-black whitespace-nowrap">
                            <span className={isCredit ? 'text-emerald-700' : 'text-gray-700'}>
                              {isCredit ? `+₹${tx.netAmount}` : tx.netAmount === 0 ? '₹0' : `-₹${Math.abs(tx.netAmount)}`}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                              tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: JOB EARNINGS */}
        {activeTab === 'JOBS' && (
          <div className="bg-white rounded-3xl border border-[#D4DED5] shadow-xs p-5 sm:p-6 space-y-4">
            <h3 className="font-black text-[#173D2B] text-sm border-b border-[#D4DED5] pb-2">
              Completed Jobs & Payout Breakdown
            </h3>

            {jobEarnings.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10">No completed jobs yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobEarnings.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#D4DED5] space-y-2.5 text-xs hover:border-[#173D2B] transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#173D2B] text-xs">
                        #{job.id.slice(-6)} • {job.serviceCategory}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        job.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {job.paymentStatus}
                      </span>
                    </div>

                    <p className="text-gray-600 text-[11px] truncate">{job.serviceDescription}</p>

                    <div className="pt-2 border-t border-[#D4DED5] flex items-center justify-between font-semibold">
                      <span className="text-gray-500">Gross: ₹{job.grossAmount}</span>
                      <span className="text-red-600 text-[11px]">Fee (10%): -₹{job.commissionAmount}</span>
                      <span className="text-emerald-700 font-black text-sm">Net: ₹{job.netAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WITHDRAWAL HISTORY */}
        {activeTab === 'WITHDRAWALS' && (
          <div className="bg-white rounded-3xl border border-[#D4DED5] shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4DED5] pb-2">
              <h3 className="font-black text-[#173D2B] text-sm">
                Bank & UPI Withdrawal History
              </h3>
              <button
                onClick={() => {
                  setWithdrawError('');
                  setWithdrawSuccessInfo(null);
                  setIsWithdrawModalOpen(true);
                }}
                className="text-xs font-bold text-[#173D2B] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Request Payout
              </button>
            </div>

            {withdrawals.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10">No withdrawal requests yet.</p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((wdr) => (
                  <div
                    key={wdr.id}
                    className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#D4DED5] flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-[#173D2B] text-sm">₹{wdr.amount.toLocaleString('en-IN')}</strong>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          wdr.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                          wdr.status === 'PROCESSING' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          wdr.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {wdr.status}
                        </span>
                      </div>
                      <span className="text-gray-600 block text-[11px] mt-0.5">
                        Target: <strong>{wdr.payoutTargetMasked}</strong> • Requested: {new Date(wdr.requestedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-gray-500">
                      <div>Ref: <code>{wdr.providerPayoutId || wdr.id}</code></div>
                      <div>Fee: ₹{wdr.fee} • Net Payout: <strong className="text-emerald-700">₹{wdr.netPayout}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PAYOUT ACCOUNTS */}
        {activeTab === 'ACCOUNTS' && (
          <div className="bg-white rounded-3xl border border-[#D4DED5] shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4DED5] pb-2">
              <h3 className="font-black text-[#173D2B] text-sm">
                Verified Payout Accounts (बैंक खाता व UPI)
              </h3>
              <button
                onClick={() => {
                  setAccountError('');
                  setIsAddAccountModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#173D2B] text-[#B7E36A] text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Payout Account
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payoutAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-5 rounded-2xl bg-[#F7F7F2] border border-[#D4DED5] space-y-2 text-xs relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {acc.accountType === 'BANK_ACCOUNT' ? (
                        <Building className="w-4 h-4 text-[#173D2B]" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-[#F2A65A]" />
                      )}
                      <strong className="text-[#173D2B] text-sm">
                        {acc.accountType === 'BANK_ACCOUNT' ? acc.bankName || 'Bank Account' : 'UPI ID'}
                      </strong>
                    </div>

                    {acc.isPrimary && (
                      <span className="text-[10px] font-black bg-[#173D2B] text-[#B7E36A] px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 font-mono text-sm">
                    {acc.accountType === 'BANK_ACCOUNT' ? acc.accountNumberMasked : acc.upiId}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-[#D4DED5] text-[11px] text-gray-500">
                    <span>Holder: <strong>{acc.accountHolderName}</strong></span>
                    {acc.ifscCode && <span>IFSC: <strong>{acc.ifscCode}</strong></span>}
                    <span className="text-emerald-700 font-bold">✓ Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* WITHDRAWAL MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D4DED5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4DED5] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#173D2B]" />
                <h3 className="font-black text-[#173D2B] text-base">Withdraw Money</h3>
              </div>
              <button onClick={() => setIsWithdrawModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {withdrawSuccessInfo ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-black text-[#173D2B] text-base">Withdrawal Requested!</h4>
                <p className="text-xs text-gray-600">
                  Amount: <strong>₹{withdrawSuccessInfo.amount}</strong> to <strong>{withdrawSuccessInfo.payoutTargetMasked}</strong>
                </p>
                <div className="p-3 bg-[#F7F7F2] rounded-xl text-xs space-y-1">
                  <div>Status: <strong className="text-amber-700 uppercase">{withdrawSuccessInfo.status}</strong></div>
                  <div>Request ID: <code>{withdrawSuccessInfo.id}</code></div>
                </div>
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#173D2B] text-[#B7E36A] font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmWithdrawal} className="space-y-4">
                <div className="p-3 bg-[#F7F7F2] rounded-2xl border border-[#D4DED5] flex justify-between items-center text-xs">
                  <span className="text-gray-600">Available to Withdraw:</span>
                  <strong className="text-base font-black text-[#173D2B]">₹{availableBal}</strong>
                </div>

                {withdrawError && (
                  <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-xs font-bold">
                    {withdrawError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Enter Amount (₹):
                  </label>
                  <input
                    type="number"
                    min="100"
                    max={availableBal}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] text-sm font-black focus:outline-none focus:border-[#173D2B]"
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    {[500, 1000, availableBal].map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setWithdrawAmount(amt)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-bold hover:bg-gray-200"
                      >
                        {amt === availableBal ? `Max (₹${amt})` : `₹${amt}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Select Verified Payout Account:
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D4DED5] text-xs font-semibold focus:outline-none focus:border-[#173D2B]"
                    required
                  >
                    {payoutAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountType === 'BANK_ACCOUNT' ? `${acc.bankName} (${acc.accountNumberMasked})` : `UPI (${acc.upiId})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 border-t border-[#D4DED5] text-xs space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Withdrawal Fee:</span>
                    <strong className="text-emerald-700">₹0 (Free)</strong>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#173D2B] pt-1 border-t border-gray-100">
                    <span>Net Payout to Bank:</span>
                    <span>₹{withdrawAmount || 0}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={withdrawSubmitting || availableBal < 100}
                  className="w-full py-3.5 rounded-2xl bg-[#173D2B] hover:bg-[#2D6547] text-[#B7E36A] font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  {withdrawSubmitting ? 'Processing Payout...' : 'CONFIRM & WITHDRAW MONEY'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ADD PAYOUT ACCOUNT MODAL */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D4DED5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4DED5] pb-3">
              <h3 className="font-black text-[#173D2B] text-base">Add Verified Payout Account</h3>
              <button onClick={() => setIsAddAccountModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {accountError && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-xs font-bold">
                {accountError}
              </div>
            )}

            <form onSubmit={handleAddAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Account Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAccountType('BANK_ACCOUNT')}
                    className={`py-2 rounded-xl font-bold border ${
                      newAccountType === 'BANK_ACCOUNT' ? 'bg-[#173D2B] text-[#B7E36A] border-[#173D2B]' : 'bg-[#F7F7F2] text-gray-700'
                    }`}
                  >
                    Bank Account (IFSC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAccountType('UPI')}
                    className={`py-2 rounded-xl font-bold border ${
                      newAccountType === 'UPI' ? 'bg-[#173D2B] text-[#B7E36A] border-[#173D2B]' : 'bg-[#F7F7F2] text-gray-700'
                    }`}
                  >
                    UPI ID
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Account Holder Name:</label>
                <input
                  type="text"
                  value={newHolderName}
                  onChange={(e) => setNewHolderName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] font-semibold"
                  required
                />
              </div>

              {newAccountType === 'BANK_ACCOUNT' ? (
                <>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Bank Name:</label>
                    <input
                      type="text"
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank, SBI, ICICI"
                      className="w-full p-2.5 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Account Number:</label>
                    <input
                      type="text"
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      placeholder="Enter 11-16 digit account number"
                      className="w-full p-2.5 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">IFSC Code:</label>
                    <input
                      type="text"
                      value={newIfsc}
                      onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      className="w-full p-2.5 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] font-semibold uppercase"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">UPI ID (VPA):</label>
                  <input
                    type="text"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full p-2.5 rounded-xl border border-[#D4DED5] bg-[#F7F7F2] font-semibold"
                    required
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={accountSubmitting}
                  className="w-full py-3 rounded-xl bg-[#173D2B] text-[#B7E36A] font-bold uppercase tracking-wider"
                >
                  {accountSubmitting ? 'Verifying Account...' : 'Save & Verify Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
