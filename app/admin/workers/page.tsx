'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HardHat, 
  Search, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Star, 
  Wallet, 
  ArrowRight, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminWorkersFleetPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'ONLINE'>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    try {
      const res = await fetch(`/api/admin/users?role=WORKER&limit=100&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setWorkers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [search]);

  const filteredWorkers = workers.filter((w) => {
    if (filter === 'VERIFIED') return w.kycStatus === 'VERIFIED';
    return true;
  });

  return (
    <AdminLayout
      title="Workers Fleet Management"
      subtitle="कारीगर बेड़ा प्रबंधन • Inspect skilled tradesmen, base wage rates, KYC status & earnings"
      actions={
        <Link
          href="/admin/kyc?status=PENDING"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Review Pending KYC</span>
        </Link>
      }
    >
      {/* Controls Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7697B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workers by trade, name, city or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-[#F5FAFF] p-1 rounded-2xl border border-[#D1E8F8]">
          {[
            { id: 'ALL', label: 'All Fleet' },
            { id: 'VERIFIED', label: '100% Aadhaar Verified' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === tab.id
                  ? 'bg-[#2583D5] text-white shadow-xs'
                  : 'text-[#4B6F8E] hover:text-[#153451]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-[#7697B3] font-semibold bg-white rounded-3xl border border-[#D1E8F8]">
            Loading worker fleet records...
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-[#7697B3] font-semibold bg-white rounded-3xl border border-[#D1E8F8]">
            No workers match current criteria.
          </div>
        ) : (
          filteredWorkers.map((w) => (
            <div
              key={w.id}
              className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs hover:border-[#2583D5] transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF6FF] text-[#2583D5] font-black flex items-center justify-center text-sm border border-[#D1E8F8]">
                      {w.fullName?.charAt(0) || 'W'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-black text-[#153451] text-sm">{w.fullName}</h4>
                        {w.kycStatus === 'VERIFIED' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#2583D5] block">{w.trade || 'Skilled Professional'}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                    w.status === 'BLOCKED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {w.status}
                  </span>
                </div>

                <div className="p-3 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#7697B3]">Mobile:</span>
                    <span className="font-bold text-[#153451]">+91 {w.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7697B3]">City / Hub:</span>
                    <span className="font-semibold text-[#153451]">{w.city || 'Delhi NCR'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7697B3]">Wallet Balance:</span>
                    <span className="font-black text-emerald-600">₹{w.walletBalance || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAF6FF] flex items-center justify-between">
                <Link
                  href={`/workers/${w.profileId || w.id}`}
                  target="_blank"
                  className="text-xs font-bold text-[#4B6F8E] hover:text-[#2583D5] flex items-center gap-1"
                >
                  <span>Public View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <Link
                  href={`/admin/users/${w.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <span>Backoffice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

    </AdminLayout>
  );
}
