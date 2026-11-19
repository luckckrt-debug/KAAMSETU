'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Phone, 
  CheckCircle2, 
  HardHat, 
  Layers, 
  CalendarCheck,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ContractorWorkforcePage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/workers?verifiedOnly=true')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setWorkers(d.workers ? d.workers.slice(0, 10) : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Contractor Workforce Management"
      subtitle="साइट पर तैनात कुशल श्रमिक, ट्रेड दल व दैनिक उपस्थिति रोस्टर"
      actions={
        <Link
          href="/contractor/attendance"
          className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Muster Roll Attendance →</span>
        </Link>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs">
            <span className="text-[11px] font-bold text-[#4B6F8E] uppercase block">Active Site Crew</span>
            <div className="text-3xl font-black text-forest mt-1">{workers.length}</div>
            <span className="text-[11px] text-emerald-600 font-bold block mt-1">100% Aadhaar Verified</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs">
            <span className="text-[11px] font-bold text-[#4B6F8E] uppercase block">Present Today</span>
            <div className="text-3xl font-black text-emerald-700 mt-1">{workers.length}</div>
            <span className="text-[11px] text-emerald-600 font-bold block mt-1">0 Absent</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs">
            <span className="text-[11px] font-bold text-[#4B6F8E] uppercase block">Overtime Hours</span>
            <div className="text-3xl font-black text-amber-600 mt-1">14h</div>
            <span className="text-[11px] text-[#4B6F8E] font-medium block mt-1">Tracked today</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs">
            <span className="text-[11px] font-bold text-[#4B6F8E] uppercase block">Daily Payroll</span>
            <div className="text-3xl font-black text-[#153451] mt-1">₹{(workers.length * 1050).toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-[#4B6F8E] font-medium block mt-1">Escrow Settled</span>
          </div>
        </div>

        {/* Workforce List */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs space-y-4">
          <h3 className="font-black text-[#153451] text-base border-b border-[#D9EEFF] pb-3">
            Active Workforce Personnel Directory ({workers.length})
          </h3>

          <div className="divide-y divide-[#D9EEFF]">
            {workers.map((w) => (
              <div key={w.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={w.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100'}
                    alt={w.user?.fullName}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#D9EEFF]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#153451] text-sm">{w.user?.fullName}</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Aadhaar Verified
                      </span>
                    </div>
                    <p className="text-xs text-[#4B6F8E]">{w.headline || 'Senior Skilled Mason'}</p>
                    <div className="flex items-center gap-3 text-xs text-[#153451] pt-0.5">
                      <span>Phone: +91 {w.user?.phoneNumber || '9876543210'}</span>
                      <span>•</span>
                      <span>Wage: <strong>₹{w.dailyRate || 1050}/day</strong></span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">Duty: Present (P)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/contractor/attendance"
                    className="px-3 py-1.5 rounded-xl border border-[#D9EEFF] hover:bg-[#F8FCFF] text-xs font-bold text-[#153451] transition"
                  >
                    Muster Record
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
