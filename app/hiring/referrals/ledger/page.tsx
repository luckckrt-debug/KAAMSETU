'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  ArrowLeft, 
  Award, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  ArrowUpRight, 
  CreditCard,
  Building2,
  Lock,
  X,
  Sparkles,
  Receipt
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ReferralLedgerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'BANK_TRANSFER' | 'BOOKING_CREDIT'>('UPI');
  const [accountDetails, setAccountDetails] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLedger = () => {
    setLoading(true);
    fetch('/api/referrals/ledger')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setData(d);
        }
      })
      .catch((err) => console.error('Error fetching ledger:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const wallet = data?.wallet || {
    totalEarnings: 0,
    referralEarnings: 0,
    bookingEarnings: 0,
    promotionalBonuses: 0,
    availableBalance: 0,
    pendingRewards: 0,
    totalWithdrawn: 0,
  };

  const transactions = data?.transactions || [];

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);
    setWithdrawing(true);

    try {
      const res = await fetch('/api/referrals/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          paymentMethod,
          accountDetails: accountDetails.trim() || 'UPI Address: partner@okaxis',
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setWithdrawMsg({ type: 'success', text: `Withdrawal of ₹${withdrawAmount} processed! Reference: ${resData.transactionId}` });
        fetchLedger();
        setTimeout(() => {
          setWithdrawModalOpen(false);
          setWithdrawMsg(null);
        }, 2500);
      } else {
        setWithdrawMsg({ type: 'error', text: resData.error || 'Withdrawal request failed.' });
      }
    } catch (err: any) {
      setWithdrawMsg({ type: 'error', text: err?.message || 'Network error processing withdrawal.' });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Referral Earning Ledger"
      subtitle="अपरिवर्तनीय वित्तीय खाता • रेफरल पुरस्कार, उपलब्ध शेष राशि व बैंक निकासी इतिहास"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/hiring/referrals"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#D7E3F1] text-[#0B1F3A] hover:bg-[#F5F8FC] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Refer & Earn Center</span>
          </Link>
          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdraw Balance</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-12">

        {/* 4 EARNINGS BREAKDOWN CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* AVAILABLE WITHDRAWABLE */}
          <div className="p-5 rounded-3xl bg-gradient-to-tr from-[#0B1F3A] to-[#153451] text-white border border-white/10 shadow-lg space-y-2 relative overflow-hidden">
            <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-[#38BDF8]" /> Available Balance
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ₹{wallet.availableBalance}
            </div>
            <p className="text-[11px] text-slate-300">Ready for instant UPI payout or service credits</p>
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="mt-2 w-full py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <span>Withdraw Funds</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* REFERRAL REWARDS */}
          <div className="p-5 rounded-3xl bg-white border border-[#D7E3F1] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#2563EB]" /> Referral Rewards
            </span>
            <div className="text-2xl font-black text-[#0B1F3A]">
              ₹{wallet.referralEarnings}
            </div>
            <p className="text-[11px] text-emerald-600 font-bold">Lifetime earned from referrals</p>
          </div>

          {/* PENDING REWARDS */}
          <div className="p-5 rounded-3xl bg-white border border-[#D7E3F1] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Review
            </span>
            <div className="text-2xl font-black text-amber-600">
              ₹{wallet.pendingRewards}
            </div>
            <p className="text-[11px] text-slate-500">Unlocks on qualifying action</p>
          </div>

          {/* TOTAL WITHDRAWN */}
          <div className="p-5 rounded-3xl bg-white border border-[#D7E3F1] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Total Withdrawn
            </span>
            <div className="text-2xl font-black text-[#0B1F3A]">
              ₹{wallet.totalWithdrawn}
            </div>
            <p className="text-[11px] text-slate-500">Settled to your verified UPI/Bank</p>
          </div>

        </div>

        {/* IMMUTABLE LEDGER DISCLAIMER */}
        <div className="p-4 rounded-2xl bg-[#EDF4FC] border border-[#D7E3F1] flex items-center justify-between text-xs text-[#0B1F3A]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              <strong>DigiWork Financial Governance:</strong> This ledger is strictly append-only and cryptographically audited. Past transactions are never altered or deleted. Adjustments and reversals appear as separate transparent balancing records.
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-[#2563EB] shrink-0 hidden md:inline">
            ENTRIES: {transactions.length}
          </span>
        </div>

        {/* LEDGER TRANSACTIONS TABLE */}
        <div className="bg-white rounded-3xl border border-[#D7E3F1] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E5EEF8] flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#0B1F3A]">Transaction & Reward History</h3>
              <p className="text-xs text-[#7697B3]">Itemized record of credits, qualifying milestones, and disbursements</p>
            </div>
            <button
              onClick={fetchLedger}
              className="p-2 rounded-xl border border-[#D7E3F1] text-slate-500 hover:text-[#0B1F3A] hover:bg-[#F5F8FC] transition"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#7697B3]">Loading financial ledger records...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F8FC] text-slate-400 flex items-center justify-center mx-auto">
                <Receipt className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black text-[#0B1F3A]">No Transactions Yet</h4>
              <p className="text-xs text-[#7697B3] max-w-sm mx-auto">
                When contacts join and complete their first qualifying booking using your referral link, reward transactions will record automatically here.
              </p>
              <Link
                href="/hiring/referrals"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition"
              >
                <span>Invite Contacts</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F8FC] border-b border-[#D7E3F1] text-[#7697B3] uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-4 px-6">Transaction Ref</th>
                    <th className="py-4 px-6">Date & Time</th>
                    <th className="py-4 px-6">Description / Reason</th>
                    <th className="py-4 px-6">Qualifying Event</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EEF8]">
                  {transactions.map((tx: any) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <tr key={tx.id || tx.transactionId} className="hover:bg-[#F8FCFF] transition">
                        
                        <td className="py-4 px-6 font-mono font-bold text-[#0B1F3A]">
                          {tx.transactionId}
                        </td>

                        <td className="py-4 px-6 text-[#7697B3] font-medium whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-bold text-[#0B1F3A]">{tx.rewardReason}</div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            Type: {tx.referralType?.toLowerCase() || 'partner'}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-medium text-slate-600">
                          {tx.qualifyingEvent?.replace(/_/g, ' ') || 'Registration'}
                        </td>

                        <td className="py-4 px-6">
                          <span className={`font-black text-sm ${isCredit ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {isCredit ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          {tx.status === 'VERIFIED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : tx.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Reversed</span>
                            </span>
                          )}
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

      {/* WITHDRAWAL DIALOG MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 bg-[#0B1F3A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#D7E3F1] space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-[#0B1F3A] p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#0B1F3A]">Withdraw Referral Balance</h3>
              <p className="text-xs text-[#7697B3]">
                Available Withdrawable Balance: <strong className="text-emerald-600 font-black">₹{wallet.availableBalance}</strong>
              </p>
            </div>

            {withdrawMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                withdrawMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}>
                {withdrawMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{withdrawMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-[#0B1F3A]">Payout Destination Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'Instant UPI', sub: 'PhonePe / GPay' },
                    { id: 'BANK_TRANSFER', label: 'IMPS Bank', sub: 'NEFT / RTGS' },
                    { id: 'BOOKING_CREDIT', label: 'Work Credit', sub: 'Zero fee' },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        paymentMethod === m.id
                          ? 'border-[#2563EB] bg-[#EDF4FC] text-[#2563EB] font-bold'
                          : 'border-[#D7E3F1] bg-white text-[#7697B3]'
                      }`}
                    >
                      <div className="font-bold">{m.label}</div>
                      <div className="text-[10px] opacity-75">{m.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#0B1F3A]">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  min="200"
                  max={wallet.availableBalance || 50000}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D7E3F1] font-black text-sm bg-[#F5F8FC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  placeholder="Min ₹200"
                  required
                />
                <span className="text-[10px] text-slate-400">Minimum withdrawal amount is ₹200</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#0B1F3A]">
                  {paymentMethod === 'UPI' ? 'UPI ID (VPA)' : paymentMethod === 'BANK_TRANSFER' ? 'Account Number & IFSC Code' : 'DigiWork User ID'}
                </label>
                <input
                  type="text"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={paymentMethod === 'UPI' ? 'e.g. mobile@okaxis or user@upi' : 'Account: 50100..., IFSC: HDFC000...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D7E3F1] font-mono text-xs bg-[#F5F8FC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EEF8] text-[11px] text-[#7697B3] space-y-1">
                <div className="flex justify-between">
                  <span>Gross Payout:</span>
                  <strong className="text-[#0B1F3A]">₹{withdrawAmount || 0}</strong>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Disbursement Fee:</span>
                  <span>₹0 (100% Free)</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#D7E3F1] text-[#0B1F3A] font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawing || wallet.availableBalance < Number(withdrawAmount) || Number(withdrawAmount) < 200}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20"
                >
                  {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
