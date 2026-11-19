'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Receipt, 
  Wrench, 
  ShieldCheck, 
  ArrowUpRight,
  RefreshCw,
  Calendar
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/admin/overview');
        const data = await res.json();
        if (data.success) {
          setMetrics(data.metrics);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <AdminLayout
      title="Reports & Ecosystem Analytics"
      subtitle="रिपोर्ट्स व विश्लेषण • Comprehensive platform KPI metrics calculated from live MongoDB Atlas records"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-[#7697B3]">User Base</span>
          <div className="text-2xl font-black text-[#153451]">{metrics?.totalUsers || 0} Total</div>
          <span className="text-xs text-emerald-600 font-bold">{metrics?.activeUsers || 0} Active Users</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-[#7697B3]">KYC Verification Rate</span>
          <div className="text-2xl font-black text-emerald-600">
            {metrics ? Math.round((metrics.approvedKyc / (metrics.totalWorkers || 1)) * 100) : 0}%
          </div>
          <span className="text-xs text-[#7697B3]">{metrics?.approvedKyc || 0} Aadhaar Verified</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-[#7697B3]">Platform Fees Collected</span>
          <div className="text-2xl font-black text-[#2583D5]">
            ₹{metrics?.totalPlatformRevenue?.toLocaleString('en-IN') || 0}
          </div>
          <span className="text-xs text-[#7697B3]">₹99 Service Fee per Settled Job</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-[#7697B3]">Completed Jobs Rate</span>
          <div className="text-2xl font-black text-[#153451]">
            {metrics?.completedJobs || 0}
          </div>
          <span className="text-xs text-emerald-600 font-bold">Successful Dispatches</span>
        </div>

      </div>

      {/* Role Distribution Visual */}
      <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm space-y-4">
        <h3 className="font-black text-sm text-[#153451]">Ecosystem Role Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF]">
            <span className="text-[10px] font-black uppercase text-[#7697B3] block">Workers Fleet</span>
            <span className="text-xl font-black text-amber-600 mt-1 block">{metrics?.totalWorkers || 0}</span>
            <span className="text-xs text-[#7697B3]">Electricians, Plumbers, Masons, Carpenters</span>
          </div>

          <div className="p-4 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF]">
            <span className="text-[10px] font-black uppercase text-[#7697B3] block">Contractors</span>
            <span className="text-xl font-black text-[#1E70B8] mt-1 block">{metrics?.totalContractors || 0}</span>
            <span className="text-xs text-[#7697B3]">Enterprise Construction & Tenders</span>
          </div>

          <div className="p-4 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF]">
            <span className="text-[10px] font-black uppercase text-[#7697B3] block">Hiring Partners & Customers</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">{metrics?.totalHiringPartners || 0}</span>
            <span className="text-xs text-[#7697B3]">Service Bookers & Households</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
