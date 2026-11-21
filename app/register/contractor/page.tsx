'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  HardHat, 
  User, 
  Phone, 
  Lock, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  FileText
} from 'lucide-react';

const BUSINESS_TYPES = [
  'Civil Construction & General Contracting',
  'Commercial Infrastructure & Warehouse',
  'Electrical & Industrial Power Contracting',
  'Plumbing, Sanitary & Drainage Contracting',
  'Roads, Highways & Earthwork',
  'Interior Fitouts, POP & Painting',
  'Skilled Manpower Supply & Staffing'
];

export default function ContractorRegistrationPage() {
  const router = useRouter();

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [city, setCity] = useState('Delhi');
  const [state, setState] = useState('Delhi');
  const [pincode, setPincode] = useState('110001');
  const [gstin, setGstin] = useState('');
  const [panNumber, setPanNumber] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Frontend Validations
    if (!companyName.trim()) {
      setError('Company / Firm Name is required.');
      return;
    }
    if (!fullName.trim()) {
      setError('Authorized Representative Name is required.');
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const refCode = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('ref') || '') : '';
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: cleanPhone,
          password,
          role: 'CONTRACTOR',
          companyName: companyName.trim(),
          businessType,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          gstin: gstin.trim().toUpperCase() || undefined,
          panNumber: panNumber.trim().toUpperCase() || undefined,
          referralCode: refCode || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Contractor registration failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccessMessage('Contractor account created successfully in central database! Redirecting to login...');
      setTimeout(() => {
        router.push('/login?registered=contractor&phone=' + cleanPhone);
      }, 1500);
    } catch (err: any) {
      console.error('Contractor registration error:', err);
      setError(err.message || 'Network error occurred while connecting to DigiWork servers.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EAF6FF]/50 via-white to-[#EAF6FF]/30 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-10 border border-[#D1E8F8] shadow-xl space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#153451] text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#2583D5] bg-[#EAF6FF] px-3 py-1 rounded-full border border-[#D1E8F8] inline-block">
            CONTRACTOR PORTAL REGISTRATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#153451]">
            Register as DigiWork Contractor (ठेकेदार पंजीकरण)
          </h1>
          <p className="text-xs sm:text-sm text-[#7697B3] max-w-md mx-auto">
            Create an authorized contractor account to post multi-trade projects, manage workforce, track muster rolls, and execute daily payouts.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">

          {/* Section 1: Firm Details */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#153451] border-b border-[#EAF6FF] pb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#2583D5]" />
              <span>1. Company & Business Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  Company / Firm Name (फर्म / कंपनी का नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Infra & Construction Works"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  Authorized Person Name (ठेकेदार का नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Singh"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  Business Domain / Category *
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                >
                  {BUSINESS_TYPES.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Account Security */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#153451] border-b border-[#EAF6FF] pb-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#2583D5]" />
              <span>2. Login Credentials & Mobile Number</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  Mobile Number (मोबाइल) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7697B3]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="98110 02233"
                    className="w-full pl-12 pr-3 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  Password (पासवर्ड) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Location & Tax Details */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#153451] border-b border-[#EAF6FF] pb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2583D5]" />
              <span>3. Headquarters & Tax Registration</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  City (शहर) *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  State (राज्य) *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  GSTIN (वैकल्पिक)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="07AAAAA0000A1Z5"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                  Company PAN
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="AAACV1234F"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#2583D5]/25 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Building2 className="w-5 h-5" />
              <span>{loading ? 'CREATING CONTRACTOR ACCOUNT...' : 'REGISTER CONTRACTOR ACCOUNT (खाता बनाएं)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

        <div className="text-center pt-2 border-t border-[#EAF6FF] text-xs text-[#7697B3]">
          Already have a contractor account?{' '}
          <Link href="/login" className="font-bold text-[#2583D5] hover:underline">
            Login Here
          </Link>
        </div>

      </div>
    </div>
  );
}
