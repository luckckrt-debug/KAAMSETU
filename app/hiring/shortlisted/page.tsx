'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Phone, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HiringShortlistedPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/workers?verifiedOnly=true')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.workers) {
          // Pre-select top candidates as sample shortlisted
          setCandidates(d.workers.slice(0, 5));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Shortlisted Candidates Queue"
      subtitle="साक्षात्कार हेतु चयनित उम्मीदवार • डायरेक्ट संपर्क व ऑनबोर्डिंग पुष्टिकरण"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="p-4 rounded-3xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
          <span>
            <strong>Candidate Privacy Notice:</strong> Contact details are unlocked exclusively for interview scheduling and recruitment verification.
          </span>
          <span className="font-bold text-blue-800">{candidates.length} In Queue</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-[#4B6F8E] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2583D5]" />
            <span>Loading shortlisted candidates...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="bg-white p-5 rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={cand.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100'}
                    alt={cand.user?.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#D9EEFF]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#153451] text-sm">{cand.user?.fullName}</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Shortlisted
                      </span>
                    </div>
                    <p className="text-xs text-[#4B6F8E]">{cand.headline || 'Verified Professional'}</p>
                    <div className="flex items-center gap-3 text-xs text-[#153451] pt-1 font-semibold">
                      <span className="flex items-center gap-1 text-[#2583D5]">
                        <Phone className="w-3 h-3" /> +91 {cand.user?.phoneNumber || '9876543210'}
                      </span>
                      <span>•</span>
                      <span>₹{cand.hourlyRate || 350}/hr</span>
                      <span>•</span>
                      <span>{cand.city}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/hiring/selected"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm & Hire Candidate</span>
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
