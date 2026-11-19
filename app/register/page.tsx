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
  RefreshCw
} from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';

export default function UnifiedRegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'WORKER' | 'CONTRACTOR' | 'CUSTOMER'>('WORKER');
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Role specific fields
  const [tradeCategory, setTradeCategory] = useState('Electrician');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('Delhi');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleSignUp = async () => {
    setError('');
    setSuccess('');
    setGoogleLoading(true);

    try {
      const result = await signInWithGoogle();
      const user = result.user;

      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          requestedRole: selectedRole,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Google registration failed.');
        setGoogleLoading(false);
        return;
      }

      setSuccess('Account created via Firebase! Redirecting to workspace...');
      setTimeout(() => {
        router.push(data.redirectUrl || '/hiring/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('[Google Registration Error]', err);
      setError(err.message || 'Google registration was cancelled.');
      setGoogleLoading(false);
    }
  };

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
      setError('Please enter a valid 10-digit mobile number.');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: cleanPhone,
          password,
          role: selectedRole,
          tradeCategory: selectedRole === 'WORKER' ? tradeCategory : undefined,
          companyName: selectedRole === 'CONTRACTOR' ? (companyName.trim() || `${fullName} Contracting`) : undefined,
          city: city.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      setSuccess('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        router.push(`/login?phone=${cleanPhone}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Network error.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EAF6FF]/50 via-white to-[#EAF6FF]/30 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-10 border border-[#D1E8F8] shadow-xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2583D5] text-white flex items-center justify-center mx-auto shadow-md">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-[#153451]">
            Create a KAAMSETU Account
          </h1>
          <p className="text-xs text-[#7697B3]">
            Select your primary role and enter your mobile number with password.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedRole('WORKER')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              selectedRole === 'WORKER'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black ring-2 ring-emerald-500/20'
                : 'border-[#D1E8F8] bg-white text-[#153451] hover:bg-[#F5FAFF]'
            }`}
          >
            <HardHat className="w-5 h-5 text-emerald-600" />
            <span className="text-xs">Worker (श्रमिक)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('CONTRACTOR')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              selectedRole === 'CONTRACTOR'
                ? 'border-[#153451] bg-slate-900 text-lime font-black ring-2 ring-slate-900/20'
                : 'border-[#D1E8F8] bg-white text-[#153451] hover:bg-[#F5FAFF]'
            }`}
          >
            <Building2 className="w-5 h-5 text-amber-500" />
            <span className="text-xs">Contractor (ठेकेदार)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('CUSTOMER')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              selectedRole === 'CUSTOMER'
                ? 'border-[#2583D5] bg-[#EAF6FF] text-[#2583D5] font-black ring-2 ring-[#2583D5]/20'
                : 'border-[#D1E8F8] bg-white text-[#153451] hover:bg-[#F5FAFF]'
            }`}
          >
            <User className="w-5 h-5 text-[#2583D5]" />
            <span className="text-xs">Customer (ग्राहक)</span>
          </button>
        </div>

        {/* 1-Click Google Sign-Up with Firebase */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          className="w-full py-3 px-4 rounded-2xl border border-[#D1E8F8] hover:border-[#2583D5] bg-white hover:bg-[#F5FAFF] transition flex items-center justify-center gap-3 text-xs font-black text-[#153451] shadow-xs active:scale-95 disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'CREATING FIREBASE ACCOUNT...' : `Register with Google as ${selectedRole}`}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#EAF6FF] w-full" />
          <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-[#7697B3] absolute">
            OR FILL REGISTRATION DETAILS
          </span>
        </div>

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
              placeholder="e.g. Ramesh Sharma / Vikram Singh"
              className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
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
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
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
                className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
              />
            </div>
          </div>

          {selectedRole === 'WORKER' && (
            <div>
              <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                Primary Trade / Skill (मुख्य काम)
              </label>
              <select
                value={tradeCategory}
                onChange={(e) => setTradeCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
              >
                <option value="Electrician">Electrician (बिजली मिस्त्री)</option>
                <option value="Plumber">Plumber (नल मिस्त्री)</option>
                <option value="Carpenter">Carpenter (बढ़ई)</option>
                <option value="Painter">Painter (पेंटर)</option>
                <option value="Mason">Mason / Construction (राज मिस्त्री)</option>
                <option value="Housekeeping">Housekeeping (सफाई कर्मी)</option>
                <option value="Delivery">Delivery Partner (डिलीवरी)</option>
              </select>
            </div>
          )}

          {selectedRole === 'CONTRACTOR' && (
            <div>
              <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                Company / Firm Name (फर्म का नाम)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Civil Projects"
                className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
              City (शहर)
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-sm uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'REGISTERING...' : 'CREATE ACCOUNT (पंजीकरण करें)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#EAF6FF] text-xs text-[#7697B3]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#2583D5] hover:underline">
            Login with Password
          </Link>
        </div>

      </div>
    </div>
  );
}
