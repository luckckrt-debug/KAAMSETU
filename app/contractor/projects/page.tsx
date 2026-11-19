'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  PlusCircle, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw,
  CalendarCheck,
  CreditCard,
  Layers,
  Zap
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Project } from '@/lib/types';

export default function ContractorProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Workforce Projects & Tenders"
      subtitle="सक्रिय निर्माण परियोजनाएं, कार्यबल आवश्यकताएं, मस्टर रोल व दैनिक भुगतान"
      actions={
        <Link
          href="/contractor/post-work"
          className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Post New Project</span>
        </Link>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
            <span className="text-[11px] font-bold text-text-secondary uppercase">Active Projects</span>
            <div className="text-2xl font-black text-forest mt-1">
              {projects.filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS').length}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Recruiting & Live on site</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
            <span className="text-[11px] font-bold text-text-secondary uppercase">Total Workforce Needed</span>
            <div className="text-2xl font-black text-[#2583D5] mt-1">
              {projects.reduce((sum, p) => sum + (p.totalWorkersRequired || 10), 0)}
            </div>
            <span className="text-[10px] text-text-muted font-bold block mt-0.5">Across all trade categories</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
            <span className="text-[11px] font-bold text-text-secondary uppercase">Accepted Workers</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {projects.reduce((sum, p) => sum + (p.totalWorkersAccepted || 0), 0)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Assigned to projects</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
            <span className="text-[11px] font-bold text-text-secondary uppercase">Daily Payouts Active</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {projects.filter(p => p.payoutSchedule === 'DAILY').length}
            </div>
            <span className="text-[10px] text-amber-600 font-bold block mt-0.5">Same-day evening settlements</span>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-forest">
              Contractor Project Roster ({projects.length})
            </h2>
            <button
              onClick={fetchProjects}
              className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Roster
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-text-muted flex items-center justify-center gap-2 bg-white rounded-3xl border border-border">
              <RefreshCw className="w-4 h-4 animate-spin text-forest" />
              <span>Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-border p-8 space-y-3">
              <Building2 className="w-12 h-12 text-forest/40 mx-auto" />
              <h3 className="font-bold text-forest text-base">No projects created yet</h3>
              <p className="text-xs text-text-secondary">Publish your first workforce project to recruit workers and manage daily payroll.</p>
              <Link
                href="/contractor/post-work"
                className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-forest text-lime text-xs font-bold"
              >
                Post Your First Project
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((p) => {
                const totalReq = p.totalWorkersRequired || 10;
                const totalAcc = p.totalWorkersAccepted || 0;
                const remaining = Math.max(0, totalReq - totalAcc);

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl p-6 border border-border shadow-elevated hover:border-forest/50 transition-all space-y-5"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black uppercase tracking-wider text-forest bg-bg px-2.5 py-0.5 rounded-md border border-border">
                            {p.projectType || 'Construction Project'}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            p.payoutSchedule === 'DAILY' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            ⚡ {p.payoutSchedule} PAYOUT
                          </span>
                          <span className="text-xs text-text-muted font-bold">
                            #{p.id.slice(-6)}
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-forest">
                          {p.title}
                        </h3>

                        <p className="text-xs text-text-muted flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-forest" />
                          {p.locationAddress}, {p.city}
                        </p>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1 shrink-0">
                        <span className="text-xs text-text-muted font-bold">Estimated Budget</span>
                        <span className="text-2xl font-black text-forest">
                          ₹{p.estimatedBudget?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-bold text-status-success bg-status-successSoft px-2.5 py-0.5 rounded-full">
                          {p.status}
                        </span>
                      </div>
                    </div>

                    {/* Workforce Requirements Breakdown by Category (MODULE 8) */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase text-text-primary tracking-wider block">
                        Workforce Requirements & Remaining Vacancies:
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {p.requirements?.map((req, rIdx) => {
                          const rem = Math.max(0, req.requiredCount - req.acceptedCount);
                          const isFull = rem === 0;

                          return (
                            <div
                              key={req.id || rIdx}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                                isFull ? 'bg-gray-50 border-gray-200' : 'bg-bg border-border'
                              }`}
                            >
                              <div>
                                <span className="font-black text-forest block">{req.trade}</span>
                                <span className="text-[10px] text-text-muted">₹{req.dailyWage}/day • {req.shift || 'Day'}</span>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs font-bold block ${isFull ? 'text-gray-500' : 'text-forest'}`}>
                                  {req.acceptedCount}/{req.requiredCount} Accepted
                                </span>
                                <span className={`text-[10px] font-black ${isFull ? 'text-red-500' : 'text-status-success'}`}>
                                  {isFull ? '● Quota Full' : `● ${rem} Remaining`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border">
                      <div className="text-xs text-text-muted font-medium flex items-center gap-3">
                        <span>Duration: <strong>{p.durationDays || 30} days</strong></span>
                        <span>•</span>
                        <span>Shift: <strong>{p.shiftTiming}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/contractor/applications?projectId=${p.id}`}
                          className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Applicants ({p.applicationsCount || 0})</span>
                        </Link>

                        <Link
                          href={`/contractor/attendance?projectId=${p.id}`}
                          className="px-4 py-2 rounded-xl border border-border hover:border-forest text-xs font-bold text-forest transition flex items-center gap-1.5"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Muster Roll</span>
                        </Link>

                        <Link
                          href={`/contractor/payments?projectId=${p.id}`}
                          className="px-4 py-2 rounded-xl border border-border hover:border-forest text-xs font-bold text-forest transition flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Daily Payout</span>
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
