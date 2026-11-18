'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, MapPin, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CustomerRegistrationPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-bg">
        <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" />
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          email,
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

      router.push('/customer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Network error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-bg">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-border shadow-elevated">
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-forest text-lime flex items-center justify-center mx-auto mb-3 shadow-xs">
            <User className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-forest">
            Customer Registration
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            ग्राहक पंजीकरण • Book verified skilled workers in seconds
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-status-dangerSoft border border-status-danger/20 text-status-danger text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
              Full Name (पूरा नाम) *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ananya Deshmukh"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
              Mobile Number (मोबाइल नंबर) *
            </label>
            <input
              type="tel"
              maxLength={10}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="9876543210"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
              Email Address (वैकल्पिक ईमेल)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ananya@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                City (शहर) *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
              Address (पता)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat 402, Lotus Boulevard"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold focus:outline-none focus:border-forest"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'REGISTERING...' : 'REGISTER & PROCEED (पंजीकरण करें)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-border text-center text-xs text-text-secondary">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-forest hover:underline">
            Login Here
          </Link>
        </div>

      </div>
    </div>
  );
}
