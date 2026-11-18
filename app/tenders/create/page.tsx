'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, HardHat } from 'lucide-react';

export default function CreateTenderPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-bg py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-forest">Loading tender draft builder...</p>
        </div>
      </div>
    }>
      <CreateTenderForm />
    </React.Suspense>
  );
}

function CreateTenderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tradeParam = searchParams.get('trade') || 'Mason';
  const countParam = searchParams.get('count') ? parseInt(searchParams.get('count')!) : 20;

  const [title, setTitle] = useState(`Structural ${tradeParam} Requirement for High-Rise Project`);
  const [projectName, setProjectName] = useState('Apex Urban Heights Phase 1');
  const [description, setDescription] = useState('Looking for verified trade brigade with experience in continuous shifts, safety gear compliance, and quality finishing.');
  const [categoryId, setCategoryId] = useState('cat-mason');
  const [city, setCity] = useState('Noida');
  const [state, setState] = useState('Uttar Pradesh');
  const [locationAddress, setLocationAddress] = useState('Sector 150 Expressway');
  const [workerCountRequired, setWorkerCountRequired] = useState(countParam);
  const [perWorkerRate, setPerWorkerRate] = useState(1050);
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [workingHours, setWorkingHours] = useState('8 Hours');
  const [shifts, setShifts] = useState('Day Shift');
  const [accommodationProvided, setAccommodationProvided] = useState(true);
  const [foodProvided, setFoodProvided] = useState(false);
  const [transportProvided, setTransportProvided] = useState(true);
  const [safetyRequirements, setSafetyRequirements] = useState('ISI Safety Helmets, Reflective Jackets, and Steel-Toe Boots mandatory.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalBudget = workerCountRequired * perWorkerRate * 30; // 30 days default calculation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          projectName,
          description,
          categoryId,
          categoryName: tradeParam,
          locationAddress,
          city,
          state,
          workerCountRequired,
          perWorkerRate,
          totalBudget,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          workingHours,
          shifts,
          accommodationProvided,
          foodProvided,
          transportProvided,
          safetyRequirements,
          skillsRequired: [tradeParam, 'Safety Certified'],
          applicationDeadline: new Date(Date.now() + 10 * 86400000).toISOString(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to create tender');
        setLoading(false);
        return;
      }

      router.push(`/tenders/${data.tender.id}`);
    } catch (err: any) {
      setError(err.message || 'Network error');
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-elevated">
        
        {/* Header */}
        <div className="text-center mb-8 border-b border-border pb-6">
          <Link href="/tenders" className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tenders
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-forest text-lime flex items-center justify-center mx-auto mb-2 shadow-xs">
            <Building2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest">
            Publish Workforce Tender
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            व्यावसायिक टेंडर प्रकाशित करें • Mobilize 5 to 100+ skilled workers
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-status-dangerSoft text-status-danger text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-forest uppercase tracking-wider border-b border-border pb-1">
              1. Project & Trade Scope
            </h2>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Tender Title (टेंडर का शीर्षक) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Project Name (प्रोजेक्ट का नाम) *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Trade Category (कार्य श्रेणी) *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                >
                  <option value="cat-mason">Mason (राज मिस्त्री)</option>
                  <option value="cat-electrician">Electrician (बिजली)</option>
                  <option value="cat-plumber">Plumber (नल)</option>
                  <option value="cat-carpenter">Carpenter (बढ़ई)</option>
                  <option value="cat-painter">Painter (पेंटर)</option>
                  <option value="cat-welder">Welder (वेल्डर)</option>
                  <option value="cat-labour">Construction Labour / Helper</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Detailed Scope of Work (काम का पूरा विवरण) *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-bg text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-bold text-forest uppercase tracking-wider border-b border-border pb-1">
              2. Headcount & Compensation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Number of Workers Required (कारीगर संख्या) *
                </label>
                <input
                  type="number"
                  min="2"
                  max="200"
                  value={workerCountRequired}
                  onChange={(e) => setWorkerCountRequired(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-black text-forest"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Daily Wage Rate per Worker (दैनिक दर - ₹) *
                </label>
                <input
                  type="number"
                  value={perWorkerRate}
                  onChange={(e) => setPerWorkerRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-black text-forest"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-sage-soft rounded-2xl border border-sage/20 flex justify-between items-center text-xs">
              <span className="font-semibold text-text-secondary">Estimated 30-Day Total Wage Budget:</span>
              <span className="text-lg font-black text-forest">₹{totalBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-bold text-forest uppercase tracking-wider border-b border-border pb-1">
              3. Site Location & Perks
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  City (शहर) *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Site Address / Land (स्थान) *
                </label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                  required
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer p-3 bg-bg rounded-xl border border-border">
                <input
                  type="checkbox"
                  checked={accommodationProvided}
                  onChange={(e) => setAccommodationProvided(e.target.checked)}
                  className="w-4 h-4 accent-forest rounded"
                />
                <span>Free Stay / Barracks</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer p-3 bg-bg rounded-xl border border-border">
                <input
                  type="checkbox"
                  checked={foodProvided}
                  onChange={(e) => setFoodProvided(e.target.checked)}
                  className="w-4 h-4 accent-forest rounded"
                />
                <span>Food / Meals Provided</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer p-3 bg-bg rounded-xl border border-border">
                <input
                  type="checkbox"
                  checked={transportProvided}
                  onChange={(e) => setTransportProvided(e.target.checked)}
                  className="w-4 h-4 accent-forest rounded"
                />
                <span>Site Cab Transport</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 mt-6"
          >
            <span>{loading ? 'PUBLISHING TENDER...' : 'PUBLISH TENDER (टेंडर प्रकाशित करें)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
