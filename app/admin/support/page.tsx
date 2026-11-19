'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  MessageSquare,
  FileText
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminSupportPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/disputes');
      const data = await res.json();
      if (data.success && Array.isArray(data.disputes)) {
        setDisputes(data.disputes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (disputeId: string, resolutionStatus: string) => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolutionNotes: resolutionNotes || 'Resolved by Super Admin Command Center.',
          status: resolutionStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Dispute successfully marked as ${resolutionStatus}.`);
        setSelectedDispute(null);
        setResolutionNotes('');
        fetchDisputes();
      } else {
        setActionMessage(data.error || 'Failed to update dispute');
      }
    } catch (err: any) {
      setActionMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    const matchesSearch = 
      d.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCount = disputes.filter(d => d.status === 'OPEN').length;

  return (
    <AdminLayout
      title="Support & Customer Disputes"
      subtitle="ग्राहक शिकायत व विवाद समाधान • Mediate customer complaints, quality issues, refund requests and dispute settlements"
    >
      <div className="space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Total Disputes</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#153451]">{disputes.length}</span>
              <span className="text-xs text-[#7697B3]">Logged</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Open / Action Required</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-600">{openCount}</span>
              <span className="text-xs text-rose-600 font-bold">Needs Review</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Resolution Time Avg</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">3.4 hrs</span>
              <span className="text-xs text-emerald-600 font-bold">Fast SLA</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Customer Trust Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#2583D5]">4.9 / 5</span>
              <span className="text-xs text-[#2583D5] font-bold">High</span>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-emerald-900 font-bold">Dismiss</button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-3xl p-4 border border-[#D1E8F8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7697B3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, booking ID, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D1E8F8] focus:border-[#2583D5] focus:outline-none bg-[#F5FAFF]/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-xl border border-[#D1E8F8] px-3 py-2 bg-white text-[#153451] font-semibold focus:outline-none"
            >
              <option value="ALL">All Disputes</option>
              <option value="OPEN">Open Only</option>
              <option value="RESOLVED_REFUND">Refunded</option>
              <option value="RESOLVED_DISMISSED">Dismissed</option>
            </select>

            <button
              onClick={fetchDisputes}
              disabled={loading}
              className="p-2 rounded-xl border border-[#D1E8F8] hover:border-[#2583D5] text-[#2583D5] hover:bg-[#EAF6FF] transition"
              title="Refresh Disputes"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Disputes Table */}
        <div className="bg-white rounded-3xl border border-[#D1E8F8] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#EAF6FF] flex items-center justify-between">
            <h3 className="font-black text-sm text-[#153451]">
              Dispute Investigation Queue ({filteredDisputes.length})
            </h3>
            <span className="text-xs text-[#7697B3]">Realtime Resolution Center</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#7697B3]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#2583D5] mx-auto mb-2" />
              Loading customer disputes...
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#7697B3] space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-[#153451]">Zero active disputes</p>
              <p>All service bookings and transactions are running smoothly.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#EAF6FF]">
              {filteredDisputes.map((dispute) => (
                <div key={dispute.id} className="p-5 hover:bg-[#F5FAFF]/50 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#153451] text-sm">
                        {dispute.customerName || 'Customer'}
                      </span>
                      <span className="text-[10px] font-mono text-[#7697B3] bg-[#F5FAFF] px-2 py-0.5 rounded border border-[#D1E8F8]">
                        Booking: {dispute.bookingId}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        dispute.status === 'OPEN' 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {dispute.status || 'OPEN'}
                      </span>
                    </div>

                    <p className="font-bold text-rose-700">
                      Reason: {dispute.reason}
                    </p>
                    <p className="text-[#4B6F8E] leading-relaxed">
                      {dispute.description}
                    </p>

                    {dispute.resolutionNotes && (
                      <div className="p-2.5 rounded-xl bg-[#EAF6FF] border border-[#D1E8F8] text-[11px] text-[#19639E] font-medium">
                        <strong>Resolution:</strong> {dispute.resolutionNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {dispute.status === 'OPEN' ? (
                      <>
                        <button
                          onClick={() => setSelectedDispute(dispute)}
                          className="px-3.5 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-bold text-xs shadow-xs transition"
                        >
                          Resolve Dispute
                        </button>
                      </>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Settled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolution Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 z-50 bg-[#153451]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#D1E8F8] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
                <h3 className="font-black text-[#153451] text-base">
                  Resolve Dispute: {selectedDispute.id}
                </h3>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="text-[#7697B3] hover:text-[#153451] font-bold text-lg"
                >
                  ×
                </button>
              </div>

              <div className="text-xs space-y-2 bg-[#F5FAFF] p-3 rounded-2xl border border-[#D1E8F8]">
                <p><strong>Customer:</strong> {selectedDispute.customerName}</p>
                <p><strong>Booking:</strong> {selectedDispute.bookingId}</p>
                <p><strong>Reason:</strong> {selectedDispute.reason}</p>
                <p><strong>Description:</strong> {selectedDispute.description}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">
                  Investigation & Resolution Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter official resolution decision..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#D1E8F8] bg-white text-[#153451] focus:outline-none focus:border-[#2583D5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleResolve(selectedDispute.id, 'RESOLVED_REFUND')}
                  disabled={actionLoading}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Approve Refund
                </button>
                <button
                  onClick={() => handleResolve(selectedDispute.id, 'RESOLVED_DISMISSED')}
                  disabled={actionLoading}
                  className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                >
                  Dismiss Complaint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
