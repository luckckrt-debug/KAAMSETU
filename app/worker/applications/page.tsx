'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  MapPin, 
  DollarSign, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function WorkerApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/tenders');
        const data = await res.json();
        if (data.success && data.tenders) {
          // Extract applications where user applied
          const apps: any[] = [];
          data.tenders.forEach((t: any) => {
            if (t.applications && t.applications.length > 0) {
              t.applications.forEach((a: any) => {
                apps.push({
                  ...a,
                  tenderTitle: t.title,
                  tenderLocation: t.location,
                  tenderBudget: t.budgetTotal,
                  tenderContractor: t.contractor?.user?.fullName || 'Contractor',
                });
              });
            }
          });
          setApplications(apps);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <DashboardLayout
      role="WORKER"
      title="My Job Applications"
      subtitle="आपके द्वारा भेजे गए आवेदन, शॉर्टलिस्टिंग स्थिति व साइट चयन"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {loading ? (
          <div className="py-16 text-center text-xs text-[#4B6F8E] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2583D5]" />
            <span>Loading applications...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#D9EEFF] p-8 space-y-3">
            <FileText className="w-12 h-12 text-[#4B6F8E] mx-auto opacity-40" />
            <h3 className="font-bold text-[#153451] text-base">No active applications yet</h3>
            <p className="text-xs text-[#4B6F8E] max-w-md mx-auto">
              You haven't submitted any job or tender applications. Browse open work posts to start receiving daily wages.
            </p>
            <Link
              href="/worker/jobs"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2583D5] text-white text-xs font-bold shadow-md hover:bg-[#1E70B8] transition mt-2"
            >
              <span>Explore Available Jobs (काम खोजें)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white p-5 rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#153451] text-sm">{app.tenderTitle}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      app.status === 'ACCEPTED' || app.status === 'SELECTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'SHORTLISTED'
                        ? 'bg-blue-100 text-blue-800'
                        : app.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status || 'SUBMITTED'}
                    </span>
                  </div>

                  <p className="text-xs text-[#4B6F8E]">
                    Contractor: {app.tenderContractor} • Location: {app.tenderLocation}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#153451] pt-1">
                    <span>Proposed Rate: <strong>₹{app.dailyRate || 900}/day</strong></span>
                    <span>•</span>
                    <span className="text-[11px] text-[#4B6F8E]">Applied: {new Date(app.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/worker/jobs"
                    className="px-3.5 py-1.5 rounded-xl border border-[#D9EEFF] hover:bg-[#F8FCFF] text-xs font-bold text-[#153451] transition"
                  >
                    View Project Details
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
