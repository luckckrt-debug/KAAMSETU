'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Globe, 
  ShieldCheck, 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageSquare, 
  LogOut, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function WorkerSettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
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
      role="WORKER"
      title="Worker Settings & Help"
      subtitle="अधिसूचना प्राथमिकताएं, भाषा व 24x7 सहायता डेस्क"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Preferences updated successfully!</span>
          </div>
        )}

        {/* Preferences Box */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs space-y-5">
          <h3 className="font-black text-[#153451] text-base border-b border-[#D9EEFF] pb-3">
            Notifications & Preferences (प्राथमिकताएं)
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#153451]">Push Notifications for Nearby Jobs</p>
                <p className="text-[#4B6F8E]">Receive immediate ring when a customer books within your radius</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#2583D5] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#153451]">SMS Alerts for Payouts & Bookings</p>
                <p className="text-[#4B6F8E]">Get free SMS alerts when UPI withdrawal succeeds</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#2583D5] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D9EEFF]">
              <div>
                <p className="font-bold text-[#153451]">Preferred Language (भाषा)</p>
                <p className="text-[#4B6F8E]">Choose dashboard display language</p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-[#D9EEFF] bg-[#F8FCFF] text-xs font-bold text-[#153451]"
              >
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="en">English</option>
              </select>
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

        {/* 24x7 Help & Worker Support */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs space-y-4">
          <h3 className="font-black text-[#153451] text-base border-b border-[#D9EEFF] pb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#2583D5]" />
            <span>24x7 KaamSetu Worker Helpline (सहायता केंद्र)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8FCFF] border border-[#D9EEFF] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2583D5]/10 text-[#2583D5] flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[#4B6F8E] block">Toll-Free Worker Support</span>
                <strong className="text-sm text-[#153451]">1800-KAAMSETU (522673)</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FCFF] border border-[#D9EEFF] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2583D5]/10 text-[#2583D5] flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[#4B6F8E] block">Worker Email Support</span>
                <strong className="text-sm text-[#153451]">support@kaamsetu.in</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone / Logout */}
        <div className="p-5 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-red-900">Sign Out of Worker Workspace</h4>
            <p className="text-[11px] text-red-700">You will stop receiving incoming dispatch rings until you log back in.</p>
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
