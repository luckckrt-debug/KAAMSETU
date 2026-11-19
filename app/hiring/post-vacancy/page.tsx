'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  Briefcase, 
  Users, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  ArrowLeft,
  Building,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function PostVacancyPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electrician & Maintenance');
  const [description, setDescription] = useState('');
  const [requiredWorkers, setRequiredWorkers] = useState(2);
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [estimatedBudget, setEstimatedBudget] = useState(15000);
  const [shiftType, setShiftType] = useState('Full Time (Day Shift)');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Please provide a job title / vacancy headline.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/hiring/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description: `${description} | Shift: ${shiftType}`,
          requiredWorkers: Number(requiredWorkers),
          locality,
          city,
          estimatedBudget: Number(estimatedBudget),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/hiring/requirements');
        }, 2000);
      } else {
        setError(data.error || 'Failed to post vacancy.');
      }
    } catch (e: any) {
      setError(e.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Post New Job Vacancy / Requirement"
      subtitle="सत्यापित कार्यबल भर्ती आवश्यकता बनाएं • तत्काल आवेदन प्राप्त करें"
    >
      <div className="max-w-3xl mx-auto space-y-6">

        {success && (
          <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-black">Vacancy Posted Successfully!</p>
              <p className="text-emerald-700">Candidates in your city are being notified. Redirecting to recruitment desk...</p>
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
                Job Title / Vacancy Headline (पद का नाम) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5x Certified Electricians for Commercial Tower Project"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451] focus:outline-none focus:ring-2 focus:ring-[#2583D5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Trade Category (कार्य श्रेणी)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D9EEFF] bg-[#F8FCFF] text-xs font-bold text-[#153451]"
                >
                  <option value="Electrician & Maintenance">Electrician & Electrical Maintenance</option>
                  <option value="Plumbing & Sanitary">Plumbing & Sanitary Work</option>
                  <option value="Carpentry & Woodwork">Carpentry & Woodwork</option>
                  <option value="Painting & Polishing">Painting & Wall Finish</option>
                  <option value="Construction & Masonry">Construction Masonry & Shuttering</option>
                  <option value="HVAC & AC Service">HVAC, AC & Refrigeration</option>
                  <option value="Housekeeping & Facility">Housekeeping & Facility Staff</option>
                  <option value="Computer & Backoffice">Computer Operator & Desk Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Required Headcount (संख्या)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={requiredWorkers}
                  onChange={(e) => setRequiredWorkers(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-bold text-[#153451]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Total Estimated Budget (₹)</label>
                <input
                  type="number"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-bold text-[#153451]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Shift / Working Hours</label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D9EEFF] bg-[#F8FCFF] text-xs font-bold text-[#153451]"
                >
                  <option value="Full Time (Day Shift)">Full Time (9:00 AM - 6:00 PM)</option>
                  <option value="Night Shift (Overtime)">Night Shift (8:00 PM - 5:00 AM)</option>
                  <option value="Flexible Shift">Flexible / Milestone Based</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">City / Region (शहर)</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-bold text-[#153451]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153451] mb-1">Site Address / Landmark (स्थान)</label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Sector 62, Commercial Plaza, Noida"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153451] mb-1">Detailed Requirements & Skills Needed</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe candidate experience, required tools, project timeline, and perks provided (e.g. lunch/tea, safety gear)..."
                className="w-full p-4 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451] focus:outline-none focus:ring-2 focus:ring-[#2583D5]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#D9EEFF] flex items-center justify-between">
            <span className="text-[11px] text-[#4B6F8E] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Aadhaar Verified Candidates Only
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-md flex items-center gap-2 transition active:scale-95"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Publishing Vacancy...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Hiring Vacancy (भर्ती जारी करें)</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </DashboardLayout>
  );
}
