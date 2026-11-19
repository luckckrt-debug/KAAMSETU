'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  CreditCard
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch(`/api/admin/withdrawals?status=${filter}`);
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.withdrawals || []);
        setSummary(data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const handleWithdrawalAction = async (withdrawalId: string, action: 'PROCESS' | 'COMPLETE' | 'REJECT') => {
    const reason = action === 'REJECT' ? prompt('Enter mandatory rejection reason:') : 'Authorized by Finance Admin';
    if (action === 'REJECT' && !reason) return;

    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        fetchWithdrawals();
      } else {
        alert(data.error || 'Action failed.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout
      title="Withdrawal & Payout Management"
      subtitle="निकासी व भुगतान प्रबंधन • Process worker bank/UPI transfers with idempotency & audit tracking"
      actions={
        <button
          onClick={() => { setRefreshing(true); fetchWithdrawals(); }}
          className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] bg-white hover:bg-[#F5FAFF] text-xs font-bold text-[#153451] transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#2583D5] ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      }
    >
      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-3 border border-[#D1E8F8] flex items-center justify-between text-xs font-bold">
        <span className="text-[#153451] font-black">
          Payout Requests ({withdrawals.length})
        </span>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'PENDING', label: 'Pending Review' },
            { id: 'COMPLETED', label: 'Completed Transfers' },
            { id: 'FAILED', label: 'Failed / Rejected' },
            { id: 'ALL', label: 'All Requests' },
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

      {/* Withdrawals Table */}
      <div className="bg-white rounded-3xl border border-[#D1E8F8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5FAFF] border-b border-[#EAF6FF] text-[10px] font-black uppercase text-[#7697B3]">
                <th className="py-3 px-4">Withdrawal ID</th>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4 text-right">Gross Amount</th>
                <th className="py-3 px-4 text-right">Fee</th>
                <th className="py-3 px-4 text-right">Net Payout</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF6FF]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#7697B3] font-semibold">
                    Loading payout records...
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#7697B3] font-semibold">
                    No withdrawal requests matching filter.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-[#F5FAFF] transition font-medium">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#2583D5] font-bold">
                      {w.id}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#153451] block">{w.workerName}</span>
                      <span className="text-[11px] text-[#7697B3]">+91 {w.workerPhone}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-[#153451]">
                      ₹{w.amount}
                    </td>

                    <td className="py-3 px-4 text-right text-[#7697B3]">
                      ₹{w.fee}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-emerald-600 text-sm">
                      ₹{w.netPayout}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-[#153451] block">{w.maskedDestination}</span>
                      <span className="text-[10px] text-[#7697B3] uppercase">{w.payoutMethod}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        w.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : w.status === 'FAILED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {w.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-[#7697B3]">
                      {new Date(w.requestedAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {w.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleWithdrawalAction(w.id, 'COMPLETE')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWithdrawalAction(w.id, 'REJECT')}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#7697B3] font-mono">
                          {w.providerRef || 'SETTLED'}
                        </span>
                      )}
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
