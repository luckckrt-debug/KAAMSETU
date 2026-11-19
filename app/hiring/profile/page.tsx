'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Save, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HiringPartnerProfilePage() {
  const [companyName, setCompanyName] = useState('Deshmukh Enterprises & Facility Services');
  const [contactPerson, setContactPerson] = useState('Ananya Deshmukh');
  const [phone, setPhone] = useState('9911223344');
  const [email, setEmail] = useState('ananya.deshmukh@example.com');
  const [gstin, setGstin] = useState('07AAAAA0000A1Z5');
  const [officeAddress, setOfficeAddress] = useState('Connaught Place, Barakhamba Road, New Delhi 110001');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Hiring Partner Organization Profile"
      subtitle="कंपनी विवरण, जीएसटी पंजीकरण व अधिकृत प्रतिनिधि प्रोफाइल"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Organization profile saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D9EEFF] shadow-xs space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-[#D9EEFF]">
            <div className="w-16 h-16 rounded-2xl bg-[#123B5D] text-[#60B5F5] flex items-center justify-center font-black text-2xl">
              {companyName.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-lg text-[#153451]">{companyName}</h3>
              <p className="text-xs text-[#4B6F8E]">GSTIN: {gstin} • Verified Corporate Hiring Partner</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Company / Entity Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Authorized Representative</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Contact Phone (+91)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Billing Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153451] mb-1">Headquarters / Office Address</label>
              <textarea
                rows={2}
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#D9EEFF] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold shadow-md transition"
            >
              Save Organization Profile
            </button>
          </div>
        </form>

      </div>
    </DashboardLayout>
  );
}
