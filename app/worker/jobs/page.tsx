'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  Filter, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  HardHat,
  Users,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Project, ProjectWorkerRequirement } from '@/lib/types';

export default function WorkerFindWorkPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState('ALL');
  const [payoutFilter, setPayoutFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<ProjectWorkerRequirement | null>(null);
  const [applicantNotes, setApplicantNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [appliedProjectIds, setAppliedProjectIds] = useState<string[]>([]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch (e) {
      console.error('Error fetching contractor projects:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openApplyModal = (project: Project, req: ProjectWorkerRequirement) => {
    setSelectedProject(project);
    setSelectedRequirement(req);
    setApplicantNotes(`Available for ${req.trade} (${req.shift} shift). Verified skills and tool set ready.`);
    setErrorMsg('');
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedRequirement) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade: selectedRequirement.trade,
          categoryName: selectedRequirement.trade,
          yearsExperience: 5,
          proposedDailyWage: selectedRequirement.dailyWage,
          notes: applicantNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAppliedProjectIds((prev) => [...prev, selectedProject.id]);
        setSuccessMsg(`✅ Application submitted successfully for "${selectedRequirement.trade}" at ${selectedProject.title}! The contractor will review your profile.`);
        setSelectedProject(null);
        setSelectedRequirement(null);
        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        setErrorMsg(data.error || 'Failed to submit application. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.workLocation || p.locationAddress || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.requirements.some((r) => r.trade.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTrade =
      tradeFilter === 'ALL' ||
      p.requirements.some((r) => r.trade.toLowerCase() === tradeFilter.toLowerCase());

    const matchesPayout =
      payoutFilter === 'ALL' || p.payoutSchedule === payoutFilter;

    return matchesSearch && matchesTrade && matchesPayout;
  });

  return (
    <DashboardLayout
      role="WORKER"
      title="Contractor Projects & Work Marketplace"
      subtitle="दैनिक व साप्ताहिक पारिश्रमिक प्रोजेक्ट्स • डायरेक्ट साइट आवेदन व दैनिक बैंक भुगतान"
      actions={
        <button
          onClick={fetchProjects}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#D1E8F8] text-[#153451] hover:text-[#2583D5] text-xs font-bold transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Projects</span>
        </button>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#4B6F8E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by trade (e.g. Mason, Helper, Electrician), city, or project..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#F8FCFF] rounded-xl border border-[#D9EEFF] text-xs text-[#153451] focus:outline-none focus:ring-2 focus:ring-[#2583D5]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="px-3 py-2.5 bg-[#F8FCFF] rounded-xl border border-[#D9EEFF] text-xs font-semibold text-[#153451] focus:outline-none"
            >
              <option value="ALL">All Trades (सभी कार्य)</option>
              <option value="Mason">Mason (राज मिस्त्री)</option>
              <option value="Helper">Helper / Labour (बेलदार)</option>
              <option value="Electrician">Electrician (बिजली मिस्त्री)</option>
              <option value="Plumber">Plumber (नल मिस्त्री)</option>
              <option value="Carpenter">Carpenter (बढ़ई)</option>
              <option value="Painter">Painter (पेंटर)</option>
              <option value="Welder">Welder (वेल्डर)</option>
            </select>

            <select
              value={payoutFilter}
              onChange={(e) => setPayoutFilter(e.target.value)}
              className="px-3 py-2.5 bg-[#F8FCFF] rounded-xl border border-[#D9EEFF] text-xs font-semibold text-[#153451] focus:outline-none"
            >
              <option value="ALL">All Payout Schedules</option>
              <option value="DAILY">Daily Payout (दैनिक भुगतान)</option>
              <option value="WEEKLY">Weekly Payout (साप्ताहिक)</option>
              <option value="MILESTONE">Milestone Payout</option>
              <option value="COMPLETION">Upon Completion</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#4B6F8E] flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#2583D5]" />
            <span>Loading active contractor projects from MongoDB Atlas...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#D9EEFF] p-8 space-y-3">
            <HardHat className="w-12 h-12 text-[#4B6F8E] mx-auto opacity-40" />
            <h3 className="font-bold text-[#153451] text-base">No active contractor projects found</h3>
            <p className="text-xs text-[#4B6F8E] max-w-md mx-auto">
              There are currently no open contractor projects matching your filters. New workforce requirements are posted continuously.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const totalRequired = project.requirements.reduce((acc, r) => acc + r.requiredCount, 0);
              const totalAccepted = project.requirements.reduce((acc, r) => acc + (r.acceptedCount || 0), 0);
              const remainingSpots = totalRequired - totalAccepted;
              const isApplied = appliedProjectIds.includes(project.id);

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-3xl border border-[#D1E8F8] p-5 sm:p-6 shadow-xs hover:border-[#2583D5] transition-all space-y-4"
                >
                  {/* Top Bar: Title, Payout Schedule Badge & Location */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF6FF] text-[#2583D5] border border-[#D1E8F8]">
                          {project.projectType}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          project.payoutSchedule === 'DAILY'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          ⚡ {project.payoutSchedule} PAYOUT
                        </span>
                        <span className="text-xs font-semibold text-[#7697B3]">
                          ID: #{project.id.slice(-6)}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-[#153451]">
                        {project.title}
                      </h3>

                      <p className="text-xs text-[#4B6F8E] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#2583D5]" />
                        <span>{project.workLocation || project.locationAddress}, {project.city}, {project.state}</span>
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-[11px] font-semibold text-[#7697B3] block">Vacancies</span>
                      <span className="text-base font-black text-[#153451]">
                        {remainingSpots > 0 ? (
                          <span className="text-emerald-700">{remainingSpots} Vacancies Remaining</span>
                        ) : (
                          <span className="text-[#7697B3]">Workforce Full</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#4B6F8E] line-clamp-2">
                    {project.description}
                  </p>

                  {/* Multi-Category Workforce Requirements Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-[#EAF6FF]">
                    <span className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block">
                      Required Trades & Daily Wage Rates:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {project.requirements.map((req, idx) => {
                        const spotsLeft = req.requiredCount - (req.acceptedCount || 0);
                        const isFull = spotsLeft <= 0;

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                              isFull
                                ? 'bg-slate-50 border-slate-200 opacity-60'
                                : 'bg-[#F8FCFF] border-[#D1E8F8] hover:border-[#2583D5]'
                            }`}
                          >
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-[#153451] truncate">
                                {req.trade}
                              </h4>
                              <div className="text-[11px] font-semibold text-[#2583D5]">
                                ₹{req.dailyWage}/day • {req.shift}
                              </div>
                              <div className="text-[10px] text-[#7697B3] mt-0.5">
                                {spotsLeft > 0 ? `${spotsLeft} of ${req.requiredCount} open` : 'Filled'}
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isFull || isApplied}
                              onClick={() => openApplyModal(project, req)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition active:scale-95 ${
                                isFull
                                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                  : isApplied
                                  ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                                  : 'bg-[#2583D5] hover:bg-[#1E70B8] text-white shadow-xs'
                              }`}
                            >
                              {isApplied ? 'Applied' : isFull ? 'Full' : 'Apply'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Facilities Strip */}
                  {project.facilities && (
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-semibold text-[#4B6F8E]">
                      {project.facilities.foodProvided && (
                        <span className="flex items-center gap-1 bg-[#EAF6FF] text-[#19639E] px-2.5 py-0.5 rounded-lg">
                          ✓ Food Provided (भोजन उपलब्ध)
                        </span>
                      )}
                      {project.facilities.transportProvided && (
                        <span className="flex items-center gap-1 bg-[#EAF6FF] text-[#19639E] px-2.5 py-0.5 rounded-lg">
                          ✓ Transport / Pick-up
                        </span>
                      )}
                      {project.facilities.safetyGearProvided && (
                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg">
                          ✓ Safety Kit & Helmet
                        </span>
                      )}
                      <span className="text-[#7697B3] ml-auto">
                        Dates: {new Date(project.startDate).toLocaleDateString('en-IN')} - {new Date(project.endDate || Date.now()).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Apply Modal */}
      {selectedProject && selectedRequirement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-[#D1E8F8] shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2583D5] bg-[#EAF6FF] px-2.5 py-0.5 rounded-full inline-block mb-1">
                  APPLY FOR WORKFORCE POSITION
                </span>
                <h3 className="text-lg font-black text-[#153451]">
                  Apply for {selectedRequirement.trade}
                </h3>
                <p className="text-xs text-[#4B6F8E]">{selectedProject.title} • {selectedProject.city}</p>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedProject(null); setSelectedRequirement(null); }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#F8FCFF] border border-[#D1E8F8] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7697B3]">Trade Category:</span>
                  <strong className="text-[#153451]">{selectedRequirement.trade}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7697B3]">Offered Daily Wage:</span>
                  <strong className="text-emerald-700 font-black">₹{selectedRequirement.dailyWage}/day</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7697B3]">Payout Schedule:</span>
                  <strong className="text-[#2583D5] font-black">{selectedProject.payoutSchedule}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7697B3]">Shift:</span>
                  <strong className="text-[#153451]">{selectedRequirement.shift}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7697B3]">Reporting Location:</span>
                  <strong className="text-[#153451] text-right truncate max-w-[240px]">{selectedProject.workLocation || selectedProject.locationAddress}</strong>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  Message / Experience Summary for Contractor
                </label>
                <textarea
                  rows={3}
                  value={applicantNotes}
                  onChange={(e) => setApplicantNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#D1E8F8] bg-[#F8FCFF] text-xs font-medium text-[#153451] focus:outline-none focus:border-[#2583D5]"
                  placeholder="Share details of your trade experience, available tools, and availability..."
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-[#153451] leading-relaxed">
                ℹ️ <strong>Direct Payout Notice:</strong> Upon selection and daily work completion verification by the contractor, your earnings will be credited directly to your DigiWork digital wallet.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedProject(null); setSelectedRequirement(null); }}
                  className="px-4 py-2.5 rounded-xl border border-[#D1E8F8] text-[#153451] text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-md shadow-[#2583D5]/20 flex items-center gap-1.5 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Confirm & Apply (आवेदन भेजें)</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
