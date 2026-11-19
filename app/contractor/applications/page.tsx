'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Users, 
  MapPin, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Phone,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ContractorApplicationsPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/tenders')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTenders(d.tenders || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (tenderId: string, appId: string, status: string) => {
    try {
      const res = await fetch(`/api/tenders/${tenderId}/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Application status updated to ${status}!`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Flatten all applications across tenders
  const allApplications: any[] = [];
  tenders.forEach((t) => {
    if (t.applications && t.applications.length > 0) {
      t.applications.forEach((a: any) => {
        allApplications.push({
          ...a,
          tenderId: t.id,
          tenderTitle: t.title,
          tenderLocation: t.location,
        });
      });
    }
  });

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Worker Tender Applications & Bids"
      subtitle="निर्माण परियोजनाओं के लिए कुशल श्रमिकों व क्रू लीडर्स के आवेदन"
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-xs text-[#4B6F8E] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-forest" />
            <span>Loading applications...</span>
          </div>
        ) : allApplications.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#D9EEFF] p-8 space-y-3">
            <FileText className="w-12 h-12 text-[#4B6F8E] mx-auto opacity-40" />
            <h3 className="font-bold text-[#153451] text-base">No bids received yet</h3>
            <p className="text-xs text-[#4B6F8E]">When skilled workers apply to your tenders, their bids will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white p-5 rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#153451] text-sm">
                      {app.worker?.user?.fullName || 'Senior Skilled Worker'}
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Aadhaar Verified
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                      {app.status || 'SUBMITTED'}
                    </span>
                  </div>

                  <p className="text-xs text-[#4B6F8E]">
                    Applied for: <strong className="text-[#153451]">{app.tenderTitle}</strong> • {app.tenderLocation}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#153451] pt-1">
                    <span>Proposed Wage: <strong className="text-emerald-800">₹{app.dailyRate || 950}/day</strong></span>
                    <span>•</span>
                    <span>Phone: +91 {app.worker?.user?.phoneNumber || '9812345678'}</span>
                    <span>•</span>
                    <span className="text-[#4B6F8E]">Applied: {new Date(app.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(app.tenderId, app.id, 'SHORTLISTED')}
                    className="px-3.5 py-2 rounded-xl border border-[#D9EEFF] hover:bg-[#F8FCFF] text-xs font-bold text-[#153451] transition"
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(app.tenderId, app.id, 'SELECTED')}
                    className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black transition shadow-xs"
                  >
                    Accept & Deploy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
