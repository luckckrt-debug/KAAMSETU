'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Award,
  FileText
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ContractorProfilePage() {
  const [companyName, setCompanyName] = useState('Apex Infra & Builders Pvt Ltd');
  const [directorName, setDirectorName] = useState('Vikram Singh');
  const [phone, setPhone] = useState('9811002233');
  const [email, setEmail] = useState('vikram.singh@apexinfra.com');
  const [gstin, setGstin] = useState('07AAACA1234B1Z5');
  const [licenseNumber, setLicenseNumber] = useState('PWD/CL-1/2022/9482');
  const [address, setAddress] = useState('Apex Tower, Expressway Sector 128, Noida, UP 201301');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Contractor & Enterprise Profile"
      subtitle="कंपनी पंजीकरण, पीडब्ल्यूडी/सीपीडब्ल्यूडी लाइसेंस व जीएसटी सत्यापन"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Contractor profile saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D9EEFF] shadow-xs space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-[#D9EEFF]">
            <div className="w-16 h-16 rounded-2xl bg-forest text-lime flex items-center justify-center font-black text-2xl">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#153451]">{companyName}</h3>
              <p className="text-xs text-[#4B6F8E]">
                GSTIN: {gstin} • License: {licenseNumber}
              </p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                A-Grade Verified Contractor
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Managing Director / Proprietor</label>
                <input
                  type="text"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Official Mobile (+91)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Official Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-mono font-bold text-[#153451]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">PWD / CPWD License Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-mono font-bold text-[#153451]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153451] mb-1">Office / Corporate Yard Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#D9EEFF] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black shadow-md transition"
            >
              Save Contractor Profile
            </button>
          </div>
        </form>

      </div>
    </DashboardLayout>
  );
}
