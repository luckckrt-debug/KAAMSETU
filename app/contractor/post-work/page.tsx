'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  PlusCircle, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Layers,
  Utensils,
  Home as HomeIcon,
  HardHat
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PayoutSchedule } from '@/lib/types';

interface WorkforceCategoryForm {
  trade: string;
  skillLevel: 'UNSKILLED' | 'SEMI_SKILLED' | 'SKILLED' | 'EXPERT';
  requiredCount: number;
  experienceYears: number;
  dailyWage: number;
  workDescription: string;
  shift: 'DAY' | 'NIGHT' | 'ROTATIONAL';
}

const COMMON_TRADES = [
  'Mason / Raj Mistri (राज मिस्त्री)',
  'Construction Helper / Beldar (मजदूर / हेल्पर)',
  'Electrician (बिजली मिस्त्री)',
  'Plumber & Pipe Fitter (नल मिस्त्री)',
  'Carpenter & Woodworker (बढ़ई)',
  'Painter & Waterproofing (रंग मिस्त्री)',
  'Welder & Steel Fabricator (वेल्डर)',
  'Bar Bender / Saria Mistri (सरिया मिस्त्री)',
  'Tile & Marble Installer (टाइल मिस्त्री)',
  'Civil Site Supervisor (सिविल सुपरवाइजर)',
  'Civil Engineer (सिविल इंजीनियर)',
  'Commercial Driver (ड्राइवर)',
  'Security Guard (सुरक्षा गार्ड)',
  'Deep Cleaning / Housekeeping (सफाई कर्मी)',
  'Cook / Chef / Maharaj (रसोइया)',
  'Waiter / Catering Staff (वेटर)',
  'Warehouse Picker & Packer (गोदाम पैकर)',
  'Auto & Vehicle Mechanic (मैकेनिक)',
  'Software Developer / IT Support (सॉफ्टवेयर डेवलपर)',
  'Data Entry Operator / Typist (डाटा एंट्री ऑपरेटर)',
  'Accountant / Tally GST (अकाउंटेंट)',
  'Qualified Nurse / Caregiver (नर्स / रोगी देखभाल)'
];

export default function ContractorPostWorkPage() {
  const router = useRouter();

  // Basic project info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('Commercial Construction & Warehouse');
  const [locationAddress, setLocationAddress] = useState('Sector 128, Expressway');
  const [city, setCity] = useState('Noida');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('201304');
  const [durationDays, setDurationDays] = useState(45);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [shiftTiming, setShiftTiming] = useState('08:00 AM - 05:00 PM (General Day Shift)');
  const [workHoursPerDay, setWorkHoursPerDay] = useState(8);

  // Site facilities & conditions
  const [accommodationDetails, setAccommodationDetails] = useState('Provided on-site with clean sanitation');
  const [foodDetails, setFoodDetails] = useState('Subsidized worker mess canteen provided');
  const [toolsEquipmentInfo, setToolsEquipmentInfo] = useState('Heavy equipment & scaffolding provided; personal hand tools required');
  const [safetyRequirements, setSafetyRequirements] = useState('Hard hats, safety boots, and reflective jackets mandatory on site');

  // Payment schedule & terms
  const [payoutSchedule, setPayoutSchedule] = useState<PayoutSchedule>('DAILY');
  const [attendanceVerification, setAttendanceVerification] = useState('DAILY_SUPERVISOR');
  const [paymentDueDate, setPaymentDueDate] = useState('Same-day evening 08:00 PM');
  const [paymentTerms, setPaymentTerms] = useState('Daily verified wage transfer via KaamSetu digital central escrow payout');

  // Multi-category workforce state
  const [categories, setCategories] = useState<WorkforceCategoryForm[]>([
    {
      trade: 'Mason / Raj Mistri (राज मिस्त्री)',
      skillLevel: 'SKILLED',
      requiredCount: 5,
      experienceYears: 3,
      dailyWage: 950,
      workDescription: 'RCC slab casting, brickwork, and exterior plastering.',
      shift: 'DAY',
    },
    {
      trade: 'Construction Helper / Beldar (मजदूर / हेल्पर)',
      skillLevel: 'UNSKILLED',
      requiredCount: 12,
      experienceYears: 1,
      dailyWage: 650,
      workDescription: 'Material shifting, mortar mixing, and site clearing.',
      shift: 'DAY',
    },
    {
      trade: 'Electrician (बिजली मिस्त्री)',
      skillLevel: 'SKILLED',
      requiredCount: 2,
      experienceYears: 4,
      dailyWage: 850,
      workDescription: 'Concealed conduit piping, temporary power lines, and DB box fitting.',
      shift: 'DAY',
    }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Add workforce row
  const addCategory = () => {
    setCategories([
      ...categories,
      {
        trade: COMMON_TRADES[0],
        skillLevel: 'SKILLED',
        requiredCount: 2,
        experienceYears: 2,
        dailyWage: 800,
        workDescription: 'Site civil tasks as per engineering supervisor instructions.',
        shift: 'DAY',
      }
    ]);
  };

  // Remove workforce row
  const removeCategory = (index: number) => {
    if (categories.length === 1) {
      setError('At least one workforce category is required for a project.');
      return;
    }
    setCategories(categories.filter((_, i) => i !== index));
  };

  // Update workforce row
  const updateCategory = (index: number, field: keyof WorkforceCategoryForm, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  // Calculate totals
  const totalHeadcount = categories.reduce((sum, c) => sum + (Number(c.requiredCount) || 0), 0);
  const dailyPayroll = categories.reduce((sum, c) => sum + ((Number(c.requiredCount) || 0) * (Number(c.dailyWage) || 0)), 0);
  const totalEstimatedBudget = dailyPayroll * durationDays;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Project description is required.');
      return;
    }
    if (categories.length === 0) {
      setError('Please add at least one workforce requirement category.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          projectType,
          locationAddress: `${locationAddress}, ${city}`,
          city,
          state,
          pincode,
          durationDays: Number(durationDays),
          startDate,
          shiftTiming,
          workHoursPerDay: Number(workHoursPerDay),
          accommodationDetails,
          foodDetails,
          toolsEquipmentInfo,
          safetyRequirements,
          contactCoordinationDetails: `Site Office: ${locationAddress}`,
          requirements: categories,
          payoutSchedule,
          attendanceVerification,
          paymentDueDate,
          paymentTerms,
          estimatedBudget: totalEstimatedBudget,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to publish project.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/contractor/projects');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Network error.');
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Create Workforce Project"
      subtitle="मल्टी-कैटेगरी कार्यबल आवश्यकताएं, दैनिक भुगतान व साइट प्रबंधन"
      actions={
        <Link
          href="/contractor/projects"
          className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-text-primary hover:bg-bg transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Project published successfully! Opening project management dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. PROJECT OVERVIEW */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Building2 className="w-5 h-5 text-forest" />
              <h2 className="text-base font-black text-forest">
                1. Project Overview & Work Location
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Project Title (परियोजना का नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Commercial Logistics Warehouse & RCC Foundation"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Project Domain / Classification
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:border-forest"
                >
                  <option value="Commercial Infrastructure & Warehouse">Commercial Infrastructure & Warehouse</option>
                  <option value="Residential Multi-Storey Construction">Residential Multi-Storey Construction</option>
                  <option value="Industrial Plant & Factory Setup">Industrial Plant & Factory Setup</option>
                  <option value="Highway, Road & Bridge Works">Highway, Road & Bridge Works</option>
                  <option value="Commercial Interior & Electrical Fitout">Commercial Interior & Electrical Fitout</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Work Duration (दिन) & Start Date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:border-forest"
                    placeholder="Duration days"
                  />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Project Description & Scope of Work *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide comprehensive instructions: site safety, milestone requirements, engineering supervision details, tool availability..."
                  className="w-full p-4 rounded-xl border border-border bg-bg text-xs font-medium text-text-primary focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Site Street Address / Landmark
                </label>
                <input
                  type="text"
                  required
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                    City (शहर)
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                    State (राज्य)
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:border-forest"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. MULTI-CATEGORY WORKFORCE BUILDER (MODULE 3) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-forest" />
                  <h2 className="text-base font-black text-forest">
                    2. Workforce Requirements (मल्टी-कैटेगरी कार्यबल)
                  </h2>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Contractor can add multiple worker categories (Masons, Helpers, Electricians, Carpenters) with specific counts and daily rates.
                </p>
              </div>

              <button
                type="button"
                onClick={addCategory}
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Worker Category</span>
              </button>
            </div>

            <div className="space-y-4">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl border border-border bg-bg/50 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-forest bg-white px-2.5 py-1 rounded-lg border border-border">
                      Category #{idx + 1}
                    </span>

                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCategory(idx)}
                        className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-text-primary uppercase block mb-1">
                        Worker Type / Trade *
                      </label>
                      <input
                        type="text"
                        required
                        list="all-trades-list"
                        value={cat.trade}
                        onChange={(e) => updateCategory(idx, 'trade', e.target.value)}
                        placeholder="Search or enter any trade (e.g. Mason, Electrician, Cook, Driver, Developer)..."
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-xs font-bold text-text-primary"
                      />
                      <datalist id="all-trades-list">
                        {COMMON_TRADES.map((t) => (
                          <option key={t} value={t} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-primary uppercase block mb-1">
                        Required Headcount *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        required
                        value={cat.requiredCount}
                        onChange={(e) => updateCategory(idx, 'requiredCount', Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-xs font-bold text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-primary uppercase block mb-1">
                        Daily Wage (₹/day) *
                      </label>
                      <input
                        type="number"
                        min="300"
                        step="50"
                        required
                        value={cat.dailyWage}
                        onChange={(e) => updateCategory(idx, 'dailyWage', Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-xs font-bold text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-primary uppercase block mb-1">
                        Skill Level
                      </label>
                      <select
                        value={cat.skillLevel}
                        onChange={(e) => updateCategory(idx, 'skillLevel', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-xs font-bold text-text-primary"
                      >
                        <option value="UNSKILLED">Unskilled (अकुशल)</option>
                        <option value="SEMI_SKILLED">Semi-Skilled (अर्ध-कुशल)</option>
                        <option value="SKILLED">Skilled (कुशल कारीगर)</option>
                        <option value="EXPERT">Master / Expert (उस्ताद)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-primary uppercase block mb-1">
                        Min. Exp (Years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={cat.experienceYears}
                        onChange={(e) => updateCategory(idx, 'experienceYears', Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-xs font-bold text-text-primary"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-text-primary uppercase block mb-1">
                        Specific Tasks & Description
                      </label>
                      <input
                        type="text"
                        value={cat.workDescription}
                        onChange={(e) => updateCategory(idx, 'workDescription', e.target.value)}
                        placeholder="e.g. Mortar mixing, foundation work, shuttering"
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-xs font-bold text-text-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Workforce Summary Card */}
            <div className="p-4 rounded-2xl bg-[#EAF6FF] border border-[#D1E8F8] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#7697B3] font-bold uppercase block">Total Crew Size</span>
                <span className="text-xl font-black text-[#153451]">{totalHeadcount} Workers Required</span>
              </div>
              <div>
                <span className="text-xs text-[#7697B3] font-bold uppercase block">Gross Daily Payroll</span>
                <span className="text-xl font-black text-[#2583D5]">₹{dailyPayroll.toLocaleString('en-IN')}/day</span>
              </div>
              <div>
                <span className="text-xs text-[#7697B3] font-bold uppercase block">Est. Total Project Budget ({durationDays} days)</span>
                <span className="text-xl font-black text-emerald-700">₹{totalEstimatedBudget.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* 3. PAYMENT SCHEDULE & TERMS (MODULE 4) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <DollarSign className="w-5 h-5 text-forest" />
              <h2 className="text-base font-black text-forest">
                3. Payout Schedule & Payment Terms (भुगतान अनुसूची)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Payout Frequency / Schedule *
                </label>
                <select
                  value={payoutSchedule}
                  onChange={(e) => setPayoutSchedule(e.target.value as PayoutSchedule)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:border-forest"
                >
                  <option value="DAILY">Daily Pay (दैनिक शाम का भुगतान)</option>
                  <option value="WEEKLY">Weekly Muster (साप्ताहिक भुगतान)</option>
                  <option value="MILESTONE">Milestone-based (माइलस्टोन अनुसार)</option>
                  <option value="COMPLETION">Project Completion (कार्य समाप्ति पर)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Attendance Verification Model
                </label>
                <select
                  value={attendanceVerification}
                  onChange={(e) => setAttendanceVerification(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:border-forest"
                >
                  <option value="DAILY_SUPERVISOR">Site Supervisor Daily Verification</option>
                  <option value="CONTRACTOR_APPROVAL">Contractor Direct Portal Approval</option>
                  <option value="GPS_CHECKIN">GPS Live Geofence Check-in</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Payment Due Time
                </label>
                <input
                  type="text"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:border-forest"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Binding Payment Terms (Visible to workers upon applying)
                </label>
                <input
                  type="text"
                  required
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:border-forest"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  ✓ Terms once published are locked and disclosed to workers during application.
                </p>
              </div>
            </div>
          </div>

          {/* 4. SITE FACILITIES & SAFETY */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated space-y-4">
            <h2 className="text-base font-black text-forest border-b border-border pb-3 flex items-center gap-2">
              <HardHat className="w-5 h-5 text-forest" />
              <span>4. Site Facilities & Safety Compliance</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Accommodation Details (आवास व्यवस्था)
                </label>
                <input
                  type="text"
                  value={accommodationDetails}
                  onChange={(e) => setAccommodationDetails(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Food & Canteen (भोजन व्यवस्था)
                </label>
                <input
                  type="text"
                  value={foodDetails}
                  onChange={(e) => setFoodDetails(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                  Safety Equipment & PPE Rules
                </label>
                <input
                  type="text"
                  value={safetyRequirements}
                  onChange={(e) => setSafetyRequirements(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-forest hover:bg-forest-light text-lime font-black text-sm uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Building2 className="w-5 h-5" />
              <span>{submitting ? 'PUBLISHING WORKFORCE PROJECT...' : 'PUBLISH PROJECT TO WORKER MARKETPLACE (परियोजना प्रकाशित करें)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}
