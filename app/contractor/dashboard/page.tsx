'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { Tender, TenderApplication } from '@/lib/types';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ContractorDashboardPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchContractorData = async () => {
    try {
      const res = await fetch('/api/tenders');
      const data = await res.json();
      if (data.success) {
        setTenders(data.tenders || []);
        if (data.tenders && data.tenders.length > 0 && !selectedTender) {
          // Fetch details for first tender
          const detRes = await fetch(`/api/tenders/${data.tenders[0].id}`);
          const detData = await detRes.json();
          if (detData.success) {
            setSelectedTender(detData.tender);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractorData();
  }, []);

  const handleSelectTender = async (tId: string) => {
    try {
      const res = await fetch(`/api/tenders/${tId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTender(data.tender);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: string) => {
    if (!selectedTender) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/tenders/${selectedTender.id}/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Application ${status.toLowerCase()} successfully.`);
        handleSelectTender(selectedTender.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg font-bold text-text-muted">
        Loading contractor portal...
      </div>
    );
  }

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Contractor Operations Dashboard"
      subtitle="निर्माण परियोजनाएं, मस्टर रोल उपस्थिति व टेंडर प्रबंधन"
      actions={
        <Link
          href="/contractor/post-work"
          className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Post Project / Tender</span>
        </Link>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Company Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest text-lime flex items-center justify-center font-black text-2xl shadow-xs">
              <Building2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-forest">
                  Apex Infra & Builders Pvt Ltd
                </h1>
                <span className="flex items-center gap-1 text-[11px] font-bold text-status-success bg-status-successSoft px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> GST Verified
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                GSTIN: 07AAACA1234B1Z5 • Civil Construction & High-Rise Infrastructure
              </p>
              <span className="text-[11px] text-text-muted font-semibold block mt-0.5">
                Noida, Uttar Pradesh
              </span>
            </div>
          </div>

          <Link
            href="/tenders/create"
            className="px-6 py-3.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>PUBLISH NEW TENDER (टेंडर निकालें)</span>
          </Link>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-status-successSoft text-status-success text-xs font-bold border border-status-success/20">
            {message}
          </div>
        )}

        {/* Tenders & Applications Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Tenders Published */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-black text-forest">Your Active Tenders</h2>
              <span className="text-xs font-bold text-text-muted">{tenders.length} Active</span>
            </div>

            <div className="space-y-3">
              {tenders.map((t) => {
                const isSelected = selectedTender?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTender(t.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-forest bg-forest/5 shadow-xs'
                        : 'border-border bg-bg hover:border-forest/40'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold text-sage bg-sage-soft px-2 py-0.5 rounded">
                        {t.categoryName}
                      </span>
                      <span className="text-xs font-black text-forest">
                        {t.workerCountRequired} Workers
                      </span>
                    </div>
                    <h3 className="font-bold text-forest text-sm mt-1.5 line-clamp-1">{t.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{t.projectName} • {t.city}</p>
                    <div className="mt-3 pt-2 border-t border-border/60 flex justify-between text-[11px] text-text-secondary">
                      <span>Daily: ₹{t.perWorkerRate}/day</span>
                      <span className="font-bold text-forest">{t.applicationsCount || 0} Bids Received</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Applications Queue for Selected Tender */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
            
            {selectedTender ? (
              <>
                <div className="pb-4 border-b border-border">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-text-muted">Selected Tender Scope</span>
                    <span className="text-xs font-bold text-status-success">Applications Open</span>
                  </div>
                  <h2 className="text-lg font-black text-forest mt-1">{selectedTender.title}</h2>
                  <p className="text-xs text-text-secondary mt-1">{selectedTender.description}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-forest flex items-center justify-between">
                    <span>Crew & Worker Bids Received ({selectedTender.applications?.length || 0})</span>
                    <span className="text-xs font-normal text-text-muted">Review & Shortlist</span>
                  </h3>

                  {(!selectedTender.applications || selectedTender.applications.length === 0) ? (
                    <div className="p-8 text-center text-text-muted text-xs bg-bg rounded-2xl border border-border">
                      No applications submitted for this tender yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedTender.applications.map((app: TenderApplication) => (
                        <div
                          key={app.id}
                          className="p-5 rounded-2xl bg-bg border border-border space-y-3"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[10px] font-black text-forest bg-white px-2 py-0.5 rounded border border-border">
                                {app.tenderTeamId ? '👥 Trade Crew Bid' : '👤 Individual'}
                              </span>
                              <h4 className="text-base font-black text-forest mt-1">
                                {app.tenderTeamId ? 'Satish Kumar Masonry Brigade' : 'Verified Tradesman'}
                              </h4>
                              <p className="text-xs text-text-secondary mt-0.5">
                                Offered Crew: <strong className="text-forest font-bold">{app.proposedWorkersCount} Workers</strong> • Proposed Rate: <strong className="text-forest font-bold">₹{app.proposedRate}/worker/day</strong>
                              </p>
                            </div>

                            <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              app.status === 'SELECTED'
                                ? 'bg-status-successSoft text-status-success'
                                : app.status === 'SHORTLISTED'
                                ? 'bg-blue-100 text-blue-800'
                                : app.status === 'REJECTED'
                                ? 'bg-status-dangerSoft text-status-danger'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {app.status}
                            </span>
                          </div>

                          {app.coverNote && (
                            <p className="text-xs text-text-secondary bg-white p-3 rounded-xl border border-border italic">
                              &ldquo;{app.coverNote}&rdquo;
                            </p>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-border flex items-center justify-end gap-2 text-xs">
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                              className="px-3 py-1.5 rounded-lg border border-border hover:bg-white text-status-danger font-bold"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleUpdateApplicationStatus(app.id, 'SHORTLISTED')}
                              className="px-3.5 py-1.5 rounded-lg border border-border hover:bg-white text-forest font-bold"
                            >
                              Shortlist
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleUpdateApplicationStatus(app.id, 'SELECTED')}
                              className="px-4 py-1.5 rounded-lg bg-forest text-lime font-black shadow-xs hover:bg-forest-light"
                            >
                              Accept & Contract
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-text-muted text-xs">
                Select a tender on the left to inspect applications.
              </div>
            )}

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
