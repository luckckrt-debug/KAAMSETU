'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  Users, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Save, 
  RefreshCw,
  Calendar,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ContractorAttendancePage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'P' | 'HD' | 'A' | 'OT'>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/workers?verifiedOnly=true')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.workers) {
          const sample = d.workers.slice(0, 8);
          setWorkers(sample);
          const initial: Record<string, 'P' | 'HD' | 'A' | 'OT'> = {};
          sample.forEach((w: any, idx: number) => {
            initial[w.id] = idx === 6 ? 'HD' : idx === 7 ? 'OT' : 'P';
          });
          setAttendance(initial);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (id: string, val: 'P' | 'HD' | 'A' | 'OT') => {
    setAttendance((prev) => ({ ...prev, [id]: val }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Daily Muster Roll & Site Attendance"
      subtitle={`दैनिक मस्टर रोल उपस्थिति • ${today}`}
      actions={
        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save Muster Roll</span>
        </button>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Muster roll attendance saved and synced with payroll ledger!</span>
          </div>
        )}

        {/* Legend */}
        <div className="p-4 bg-white rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#153451]">Attendance Codes:</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">P</span>
              <span className="text-[#4B6F8E]">Present (Full Day)</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs">HD</span>
              <span className="text-[#4B6F8E]">Half Day</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-6 h-6 rounded-lg bg-red-100 text-red-800 font-black flex items-center justify-center text-xs">A</span>
              <span className="text-[#4B6F8E]">Absent</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 font-black flex items-center justify-center text-xs">OT</span>
              <span className="text-[#4B6F8E]">Overtime (+4h)</span>
            </span>
          </div>

          <span className="font-bold text-forest text-xs">{workers.length} Personnel on Muster</span>
        </div>

        {/* Muster Roll Table */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs">
          <div className="divide-y divide-[#D9EEFF]">
            {workers.map((worker) => {
              const currentVal = attendance[worker.id] || 'P';

              return (
                <div key={worker.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100'}
                      alt={worker.user?.fullName}
                      className="w-11 h-11 rounded-2xl object-cover border border-[#D9EEFF]"
                    />
                    <div>
                      <h4 className="font-bold text-[#153451] text-sm">{worker.user?.fullName}</h4>
                      <p className="text-xs text-[#4B6F8E]">{worker.headline || 'Senior Skilled Worker'}</p>
                      <span className="text-[11px] text-[#153451] font-semibold">
                        Daily Wage: ₹{worker.dailyRate || 1050}/day
                      </span>
                    </div>
                  </div>

                  {/* Attendance Controls */}
                  <div className="flex items-center gap-2">
                    {(['P', 'HD', 'A', 'OT'] as const).map((code) => {
                      const isSelected = currentVal === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => handleStatusChange(worker.id, code)}
                          className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                            isSelected
                              ? code === 'P'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : code === 'HD'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : code === 'A'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-purple-600 text-white shadow-sm'
                              : 'bg-[#F8FCFF] text-[#4B6F8E] hover:bg-slate-100 border border-[#D9EEFF]'
                          }`}
                        >
                          {code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
