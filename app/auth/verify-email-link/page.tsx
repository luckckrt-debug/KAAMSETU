'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { checkIsEmailSignInLink, completeEmailSignIn, getFirebaseIdToken } from '@/lib/firebase';

export default function VerifyEmailLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FCFF]">
          <Loader2 className="w-8 h-8 text-[#2583D5] animate-spin" />
        </div>
      }
    >
      <VerifyEmailLinkContent />
    </Suspense>
  );
}

function VerifyEmailLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') || 'CUSTOMER';
  const returnUrlParam = searchParams.get('returnUrl') || '';

  const [status, setStatus] = useState<'VERIFYING' | 'NEED_EMAIL' | 'SUCCESS' | 'ERROR'>('VERIFYING');
  const [emailInput, setEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentUrl = window.location.href;
    if (!checkIsEmailSignInLink(currentUrl)) {
      setStatus('ERROR');
      setErrorMessage('Invalid or expired email sign-in link. Please request a new link from the login page.');
      return;
    }

    const storedEmail = window.localStorage.getItem('emailForSignIn');
    if (storedEmail) {
      handleCompleteSignIn(storedEmail, currentUrl);
    } else {
      // Prompt user for confirmation if opened in another browser
      setStatus('NEED_EMAIL');
    }
  }, []);

  const handleCompleteSignIn = async (emailToUse: string, linkUrl: string) => {
    setStatus('VERIFYING');
    setErrorMessage('');

    try {
      const userCredential = await completeEmailSignIn(emailToUse, linkUrl);
      const firebaseUser = userCredential.user;

      // Clean up localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('emailForSignIn');
      }

      const idToken = await getFirebaseIdToken();

      // Exchange with backend session & MongoDB Atlas
      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || emailToUse,
          displayName: firebaseUser.displayName || 'KaamSetu User',
          photoURL: firebaseUser.photoURL || undefined,
          requestedRole: roleParam,
          idToken: idToken || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize session with KaamSetu servers.');
      }

      setSuccessInfo(data);
      setStatus('SUCCESS');

      // Seamless redirect after 1.2s
      const targetPath = returnUrlParam || data.redirectUrl || '/hiring/dashboard';
      setTimeout(() => {
        router.push(targetPath);
      }, 1200);

    } catch (err: any) {
      console.error('[Email Link Verification Error]:', err);
      setStatus('ERROR');
      setErrorMessage(err.message || 'Authentication failed. Please verify your email or request a new login link.');
    }
  };

  const handleManualEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    handleCompleteSignIn(emailInput.trim(), window.location.href);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-linear-to-b from-[#F5FAFF] via-[#EBF5FD] to-[#F5FAFF]">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-[#D1E8F8] shadow-xl text-center">
        
        {/* Verification in Progress */}
        {status === 'VERIFYING' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center mx-auto border border-[#D1E8F8]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-xl font-black text-[#153451]">
              Verifying Sign-In Link
            </h1>
            <p className="text-xs text-[#4B6F8E]">
              ईमेल सत्यापन जारी है... Authenticating your credentials with KaamSetu and MongoDB Atlas.
            </p>
          </div>
        )}

        {/* Success Screen */}
        {status === 'SUCCESS' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-[#153451]">
              Verified Successfully!
            </h1>
            <p className="text-xs text-[#4B6F8E]">
              सत्यापन सफल रहा। Redirecting you to your KaamSetu dashboard...
            </p>
            <div className="pt-2">
              <span className="text-xs font-bold text-[#2583D5] inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Session Secured & Synchronized
              </span>
            </div>
          </div>
        )}

        {/* Need Email Confirmation (cross-device fallback) */}
        {status === 'NEED_EMAIL' && (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center mx-auto border border-[#D1E8F8]">
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-[#153451]">
              Confirm Your Email
            </h1>
            <p className="text-xs text-[#4B6F8E]">
              Please enter the email address you used to request this sign-in link:
            </p>

            <form onSubmit={handleManualEmailSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Complete Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Error Screen */}
        {status === 'ERROR' && (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-[#153451]">
              Verification Failed
            </h1>
            <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-medium">
              {errorMessage}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl bg-[#2583D5] text-white text-xs font-bold transition hover:bg-[#1E70B8]"
              >
                Return to Login
              </Link>
              <Link
                href="/"
                className="text-xs font-bold text-[#7697B3] hover:text-[#153451] transition"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
