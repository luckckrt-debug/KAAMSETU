'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  PlusCircle, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ContractorProjectsPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tenders')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTenders(d.tenders || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Manage Projects & Tenders"
      subtitle="सक्रिय निर्माण परियोजनाएं, कार्य आवंटन व टेंडर स्थिति"
      actions={
        <Link
          href="/contractor/post-work"
          className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Post Project / Tender</span>
        </Link>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {loading ? (
          <div className="py-16 text-center text-xs text-[#4B6F8E] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-forest" />
            <span>Loading projects...</span>
          </div>
        ) : tenders.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#D9EEFF] p-8 space-y-3">
            <Building2 className="w-12 h-12 text-[#4B6F8E] mx-auto opacity-40" />
            <h3 className="font-bold text-[#153451] text-base">No projects created yet</h3>
            <p className="text-xs text-[#4B6F8E]">Publish your first commercial tender to start receiving worker and crew bids.</p>
            <Link
              href="/contractor/post-work"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-lime text-xs font-bold"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tenders.map((t) => (
              <div
                key={t.id}
                className="bg-white p-6 rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#153451] text-base">{t.title}</h4>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                      {t.status || 'PUBLISHED'}
                    </span>
                  </div>

                  <p className="text-xs text-[#4B6F8E] max-w-2xl leading-relaxed">{t.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#153451] pt-1 font-medium">
                    <span className="flex items-center gap-1 text-[#4B6F8E]">
                      <MapPin className="w-3.5 h-3.5 text-forest" /> {t.location}
                    </span>
                    <span>•</span>
                    <span>Duration: <strong>{t.durationDays || 45} Days</strong></span>
                    <span>•</span>
                    <span>Budget: <strong className="text-emerald-800">₹{(t.budgetTotal || 50000).toLocaleString('en-IN')}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-forest font-bold">
                      <Users className="w-3.5 h-3.5" /> {t.applications?.length || 0} Worker Applicants
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/contractor/applications"
                    className="px-4 py-2 rounded-xl bg-[#EAF6FF] hover:bg-[#D9EEFF] text-[#2583D5] text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>View Applicants ({t.applications?.length || 0})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
