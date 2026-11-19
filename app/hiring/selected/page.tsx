'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  Award, 
  UserCheck, 
  FileText,
  DollarSign
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HiringSelectedPage() {
  const [selectedWorkers, setSelectedWorkers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/workers?verifiedOnly=true')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.workers) {
          setSelectedWorkers(d.workers.slice(0, 4));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Selected & Hired Candidates"
      subtitle="अंतिम रूप से चयनित कार्यबल • अनुबंध व साइट ऑनबोर्डिंग स्थिति"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All candidate onboarding contracts are covered under <strong>KaamSetu Escrow Guarantee</strong>.</span>
          </span>
          <span className="font-bold text-emerald-800">{selectedWorkers.length} Active Hires</span>
        </div>

        <div className="space-y-4">
          {selectedWorkers.map((worker, idx) => (
            <div
              key={worker.id}
              className="bg-white p-5 rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100'}
                  alt={worker.user?.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#153451] text-sm">{worker.user?.fullName}</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      HIRED & ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-[#4B6F8E]">{worker.headline || 'Senior Skilled Worker'}</p>
                  <div className="flex items-center gap-3 text-xs text-[#153451] pt-1">
                    <span>Contact: <strong>+91 {worker.user?.phoneNumber || '9876543210'}</strong></span>
                    <span>•</span>
                    <span>Daily Wage: <strong>₹{worker.dailyRate || 1050}/day</strong></span>
                    <span>•</span>
                    <span className="text-[#4B6F8E]">Site: {worker.city || 'Delhi NCR'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  Onboarding Complete ✓
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
