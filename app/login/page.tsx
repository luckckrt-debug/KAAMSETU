'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HardHat, Phone, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testCode, setTestCode] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      setOtpSent(true);
      if (data.testCode) {
        setTestCode(data.testCode);
        setOtp(data.testCode); // Auto-fill test code for dev convenience
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Network error');
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
        body: JSON.stringify({ phoneNumber, otp }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Verification failed');
        setLoading(false);
        return;
      }

      if (data.isNewUser) {
        // Redirect to registration
        router.push(`/register/customer?phone=${phoneNumber}`);
      } else {
        router.push(data.redirectUrl || '/customer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Verification error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-bg">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-border shadow-elevated">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-forest text-lime flex items-center justify-center mx-auto mb-3 shadow-sm">
            <HardHat className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-forest tracking-tight">
            Login to KAAMSETU
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            अपने मोबाइल नंबर से लॉगिन करें (OTP Verification)
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-status-dangerSoft border border-status-danger/20 text-status-danger text-xs font-semibold">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                Mobile Number (मोबाइल नंबर)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full pl-14 pr-4 py-3 rounded-xl border border-border bg-bg text-sm font-bold text-text-primary focus:outline-none focus:border-forest"
                  required
                />
              </div>
              <p className="text-[11px] text-text-muted mt-1.5">
                We will send an instant 6-digit OTP for secure authentication.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              className="w-full py-3.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'SENDING OTP...' : 'GET OTP (ओटीपी प्राप्त करें)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Login Pre-fills */}
            <div className="pt-4 border-t border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold block mb-2 text-center">
                Quick Demo Logins (Click to pre-fill)
              </span>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPhoneNumber('9876543210')}
                  className="p-1.5 bg-bg border border-border rounded-lg text-forest font-bold hover:border-forest"
                >
                  ⚡ Worker
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneNumber('9911223344')}
                  className="p-1.5 bg-bg border border-border rounded-lg text-forest font-bold hover:border-forest"
                >
                  👤 Customer
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneNumber('9999999999')}
                  className="p-1.5 bg-bg border border-border rounded-lg text-forest font-bold hover:border-forest"
                >
                  🛡️ Admin
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Enter 6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs font-bold text-sage hover:underline"
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
                className="w-full py-3 text-center tracking-widest text-xl font-black rounded-xl border border-border bg-bg text-forest focus:outline-none focus:border-forest"
                required
              />
              {testCode && (
                <div className="mt-2 p-2 bg-sage-soft rounded-lg text-center text-xs font-bold text-forest">
                  🔑 Development Auto-OTP: <span className="underline">{testCode}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'VERIFYING...' : 'VERIFY & CONTINUE (सत्यापित करें)'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-border text-center text-xs text-text-secondary space-y-1">
          <p>Don&apos;t have an account yet?</p>
          <div className="flex justify-center gap-4 font-bold text-forest">
            <Link href="/register/customer" className="hover:underline">Customer Sign Up</Link>
            <span>•</span>
            <Link href="/register/worker" className="hover:underline">Worker Sign Up</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
