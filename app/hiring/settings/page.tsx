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
  Lock,
  AlertTriangle,
  Radio
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function CustomerSettingsPage() {
  const [liveGpsSms, setLiveGpsSms] = useState(true);
  const [workerArrivalAlerts, setWorkerArrivalAlerts] = useState(true);
  const [promotions, setPromotions] = useState(false);
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
      title="Customer Settings & Safety Support"
      subtitle="लाइव ट्रैकिंग सूचनाएं, 24x7 ग्राहक सहायता व सुरक्षा हेल्पडेस्क"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        {/* 1. Notification Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-[#EAF6FF] pb-3">
            <Bell className="w-4 h-4 text-[#2583D5]" />
            <h3 className="font-black text-[#153451] text-base">
              Service & Live Tracking Alerts
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#153451]">Live GPS Arrival & Route Tracking SMS</p>
                <p className="text-[#7697B3]">Receive instant SMS with live map link when worker starts moving</p>
              </div>
              <input
                type="checkbox"
                checked={liveGpsSms}
                onChange={(e) => setLiveGpsSms(e.target.checked)}
                className="w-4 h-4 accent-[#2583D5]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#153451]">Worker Doorstep Arrival Call & Push</p>
                <p className="text-[#7697B3]">Get an automated ring when professional is 200m away</p>
              </div>
              <input
                type="checkbox"
                checked={workerArrivalAlerts}
                onChange={(e) => setWorkerArrivalAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#2583D5]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#153451]">Service Discounts & Trade Deals</p>
                <p className="text-[#7697B3]">Receive occasional seasonal discounts for home maintenance</p>
              </div>
              <input
                type="checkbox"
                checked={promotions}
                onChange={(e) => setPromotions(e.target.checked)}
                className="w-4 h-4 accent-[#2583D5]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#EAF6FF]">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#2583D5] text-white text-xs font-bold hover:bg-[#1E70B8] transition"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* 2. 24x7 Customer Helpline & Emergency Support */}
        <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EAF6FF] pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-black text-[#153451] text-base">
              DigiWork Trust & 24x7 Safety Helpdesk
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8] space-y-2">
              <span className="text-[#7697B3] font-bold uppercase block">Customer Support Toll-Free</span>
              <p className="text-base font-black text-[#2583D5] flex items-center gap-1.5">
                <Phone className="w-4 h-4" /> 1800-DIGIWORK (3444)
              </p>
              <p className="text-[11px] text-[#7697B3]">Available 24 hours, 7 days a week in Hindi & English</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8] space-y-2">
              <span className="text-[#7697B3] font-bold uppercase block">Emergency SOS Safety Desk</span>
              <p className="text-base font-black text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> +91 9999-911-738
              </p>
              <p className="text-[11px] text-[#7697B3]">Priority incident escalation & dispute resolution team</p>
            </div>
          </div>
        </div>

        {/* 3. Account Actions */}
        <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#153451]">Sign Out of DigiWork</h4>
            <p className="text-[11px] text-[#7697B3]">Log out from this browser session</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
