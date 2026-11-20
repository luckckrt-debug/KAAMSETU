'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, MapPin, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
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
          confirmPassword,
          email: email.trim() || undefined,
          city: city.trim(),
          addressLine: address.trim(),
          pincode: pincode.trim(),
          role: 'CUSTOMER',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Registration failed. Please check your details.');
        setLoading(false);
        return;
      }

      setSuccessNotice('Account registered successfully! Redirecting to Hiring Partner workspace...');
      const destination = data.redirectUrl || '/hiring/dashboard';
      setTimeout(() => {
        router.push(destination);
      }, 700);

    } catch (err: any) {
      setError(err.message || 'Network error during registration. Please try again.');
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
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
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
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7697B3]">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
              Mobile Number (मोबाइल नंबर) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#7697B3]">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
              Create Password (पासवर्ड) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7697B3]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7697B3] hover:text-[#153451]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
              Confirm Password (पासवर्ड की पुष्टि करें) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7697B3]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
              Email Address (वैकल्पिक ईमेल)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7697B3]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
                City (शहर) *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Noida / Delhi"
                className="w-full px-3 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="201301"
                className="w-full px-3 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#153451] uppercase tracking-wider mb-1">
              Service Address (पता)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7697B3]">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No, Street, Sector"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phoneNumber.length < 10 || password.length < 6}
            className="w-full py-4 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#2583D5]/25 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>REGISTERING ACCOUNT...</span>
              </>
            ) : (
              <>
                <span>REGISTER & BOOK WORKERS (पंजीकरण करें)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#EAF6FF] text-center">
          <p className="text-xs text-[#7697B3]">
            Already have a registered account?{' '}
            <Link href="/login" className="font-bold text-[#2583D5] hover:underline">
              Login here (लॉगिन करें)
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
