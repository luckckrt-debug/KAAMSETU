'use client';

import React, { useState } from 'react';
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
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound,
  X
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Primary Login State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Self-Hosted Password Reset Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'PHONE' | 'OTP_PASSWORD'>('PHONE');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [testOtpCode, setTestOtpCode] = useState('');

  // Handle Central Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
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
        setError(data.error || 'Login failed. Please check your mobile number and password.');
        setLoading(false);
        return;
      }

      setStatusMsg(data.message || 'Login successful! Redirecting to your workspace...');
      const destination = data.redirectUrl || '/hiring/dashboard';
      setTimeout(() => {
        router.push(destination);
      }, 400);

    } catch (err: any) {
      setError(err.message || 'Network error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  // Self-Hosted Forgot Password: Step 1 Send OTP
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    const cleanPhone = resetPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setResetError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone }),
      });

      const data = await res.json();
      if (!data.success) {
        setResetError(data.error || 'Failed to send verification code.');
        setResetLoading(false);
        return;
      }

      if (data.testCode) {
        setTestOtpCode(data.testCode);
        setResetOtp(data.testCode);
      }
      setResetSuccess(data.message || 'OTP verification code sent to your mobile number.');
      setResetStep('OTP_PASSWORD');
    } catch (err: any) {
      setResetError(err.message || 'Network error occurred while requesting password reset.');
    } finally {
      setResetLoading(false);
    }
  };

  // Self-Hosted Forgot Password: Step 2 Reset with OTP
  const handleCompletePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetOtp.trim()) {
      setResetError('Please enter the 6-digit OTP code.');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match. Please verify.');
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: resetPhone.replace(/\D/g, ''),
          otp: resetOtp.trim(),
          newPassword,
          confirmPassword: confirmNewPassword,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setResetError(data.error || 'Password reset failed. Invalid or expired OTP.');
        setResetLoading(false);
        return;
      }

      setResetSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setPhoneNumber(resetPhone);
        setPassword(newPassword);
        setStatusMsg('Password updated. Please click Login to enter.');
      }, 1200);

    } catch (err: any) {
      setResetError(err.message || 'Failed to complete password reset.');
    } finally {
      setResetLoading(false);
    }
  };

  // Demo user fast-fill
  const selectDemoUser = (phone: string, pass: string) => {
    setPhoneNumber(phone);
    setPassword(pass);
    setError('');
    setStatusMsg('');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F5FAFF] via-[#EAF6FF]/40 to-[#F5FAFF] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#D1E8F8] shadow-xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2583D5] text-white flex items-center justify-center mx-auto shadow-md shadow-[#2583D5]/20">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-[#153451] tracking-tight">
            Login to KAAMSETU
          </h1>
          <p className="text-xs text-[#7697B3]">
            Central Authentication • सुरक्षित मोबाइल व पासवर्ड लॉगिन
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
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

        {/* Central Password Login Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
              Mobile Number (मोबाइल नंबर)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7697B3] flex items-center gap-1">
                <span>🇮🇳</span> +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                className="w-full pl-16 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
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
                onClick={() => {
                  setResetPhone(phoneNumber);
                  setResetStep('PHONE');
                  setResetError('');
                  setResetSuccess('');
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-bold text-[#2583D5] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7697B3] hover:text-[#153451] p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phoneNumber.length < 10 || !password}
            className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#2583D5]/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
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

        {/* Demo Fast Fill Accounts */}
        <div className="pt-2 border-t border-[#EAF6FF] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7697B3] block text-center">
            One-Click Demo Account Quick Fill:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => selectDemoUser('9876543210', 'KaamSetu@2026')}
              className="p-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] hover:bg-[#EAF6FF] text-left transition flex items-center gap-2 font-bold text-[#153451]"
            >
              <HardHat className="w-4 h-4 text-[#2583D5] shrink-0" />
              <div className="truncate">
                <div>Worker Fleet</div>
                <div className="text-[9px] text-[#7697B3]">9876543210</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => selectDemoUser('9876543211', 'KaamSetu@2026')}
              className="p-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] hover:bg-[#EAF6FF] text-left transition flex items-center gap-2 font-bold text-[#153451]"
            >
              <Building2 className="w-4 h-4 text-[#2583D5] shrink-0" />
              <div className="truncate">
                <div>Contractor</div>
                <div className="text-[9px] text-[#7697B3]">9876543211</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => selectDemoUser('9876543212', 'KaamSetu@2026')}
              className="p-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] hover:bg-[#EAF6FF] text-left transition flex items-center gap-2 font-bold text-[#153451]"
            >
              <User className="w-4 h-4 text-[#2583D5] shrink-0" />
              <div className="truncate">
                <div>Hiring Partner</div>
                <div className="text-[9px] text-[#7697B3]">9876543212</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => selectDemoUser('9999999999', 'KaamSetu@2026')}
              className="p-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] hover:bg-[#EAF6FF] text-left transition flex items-center gap-2 font-bold text-[#153451]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <div>Super Admin</div>
                <div className="text-[9px] text-[#7697B3]">9999999999</div>
              </div>
            </button>
          </div>
        </div>

        {/* Registration Navigation */}
        <div className="text-center pt-2 border-t border-[#EAF6FF] space-y-1">
          <p className="text-xs text-[#7697B3]">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-bold text-[#2583D5] hover:underline">
              Register here (नया खाता बनाएं)
            </Link>
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-[#7697B3] pt-1">
            <Link href="/register/worker" className="hover:text-[#2583D5] font-semibold">Worker Sign Up</Link>
            <span>•</span>
            <Link href="/register/contractor" className="hover:text-[#2583D5] font-semibold">Contractor Sign Up</Link>
            <span>•</span>
            <Link href="/register/customer" className="hover:text-[#2583D5] font-semibold">Customer Sign Up</Link>
          </div>
        </div>

      </div>

      {/* Self-Hosted Password Reset Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-[#153451]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#EAF6FF]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-[#153451] text-sm">Reset Password</h3>
                  <p className="text-[11px] text-[#7697B3]">Central Identity Verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-[#7697B3] hover:text-[#153451] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetStep === 'PHONE' ? (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#153451] block mb-1">
                    Enter Registered Mobile Number:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7697B3]">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={resetPhone}
                      onChange={(e) => setResetPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#D1E8F8] text-xs font-bold text-[#7697B3] hover:bg-[#F5FAFF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading || resetPhone.length < 10}
                    className="px-5 py-2 rounded-xl bg-[#2583D5] text-white text-xs font-bold hover:bg-[#1E70B8] disabled:opacity-50 flex items-center gap-2"
                  >
                    {resetLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Send Verification Code</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCompletePasswordReset} className="space-y-3">
                {testOtpCode && (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#2583D5] font-semibold">
                    Dev Test OTP Code: <strong className="font-mono text-sm">{testOtpCode}</strong>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-[#153451] block mb-1">
                    6-Digit Verification OTP:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] tracking-widest text-center"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#153451] block mb-1">
                    New Password:
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#153451] block mb-1">
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('PHONE')}
                    className="px-4 py-2 rounded-xl border border-[#D1E8F8] text-xs font-bold text-[#7697B3] hover:bg-[#F5FAFF]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading || !resetOtp || !newPassword}
                    className="px-5 py-2 rounded-xl bg-[#2583D5] text-white text-xs font-bold hover:bg-[#1E70B8] disabled:opacity-50 flex items-center gap-2"
                  >
                    {resetLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save & Update Password</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
