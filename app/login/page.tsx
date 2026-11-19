'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Phone, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  HardHat,
  Building2,
  User,
  KeyRound
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP mode states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [testCode, setTestCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Authentication
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanPhone,
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Redirect directly to role authorized workspace
      const redirectUrl = data.redirectUrl || '/hiring/dashboard';
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Network error occurred during login.');
      setLoading(false);
    }
  };

  // OTP Authentication
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to send OTP.');
        setLoading(false);
        return;
      }

      setOtpSent(true);
      if (data.testCode) {
        setTestCode(data.testCode);
        setOtp(data.testCode);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Network error.');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber.replace(/\D/g, ''), otp }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'OTP verification failed.');
        setLoading(false);
        return;
      }

      if (data.isNewUser) {
        router.push(`/register?phone=${phoneNumber}`);
      } else {
        router.push(data.redirectUrl || '/hiring/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Verification error.');
      setLoading(false);
    }
  };

  // Demo user fast-fill
  const selectDemoUser = (phone: string, pass: string) => {
    setPhoneNumber(phone);
    setPassword(pass);
    setAuthMode('PASSWORD');
    setError('');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EAF6FF]/60 via-white to-[#EAF6FF]/30 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#D1E8F8] shadow-xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2583D5] text-white flex items-center justify-center mx-auto shadow-md">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-[#153451] tracking-tight">
            Login to KAAMSETU
          </h1>
          <p className="text-xs text-[#7697B3]">
            अपने मोबाइल नंबर और पासवर्ड से लॉगिन करें
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#F5FAFF] rounded-2xl border border-[#D1E8F8] text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => { setAuthMode('PASSWORD'); setError(''); }}
            className={`py-2 rounded-xl transition ${
              authMode === 'PASSWORD'
                ? 'bg-white text-[#2583D5] shadow-xs'
                : 'text-[#7697B3] hover:text-[#153451]'
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('OTP'); setError(''); }}
            className={`py-2 rounded-xl transition ${
              authMode === 'OTP'
                ? 'bg-white text-[#2583D5] shadow-xs'
                : 'text-[#7697B3] hover:text-[#153451]'
            }`}
          >
            OTP Login
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. PASSWORD LOGIN FORM */}
        {authMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                Mobile Number (मोबाइल नंबर)
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
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider">
                  Password (पासवर्ड)
                </label>
                <button
                  type="button"
                  onClick={() => setAuthMode('OTP')}
                  className="text-[11px] font-bold text-[#2583D5] hover:underline"
                >
                  Forgot / Use OTP
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10 || !password}
              className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#2583D5]/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'AUTHENTICATING...' : 'LOGIN TO WORKSPACE (लॉगिन करें)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. OTP LOGIN FORM */}
        {authMode === 'OTP' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                    Mobile Number (मोबाइल नंबर)
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
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? 'SENDING OTP...' : 'GET OTP (ओटीपी प्राप्त करें)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs font-bold text-[#2583D5] hover:underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full py-3 text-center tracking-widest text-xl font-black rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-[#153451] focus:outline-none focus:border-[#2583D5]"
                    required
                  />
                  {testCode && (
                    <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-center text-xs font-bold text-emerald-800 border border-emerald-200">
                      Development Auto-OTP: <span className="underline">{testCode}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? 'VERIFYING...' : 'VERIFY & CONTINUE (सत्यापित करें)'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Quick Demo Credentials Pre-fills */}
        <div className="pt-4 border-t border-[#EAF6FF] space-y-2">
          <span className="text-[10px] text-[#7697B3] uppercase font-black block text-center tracking-wider">
            Quick One-Click Demo Logins
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => selectDemoUser('9876543210', 'KaamSetu@2026')}
              className="p-2 bg-[#F5FAFF] border border-[#D1E8F8] hover:border-[#2583D5] rounded-xl text-[#153451] font-bold flex flex-col items-center gap-0.5 text-center transition"
            >
              <span className="text-sm">👷</span>
              <span className="text-[10px]">Worker</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoUser('9811002233', 'KaamSetu@2026')}
              className="p-2 bg-[#F5FAFF] border border-[#D1E8F8] hover:border-[#2583D5] rounded-xl text-[#153451] font-bold flex flex-col items-center gap-0.5 text-center transition"
            >
              <span className="text-sm">🏗️</span>
              <span className="text-[10px]">Contractor</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoUser('9911223344', 'KaamSetu@2026')}
              className="p-2 bg-[#F5FAFF] border border-[#D1E8F8] hover:border-[#2583D5] rounded-xl text-[#153451] font-bold flex flex-col items-center gap-0.5 text-center transition"
            >
              <span className="text-sm">📍</span>
              <span className="text-[10px]">Customer</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoUser('9999999999', 'KaamSetu@2026')}
              className="p-2 bg-[#F5FAFF] border border-[#D1E8F8] hover:border-[#2583D5] rounded-xl text-[#153451] font-bold flex flex-col items-center gap-0.5 text-center transition"
            >
              <span className="text-sm">🛡️</span>
              <span className="text-[10px]">Admin</span>
            </button>
          </div>
        </div>

        {/* Registration Links */}
        <div className="pt-2 text-center text-xs text-[#7697B3] space-y-1">
          <p>Don&apos;t have an account yet?</p>
          <div className="flex flex-wrap justify-center gap-3 font-bold text-[#2583D5]">
            <Link href="/register" className="hover:underline">Register New Account</Link>
            <span>•</span>
            <Link href="/register/contractor" className="hover:underline">Contractor Registration</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
