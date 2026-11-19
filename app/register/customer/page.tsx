'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, MapPin, Mail, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { sendFirebaseEmailLink } from '@/lib/firebase';

export default function CustomerRegistrationPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-[#F8FCFF]">
        <div className="w-8 h-8 border-4 border-[#2583D5] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CustomerRegistrationForm />
    </React.Suspense>
  );
}

function CustomerRegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(phoneParam);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Noida');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('201301');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          email: email.trim() || undefined,
          city,
          addressLine: address,
          pincode,
          role: 'CUSTOMER',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // If user specified an email, also initiate Firebase Email Link authentication in parallel
      if (email.trim()) {
        try {
          await sendFirebaseEmailLink(email.trim(), { role: 'CUSTOMER', returnUrl: '/hiring/dashboard' });
          setSuccessNotice('Account registered & Firebase one-click verification link sent to your email!');
        } catch (fbErr: any) {
          console.warn('[Firebase Email Link Notice]:', fbErr);
        }
      }

      // Seamless redirect to Customer / Hiring Partner workspace
      const destination = data.redirectUrl || '/hiring/dashboard';
      setTimeout(() => {
        router.push(destination);
      }, email.trim() ? 1000 : 300);

    } catch (err: any) {
      setError(err.message || 'Network error during registration');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F5FAFF] via-[#EBF5FD] to-[#F5FAFF]">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-[#D1E8F8] shadow-xl">
        
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center mx-auto mb-3 shadow-xs border border-[#D1E8F8]">
            <User className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-[#153451]">
            Customer Registration
          </h1>
          <p className="text-xs text-[#4B6F8E] mt-1 font-medium">
            ग्राहक पंजीकरण • Instant verification & fast worker booking
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {successNotice && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
              Full Name (पूरा नाम) *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ananya Deshmukh"
              className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
              Mobile Number (मोबाइल नंबर) *
            </label>
            <input
              type="tel"
              maxLength={10}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="9876543210"
              className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
              Email Address (वैकल्पिक ईमेल - Passwordless Login)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ananya@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
                City (शहर) *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
              Address / Locality (पता / इलाका)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Sector 62, Indirapuram"
              className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>REGISTERING...</span>
              </>
            ) : (
              <>
                <span>REGISTER & PROCEED (पंजीकरण करें)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#EAF6FF] text-center text-xs text-[#7697B3]">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-[#2583D5] hover:underline">
            Login Here
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#4B6F8E]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>MongoDB Atlas Encrypted • Firebase Verified</span>
        </div>

      </div>
    </div>
  );
}
