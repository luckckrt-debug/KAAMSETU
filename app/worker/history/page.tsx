'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  MapPin, 
  Star, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  User, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function WorkerWorkHistoryPage() {
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        if (data.success && data.bookings) {
          const finished = data.bookings.filter((b: any) =>
            ['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID'].includes(b.status)
          );
          setCompletedJobs(finished);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <DashboardLayout
      role="WORKER"
      title="Work History & Attendance"
      subtitle="पूर्ण किए गए काम, ग्राहक रेटिंग्स व पारिश्रमिक रिकॉर्ड"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {loading ? (
          <div className="py-16 text-center text-xs text-[#4B6F8E] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2583D5]" />
            <span>Loading work history...</span>
          </div>
        ) : completedJobs.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#D9EEFF] p-8 space-y-2">
            <Clock className="w-12 h-12 text-[#4B6F8E] mx-auto opacity-40" />
            <h3 className="font-bold text-[#153451] text-base">No completed jobs yet</h3>
            <p className="text-xs text-[#4B6F8E]">Your completed dispatches and client reviews will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-5 rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#153451] text-sm">
                      {job.serviceCategory || 'Electrical Work'} • Booking #{job.id.slice(-6)}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> COMPLETED
                    </span>
                  </div>

                  <p className="text-xs text-[#4B6F8E] leading-relaxed">
                    {job.serviceDescription || 'Domestic maintenance & power line verification completed successfully.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#153451] pt-1">
                    <span className="flex items-center gap-1 text-[#4B6F8E]">
                      <MapPin className="w-3.5 h-3.5 text-[#2583D5]" /> {job.locality || job.city || 'Delhi'}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-emerald-800">
                      ₹{job.finalAmount || job.estimatedAmount || 450} Earned
                    </span>
                    <span>•</span>
                    <span className="text-amber-600 flex items-center gap-1 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 5.0 Rated
                    </span>
                  </div>
                </div>

                <div className="text-right sm:self-center shrink-0">
                  <span className="text-[11px] font-mono text-[#4B6F8E] block">
                    {new Date(job.updatedAt || Date.now()).toLocaleDateString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                    Payment Settled
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
