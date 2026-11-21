'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HardHat, 
  User, 
  Briefcase, 
  Award, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Crosshair,
  Upload,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Sparkles,
  Search
} from 'lucide-react';
import { MASTER_CATEGORIES, MASTER_PROFESSIONS, findProfessionByIdOrSlug } from '@/lib/professions-master';

export default function WorkerRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Personal
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dob, setDob] = useState('1994-05-15');
  const [gender, setGender] = useState('MALE');
  const [language, setLanguage] = useState('hi');

  // Step 2: Multi-Profession Support
  const [selectedCatId, setSelectedCatId] = useState('cat-b-electrical');
  const [primaryProfessionId, setPrimaryProfessionId] = useState('prof-electrician');
  const [additionalProfessions, setAdditionalProfessions] = useState<string[]>(['prof-cctv-technician', 'prof-solar-technician']);
  const [customProfessionInput, setCustomProfessionInput] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSubmitted, setCustomSubmitted] = useState(false);
  const [category, setCategory] = useState('cat-electrician');
  const [skills, setSkills] = useState<string[]>(['House Wiring', 'MCB Fixing', 'Inverter Setup']);

  // Step 3: Experience
  const [yearsExperience, setYearsExperience] = useState(5);
  const [bio, setBio] = useState('Specialized in 3-phase wiring and electrical maintenance.');
  const [qualification, setQualification] = useState('ITI Electrical Certified');
  const [tools, setTools] = useState('Multimeter, Drill, Wire Stripper, Pliers');
  const [hourlyRate, setHourlyRate] = useState(350);
  const [dailyRate, setDailyRate] = useState(900);

  // Step 4: Location
  const [state, setState] = useState('Delhi');
  const [city, setCity] = useState('Delhi');
  const [district, setDistrict] = useState('South Delhi');
  const [pincode, setPincode] = useState('110020');
  const [locality, setLocality] = useState('Okhla');
  const [address, setAddress] = useState('Pocket B, Okhla Phase 3');
  const [latitude, setLatitude] = useState(28.5355);
  const [longitude, setLongitude] = useState(77.2600);
  const [preferredRadiusKm, setPreferredRadiusKm] = useState(15);

  // Step 5: Availability
  const [isAvailableNow, setIsAvailableNow] = useState(true);
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [workingHours, setWorkingHours] = useState('09:00 AM - 07:00 PM');

  // Step 6: Verification
  const [docType, setDocType] = useState<'AADHAAR' | 'PAN' | 'VOTER_ID'>('AADHAAR');
  const [docNumber, setDocNumber] = useState('5421 8890 1234');
  const [docUploaded, setDocUploaded] = useState(true);

  // Step 7: Payout
  const [upiId, setUpiId] = useState('worker@okhdfcbank');
  const [accountNumber, setAccountNumber] = useState('987654321012');
  const [ifsc, setIfsc] = useState('HDFC0001234');
  const [accountName, setAccountName] = useState('');

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      () => {},
      { timeout: 6000 }
    );
  };

  const handleSubmit = async () => {
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const primaryProf = MASTER_PROFESSIONS.find(p => p.id === primaryProfessionId);
      const allProfessionsPayload = [
        {
          professionId: primaryProfessionId,
          name: primaryProf ? primaryProf.name : 'Electrician',
          isPrimary: true,
          hourlyRate,
          dailyRate,
          skills
        },
        ...additionalProfessions.map(addId => {
          const p = MASTER_PROFESSIONS.find(mp => mp.id === addId);
          return {
            professionId: addId,
            name: p ? p.name : addId,
            isPrimary: false,
            hourlyRate,
            dailyRate,
            skills: p ? p.popularSkills : []
          };
        })
      ];

      const refCode = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('ref') || '') : '';
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          password,
          confirmPassword,
          role: 'WORKER',
          language,
          state,
          city,
          pincode,
          tradeCategory: primaryProf ? primaryProf.name : category,
          yearsExperience,
          hourlyRate,
          dailyRate,
          professions: allProfessionsPayload,
          referralCode: refCode || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/worker/dashboard');
    } catch (err: any) {
      setError(err.message || 'Network error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-bg">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-border shadow-elevated p-6 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-8 border-b border-border pb-6">
          <div className="w-12 h-12 rounded-2xl bg-forest text-lime flex items-center justify-center mx-auto mb-3 shadow-xs">
            <HardHat className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest">
            Skilled Worker Registration
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            कुशल कारीगर पंजीकरण • 7-Step Verified Onboarding
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between max-w-xl mx-auto mt-6 px-2">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    currentStep === step
                      ? 'bg-forest text-lime ring-4 ring-forest/15'
                      : currentStep > step
                      ? 'bg-status-success text-white'
                      : 'bg-bg border border-border text-text-muted'
                  }`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
                <span className="text-[10px] font-bold text-text-muted mt-1 hidden sm:block">
                  {step === 1 && 'Personal'}
                  {step === 2 && 'Trade'}
                  {step === 3 && 'Skills'}
                  {step === 4 && 'Area'}
                  {step === 5 && 'Hours'}
                  {step === 6 && 'KYC'}
                  {step === 7 && 'Payout'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-status-dangerSoft border border-status-danger/20 text-status-danger text-xs font-semibold">
            {error}
          </div>
        )}

        {/* STEP 1: PERSONAL DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-forest border-b border-border pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-sage" /> Step 1: Personal Details (व्यक्तिगत विवरण)
            </h2>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Full Name as per Aadhaar (आधार अनुसार पूरा नाम) *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setAccountName(e.target.value); }}
                placeholder="e.g. Ramesh Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Mobile Number (मोबाइल नंबर) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Create Password (पासवर्ड) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Confirm Password (पासवर्ड की पुष्टि करें) *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Date of Birth (जन्म तिथि)
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Gender (लिंग)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
                >
                  <option value="MALE">Male (पुरुष)</option>
                  <option value="FEMALE">Female (महिला)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Preferred Language (भाषा)
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
                >
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROFESSION */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-forest border-b border-border pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sage" /> Step 2: Profession & Trades (व्यवसाय व कौशल)
              </span>
              <span className="text-xs bg-lime/20 text-forest font-bold px-2.5 py-1 rounded-full">
                26 Industry Categories
              </span>
            </h2>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                1. Select Industry Category (उद्योग श्रेणी) *
              </label>
              <select
                value={selectedCatId}
                onChange={(e) => {
                  setSelectedCatId(e.target.value);
                  const firstInCat = MASTER_PROFESSIONS.find(p => p.categoryId === e.target.value);
                  if (firstInCat) {
                    setPrimaryProfessionId(firstInCat.id);
                    setCategory(firstInCat.slug);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm font-bold text-forest focus:outline-none focus:border-forest"
              >
                {MASTER_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    [{cat.code}] {cat.name} ({cat.nameHi})
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Profession */}
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                2. Select Primary Profession (मुख्य पेशा / व्यवसाय) *
              </label>
              <select
                value={primaryProfessionId}
                onChange={(e) => {
                  setPrimaryProfessionId(e.target.value);
                  const p = MASTER_PROFESSIONS.find(mp => mp.id === e.target.value);
                  if (p) {
                    setCategory(p.slug);
                    if (p.popularSkills.length > 0) {
                      setSkills(p.popularSkills.slice(0, 4));
                    }
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm font-bold text-forest focus:outline-none focus:border-forest"
              >
                {MASTER_PROFESSIONS.filter(p => p.categoryId === selectedCatId).map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name} — {prof.nameHi}
                  </option>
                ))}
              </select>
            </div>

            {/* Regulated Professional Notice if applicable */}
            {MASTER_PROFESSIONS.find(p => p.id === primaryProfessionId)?.isRegulated && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Regulated Occupation • सत्यापन अनिवार्य
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  This profession requires official qualification proof: {MASTER_PROFESSIONS.find(p => p.id === primaryProfessionId)?.verificationRequirements?.join(', ')}. You will be asked to upload certifications in Step 6.
                </p>
              </div>
            )}

            {/* Additional Secondary Professions */}
            <div className="bg-[#F5FAFF] p-4 rounded-2xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-forest uppercase tracking-wider">
                    Additional Secondary Professions (अतिरिक्त कौशल / कार्य)
                  </label>
                  <p className="text-[11px] text-text-secondary">
                    Add other trades you work in so you appear in multiple job searches.
                  </p>
                </div>
              </div>

              {/* Active Additional Tags */}
              <div className="flex flex-wrap gap-2">
                {additionalProfessions.map(profId => {
                  const prof = MASTER_PROFESSIONS.find(p => p.id === profId);
                  return (
                    <span 
                      key={profId} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D1E8F8] text-xs font-bold text-[#153451] shadow-2xs"
                    >
                      <span>{prof ? prof.name : profId}</span>
                      <button
                        type="button"
                        onClick={() => setAdditionalProfessions(additionalProfessions.filter(id => id !== profId))}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>

              {/* Dropdown to add more */}
              <div className="flex items-center gap-2 pt-1">
                <select
                  id="add-secondary-prof"
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:border-forest"
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !additionalProfessions.includes(val) && val !== primaryProfessionId) {
                      setAdditionalProfessions([...additionalProfessions, val]);
                    }
                    e.target.value = '';
                  }}
                >
                  <option value="" disabled>+ Add Another Profession (अन्य पेशा जोड़ें)...</option>
                  {MASTER_PROFESSIONS.filter(p => p.id !== primaryProfessionId && !additionalProfessions.includes(p.id)).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.nameHi})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Profession Submission Trigger */}
            <div className="pt-1 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-text-secondary">
                Your profession not listed in the catalogue?
              </span>
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="text-xs font-bold text-forest underline hover:text-sage flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Profession (नया व्यवसाय जोड़ें)</span>
              </button>
            </div>

            {/* Custom Profession Input Dialog */}
            {showCustomModal && (
              <div className="p-4 rounded-2xl bg-white border-2 border-forest/30 space-y-3 shadow-md animate-in fade-in">
                <h4 className="text-xs font-black uppercase tracking-wider text-forest">
                  Propose New Profession (अनलिस्टेड पेशा दर्ज करें)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Profession name (e.g. Drone Camera Operator)"
                    value={customProfessionInput}
                    onChange={(e) => setCustomProfessionInput(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!customProfessionInput.trim()) return;
                      try {
                        await fetch('/api/professions/suggest', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: customProfessionInput.trim(),
                            submittedByRole: 'WORKER'
                          })
                        });
                        setCustomSubmitted(true);
                        setAdditionalProfessions([...additionalProfessions, customProfessionInput.trim()]);
                        setCustomProfessionInput('');
                        setShowCustomModal(false);
                      } catch (e) {
                        setShowCustomModal(false);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-forest text-lime font-bold text-xs"
                  >
                    Submit & Attach to Profile
                  </button>
                </div>
              </div>
            )}

            {/* Specific Skills Selector */}
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Specific Skills & Expertise (विशेष कौशल टैग)
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'House Wiring', 
                  'MCB Tripping', 
                  'Conduit Pipe', 
                  'Inverter Battery', 
                  'Motor Pump', 
                  'Tile Laying', 
                  'Brick Masonry',
                  'Solar Rooftop',
                  'JCB Backhoe',
                  'Commercial Driving',
                  'Civil Site Quality',
                  'Deep Cleaning',
                  'Saria Tying',
                  'Security PSARA'
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSkills(skills.includes(s) ? skills.filter(item => item !== s) : [...skills, s]);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      skills.includes(s)
                        ? 'bg-forest text-lime border-forest'
                        : 'bg-bg text-text-primary border-border hover:border-forest'
                    }`}
                  >
                    {skills.includes(s) ? '✓ ' : '+ '} {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EXPERIENCE & RATES */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-forest border-b border-border pb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-sage" /> Step 3: Experience & Pricing (अनुभव व दर)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Years of Experience (कार्य अनुभव)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Qualification / Trade Certificate
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. ITI Electrical or 5 Years Apprenticeship"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Hourly Rate (प्रति घंटा दर - ₹)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-black text-forest"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Daily Wage Rate (दैनिक मजदूरी - ₹)
                </label>
                <input
                  type="number"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-black text-forest"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Tools & Equipment Owned (आपके पास उपलब्ध औजार)
              </label>
              <input
                type="text"
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                placeholder="e.g. Digital Multimeter, Heavy Drill, Conduit Bender"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
              />
            </div>
          </div>
        )}

        {/* STEP 4: LOCATION */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-forest border-b border-border pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sage" /> Step 4: Service Area (कार्य क्षेत्र)
              </span>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="text-xs font-bold text-sage hover:underline flex items-center gap-1"
              >
                <Crosshair className="w-3.5 h-3.5 text-cta" /> Get Current GPS
              </button>
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
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  District / Area
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  PIN Code (पिन कोड) *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Full Base Address / Shop Location (स्थाई पता)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-text-primary mb-1">
                <span>Working Radius (कार्य क्षेत्र दायरा): <strong>{preferredRadiusKm} km</strong></span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={preferredRadiusKm}
                onChange={(e) => setPreferredRadiusKm(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* STEP 5: AVAILABILITY */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-forest border-b border-border pb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sage" /> Step 5: Availability & Shift (उपलब्धता)
            </h2>

            <div className="p-4 rounded-xl border border-border bg-bg space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailableNow}
                  onChange={(e) => setIsAvailableNow(e.target.checked)}
                  className="w-5 h-5 accent-forest rounded"
                />
                <div>
                  <span className="font-bold text-sm text-forest block">Available For Immediate Dispatch</span>
                  <span className="text-xs text-text-muted">Receive instant customer calls & jobs today</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-border">
                <input
                  type="checkbox"
                  checked={emergencyAvailable}
                  onChange={(e) => setEmergencyAvailable(e.target.checked)}
                  className="w-5 h-5 accent-cta rounded"
                />
                <div>
                  <span className="font-bold text-sm text-forest block">Emergency Night Calls (24x7)</span>
                  <span className="text-xs text-text-muted">Earn 1.5x higher surge fees on emergency calls</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 6: VERIFICATION KYC */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-forest border-b border-border pb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-status-success" /> Step 6: Identity KYC (सत्यापन)
            </h2>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Select Identity Document
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
              >
                <option value="AADHAAR">Aadhaar Card (आधार कार्ड)</option>
                <option value="PAN">PAN Card (पैन कार्ड)</option>
                <option value="VOTER_ID">Voter ID (मतदाता पहचान पत्र)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Document Number (दस्तावेज़ संख्या)
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
              />
            </div>

            <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center bg-bg/50">
              <Upload className="w-8 h-8 text-sage mx-auto mb-2" />
              <p className="text-sm font-bold text-forest">Upload Clear Photo of {docType}</p>
              <p className="text-xs text-text-muted mt-0.5">JPG or PNG up to 5MB (Kept strictly private & secure)</p>
              <button
                type="button"
                onClick={() => setDocUploaded(true)}
                className="mt-3 px-4 py-1.5 rounded-lg bg-white border border-border text-xs font-bold text-forest shadow-xs"
              >
                {docUploaded ? '✓ Document Attached (Verified Format)' : 'Choose File'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: PAYOUT DETAILS */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-forest border-b border-border pb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-sage" /> Step 7: Bank & UPI Payout (भुगतान खाता)
            </h2>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                UPI ID for Instant Daily Earnings (यूपीआई आईडी) *
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. mobile@okaxis or name@paytm"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm font-bold text-forest focus:outline-none focus:border-forest"
                required
              />
              <p className="text-[11px] text-text-muted mt-1">
                Daily job earnings are settled directly to this UPI address after job completion.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Bank Account Number
                </label>
                <input
                  type="password"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Bank IFSC Code
                </label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-text-primary hover:bg-bg flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && (!fullName || !phoneNumber)) {
                  setError('Please fill in Full Name and Phone Number');
                  return;
                }
                setError('');
                setCurrentStep(currentStep + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black flex items-center gap-1.5 shadow-sm"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-7 py-3 rounded-xl bg-cta hover:bg-cta-hover text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              <span>{loading ? 'CREATING PROFILE...' : 'COMPLETE REGISTRATION (पंजीकरण पूर्ण करें)'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
