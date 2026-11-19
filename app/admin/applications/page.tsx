'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Search, RefreshCw, CheckCircle2, XCircle, ArrowRight, User } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch('/api/admin/data?collection=project_applications');
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setApplications(data.items);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <AdminLayout
      title="Work & Project Applications"
      subtitle="कार्य व प्रोजेक्ट आवेदन • Review candidate submissions for contractor projects and tenders"
    >
      <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm space-y-4">
        <h3 className="font-black text-sm text-[#153451]">Applications Queue ({applications.length})</h3>
        
        {loading ? (
          <div className="py-12 text-center text-xs text-[#7697B3]">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#7697B3] space-y-2">
            <FileText className="w-8 h-8 text-[#7697B3] mx-auto" />
            <p className="font-bold text-[#153451]">No pending project applications</p>
            <p>Candidate applications from Worker apps appear here for contractor review.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAF6FF] text-xs">
            {applications.map((app) => (
              <div key={app.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#153451]">{app.workerName || app.displayName}</span>
                  <p className="text-[11px] text-[#7697B3]">Trade: {app.trade} • Project: {app.projectTitle || app.projectId}</p>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#EAF6FF] text-[#2583D5]">
                  {app.status || 'APPLIED'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
