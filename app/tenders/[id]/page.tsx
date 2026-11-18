'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Tender } from '@/lib/types';

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenderId = params.id as string;

  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [applyType, setApplyType] = useState<'INDIVIDUAL' | 'TEAM'>('TEAM');
  const [proposedWorkers, setProposedWorkers] = useState(10);
  const [proposedRate, setProposedRate] = useState(1050);
  const [coverNote, setCoverNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/tenders/${tenderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.tender) {
          setTender(data.tender);
          setProposedRate(data.tender.perWorkerRate);
          setProposedWorkers(Math.min(10, data.tender.workerCountRequired));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tenderId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/tenders/${tenderId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderTeamId: applyType === 'TEAM' ? 'team-1' : undefined,
          proposedRate,
          proposedWorkersCount: applyType === 'TEAM' ? proposedWorkers : 1,
          coverNote,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to submit application');
        setActionLoading(false);
        return;
      }

      setMessage('Application submitted successfully! The contractor will review your team qualifications.');
      setApplyModal(false);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg font-bold text-text-muted">
        Loading tender specifications...
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-bg space-y-4">
        <p className="text-forest font-bold text-lg">Tender not found.</p>
        <Link href="/tenders" className="px-5 py-2.5 rounded-xl bg-forest text-lime text-xs font-bold">
          Back to Tenders
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation */}
        <Link
          href="/tenders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Tenders
        </Link>

        {message && (
          <div className="p-4 rounded-2xl bg-status-successSoft text-status-success text-xs font-bold border border-status-success/20">
            {message}
          </div>
        )}

        {/* Tender Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-elevated">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-forest uppercase tracking-wider bg-sage-soft px-3 py-1 rounded-full">
                  {tender.categoryName || 'Trade Tender'}
                </span>
                <span className="text-xs font-bold text-status-success bg-status-successSoft px-2.5 py-0.5 rounded-full">
                  Verified Contractor Tender
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-forest">
                {tender.title}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary flex items-center gap-2">
                <Building className="w-4 h-4 text-sage" />
                <span>Project: <strong className="text-forest">{tender.projectName}</strong></span>
              </p>
            </div>

            <div className="bg-bg p-5 rounded-2xl border border-border text-left md:text-right space-y-1 shrink-0">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Total Budget Allocation</span>
              <span className="text-2xl font-black text-forest">₹{tender.totalBudget.toLocaleString('en-IN')}</span>
              <span className="text-xs font-bold text-cta block">₹{tender.perWorkerRate} / worker / day</span>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1 font-semibold text-text-primary">
                <MapPin className="w-4 h-4 text-sage" /> {tender.locationAddress}, {tender.city}
              </span>
              <span className="flex items-center gap-1 font-semibold text-text-primary">
                <Users className="w-4 h-4 text-forest" /> Required: {tender.workerCountRequired} Workers
              </span>
              <span className="flex items-center gap-1 font-semibold text-cta">
                <Clock className="w-4 h-4" /> Closing: {new Date(tender.applicationDeadline).toLocaleDateString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setApplyModal(true)}
              className="px-6 py-3 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
            >
              <span>APPLY FOR TENDER (टेंडर के लिए आवेदन करें)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detailed Specs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* Project Scope */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-3">
              <h2 className="text-base font-bold text-forest">Project Scope & Scope of Work</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {tender.description}
              </p>
            </div>

            {/* Technical Skills Required */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
              <h2 className="text-base font-bold text-forest">Required Skills & Certifications</h2>
              <div className="flex flex-wrap gap-2">
                {tender.skillsRequired.map((skill, idx) => (
                  <span key={idx} className="bg-sage-soft text-forest text-xs font-bold px-3 py-1.5 rounded-xl border border-sage/20">
                    ✓ {skill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-text-muted">
                Minimum {tender.experienceRequired} years verified trade experience required for all team participants.
              </p>
            </div>

            {/* Schedule & Shifts */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-3">
              <h2 className="text-base font-bold text-forest">Working Hours & Milestone Terms</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-bg rounded-xl border border-border">
                  <span className="text-[10px] text-text-muted block font-semibold">Shifts & Hours</span>
                  <span className="font-bold text-forest">{tender.workingHours} ({tender.shifts})</span>
                </div>
                <div className="p-3 bg-bg rounded-xl border border-border">
                  <span className="text-[10px] text-text-muted block font-semibold">Payment Settlement</span>
                  <span className="font-bold text-forest">{tender.paymentTerms}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Site Facilities & Safety Compliance */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-4">
              <h3 className="font-bold text-forest text-sm">Site Facilities Provided</h3>
              <div className="space-y-2.5 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${tender.accommodationProvided ? 'text-status-success' : 'text-gray-300'}`} />
                  <span className={tender.accommodationProvided ? 'font-bold text-forest' : 'text-text-muted line-through'}>
                    Free On-site Accommodation & Rest Barracks
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${tender.foodProvided ? 'text-status-success' : 'text-gray-300'}`} />
                  <span className={tender.foodProvided ? 'font-bold text-forest' : 'text-text-muted line-through'}>
                    Canteen / Subsidized Food Facilities
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${tender.transportProvided ? 'text-status-success' : 'text-gray-300'}`} />
                  <span className={tender.transportProvided ? 'font-bold text-forest' : 'text-text-muted line-through'}>
                    Site Pickup & Drop Transport
                  </span>
                </div>
              </div>
            </div>

            {tender.safetyRequirements && (
              <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-2">
                <h3 className="font-bold text-forest text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-status-danger" /> Mandatory Safety Protocols
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {tender.safetyRequirements}
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Tender Application Modal */}
      {applyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5">
            <h3 className="text-xl font-black text-forest">Apply for Tender</h3>
            <p className="text-xs text-text-secondary">
              Submit your team bid. The contractor will review your team credentials and attendance availability.
            </p>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                  How are you applying?
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setApplyType('TEAM')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      applyType === 'TEAM'
                        ? 'bg-forest text-lime border-forest shadow-xs'
                        : 'bg-bg text-text-primary border-border hover:border-forest'
                    }`}
                  >
                    👥 As Team Leader (टीम के साथ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyType('INDIVIDUAL')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      applyType === 'INDIVIDUAL'
                        ? 'bg-forest text-lime border-forest shadow-xs'
                        : 'bg-bg text-text-primary border-border hover:border-forest'
                    }`}
                  >
                    👤 Individual Worker (अकेले)
                  </button>
                </div>
              </div>

              {applyType === 'TEAM' && (
                <div>
                  <div className="flex justify-between text-xs font-bold text-text-primary mb-1">
                    <span>Number of Workers in Crew:</span>
                    <span className="text-forest font-black">{proposedWorkers} Workers</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max={tender.workerCountRequired}
                    value={proposedWorkers}
                    onChange={(e) => setProposedWorkers(Number(e.target.value))}
                    className="w-full accent-forest cursor-pointer"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Proposed Daily Wage per Worker (प्रस्तावित दैनिक दर - ₹)
                </label>
                <input
                  type="number"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-black text-forest"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Cover Note / Experience Proof (अनुभव विवरण)
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="e.g. My crew has completed structural brickwork on over 15 high-rise projects in Noida Sector 150."
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-xs font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 rounded-xl bg-forest text-lime text-xs font-black shadow-md"
                >
                  {actionLoading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
