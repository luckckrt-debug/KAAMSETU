'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Receipt, 
  ShieldCheck, 
  AlertTriangle, 
  Save, 
  RefreshCw, 
  Phone, 
  Mail, 
  ToggleLeft, 
  ToggleRight,
  Radio,
  CheckCircle2
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<any>({
    platformName: 'KAAMSETU',
    platformFee: 99,
    serviceFeeEnabled: true,
    maintenanceMode: false,
    kycRequiredForBookings: true,
    payoutProvider: 'MANUAL',
    supportPhone: '+91-8887642828',
    supportEmail: 'support@kaamsetu.in',
    autoDispatchEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Platform configuration successfully updated in MongoDB Atlas & audit logged.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(data.error || 'Failed to update settings.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="System & Ecosystem Settings"
      subtitle="सिस्टम सेटिंग्स • Configure platform service fees, maintenance status & automated dispatch rules"
      actions={
        <button
          type="button"
          onClick={() => { setLoading(true); fetchSettings(); }}
          className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] bg-white hover:bg-[#F5FAFF] text-xs font-bold text-[#153451] transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#2583D5]" />
          <span>Reload Config</span>
        </button>
      }
    >
      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. Platform Fee Configuration (Section 10 Requirement) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D1E8F8] shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#EAF6FF] pb-3">
            <Receipt className="w-5 h-5 text-[#2583D5]" />
            <div>
              <h3 className="font-black text-[#153451] text-base">Platform Service Fee (₹99 Rule)</h3>
              <p className="text-xs text-[#7697B3]">Transparent fee added to base worker charges on customer bookings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                Standard Platform Fee (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                value={settings.platformFee}
                onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-black text-[#153451] focus:outline-none focus:border-[#2583D5]"
                required
              />
              <p className="text-[10px] text-[#7697B3] mt-1">
                Standard KaamSetu fee applied separately from the worker&apos;s displayed base charge.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                Fee Collection Status
              </label>
              <select
                value={settings.serviceFeeEnabled ? 'ENABLED' : 'DISABLED'}
                onChange={(e) => setSettings({ ...settings, serviceFeeEnabled: e.target.value === 'ENABLED' })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451]"
              >
                <option value="ENABLED">Enabled (Active ₹99 Collection)</option>
                <option value="DISABLED">Disabled (Promotional Free Service)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Operations & Maintenance */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D1E8F8] shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#EAF6FF] pb-3">
            <Settings className="w-5 h-5 text-[#2583D5]" />
            <div>
              <h3 className="font-black text-[#153451] text-base">Ecosystem Operations & Dispatch</h3>
              <p className="text-xs text-[#7697B3]">Control system maintenance and autonomous radar dispatch</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#153451] text-xs block">Maintenance Mode</span>
                <span className="text-[11px] text-[#7697B3]">Temporarily prevent new job requests</span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 accent-[#2583D5] cursor-pointer"
              />
            </div>

            <div className="p-4 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#153451] text-xs block">Automated Nearest Dispatch</span>
                <span className="text-[11px] text-[#7697B3]">Dispatch nearest available trade worker</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoDispatchEnabled}
                onChange={(e) => setSettings({ ...settings, autoDispatchEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#2583D5] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Support & Emergency Contact */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D1E8F8] shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#EAF6FF] pb-3">
            <Phone className="w-5 h-5 text-[#2583D5]" />
            <div>
              <h3 className="font-black text-[#153451] text-base">Customer & Worker Support Contacts</h3>
              <p className="text-xs text-[#7697B3]">Helpline and emergency coordination numbers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                Support Helpline Phone
              </label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>SAVE SYSTEM SETTINGS TO MONGODB ATLAS</span>
        </button>

      </form>
    </AdminLayout>
  );
}
