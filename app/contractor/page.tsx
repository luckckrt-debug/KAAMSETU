'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Users, FileText, CheckCircle2, ArrowRight, ShieldCheck, Calculator } from 'lucide-react';

export default function ContractorLandingPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('Noida');
  const [businessType, setBusinessType] = useState('CIVIL_CONSTRUCTION');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: contactPerson,
          phoneNumber,
          companyName,
          gstin,
          city,
          businessType,
          role: 'CONTRACTOR',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/contractor/dashboard');
    } catch (err: any) {
      setError(err.message || 'Network error');
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-forest to-forest-dark text-white rounded-3xl p-8 sm:p-14 shadow-elevated border border-white/10">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold text-lime uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Institutional Solutions • ठेकेदारी व संस्थागत मैनपावर
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Deploy Scalable Skilled Manpower Across India
            </h1>
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
              Empowering civil contractors, infra developers, MEP consultants, and facility managers with on-demand verified workforce crews, automated muster rolls, and milestone settlements.
            </p>
          </div>
        </div>

        {/* Two Columns: Value Props & Registration Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl font-black text-forest">
              Why Prime Builders & Contractors Partner With KaamSetu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
                <Users className="w-6 h-6 text-sage mb-3" />
                <h3 className="font-bold text-forest text-base mb-1">Pre-formed Trade Brigades</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Hire cohesive crews led by veteran head masons, master electricians, and site supervisors.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
                <FileText className="w-6 h-6 text-cta mb-3" />
                <h3 className="font-bold text-forest text-base mb-1">Tender Marketplace</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Post requirements with custom shifts, food/stay terms, and receive applications within 24 hours.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
                <ShieldCheck className="w-6 h-6 text-status-success mb-3" />
                <h3 className="font-bold text-forest text-base mb-1">100% Verified Credentials</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Aadhaar, trade certifications, and police verification documents on file for every deployed worker.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-forest mb-3" />
                <h3 className="font-bold text-forest text-base mb-1">Digital Attendance & GST</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Daily GPS-verified clock-in, weekly muster-roll approval, and compliant GST invoices.
                </p>
              </div>
            </div>

            <div className="bg-sage-soft p-6 rounded-2xl border border-sage/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-forest text-sm">Need immediate custom procurement?</h4>
                <p className="text-xs text-text-secondary">Talk to our Enterprise Key Accounts Manager</p>
              </div>
              <a
                href="tel:18005226738"
                className="px-4 py-2 rounded-xl bg-forest text-lime text-xs font-black shadow-xs"
              >
                1800-KAAMSETU
              </a>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated">
            <h3 className="text-xl font-black text-forest mb-1">Contractor Registration</h3>
            <p className="text-xs text-text-muted mb-6">कंपनी या ठेकेदार खाता बनाएं</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-status-dangerSoft text-status-danger text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Company / Firm Name (फर्म का नाम) *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Infra & Builders Pvt Ltd"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Vikram Singh"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9811002233"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Business Domain (व्यवसाय प्रकार)
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                >
                  <option value="CIVIL_CONSTRUCTION">Civil Construction & High-Rise</option>
                  <option value="ELECTRICAL_CONTRACTS">MEP & Electrical Contractor</option>
                  <option value="INTERIOR_FITOUT">Interior Fitout & Carpentry</option>
                  <option value="MANPOWER_AGENCY">Registered Labour Supply Agency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                    GSTIN / PAN (Optional)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="07AAACA1234B1Z5"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                    City (शहर) *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>{loading ? 'REGISTERING...' : 'REGISTER AS CONTRACTOR (ठेकेदार खाता बनाएं)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-xs font-bold text-text-secondary hover:text-forest">
                Already registered contractor? <span className="text-cta">Login</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
