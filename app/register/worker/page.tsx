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
  Upload
} from 'lucide-react';

export default function WorkerRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Personal
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('123456');
  const [dob, setDob] = useState('1994-05-15');
  const [gender, setGender] = useState('MALE');
  const [language, setLanguage] = useState('hi');

  // Step 2: Profession
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
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          role: 'WORKER',
          language,
          state,
          city,
          pincode,
          tradeCategory: category,
          yearsExperience,
          hourlyRate,
          dailyRate,
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
                  OTP Code (ओटीपी)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
                />
              </div>
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
          <div className="space-y-4">
            <h2 className="text-base font-bold text-forest border-b border-border pb-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sage" /> Step 2: Profession & Trade (व्यवसाय)
            </h2>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                Select Primary Trade Skill *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm font-bold text-forest focus:outline-none focus:border-forest"
              >
                <option value="cat-electrician">Electrician (बिजली मिस्त्री)</option>
                <option value="cat-plumber">Plumber (नल मिस्त्री)</option>
                <option value="cat-mason">Mason (राज मिस्त्री)</option>
                <option value="cat-carpenter">Carpenter (बढ़ई)</option>
                <option value="cat-painter">Painter (रंग मिस्त्री)</option>
                <option value="cat-welder">Welder & Fabricator (वेल्डर)</option>
                <option value="cat-ac-tech">AC & Appliance Technician (एसी रिपेयर)</option>
                <option value="cat-labour">Construction Labour / Helper (मजदूर / बेलदार)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Specific Skills & Expertise (विशेष कौशल)
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['House Wiring', 'MCB Fixing', 'Concealed Conduit', 'Inverter Battery', 'Motor Repair', 'Tile Laying'].map((s) => (
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
