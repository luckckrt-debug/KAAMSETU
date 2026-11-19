'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  Search, 
  Filter, 
  RefreshCw, 
  Receipt, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`/api/admin/jobs?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const reason = prompt(`Enter mandatory reason for changing job ${jobId} status to ${newStatus}:`);
    if (!reason) return;

    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, newStatus, reason }),
      });
      const data = await res.json();
      if (data.success) {
        fetchJobs();
      } else {
        alert(data.error || 'Failed to update job status.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout
      title="Central Job & Work Management"
      subtitle="केंद्रीकृत कार्य व बुकिंग प्रबंधन • Manage all active dispatches, worker charges & ₹99 platform fees"
      actions={
        <button
          onClick={() => { setRefreshing(true); fetchJobs(); }}
          className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] bg-white hover:bg-[#F5FAFF] text-xs font-bold text-[#153451] transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#2583D5] ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Jobs</span>
        </button>
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
            onKeyDown={(e) => { if (e.key === 'Enter') fetchJobs(); }}
            placeholder="Search by job ID, trade, customer or worker..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F5FAFF] p-1 rounded-2xl border border-[#D1E8F8]">
          {[
            { id: 'ALL', label: 'All Jobs' },
            { id: 'REQUESTED', label: 'Requested' },
            { id: 'ACCEPTED', label: 'Accepted / Dispatched' },
            { id: 'WORK_COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === tab.id
                  ? 'bg-[#2583D5] text-white shadow-xs'
                  : 'text-[#4B6F8E] hover:text-[#153451]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Pricing Model Banner (Section 10 Requirement) */}
      <div className="bg-linear-to-r from-[#EAF6FF] to-white p-4 rounded-2xl border border-[#D1E8F8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Receipt className="w-5 h-5 text-[#2583D5] shrink-0" />
          <div>
            <span className="font-black text-[#153451]">KaamSetu Pricing Formula: </span>
            <span className="text-[#4B6F8E]">Worker Base Charge (100% to Worker) + <strong>₹99 KaamSetu Platform Fee</strong> = Total Customer Payable</span>
          </div>
        </div>
        <Link href="/admin/platform-fees" className="font-bold text-[#2583D5] hover:underline shrink-0">
          Open Platform Fee Ledger →
        </Link>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-3xl border border-[#D1E8F8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5FAFF] border-b border-[#EAF6FF] text-[10px] font-black uppercase text-[#7697B3]">
                <th className="py-3 px-4">Job / Booking ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Assigned Worker</th>
                <th className="py-3 px-4 text-right">Worker Charge</th>
                <th className="py-3 px-4 text-right">Platform Fee</th>
                <th className="py-3 px-4 text-right">Customer Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF6FF]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#7697B3] font-semibold">
                    Loading jobs from MongoDB Atlas...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#7697B3] font-semibold">
                    No jobs matching current filter.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#F5FAFF] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2583D5]">
                      <Link href={`/track/${job.id}`} target="_blank" className="hover:underline flex items-center gap-1">
                        <span>{job.id.slice(0, 16)}</span>
                        <ExternalLink className="w-3 h-3 text-[#7697B3]" />
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#153451]">
                      {job.serviceCategory}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#153451] block">{job.customerName}</span>
                      <span className="text-[11px] text-[#7697B3]">{job.customerPhone}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#153451] block">{job.workerName}</span>
                      <span className="text-[11px] text-[#7697B3]">{job.workerPhone}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-[#153451]">
                      ₹{job.workerBaseCharge}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-[#2583D5]">
                      ₹{job.platformFee}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-[#153451]">
                      ₹{job.totalCustomerPrice}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        ['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID'].includes(job.status)
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : job.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-[#EAF6FF] text-[#2583D5] border-[#D1E8F8]'
                      }`}>
                        {job.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(job.id, 'CANCELLED')}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition"
                          >
                            Cancel
                          </button>
                        )}
                        {job.status !== 'WORK_COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(job.id, 'WORK_COMPLETED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition"
                          >
                            Complete
                          </button>
                        )}
                      </div>
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
