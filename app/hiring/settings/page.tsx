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
  Lock
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HiringSettingsPage() {
  const [notifyOnApply, setNotifyOnApply] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
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
      role="HIRING_PARTNER"
      title="Hiring Partner Settings & Support"
      subtitle="भर्ती सूचना प्राथमिकताएं व समर्पित कॉर्पोरेट अकाउंट मैनेजर"
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
            Recruitment Notification Preferences
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#153451]">Instant Candidate Application Alerts</p>
                <p className="text-[#4B6F8E]">Receive notification as soon as a verified worker applies to your vacancy</p>
              </div>
              <input
                type="checkbox"
                checked={notifyOnApply}
                onChange={(e) => setNotifyOnApply(e.target.checked)}
                className="w-5 h-5 accent-[#2583D5] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#153451]">Daily Candidate Pipeline Digest</p>
                <p className="text-[#4B6F8E]">Summary email of shortlisted candidates and vacancy statuses</p>
              </div>
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="w-5 h-5 accent-[#2583D5] cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#2583D5] text-white text-xs font-bold hover:bg-[#1E70B8] transition"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Corporate Support Desk */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs space-y-4">
          <h3 className="font-black text-[#153451] text-base border-b border-[#D9EEFF] pb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#2583D5]" />
            <span>Corporate Hiring Dedicated Desk</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8FCFF] border border-[#D9EEFF] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2583D5]/10 text-[#2583D5] flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[#4B6F8E] block">Key Account Manager</span>
                <strong className="text-sm text-[#153451]">+91 9811002233</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FCFF] border border-[#D9EEFF] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2583D5]/10 text-[#2583D5] flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[#4B6F8E] block">Corporate Support</span>
                <strong className="text-sm text-[#153451]">hiring@kaamsetu.in</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-5 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-red-900">Sign Out of Hiring Workspace</h4>
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
