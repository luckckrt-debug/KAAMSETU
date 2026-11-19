'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Star, 
  Award, 
  Clock, 
  DollarSign, 
  Save, 
  CheckCircle2,
  HardHat,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function WorkerProfilePage() {
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable fields
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(350);
  const [dailyRate, setDailyRate] = useState(1100);
  const [experience, setExperience] = useState(6);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        const userId = meData.user?.id || 'user-worker-1';

        const res = await fetch(`/api/workers/${userId}`);
        const data = await res.json();
        if (data.success && data.worker) {
          setWorker(data.worker);
          setHeadline(data.worker.headline || 'Certified Senior Electrician');
          setBio(data.worker.bio || 'Experienced in high-voltage industrial wiring and domestic emergency repairs.');
          setHourlyRate(data.worker.hourlyRate || 350);
          setDailyRate(data.worker.dailyRate || 1100);
          setExperience(data.worker.yearsExperience || 6);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/worker/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          bio,
          hourlyRate: Number(hourlyRate),
          dailyRate: Number(dailyRate),
          yearsExperience: Number(experience),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Profile successfully updated and live on KaamSetu!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      role="WORKER"
      title="My Worker Profile & Rates"
      subtitle="आपकी सार्वजनिक प्रोफाइल, मजदूरी दरें, ट्रेड कौशल व आधार सत्यापन"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row items-center gap-5">
          <img
            src={worker?.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=160'}
            alt="Worker Avatar"
            className="w-20 h-20 rounded-3xl object-cover border-2 border-[#2583D5] shadow-xs"
          />
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-black text-[#153451]">{worker?.user?.fullName || 'Ramesh Sharma'}</h2>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Aadhaar Verified
              </span>
            </div>
            <p className="text-xs text-[#4B6F8E]">
              {worker?.locality || 'Connaught Place'}, {worker?.city || 'Delhi'} • +91 {worker?.user?.phoneNumber}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs font-bold pt-1">
              <span className="text-amber-600 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {worker?.ratingAvg || 4.9} ({worker?.ratingCount || 84} reviews)
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{worker?.completedJobsCount || 112} Jobs Completed</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D9EEFF] shadow-xs space-y-5">
          <h3 className="font-black text-[#153451] text-base border-b border-[#D9EEFF] pb-3">
            Professional Details & Wage Rates
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#153451] mb-1">Headline / Profession Title (ट्रेड शीर्षक)</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451] focus:outline-none focus:ring-2 focus:ring-[#2583D5]"
                placeholder="e.g. Certified Industrial & Domestic Electrician"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Hourly Rate (₹/घंटा)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4B6F8E]">₹</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-bold text-[#153451]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Daily Wage (₹/दिन 8h)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4B6F8E]">₹</span>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-bold text-[#153451]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153451] mb-1">Experience (वर्ष अनुभव)</label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9EEFF] text-xs font-bold text-[#153451]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153451] mb-1">Work Bio & Experience (कार्य अनुभव विवरण)</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-4 rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451] focus:outline-none focus:ring-2 focus:ring-[#2583D5]"
                placeholder="Mention your tools, ITI diploma, past projects, or specialties..."
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#D9EEFF] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile (सेव करें)</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </DashboardLayout>
  );
}
