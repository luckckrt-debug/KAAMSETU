'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function PlatformFeeLedgerPage() {
  const [summary, setSummary] = useState<any | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'SETTLED' | 'PENDING' | 'REFUNDED'>('ALL');

  const fetchPlatformFees = async () => {
    try {
      const res = await fetch('/api/admin/platform-fees');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setEntries(data.ledgerEntries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlatformFees();
  }, []);

  const filteredEntries = entries.filter((e) => {
    if (filter === 'ALL') return true;
    return e.settlementStatus === filter;
  });

  return (
    <AdminLayout
      title="Platform Fee Ledger (₹99 Revenue)"
      subtitle="प्लेटफ़ॉर्म शुल्क खाता बही • Dedicated ledger tracking all ₹99 DigiWork service fees and net platform revenue"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setRefreshing(true); fetchPlatformFees(); }}
            className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] bg-white hover:bg-[#F5FAFF] text-xs font-bold text-[#153451] transition flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#2583D5] ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      }
    >
      {/* 1. FINANCIAL SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-gradient-to-br from-[#EAF6FF] to-white p-5 rounded-3xl border-2 border-[#2583D5]/30 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-[#2583D5] tracking-wider block">Total Fees Collected</span>
          <div className="text-2xl font-black text-[#153451]">
            ₹{summary ? summary.totalFeesCollected.toLocaleString('en-IN') : '...'}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">
            Net Revenue: ₹{summary ? summary.netPlatformFeeRevenue.toLocaleString('en-IN') : '...'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-[#7697B3] tracking-wider block">Today&apos;s Revenue</span>
          <div className="text-2xl font-black text-emerald-600">
            ₹{summary ? summary.todayFees.toLocaleString('en-IN') : '...'}
          </div>
          <span className="text-[10px] text-[#7697B3] block">
            This Week: ₹{summary ? summary.weeklyFees.toLocaleString('en-IN') : '...'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-[#7697B3] tracking-wider block">Pending Settlement</span>
          <div className="text-2xl font-black text-amber-600">
            ₹{summary ? summary.pendingFees.toLocaleString('en-IN') : '...'}
          </div>
          <span className="text-[10px] text-[#7697B3] block">
            Active jobs awaiting customer sign-off
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-[#7697B3] tracking-wider block">Refunds / Adjustments</span>
          <div className="text-2xl font-black text-rose-600">
            ₹{summary ? summary.refundedFees.toLocaleString('en-IN') : '...'}
          </div>
          <span className="text-[10px] text-[#7697B3] block">
            100% Customer Protection
          </span>
        </div>

      </div>

      {/* 2. FILTER STRIP */}
      <div className="bg-white rounded-2xl p-3 border border-[#D1E8F8] flex items-center justify-between text-xs font-bold">
        <span className="text-[#153451] font-black">
          Platform Transactions ({filteredEntries.length})
        </span>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Transactions' },
            { id: 'SETTLED', label: 'Settled (Collected)' },
            { id: 'PENDING', label: 'Pending Settlement' },
            { id: 'REFUNDED', label: 'Refunded' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1 rounded-xl transition ${
                filter === tab.id
                  ? 'bg-[#2583D5] text-white shadow-xs'
                  : 'bg-[#F5FAFF] hover:bg-[#EAF6FF] text-[#4B6F8E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PLATFORM FEE LEDGER TABLE */}
      <div className="bg-white rounded-3xl border border-[#D1E8F8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5FAFF] border-b border-[#EAF6FF] text-[10px] font-black uppercase text-[#7697B3]">
                <th className="py-3 px-4">Ledger ID</th>
                <th className="py-3 px-4">Booking Reference</th>
                <th className="py-3 px-4">Trade / Service</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4 text-right">Base Charge</th>
                <th className="py-3 px-4 text-right">DigiWork Fee</th>
                <th className="py-3 px-4 text-right">Total Price</th>
                <th className="py-3 px-4">Settlement Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF6FF]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#7697B3] font-semibold">
                    Calculating platform fee ledger from MongoDB Atlas bookings...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#7697B3] font-semibold">
                    No platform fee entries found in this view.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5FAFF] transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#2583D5] font-bold">
                      {item.id}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#153451]">
                      <Link href={`/track/${item.bookingId}`} target="_blank" className="hover:underline">
                        {item.bookingId.slice(0, 14)}...
                      </Link>
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#153451]">
                      {item.serviceCategory}
                    </td>

                    <td className="py-3 px-4 font-medium text-[#153451]">
                      {item.customerName}
                    </td>

                    <td className="py-3 px-4 font-medium text-[#153451]">
                      {item.workerName}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-[#153451]">
                      ₹{item.baseWorkerCharge}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-[#2583D5]">
                      ₹{item.platformFee}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-[#153451]">
                      ₹{item.totalCustomerPayment}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        item.settlementStatus === 'SETTLED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.settlementStatus === 'REFUNDED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {item.settlementStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-[#7697B3]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  );
}
