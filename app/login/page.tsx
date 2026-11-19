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
  KeyRound,
  RefreshCw,
  Mail
} from 'lucide-react';
import { 
  setupRecaptcha, 
  sendFirebasePhoneOtp, 
  verifyFirebaseOtp, 
  signInWithGoogle,
  sendFirebaseEmailLink
} from '@/lib/firebase';
import { ConfirmationResult } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<'PASSWORD' | 'FIREBASE_OTP' | 'EMAIL_LINK'>('PASSWORD');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  
  // Firebase Email Link state
  const [emailForLink, setEmailForLink] = useState('');
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  
  // Firebase Phone OTP states
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [testCode, setTestCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Password Authentication
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');
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

  // Firebase Real Phone SMS OTP Sender
  const handleSendFirebaseOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);

    try {
      // 1. Initialize invisible reCAPTCHA
      const verifier = setupRecaptcha('recaptcha-container');

      // 2. Call Firebase Phone Auth for real SMS delivery
      const confirmation = await sendFirebasePhoneOtp(`+91${cleanPhone}`, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setStatusMsg(`✅ 6-digit SMS OTP sent to +91 ${cleanPhone} via Firebase Authentication.`);
      setLoading(false);
    } catch (err: any) {
      console.warn('[Firebase Auth] Phone Auth fallback triggered:', err);
      // Fallback to internal OTP endpoint if reCAPTCHA or domain has restrictions in local testing
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: cleanPhone }),
        });
        const data = await res.json();
        if (data.success) {
          setOtpSent(true);
          if (data.testCode) {
            setTestCode(data.testCode);
            setOtp(data.testCode);
          }
          setStatusMsg(`OTP generated for +91 ${cleanPhone}.`);
        } else {
          setError(err.message || 'Failed to send OTP. Please check mobile number.');
        }
      } catch (fallbackErr: any) {
        setError(err.message || 'Failed to send SMS OTP.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Firebase Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');
    setLoading(true);
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    try {
      let firebaseUid = '';

      // 1. If Firebase confirmation result is available, confirm with Firebase
      if (confirmationResult) {
        const cred = await verifyFirebaseOtp(confirmationResult, otp);
        firebaseUid = cred.user.uid;
      }

      // 2. Synchronize with KaamSetu MongoDB Atlas backend session
      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUid || `fb_phone_${cleanPhone}`,
          phoneNumber: cleanPhone,
          requestedRole: 'CUSTOMER',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Authentication failed.');
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl || '/hiring/dashboard');
    } catch (err: any) {
      console.error('[Verify OTP error]', err);
      // Fallback verification if needed
      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: cleanPhone, otp }),
        });
        const data = await res.json();
        if (data.success) {
          router.push(data.redirectUrl || '/hiring/dashboard');
          return;
        }
      } catch (e) {
        // ignore
      }
      setError(err.message || 'Invalid OTP code. Please try again.');
      setLoading(false);
    }
  };

  // Firebase Google 1-Click Sign-In
  const handleGoogleSignIn = async () => {
    setError('');
    setStatusMsg('');
    setGoogleLoading(true);

    try {
      const result = await signInWithGoogle();
      const user = result.user;

      // Sync with KaamSetu backend
      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          requestedRole: 'CUSTOMER',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Google sign-in failed.');
        setGoogleLoading(false);
        return;
      }

      router.push(data.redirectUrl || '/hiring/dashboard');
    } catch (err: any) {
      console.error('[Google Sign-In Error]', err);
      setError(err.message || 'Google sign-in was cancelled or encountered an error.');
      setGoogleLoading(false);
    }
  };

  // Firebase Passwordless Email Link Sender
  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');
    if (!emailForLink.trim() || !emailForLink.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await sendFirebaseEmailLink(emailForLink.trim(), { returnUrl: '/hiring/dashboard' });
      setEmailLinkSent(true);
      setStatusMsg(`✅ One-click sign-in link sent to ${emailForLink}! Please check your email to log in.`);
    } catch (err: any) {
      console.error('[Firebase Email Link Error]:', err);
      setError(err.message || 'Failed to send email sign-in link.');
    } finally {
      setLoading(false);
    }
  };

  // Demo user fast-fill
  const selectDemoUser = (phone: string, pass: string) => {
    setPhoneNumber(phone);
    setPassword(pass);
    setAuthMode('PASSWORD');
    setError('');
    setStatusMsg('');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EAF6FF]/60 via-white to-[#EAF6FF]/30 flex items-center justify-center">
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

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
            Firebase Authentication • सुरक्षित मोबाइल व पासवर्ड लॉगिन
          </p>
        </div>

        {/* 1-Click Google Sign-In with Firebase */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
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
          <span>{googleLoading ? 'CONNECTING GOOGLE...' : 'Continue with Google (गूगल से लॉगिन)'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#EAF6FF] w-full" />
          <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-[#7697B3] absolute">
            OR WITH MOBILE NUMBER
          </span>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-3 p-1 bg-[#F5FAFF] rounded-2xl border border-[#D1E8F8] text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => { setAuthMode('PASSWORD'); setError(''); setStatusMsg(''); }}
            className={`py-2 rounded-xl transition ${
              authMode === 'PASSWORD'
                ? 'bg-white text-[#2583D5] shadow-xs'
                : 'text-[#7697B3] hover:text-[#153451]'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('FIREBASE_OTP'); setError(''); setStatusMsg(''); }}
            className={`py-2 rounded-xl transition ${
              authMode === 'FIREBASE_OTP'
                ? 'bg-white text-[#2583D5] shadow-xs'
                : 'text-[#7697B3] hover:text-[#153451]'
            }`}
          >
            SMS OTP
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('EMAIL_LINK'); setError(''); setStatusMsg(''); }}
            className={`py-2 rounded-xl transition ${
              authMode === 'EMAIL_LINK'
                ? 'bg-white text-[#2583D5] shadow-xs'
                : 'text-[#7697B3] hover:text-[#153451]'
            }`}
          >
            Email Link
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{statusMsg}</span>
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
                  onClick={() => setAuthMode('FIREBASE_OTP')}
                  className="text-[11px] font-bold text-[#2583D5] hover:underline"
                >
                  Use Firebase OTP
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
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>LOGIN TO WORKSPACE (लॉगिन करें)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. FIREBASE PHONE SMS OTP LOGIN FORM */}
        {authMode === 'FIREBASE_OTP' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendFirebaseOtp} className="space-y-4">
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
                  <p className="text-[10px] text-[#7697B3] mt-1">
                    🔥 Verified via Firebase Project: <strong>kaamsetu-e47e9</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>SENDING REAL SMS...</span>
                    </>
                  ) : (
                    <>
                      <span>GET FIREBASE SMS OTP (ओटीपी भेजें)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider">
                      Enter 6-Digit SMS OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setConfirmationResult(null); }}
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
                      Auto-filled Code: <span className="underline">{testCode}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>VERIFYING OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>VERIFY & LOGIN (सत्यापित करें)</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 3. FIREBASE PASSWORDLESS EMAIL LINK LOGIN FORM */}
        {authMode === 'EMAIL_LINK' && (
          <form onSubmit={handleSendEmailLink} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                Email Address (ईमेल पता)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7697B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={emailForLink}
                  onChange={(e) => setEmailForLink(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                />
              </div>
              <p className="text-[10px] text-[#7697B3] mt-1.5 leading-relaxed">
                We will email you a secure, passwordless sign-in link via Firebase. Click the link in your email to instantly enter your dashboard.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !emailForLink.trim() || !emailForLink.includes('@')}
              className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>SENDING SIGN-IN LINK...</span>
                </>
              ) : (
                <>
                  <span>SEND 1-CLICK LOGIN LINK (ईमेल लिंक भेजें)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
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
