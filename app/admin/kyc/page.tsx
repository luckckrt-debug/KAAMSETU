'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Eye, 
  ArrowRight,
  Filter,
  Check,
  X,
  FileText,
  User,
  Phone
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function KycManagementPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Review modal
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchKycRecords = async () => {
    try {
      const res = await fetch(`/api/admin/kyc?status=${filter}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.kycRecords)) {
        setRecords(data.kycRecords);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKycRecords();
  }, [filter]);

  const handleKycDecision = async (action: 'APPROVE' | 'REJECT' | 'REQUEST_RESUBMISSION') => {
    if (!selectedRecord) return;
    if (action === 'REJECT' && !actionReason.trim()) {
      alert('A rejection reason is required.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerProfileId: selectedRecord.workerProfileId,
          action,
          reason: actionReason,
          internalNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedRecord(null);
        setActionReason('');
        setInternalNotes('');
        fetchKycRecords();
      } else {
        alert(data.error || 'Failed to submit KYC decision.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (!search.trim()) return true;
    const lower = search.toLowerCase();
    return (
      r.fullName?.toLowerCase().includes(lower) ||
      r.phoneNumber?.includes(lower) ||
      r.trade?.toLowerCase().includes(lower) ||
      r.city?.toLowerCase().includes(lower)
    );
  });

  return (
    <AdminLayout
      title="KYC Management Center"
      subtitle="दस्तावेज़ सत्यापन केंद्र • Review and verify Aadhaar, Trade Certificates, and KYC documents"
      actions={
        <button
          onClick={() => { setRefreshing(true); fetchKycRecords(); }}
          className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] bg-white hover:bg-[#F5FAFF] text-xs font-bold text-[#153451] transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#2583D5] ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
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
            placeholder="Search worker by name, phone, trade or city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F5FAFF] p-1 rounded-2xl border border-[#D1E8F8]">
          {[
            { id: 'PENDING', label: 'Pending Review' },
            { id: 'VERIFIED', label: 'Approved KYC' },
            { id: 'REJECTED', label: 'Rejected' },
            { id: 'ALL', label: 'All Records' },
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

      {/* KYC Records List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#D1E8F8] text-[#7697B3] font-semibold">
            Loading KYC verification submissions from MongoDB Atlas...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#D1E8F8] space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-black text-[#153451] text-base">No KYC records in this queue</h3>
            <p className="text-xs text-[#7697B3]">All submitted documents are verified or no records match your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs hover:border-[#2583D5] transition flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black text-[#153451] text-sm">{item.fullName}</h4>
                      <p className="text-xs font-bold text-[#2583D5] mt-0.5">{item.trade}</p>
                      <span className="text-[11px] text-[#7697B3] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> +91 {item.phoneNumber}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      item.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.verificationStatus === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.verificationStatus}
                    </span>
                  </div>

                  {/* Documents Summary */}
                  <div className="p-3 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF] space-y-2 text-xs">
                    <span className="text-[10px] font-black uppercase text-[#7697B3] block">Attached Documents ({item.documents?.length || 0})</span>
                    {item.documents?.map((d: any, dIdx: number) => (
                      <div key={dIdx} className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#153451]">{d.docType}</span>
                        <a
                          href={d.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#2583D5] font-bold hover:underline flex items-center gap-0.5"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2 border-t border-[#EAF6FF] flex items-center justify-between">
                  <Link
                    href={`/admin/users/${item.userId}`}
                    className="text-xs font-bold text-[#4B6F8E] hover:text-[#2583D5]"
                  >
                    User Profile
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSelectedRecord(item)}
                    className="px-4 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-xs transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Decision</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KYC REVIEW MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-7 border border-[#D1E8F8] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
              <div>
                <h3 className="text-base font-black text-[#153451]">KYC Inspection & Decision</h3>
                <p className="text-xs text-[#7697B3]">Worker: {selectedRecord.fullName} • +91 {selectedRecord.phoneNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-xl hover:bg-[#F5FAFF] text-[#7697B3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Viewer Preview */}
            <div className="space-y-3">
              <span className="text-xs font-black text-[#153451] uppercase tracking-wider block">Submitted Documents</span>
              <div className="grid grid-cols-2 gap-3">
                {selectedRecord.documents?.map((doc: any, idx: number) => (
                  <div key={idx} className="p-3 bg-[#F5FAFF] rounded-2xl border border-[#D1E8F8] space-y-2 text-xs">
                    <span className="font-bold text-[#153451] block">{doc.docType}</span>
                    <div className="h-28 rounded-xl bg-white border border-[#D1E8F8] overflow-hidden flex items-center justify-center">
                      <img src={doc.fileUrl} alt={doc.docType} className="w-full h-full object-cover" />
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2583D5] text-[11px] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Open Full Size</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#153451] block mb-1">
                  Rejection Reason / Notes (required if rejecting)
                </label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Document image blurred or Aadhaar number mismatch"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#153451] block mb-1">
                  Internal Operations Notes (optional)
                </label>
                <input
                  type="text"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="e.g. Verified via manual phone call"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#EAF6FF] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-xs font-bold text-[#7697B3] hover:text-[#153451]"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleKycDecision('REJECT')}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black transition border border-rose-200"
                >
                  Reject KYC
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleKycDecision('REQUEST_RESUBMISSION')}
                  className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-black transition border border-amber-200"
                >
                  Request Resubmit
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleKycDecision('APPROVE')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition"
                >
                  {actionLoading ? 'Processing...' : 'Approve & Verify'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
