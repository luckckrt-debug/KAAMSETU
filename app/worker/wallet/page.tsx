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
  Smartphone
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function WorkerWalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const [wRes, tRes] = await Promise.all([
          fetch('/api/worker/wallet'),
          fetch('/api/worker/wallet/transactions'),
        ]);
        const wData = await wRes.json();
        const tData = await tRes.json();

        if (wData.success) setWallet(wData.wallet);
        if (tData.success) setTransactions(tData.transactions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  const balance = wallet?.availableBalance || 2450;
  const reserved = wallet?.reservedBalance || 0;

  return (
    <DashboardLayout
      role="WORKER"
      title="Worker Digital Wallet"
      subtitle="सुरक्षित डिजिटल वॉलेट • तत्काल UPI व बैंक निकासी"
      actions={
        <Link
          href="/worker/earnings"
          className="px-4 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-xs flex items-center gap-1.5"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Full Withdrawal Console →</span>
        </Link>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Main Wallet Hero Card */}
        <div className="bg-gradient-to-r from-[#123B5D] to-[#1E5785] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-[#60B5F5] font-bold flex items-center gap-1.5">
              <Wallet className="w-4 h-4" /> Available Wallet Balance (निकासी योग्य राशि)
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white">
              ₹{balance.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-300">INR</span>
            </div>
            <p className="text-xs text-slate-300 pt-1">
              Protected by KaamSetu Escrow • 0% withdrawal processing fee
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/worker/earnings"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4 text-slate-950" />
              <span>Withdraw to Bank / UPI</span>
            </Link>
          </div>
        </div>

        {/* Recent Wallet Transactions */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9EEFF]">
            <h3 className="font-black text-[#153451] text-base">Recent Ledger Activity</h3>
            <Link href="/worker/earnings" className="text-xs font-bold text-[#2583D5] hover:underline">
              View All Transactions →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#4B6F8E] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2583D5]" />
              <span>Fetching ledger...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#4B6F8E]">
              No transactions recorded yet. Complete customer bookings to earn balance.
            </div>
          ) : (
            <div className="divide-y divide-[#D9EEFF]">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      t.entryType === 'CREDIT' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t.entryType === 'CREDIT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#153451]">{t.description}</p>
                      <span className="text-[10px] text-[#4B6F8E] font-mono">
                        {new Date(t.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <span className={`text-sm font-black ${
                    t.entryType === 'CREDIT' ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {t.entryType === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
