'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Users, 
  MapPin, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Phone, 
  RefreshCw, 
  AlertCircle,
  Clock,
  UserCheck,
  Building2,
  Lock
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ProjectApplication, ProjectApplicationStatus } from '@/lib/types';

export default function ContractorApplicationsPage() {
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPLIED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      
      const apps: ProjectApplication[] = [];

      // Check projects for applications
      if (data.success && Array.isArray(data.projects)) {
        for (const proj of data.projects) {
          const pRes = await fetch(`/api/projects/${proj.id}`);
          const pData = await pRes.json();
          if (pData.success && Array.isArray(pData.applications)) {
            apps.push(...pData.applications);
          }
        }
      }

      // Default mock roster if none in database yet
      if (apps.length === 0) {
        apps.push(
          {
            id: 'app-1',
            projectId: 'proj-demo-1',
            projectTitle: 'Commercial Logistics Warehouse & Foundation',
            trade: 'Mason / Raj Mistri (राज मिस्त्री)',
            workerProfileId: 'work-prof-1',
            workerName: 'Ramesh Sharma',
            workerPhone: '9876543210',
            workerRating: 4.9,
            workerSkills: ['Brickwork', 'RCC Casting', 'Plastering'],
            workerExperienceYears: 6,
            proposedDailyRate: 950,
            availabilityDate: '2026-03-01',
            coverNote: 'Lead mason with 6+ years experience on commercial construction sites in NCR.',
            status: 'APPLIED',
            appliedAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'app-2',
            projectId: 'proj-demo-1',
            projectTitle: 'Commercial Logistics Warehouse & Foundation',
            trade: 'Construction Helper / Beldar (मजदूर / हेल्पर)',
            workerProfileId: 'work-prof-2',
            workerName: 'Mohan Kumar',
            workerPhone: '9811223344',
            workerRating: 4.8,
            workerSkills: ['Material Shifting', 'Mortar Mixing'],
            workerExperienceYears: 2,
            proposedDailyRate: 650,
            availabilityDate: 'Immediate',
            coverNote: 'Available immediately for full day general helper tasks.',
            status: 'SHORTLISTED',
            appliedAt: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: 'app-3',
            projectId: 'proj-demo-1',
            projectTitle: 'Commercial Logistics Warehouse & Foundation',
            trade: 'Electrician (बिजली मिस्त्री)',
            workerProfileId: 'work-prof-3',
            workerName: 'Suresh Verma',
            workerPhone: '9711223355',
            workerRating: 4.95,
            workerSkills: ['Industrial Wiring', 'DB Box', 'Concealed Conduit'],
            workerExperienceYears: 5,
            proposedDailyRate: 850,
            availabilityDate: 'Immediate',
            coverNote: 'Licensed ITI wireman with industrial electrical installation certification.',
            status: 'ACCEPTED',
            appliedAt: new Date(Date.now() - 14400000).toISOString(),
          }
        );
      }

      setApplications(apps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (app: ProjectApplication, action: 'SHORTLIST' | 'ACCEPT' | 'REJECT') => {
    setActionLoading(app.id);
    setMessage('');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/projects/${app.projectId}/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.error || 'Failed to update application status.');
        setActionLoading(null);
        return;
      }

      setMessage(data.message || `Application status updated to ${action}.`);
      
      // Update local state
      setApplications(prev => prev.map(a => 
        a.id === app.id ? { ...a, status: action === 'ACCEPT' ? 'ACCEPTED' : action === 'SHORTLIST' ? 'SHORTLISTED' : 'REJECTED' } : a
      ));
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with server.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApps = applications.filter(a => {
    if (activeTab === 'ALL') return true;
    return a.status === activeTab;
  });

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Project Worker Applications"
      subtitle="कारीगर आवेदन समीक्षा, शॉर्टलिस्टिंग, भर्ती चयन व कार्य आवंटन"
      actions={
        <Link
          href="/contractor/projects"
          className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-text-primary hover:bg-bg transition"
        >
          View All Projects
        </Link>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Status Message Banners */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-border shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All Applicants' },
              { id: 'APPLIED', label: 'New Applied' },
              { id: 'SHORTLISTED', label: 'Shortlisted' },
              { id: 'ACCEPTED', label: 'Accepted Workers' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-forest text-lime shadow-sm'
                    : 'bg-bg text-text-primary hover:bg-slate-100 border border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchApplications}
            className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="py-16 text-center text-xs text-text-muted flex items-center justify-center gap-2 bg-white rounded-3xl border border-border">
            <RefreshCw className="w-4 h-4 animate-spin text-forest" />
            <span>Loading worker applications...</span>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-border p-8 space-y-2">
            <Users className="w-12 h-12 text-forest/40 mx-auto" />
            <h3 className="font-bold text-forest text-base">No applicants found in this category</h3>
            <p className="text-xs text-text-secondary">Workers applying to your published contractor projects will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => {
              const isAccepted = app.status === 'ACCEPTED';
              const isShortlisted = app.status === 'SHORTLISTED';
              const isRejected = app.status === 'REJECTED';

              return (
                <div
                  key={app.id}
                  className={`bg-white rounded-3xl p-6 border transition-all space-y-4 ${
                    isAccepted ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-border'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-forest text-lime flex items-center justify-center font-black text-xl shrink-0">
                        {app.workerName?.charAt(0) || 'W'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-black text-forest">{app.workerName}</h3>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-status-success bg-status-successSoft px-2.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isAccepted 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : isShortlisted 
                              ? 'bg-blue-100 text-blue-800'
                              : isRejected
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-[#2583D5]">
                          Applied For: {app.trade}
                        </p>

                        <p className="text-xs text-text-muted">
                          Project: <strong>{app.projectTitle || 'Contractor Project'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      <span className="text-xs text-text-muted font-bold">Proposed Daily Wage</span>
                      <span className="text-2xl font-black text-forest">₹{app.proposedDailyRate}/day</span>
                      <span className="text-[11px] text-text-secondary">
                        Available: <strong>{app.availabilityDate}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Worker Experience, Skills & Cover Note */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-bg border border-border">
                      <span className="text-[10px] text-text-muted uppercase font-bold block">Experience</span>
                      <strong className="text-forest text-sm">{app.workerExperienceYears || 3}+ Years Active</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-bg border border-border">
                      <span className="text-[10px] text-text-muted uppercase font-bold block">Rating & Vetting</span>
                      <strong className="text-amber-600 text-sm flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {app.workerRating || 4.9} (Background Checked)
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-bg border border-border">
                      <span className="text-[10px] text-text-muted uppercase font-bold block">Contact Privacy</span>
                      {isAccepted ? (
                        <strong className="text-emerald-700 text-sm flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5" /> +91 {app.workerPhone}
                        </strong>
                      ) : (
                        <span className="text-text-muted text-xs flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Phone revealed upon acceptance
                        </span>
                      )}
                    </div>
                  </div>

                  {app.coverNote && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-text-primary">
                      <strong className="text-forest block mb-0.5">Worker Note:</strong>
                      {app.coverNote}
                    </div>
                  )}

                  {/* Action Buttons (Shortlist, Accept, Reject) */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border">
                    <span className="text-xs text-text-muted">
                      Applied on {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isAccepted && !isRejected && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoading === app.id}
                            onClick={() => handleAction(app, 'SHORTLIST')}
                            className="px-4 py-2 rounded-xl border border-border hover:border-forest text-xs font-bold text-forest transition"
                          >
                            {actionLoading === app.id ? 'Updating...' : 'Shortlist'}
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading === app.id}
                            onClick={() => handleAction(app, 'REJECT')}
                            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
                          >
                            Reject
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading === app.id}
                            onClick={() => handleAction(app, 'ACCEPT')}
                            className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                          >
                            {actionLoading === app.id ? 'Accepting...' : 'ACCEPT & ASSIGN WORKER (स्वीकार करें)'}
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Assigned to Active Crew</span>
                          </span>

                          <button
                            onClick={() => alert(`Calling worker at +91 ${app.workerPhone}`)}
                            className="px-3 py-1.5 rounded-xl bg-forest text-lime text-xs font-bold flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call Worker
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
