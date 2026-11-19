'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  Search, 
  RefreshCw, 
  PlusCircle, 
  MinusCircle, 
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  X
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminWalletsPage() {
  const [summary, setSummary] = useState<any | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Adjustment modal
  const [adjModal, setAdjModal] = useState<{ open: boolean; wallet: any; type: 'CREDIT' | 'DEBIT'; amount: string; reason: string }>({
    open: false,
    wallet: null,
    type: 'CREDIT',
    amount: '',
    reason: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWallets = async () => {
    try {
      const res = await fetch('/api/admin/wallets');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setWallets(data.wallets || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handlePerformAdjustment = async () => {
    if (!adjModal.wallet || !adjModal.amount || !adjModal.reason.trim()) {
      alert('Please fill all fields including a mandatory reason.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: adjModal.wallet.id,
          workerProfileId: adjModal.wallet.workerProfileId,
          adjustmentType: adjModal.type,
          amount: Number(adjModal.amount),
          reason: adjModal.reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAdjModal({ open: false, wallet: null, type: 'CREDIT', amount: '', reason: '' });
        fetchWallets();
        alert(data.message);
      } else {
        alert(data.error || 'Adjustment failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredWallets = wallets.filter((w) => {
    if (!search.trim()) return true;
    const lower = search.toLowerCase();
    return w.workerName?.toLowerCase().includes(lower) || w.phoneNumber?.includes(lower) || w.trade?.toLowerCase().includes(lower);
  });

  return (
    <AdminLayout
      title="Wallet & Worker Earnings Ledger"
      subtitle="कारीगर डिजिटल वॉलेट व आय खाता बही • Audit balances, pending credits & execute authorized adjustments"
      actions={
        <button
          onClick={() => { setLoading(true); fetchWallets(); }}
          className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] bg-white hover:bg-[#F5FAFF] text-xs font-bold text-[#153451] transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#2583D5]" />
          <span>Refresh Wallets</span>
        </button>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-[#7697B3] tracking-wider block">Total Wallets Monitored</span>
          <div className="text-2xl font-black text-[#153451]">
            {summary ? summary.totalWallets : '...'}
          </div>
          <span className="text-[10px] text-[#7697B3]">Active tradesmen wallets</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-[#7697B3] tracking-wider block">System Available Balance</span>
          <div className="text-2xl font-black text-emerald-600">
            ₹{summary ? summary.totalSystemBalance.toLocaleString('en-IN') : '...'}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">Available for withdrawal</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-[#7697B3] tracking-wider block">Pending Escrow Earnings</span>
          <div className="text-2xl font-black text-amber-600">
            ₹{summary ? summary.totalPendingBalance.toLocaleString('en-IN') : '...'}
          </div>
          <span className="text-[10px] text-[#7697B3]">In-progress jobs escrow</span>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-white rounded-3xl border border-[#D1E8F8] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EAF6FF] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#7697B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by worker name, phone or trade..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5FAFF] border-b border-[#EAF6FF] text-[10px] font-black uppercase text-[#7697B3]">
                <th className="py-3 px-4">Wallet ID</th>
                <th className="py-3 px-4">Worker / Trade</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Available Balance</th>
                <th className="py-3 px-4 text-right">Pending Balance</th>
                <th className="py-3 px-4 text-right">Total Withdrawn</th>
                <th className="py-3 px-4 text-right">Adjustment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF6FF]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7697B3] font-semibold">
                    Loading worker wallets...
                  </td>
                </tr>
              ) : filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7697B3] font-semibold">
                    No wallets found.
                  </td>
                </tr>
              ) : (
                filteredWallets.map((w) => (
                  <tr key={w.id} className="hover:bg-[#F5FAFF] transition font-medium">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#2583D5] font-bold">
                      {w.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#153451] block">{w.workerName}</span>
                      <span className="text-[11px] text-[#2583D5]">{w.trade}</span>
                    </td>

                    <td className="py-3.5 px-4 text-[#7697B3]">
                      +91 {w.phoneNumber}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">
                      ₹{w.balance}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-amber-600">
                      ₹{w.pendingBalance}
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-[#153451]">
                      ₹{w.totalWithdrawn}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAdjModal({ open: true, wallet: w, type: 'CREDIT', amount: '', reason: '' })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition flex items-center gap-1"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>Credit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdjModal({ open: true, wallet: w, type: 'DEBIT', amount: '', reason: '' })}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition flex items-center gap-1"
                        >
                          <MinusCircle className="w-3 h-3" />
                          <span>Debit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUSTMENT MODAL */}
      {adjModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
              <h3 className="font-black text-sm text-[#153451]">
                Execute Authorized Wallet {adjModal.type}
              </h3>
              <button
                type="button"
                onClick={() => setAdjModal({ open: false, wallet: null, type: 'CREDIT', amount: '', reason: '' })}
                className="p-1 rounded-lg hover:bg-[#F5FAFF] text-[#7697B3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#4B6F8E]">
              Worker: <strong>{adjModal.wallet?.workerName}</strong> • Current Balance: <strong>₹{adjModal.wallet?.balance}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  Adjustment Amount (₹ INR)
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjModal.amount}
                  onChange={(e) => setAdjModal({ ...adjModal, amount: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  Mandatory Audit Reason (Immutable)
                </label>
                <textarea
                  rows={2}
                  value={adjModal.reason}
                  onChange={(e) => setAdjModal({ ...adjModal, reason: e.target.value })}
                  placeholder="e.g. Compensation for customer delay or dispute settlement ref #1042"
                  className="w-full p-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451] focus:outline-none focus:border-[#2583D5]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAF6FF]">
              <button
                type="button"
                onClick={() => setAdjModal({ open: false, wallet: null, type: 'CREDIT', amount: '', reason: '' })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#7697B3]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !adjModal.amount || !adjModal.reason.trim()}
                onClick={handlePerformAdjustment}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-md transition disabled:opacity-50 ${
                  adjModal.type === 'CREDIT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${adjModal.type} of ₹${adjModal.amount || 0}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
