'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  PlusCircle, 
  ArrowRight, 
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HiringRequirementsPage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const res = await fetch('/api/hiring/requirements');
        const data = await res.json();
        if (data.success) {
          setRequirements(data.requirements || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, []);

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Manage Hiring Requirements"
      subtitle="सक्रिय भर्तियां, रिक्तियां व उम्मीदवार आवंटन ट्रैकर"
      actions={
        <Link
          href="/hiring/post-vacancy"
          className="px-4 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-xs flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Post New Vacancy</span>
        </Link>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {loading ? (
          <div className="py-16 text-center text-xs text-[#4B6F8E] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2583D5]" />
            <span>Loading requirements...</span>
          </div>
        ) : requirements.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#D9EEFF] p-8 space-y-3">
            <Briefcase className="w-12 h-12 text-[#4B6F8E] mx-auto opacity-40" />
            <h3 className="font-bold text-[#153451] text-base">No hiring requirements posted yet</h3>
            <p className="text-xs text-[#4B6F8E]">Create a vacancy to start receiving verified skilled applications.</p>
            <Link
              href="/hiring/post-vacancy"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2583D5] text-white text-xs font-bold"
            >
              Post First Vacancy
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="bg-white p-6 rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#153451] text-base">{req.serviceCategory}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                      {req.status || 'ACTIVE'}
                    </span>
                  </div>

                  <p className="text-xs text-[#4B6F8E] max-w-2xl leading-relaxed">{req.serviceDescription}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#153451] pt-1">
                    <span className="flex items-center gap-1 text-[#4B6F8E]">
                      <MapPin className="w-3.5 h-3.5 text-[#2583D5]" /> {req.locality || req.city}
                    </span>
                    <span>•</span>
                    <span>Budget: <strong>₹{(req.estimatedAmount || 12000).toLocaleString('en-IN')}</strong></span>
                    <span>•</span>
                    <span className="text-[11px] text-[#4B6F8E]">ID: {req.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/hiring/applicants"
                    className="px-4 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Applicants</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
