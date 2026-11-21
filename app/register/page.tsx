'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HardHat, 
  Building2, 
  User, 
  Lock, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export default function UnifiedRegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'WORKER' | 'CONTRACTOR' | 'CUSTOMER'>('WORKER');
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Role specific fields
  const [tradeCategory, setTradeCategory] = useState('Electrician');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('Delhi');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
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
          confirmPassword,
          role: selectedRole,
          tradeCategory: selectedRole === 'WORKER' ? tradeCategory : undefined,
          companyName: selectedRole === 'CONTRACTOR' ? (companyName.trim() || `${fullName} Contracting`) : undefined,
          city: city.trim(),
          referralCode: refCode || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Registration failed. Please check your information.');
        setLoading(false);
        return;
      }

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push(`/login?registered=${selectedRole.toLowerCase()}&phone=${cleanPhone}`);
      }, 1200);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Network error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-3 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F5FAFF] via-[#EAF6FF]/40 to-[#F5FAFF] flex items-center justify-center pb-24 md:pb-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-5 sm:p-8 border border-[#D1E8F8] shadow-xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2583D5] text-white flex items-center justify-center mx-auto shadow-md shadow-[#2583D5]/20">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-[#153451] tracking-tight">
            Create DigiWork Account
          </h1>
          <p className="text-xs text-[#7697B3]">
            Central Registration • Choose your account role below
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedRole('WORKER')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
              selectedRole === 'WORKER'
                ? 'border-[#2583D5] bg-[#EAF6FF] text-[#2583D5] shadow-xs'
                : 'border-[#D1E8F8] bg-[#F5FAFF] text-[#7697B3] hover:text-[#153451]'
            }`}
          >
            <HardHat className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase">Worker</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('CONTRACTOR')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
              selectedRole === 'CONTRACTOR'
                ? 'border-[#2583D5] bg-[#EAF6FF] text-[#2583D5] shadow-xs'
                : 'border-[#D1E8F8] bg-[#F5FAFF] text-[#7697B3] hover:text-[#153451]'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase">Contractor</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('CUSTOMER')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
              selectedRole === 'CUSTOMER'
                ? 'border-[#2583D5] bg-[#EAF6FF] text-[#2583D5] shadow-xs'
                : 'border-[#D1E8F8] bg-[#F5FAFF] text-[#7697B3] hover:text-[#153451]'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase">Customer</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Central Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
              Full Name (पूरा नाम) *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your legal full name"
              className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
              Mobile Number (मोबाइल नंबर) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7697B3]">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                className="w-full pl-14 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              />
            </div>
          </div>

          {/* Role specific inputs */}
          {selectedRole === 'WORKER' && (
            <div>
              <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                Primary Trade (कार्य कौशल)
              </label>
              <select
                value={tradeCategory}
                onChange={(e) => setTradeCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              >
                <option value="Electrician">Electrician (इलेक्ट्रीशियन)</option>
                <option value="Plumber">Plumber (प्लंबर)</option>
                <option value="Carpenter">Carpenter (बढ़ई)</option>
                <option value="Painter">Painter (पेंटर)</option>
                <option value="Mason">Mason / Rajmistri (राजमिस्त्री)</option>
                <option value="Welder">Welder (वेल्डर)</option>
                <option value="Labour">General Construction Labour (मजदूर)</option>
              </select>
            </div>
          )}

          {selectedRole === 'CONTRACTOR' && (
            <div>
              <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                Firm / Company Name (फर्म का नाम)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Infra Construction"
                className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
              City / Base Location (शहर)
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Delhi NCR, Noida, Lucknow..."
              className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
              Password (पासवर्ड) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 pr-11 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7697B3] hover:text-[#153451] p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
              Confirm Password (पासवर्ड की पुष्टि करें) *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading || phoneNumber.length < 10 || password.length < 6}
            className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#2583D5]/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>CREATING ACCOUNT...</span>
              </>
            ) : (
              <>
                <span>REGISTER AS {selectedRole} (खाता बनाएं)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#EAF6FF]">
          <p className="text-xs text-[#7697B3]">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-[#2583D5] hover:underline">
              Login to your account (लॉगिन करें)
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
