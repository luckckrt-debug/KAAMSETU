'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Share2, 
  ShieldCheck, 
  RefreshCw,
  HardHat,
  UserCheck,
  Building2,
  Calendar,
  ChevronRight
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function MyReferralsListPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReferrals = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter !== 'ALL') params.set('role', roleFilter);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);

    fetch(`/api/referrals/list?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReferrals(data.referrals || []);
        }
      })
      .catch((err) => console.error('Error fetching referrals:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReferrals();
  }, [roleFilter, statusFilter]);

  const filtered = referrals.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.displayName?.toLowerCase().includes(q) ||
      item.referredRole?.toLowerCase().includes(q) ||
      item.displayPhone?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REWARD_CREDITED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reward Credited</span>
          </span>
        );
      case 'REWARD_PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Reward Pending</span>
          </span>
        );
      case 'QUALIFYING_ACTIVITY_PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Qualifying Pending</span>
          </span>
        );
      case 'REGISTERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <span>Registered</span>
          </span>
        );
      case 'INELIGIBLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Ineligible</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === 'WORKER') return <HardHat className="w-4 h-4 text-emerald-600" />;
    if (role === 'CONTRACTOR') return <Building2 className="w-4 h-4 text-indigo-600" />;
    return <UserCheck className="w-4 h-4 text-[#2563EB]" />;
  };

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="My Referred Network"
      subtitle="आपके रेफरल लिंक से जुड़े सभी सत्यापित सदस्य व उनकी गतिविधि स्थिति"
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
            onClick={fetchReferrals}
            className="p-2 rounded-xl bg-white border border-[#D7E3F1] text-slate-600 hover:text-[#0B1F3A] transition"
            title="Refresh referrals list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-12">

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#D7E3F1] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by masked name, role, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D7E3F1] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-[#F5F8FC]"
              />
            </div>

            {/* Role Filter tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#F5F8FC] rounded-xl border border-[#D7E3F1] self-stretch sm:self-auto overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Roles' },
                { id: 'WORKER', label: 'Workers' },
                { id: 'HIRING_PARTNER', label: 'Partners' },
                { id: 'CONTRACTOR', label: 'Contractors' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    roleFilter === tab.id
                      ? 'bg-white text-[#0B1F3A] shadow-sm'
                      : 'text-[#7697B3] hover:text-[#0B1F3A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 bg-[#F5F8FC] rounded-xl border border-[#D7E3F1] self-stretch sm:self-auto overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'REWARD_CREDITED', label: 'Credited' },
                { id: 'REWARD_PENDING', label: 'Pending' },
                { id: 'QUALIFYING_ACTIVITY_PENDING', label: 'Qualifying' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    statusFilter === tab.id
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-[#7697B3] hover:text-[#0B1F3A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* PRIVACY NOTICE */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EDF4FC] border border-[#D7E3F1] text-xs text-[#0B1F3A]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              <strong>Privacy Protection Active:</strong> In compliance with DigiWork data governance, referred contacts&apos; sensitive phone numbers and full identity documents are masked.
            </span>
          </div>
          <span className="font-bold text-[#2563EB] shrink-0 hidden sm:inline">
            Total Shown: {filtered.length}
          </span>
        </div>

        {/* REFERRALS LIST TABLE */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#D7E3F1]">
            <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#7697B3] font-medium">Loading your referred network...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#D7E3F1] space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#EDF4FC] text-[#2563EB] flex items-center justify-center mx-auto text-2xl font-black">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#0B1F3A]">No Referrals Found</h3>
              <p className="text-xs text-[#7697B3] max-w-md mx-auto">
                {searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No members match the selected filter criteria. Try clearing search filters.'
                  : 'You haven&apos;t invited anyone yet. Share your personal referral code to earn cash rewards on every verified user!'}
              </p>
            </div>
            <Link
              href="/hiring/referrals"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition shadow-md shadow-[#2563EB]/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Get Your Referral Link</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#D7E3F1] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F8FC] border-b border-[#D7E3F1] text-[#7697B3] uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-4 px-6">Referred Member</th>
                    <th className="py-4 px-6">Role Category</th>
                    <th className="py-4 px-6">Registration Date</th>
                    <th className="py-4 px-6">Qualifying Activity</th>
                    <th className="py-4 px-6">Reward Amount</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EEF8]">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FCFF] transition">
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EDF4FC] text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0">
                            {item.displayName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-[#0B1F3A]">{item.displayName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{item.displayPhone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 font-bold text-[#0B1F3A]">
                          {getRoleIcon(item.referredRole)}
                          <span>
                            {item.referredRole === 'WORKER' ? 'Skilled Worker' :
                             item.referredRole === 'CONTRACTOR' ? 'Civil Contractor' : 'Hiring Partner'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-[#7697B3] font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className="font-semibold text-[#0B1F3A]">
                            {item.qualifyingActivity === 'FIRST_BOOKING_COMPLETED' ? 'First Verified Booking' :
                             item.qualifyingActivity === 'FIRST_ASSIGNMENT_COMPLETED' ? 'Workforce Deployed' :
                             item.qualifyingActivity === 'REGISTRATION_COMPLETED' ? 'Instant Registration' : 'Account Verified'}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {item.status === 'REWARD_CREDITED' ? 'Completed & verified' : 'Pending partner action'}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-black text-sm text-[#0B1F3A]">
                          ₹{item.rewardAmount || 150}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {item.rewardStatus === 'CREDITED' ? 'In Wallet' : 'On Completion'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {getStatusBadge(item.status)}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
