'use client';

import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Save 
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function CustomerProfilePage() {
  const [fullName, setFullName] = useState('Ananya Deshmukh');
  const [phoneNumber, setPhoneNumber] = useState('9911223344');
  const [email, setEmail] = useState('ananya.deshmukh@example.com');
  const [primaryCity, setPrimaryCity] = useState('Noida');
  const [language, setLanguage] = useState('hi');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Customer Profile & Account"
      subtitle="व्यक्तिगत विवरण, संपर्क नंबर व सत्यापन स्थिति"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile information updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D1E8F8] shadow-sm space-y-6">
          
          <div className="flex items-center gap-4 pb-6 border-b border-[#EAF6FF]">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center font-black text-2xl border border-[#D1E8F8]">
              {fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#153451]">{fullName}</h2>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Customer
                </span>
              </div>
              <p className="text-xs text-[#7697B3] mt-0.5">+91 {phoneNumber} • Active Member since Feb 2026</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-[#153451] uppercase tracking-wider block mb-1.5">
                Full Name (पूरा नाम)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#153451] uppercase tracking-wider block mb-1.5">
                Mobile Number (मोबाइल नंबर - OTP Verified)
              </label>
              <input
                type="text"
                disabled
                value={`+91 ${phoneNumber}`}
                className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-gray-100 text-xs font-bold text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#153451] uppercase tracking-wider block mb-1.5">
                Email Address (ईमेल)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#153451] uppercase tracking-wider block mb-1.5">
                Primary Operating City
              </label>
              <input
                type="text"
                value={primaryCity}
                onChange={(e) => setPrimaryCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#153451] uppercase tracking-wider block mb-1.5">
                Preferred Language (भाषा)
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
              >
                <option value="hi">हिंदी (Hindi)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#153451] uppercase tracking-wider block mb-1.5">
                Safety Guarantee Status
              </label>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>₹25,000 KaamSetu Escrow Guarantee Protected</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAF6FF] flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}
