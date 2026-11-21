'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  HelpCircle, 
  Phone, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2,
  Building2
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ContractorSettingsPage() {
  const [notifyOnBids, setNotifyOnBids] = useState(true);
  const [dailyMusterAlerts, setDailyMusterAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Contractor Settings & Support"
      subtitle="परियोजना सूचना प्राथमिकताएं व समर्पित इंजीनियरिंग सहायता डेस्क"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Preferences saved!</span>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs space-y-5">
          <h3 className="font-black text-[#153451] text-base border-b border-[#D9EEFF] pb-3">
            Tender & Project Notification Rules
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#153451]">Instant Worker Tender Bids</p>
                <p className="text-[#4B6F8E]">Receive immediate alert when a skilled crew or technician applies</p>
              </div>
              <input
                type="checkbox"
                checked={notifyOnBids}
                onChange={(e) => setNotifyOnBids(e.target.checked)}
                className="w-5 h-5 accent-forest cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#153451]">Daily Muster Roll Reminders</p>
                <p className="text-[#4B6F8E]">Evening reminder to lock daily site attendance before payroll runs</p>
              </div>
              <input
                type="checkbox"
                checked={dailyMusterAlerts}
                onChange={(e) => setDailyMusterAlerts(e.target.checked)}
                className="w-5 h-5 accent-forest cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-bold transition"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Dedicated Support */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs space-y-4">
          <h3 className="font-black text-[#153451] text-base border-b border-[#D9EEFF] pb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-forest" />
            <span>Contractor Technical & Tender Support</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8FCFF] border border-[#D9EEFF] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[#4B6F8E] block">Tender Desk Officer</span>
                <strong className="text-sm text-[#153451]">+91 9811002233</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FCFF] border border-[#D9EEFF] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[#4B6F8E] block">Contractor Desk Email</span>
                <strong className="text-sm text-[#153451]">contractor@digiwork.in</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-5 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-red-900">Sign Out of Contractor Workspace</h4>
            <p className="text-[11px] text-red-700">End active session on this device.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
