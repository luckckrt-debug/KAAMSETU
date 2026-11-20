'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  ArrowUpRight, 
  CreditCard, 
  ArrowDownLeft, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw,
  Building,
  Smartphone,
  Info,
  DollarSign,
  AlertCircle,
  FileText,
  X,
  Radio,
  Eye,
  Plus
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function WorkerWalletPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'JOBS' | 'WITHDRAWALS' | 'TRANSACTIONS' | 'ACCOUNTS'>('OVERVIEW');
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [payoutAccounts, setPayoutAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>(800);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Add Account Modal State
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [accountType, setAccountType] = useState<'BANK_ACCOUNT' | 'UPI'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [holderName, setHolderName] = useState('Ramesh Sharma');
  const [accountSubmitting, setAccountSubmitting] = useState(false);

  const fetchWalletData = async () => {
    try {
      const [wRes, tRes, jRes, wdrRes, accRes] = await Promise.all([
        fetch('/api/worker/wallet'),
        fetch('/api/worker/wallet/transactions'),
        fetch('/api/worker/earnings/history'),
        fetch('/api/worker/withdrawals'),
        fetch('/api/worker/payout-accounts'),
      ]);

      const wData = await wRes.json();
      const tData = await tRes.json();
      const jData = await jRes.json();
      const wdrData = await wdrRes.json();
      const accData = await accRes.json();

      if (wData.success) setWallet(wData.wallet);
      if (tData.success) setTransactions(tData.transactions || []);
      if (jData.success) setCompletedJobs(jData.jobEarnings || []);
      if (wdrData.success) setWithdrawals(wdrData.withdrawals || []);
      if (accData.success) {
        setPayoutAccounts(accData.payoutAccounts || []);
        if (accData.payoutAccounts?.length > 0 && !selectedAccountId) {
          setSelectedAccountId(accData.payoutAccounts[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const availableBalance = wallet?.availableBalance || 0;
  const reservedBalance = wallet?.reservedBalance || 0;
  const pendingEarnings = wallet?.pendingBalance || 0;
  const totalLifetimeEarnings = wallet?.totalLifetimeEarnings || 0;
  const totalWithdrawn = wallet?.totalWithdrawn || 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0 || !selectedAccountId) return;

    setWithdrawSubmitting(true);
    setWithdrawMessage(null);

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
        setWithdrawMessage({ text: 'Withdrawal request created. Funds reserved pending settlement.', isError: false });
        fetchWalletData();
        setTimeout(() => {
          setIsWithdrawModalOpen(false);
          setWithdrawMessage(null);
        }, 1500);
      } else {
        setWithdrawMessage({ text: data.error || 'Failed to submit withdrawal request', isError: true });
      }
    } catch (err: any) {
      setWithdrawMessage({ text: err.message, isError: true });
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSubmitting(true);
    try {
      const res = await fetch('/api/worker/payout-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType,
          accountHolderName: holderName,
          bankName: accountType === 'BANK_ACCOUNT' ? bankName : undefined,
          accountNumberMasked: accountType === 'BANK_ACCOUNT' ? `•••• •••• ${accountNumber.slice(-4)}` : undefined,
          ifscCode: accountType === 'BANK_ACCOUNT' ? ifsc.toUpperCase() : undefined,
          upiId: accountType === 'UPI' ? upiId : undefined,
          isPrimary: payoutAccounts.length === 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddAccountModalOpen(false);
        setAccountNumber('');
        setIfsc('');
        setUpiId('');
        fetchWalletData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAccountSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      role="WORKER"
      title="Worker Digital Wallet"
      subtitle="सुरक्षित डिजिटल वॉलेट • 100% पारिश्रमिक गारंटी, शून्य छिपी कटौती व तत्काल UPI / बैंक निकासी"
      actions={
        <button
          onClick={() => setIsWithdrawModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-md shadow-[#2583D5]/20 flex items-center gap-1.5 transition active:scale-95"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Withdraw Money (निकासी)</span>
        </button>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 6 Key Financial Balance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-[#D1E8F8] shadow-xs">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase tracking-wider block">Total Earnings</span>
            <div className="text-xl font-black text-[#153451] mt-1">₹{totalLifetimeEarnings.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-emerald-600 font-bold">100% Worker Share</span>
          </div>

          <div className="bg-gradient-to-tr from-[#2583D5] to-[#1E70B8] text-white rounded-2xl p-4 shadow-md shadow-[#2583D5]/20">
            <span className="text-[10px] font-bold text-[#D1E8F8] uppercase tracking-wider block">Available Balance</span>
            <div className="text-xl font-black text-white mt-1">₹{availableBalance.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-[#EAF6FF] font-medium">Ready to Withdraw</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#D1E8F8] shadow-xs">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase tracking-wider block">Pending Earnings</span>
            <div className="text-xl font-black text-amber-600 mt-1">₹{pendingEarnings.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-[#7697B3]">Active verification</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#D1E8F8] shadow-xs">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase tracking-wider block">Withdrawable</span>
            <div className="text-xl font-black text-[#153451] mt-1">₹{availableBalance.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-emerald-600 font-bold">Min ₹100</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#D1E8F8] shadow-xs">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase tracking-wider block">Processing Payouts</span>
            <div className="text-xl font-black text-[#2583D5] mt-1">₹{reservedBalance.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-[#7697B3]">Safely reserved</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#D1E8F8] shadow-xs">
            <span className="text-[10px] font-bold text-[#7697B3] uppercase tracking-wider block">Successfully Paid</span>
            <div className="text-xl font-black text-emerald-600 mt-1">₹{totalWithdrawn.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-[#7697B3]">To Bank / UPI</span>
          </div>
        </div>

        {/* 5 Navigation Action Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-[#D1E8F8] shadow-xs flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'OVERVIEW' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('JOBS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'JOBS' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            Job Earnings Breakdown ({completedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('WITHDRAWALS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'WITHDRAWALS' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            Withdrawal History ({withdrawals.length})
          </button>
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'TRANSACTIONS' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            Ledger Activity ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('ACCOUNTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'ACCOUNTS' ? 'bg-[#2583D5] text-white shadow-xs' : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            Bank & UPI Details ({payoutAccounts.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* KaamSetu Transparent Pricing Guarantee Banner */}
            <div className="p-4 rounded-3xl bg-[#EAF6FF] border border-[#D1E8F8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2583D5] text-white flex items-center justify-center font-black">
                  ₹
                </div>
                <div>
                  <h4 className="font-black text-[#153451] text-sm">
                    KaamSetu 100% Fair Wage Guarantee
                  </h4>
                  <p className="text-xs text-[#4B6F8E]">
                    Your agreed charge is 100% yours. The ₹99 platform convenience fee is paid separately by the customer. Zero deduction from your earnings.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-[#7697B3] block">Example Calculation:</span>
                <span className="text-xs font-bold text-[#153451]">
                  Work ₹800 + Fee ₹99 = Total ₹899 • <strong className="text-emerald-600">Worker gets ₹800</strong>
                </span>
              </div>
            </div>

            {/* Recent Completed Jobs Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
                <h3 className="font-black text-sm text-[#153451]">Recent Job Earnings Breakdown</h3>
                <button
                  onClick={() => setActiveTab('JOBS')}
                  className="text-xs font-bold text-[#2583D5] hover:underline"
                >
                  View All Jobs →
                </button>
              </div>

              {completedJobs.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#7697B3]">
                  No completed jobs yet. Once a customer confirms your work, earnings appear here instantly.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F5FAFF] text-[#7697B3] font-bold border-b border-[#EAF6FF]">
                        <th className="py-3 px-4">Job Reference</th>
                        <th className="py-3 px-4">Work Amount</th>
                        <th className="py-3 px-4">Platform Fee (Paid by Customer)</th>
                        <th className="py-3 px-4">Customer Total</th>
                        <th className="py-3 px-4">Your Earning (100%)</th>
                        <th className="py-3 px-4">Payout Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAF6FF]">
                      {completedJobs.slice(0, 5).map((job) => {
                        const workAmt = job.agreedRate || job.grossAmount || 800;
                        const fee = 99;
                        const custTotal = workAmt + fee;
                        return (
                          <tr key={job.id || job.bookingId} className="hover:bg-[#F5FAFF]/50 transition">
                            <td className="py-3 px-4 font-mono font-bold text-[#153451]">
                              {job.bookingId || job.id || 'KS-1024'}
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#153451]">₹{workAmt}</td>
                            <td className="py-3 px-4 text-[#7697B3]">₹{fee}</td>
                            <td className="py-3 px-4 font-bold text-[#153451]">₹{custTotal}</td>
                            <td className="py-3 px-4 font-black text-emerald-600">₹{workAmt}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Credited
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
          </div>
        )}

        {/* TAB 2: JOBS BREAKDOWN */}
        {activeTab === 'JOBS' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <h3 className="font-black text-sm text-[#153451]">Completed Jobs & Verified Earnings ({completedJobs.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F5FAFF] text-[#7697B3] font-bold border-b border-[#EAF6FF]">
                    <th className="py-3 px-4">Job ID</th>
                    <th className="py-3 px-4">Work Amount</th>
                    <th className="py-3 px-4">Customer Platform Fee</th>
                    <th className="py-3 px-4">Customer Total</th>
                    <th className="py-3 px-4">Worker Earning</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAF6FF]">
                  {completedJobs.map((job) => {
                    const workAmt = job.agreedRate || job.grossAmount || 800;
                    return (
                      <tr key={job.id || job.bookingId} className="hover:bg-[#F5FAFF]/50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#153451]">
                          {job.bookingId || job.id || 'KS-1024'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#153451]">₹{workAmt}</td>
                        <td className="py-3.5 px-4 text-[#7697B3]">₹99</td>
                        <td className="py-3.5 px-4 font-bold text-[#153451]">₹{workAmt + 99}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-600">₹{workAmt}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            Eligible & Paid
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: WITHDRAWAL HISTORY */}
        {activeTab === 'WITHDRAWALS' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#153451]">Withdrawals & Payout Transfers ({withdrawals.length})</h3>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#2583D5] text-white text-xs font-bold hover:bg-[#1E70B8] transition"
              >
                + New Withdrawal
              </button>
            </div>

            {withdrawals.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7697B3]">
                No withdrawals requested yet. Click above to withdraw available funds.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F5FAFF] text-[#7697B3] font-bold border-b border-[#EAF6FF]">
                      <th className="py-3 px-4">Withdrawal ID</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Requested At</th>
                      <th className="py-3 px-4">Reference / UTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF6FF]">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-[#F5FAFF]/50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#153451]">{w.id}</td>
                        <td className="py-3.5 px-4 font-black text-[#153451]">₹{w.amount}</td>
                        <td className="py-3.5 px-4 font-semibold text-[#4B6F8E]">
                          {w.payoutTargetMasked || w.payoutAccountType || 'Bank / UPI'}
                        </td>
                        <td className="py-3.5 px-4">
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
                        <td className="py-3.5 px-4 text-[#7697B3]">
                          {new Date(w.requestedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#7697B3]">
                          {w.bankTransferReference || w.providerPayoutId || 'In Queue'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRANSACTIONS LEDGER */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <h3 className="font-black text-sm text-[#153451]">Immutable Financial Ledger ({transactions.length})</h3>
            <div className="divide-y divide-[#EAF6FF] text-xs">
              {transactions.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#153451]">{t.description}</span>
                    <p className="text-[11px] text-[#7697B3]">
                      {new Date(t.createdAt).toLocaleString('en-IN')} • Ref: {t.idempotencyKey || t.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-black text-sm ${t.netAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.netAmount >= 0 ? `+₹${t.netAmount}` : `-₹${Math.abs(t.netAmount)}`}
                    </span>
                    <p className="text-[10px] text-[#7697B3]">Balance: ₹{t.balanceAfter}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ACCOUNTS */}
        {activeTab === 'ACCOUNTS' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#153451]">Saved Payout Destinations</h3>
              <button
                onClick={() => setIsAddAccountModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#2583D5] text-white text-xs font-bold hover:bg-[#1E70B8] transition"
              >
                + Add Bank / UPI
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payoutAccounts.map((acc) => (
                <div key={acc.id} className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center font-bold">
                      {acc.accountType === 'UPI' ? <Smartphone className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="font-black text-[#153451] text-xs block">
                        {acc.accountType === 'UPI' ? acc.upiId : `${acc.bankName} (${acc.accountNumberMasked})`}
                      </span>
                      <span className="text-[11px] text-[#7697B3]">{acc.accountHolderName}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WITHDRAWAL MODAL */}
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#153451]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D1E8F8] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
                <h3 className="font-black text-[#153451] text-base">Withdraw Funds to Bank / UPI</h3>
                <button onClick={() => setIsWithdrawModalOpen(false)} className="text-[#7697B3] hover:text-[#153451] font-bold text-lg">×</button>
              </div>

              {withdrawMessage && (
                <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  withdrawMessage.isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {withdrawMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{withdrawMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">
                    Available for Payout
                  </label>
                  <div className="p-3 rounded-xl bg-[#F5FAFF] border border-[#D1E8F8] font-black text-lg text-[#153451]">
                    ₹{availableBalance.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">
                    Withdrawal Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max={availableBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D1E8F8] text-[#153451] font-bold text-base focus:outline-none focus:border-[#2583D5]"
                  />
                  <span className="text-[10px] text-[#7697B3]">Minimum ₹100 • 0% Transfer Fee</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">
                    Select Verified Payout Destination
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-white text-[#153451] font-semibold focus:outline-none"
                  >
                    {payoutAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountType === 'UPI' ? `UPI: ${acc.upiId}` : `${acc.bankName} (${acc.accountNumberMasked})`}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={withdrawSubmitting || availableBalance < 100}
                  className="w-full py-3 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-bold text-xs shadow-md shadow-[#2583D5]/20 flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{withdrawSubmitting ? 'Reserving & Submitting...' : `Confirm Withdrawal of ₹${withdrawAmount}`}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ADD ACCOUNT MODAL */}
        {isAddAccountModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#153451]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D1E8F8] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
                <h3 className="font-black text-[#153451] text-base">Add Payout Account</h3>
                <button onClick={() => setIsAddAccountModalOpen(false)} className="text-[#7697B3] hover:text-[#153451] font-bold text-lg">×</button>
              </div>

              <form onSubmit={handleAddAccount} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">Account Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType('UPI')}
                      className={`py-2 rounded-xl border font-bold ${accountType === 'UPI' ? 'border-[#2583D5] bg-[#EAF6FF] text-[#2583D5]' : 'border-[#D1E8F8] text-[#7697B3]'}`}
                    >
                      UPI ID (VPA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('BANK_ACCOUNT')}
                      className={`py-2 rounded-xl border font-bold ${accountType === 'BANK_ACCOUNT' ? 'border-[#2583D5] bg-[#EAF6FF] text-[#2583D5]' : 'border-[#D1E8F8] text-[#7697B3]'}`}
                    >
                      Bank Account
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">Beneficiary Full Name</label>
                  <input
                    type="text"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-[#153451]"
                  />
                </div>

                {accountType === 'UPI' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. mobile@upi or name@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-[#153451]"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-[#153451]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">Account Number</label>
                      <input
                        type="password"
                        placeholder="Enter full account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-[#153451]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="SBIN0001234"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-[#153451]"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={accountSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-bold text-xs transition"
                >
                  {accountSubmitting ? 'Saving...' : 'Save Payout Destination'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
