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
  Zap
} from 'lucide-react';

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
