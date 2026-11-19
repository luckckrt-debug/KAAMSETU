'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  PlusCircle, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ContractorPostWorkPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [trade, setTrade] = useState('Construction & Masonry');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Sector 128, Expressway, Noida');
  const [durationDays, setDurationDays] = useState(60);
  const [budgetTotal, setBudgetTotal] = useState(120000);
  const [workersNeeded, setWorkersNeeded] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Please provide a project / tender title.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: `${description} | Required Crew: ${workersNeeded} workers`,
          workType: trade,
          location,
          durationDays: Number(durationDays),
          budgetTotal: Number(budgetTotal),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/contractor/projects');
        }, 2000);
      } else {
        setError(data.error || 'Failed to post project.');
      }
    } catch (e: any) {
      setError(e.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Create New Project / Publish Tender"
      subtitle="नई निर्माण परियोजना व कार्यबल टेंडर प्रकाशित करें"
    >
      <div className="max-w-3xl mx-auto space-y-6">

        {success && (
          <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-black">Project Tender Published Successfully!</p>
              <p className="text-emerald-700">Skilled crews and workers can now submit bids. Redirecting to project board...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D9EEFF] shadow-xs space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#153451] mb-1">
                Project / Tender Title (परियोजना का नाम) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Commercial High-Rise Flooring & Tile Masonry Project"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451] focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Work Trade (ट्रेड)</label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D9EEFF] bg-[#F8FCFF] text-xs font-bold text-[#153451]"
                >
                  <option value="Construction & Masonry">Construction, Brickwork & Masonry</option>
                  <option value="Electrician & High Voltage">Commercial High-Voltage Electrical</option>
                  <option value="Plumbing & Stormwater">Commercial Plumbing & Drainage</option>
                  <option value="Steel Fixing & Shuttering">Bar Bending & Shuttering</option>
                  <option value="Painting & Textures">External Facade & Painting</option>
                  <option value="Carpentry & Formwork">Formwork & Commercial Carpentry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Workers Needed (श्रमिक संख्या)</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={workersNeeded}
                  onChange={(e) => setWorkersNeeded(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-bold text-[#153451]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Total Project Budget (₹ कुल बजट)</label>
                <input
                  type="number"
                  value={budgetTotal}
                  onChange={(e) => setBudgetTotal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-bold text-[#153451]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Duration (अवधि - दिन)</label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-bold text-[#153451]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153451] mb-1">Site Location & Address (कार्य स्थल)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153451] mb-1">Scope of Work & Technical Terms (कार्य विवरण)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include safety equipment (PPE), site timing, muster roll attendance rules, and milestone payment schedule..."
                className="w-full p-4 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451] focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#D9EEFF] flex items-center justify-between">
            <span className="text-[11px] text-[#4B6F8E] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Milestone Escrow Protection Enabled
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2 transition active:scale-95"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Publishing Project...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Tender (टेंडर जारी करें)</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </DashboardLayout>
  );
}
