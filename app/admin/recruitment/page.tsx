'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  Search, 
  RefreshCw, 
  Building2, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminRecruitmentPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenders');
      const data = await res.json();
      if (data.success && Array.isArray(data.tenders)) {
        setTenders(data.tenders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch = 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPositions = tenders.reduce((acc, t) => acc + (t.workerCountRequired || 0), 0);
  const openTenders = tenders.filter(t => t.status === 'OPEN').length;

  return (
    <AdminLayout
      title="Recruitment & Bulk Tenders"
      subtitle="भर्ती व टेंडर प्रबंधन • Enterprise bulk hiring, construction tenders, and workforce recruitment"
    >
      <div className="space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Total Tenders</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#153451]">{tenders.length}</span>
              <span className="text-xs text-emerald-600 font-bold">Active in Atlas</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Open for Bidding</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#2583D5]">{openTenders}</span>
              <span className="text-xs text-[#7697B3]">Accepting bids</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Workforce Quota</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#153451]">{totalPositions}</span>
              <span className="text-xs text-[#7697B3]">Workers required</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Tender System Health</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">100%</span>
              <span className="text-xs text-emerald-600 font-bold">Operational</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-4 border border-[#D1E8F8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7697B3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tender title, city, project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D1E8F8] focus:border-[#2583D5] focus:outline-none bg-[#F5FAFF]/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-xl border border-[#D1E8F8] px-3 py-2 bg-white text-[#153451] font-semibold focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open Only</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <button
              onClick={fetchTenders}
              disabled={loading}
              className="p-2 rounded-xl border border-[#D1E8F8] hover:border-[#2583D5] text-[#2583D5] hover:bg-[#EAF6FF] transition"
              title="Refresh Tenders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tenders Table */}
        <div className="bg-white rounded-3xl border border-[#D1E8F8] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#EAF6FF] flex items-center justify-between">
            <h3 className="font-black text-sm text-[#153451]">
              Bulk Tenders & Vacancy Directory ({filteredTenders.length})
            </h3>
            <span className="text-xs text-[#7697B3]">Realtime MongoDB Atlas Records</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#7697B3] space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#2583D5] mx-auto" />
              <p>Fetching bulk recruitment tenders...</p>
            </div>
          ) : filteredTenders.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#7697B3] space-y-2">
              <UserCheck className="w-8 h-8 text-[#7697B3] mx-auto" />
              <p className="font-bold text-[#153451]">No bulk recruitment tenders match your filter</p>
              <p>Contractors post bulk recruitment requirements which appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F5FAFF] border-b border-[#EAF6FF] text-[#7697B3] font-bold">
                    <th className="py-3 px-4">Tender / Requirement</th>
                    <th className="py-3 px-4">Category & Trade</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Workforce Quota</th>
                    <th className="py-3 px-4">Budget / Rate</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAF6FF]">
                  {filteredTenders.map((tender) => (
                    <tr key={tender.id} className="hover:bg-[#F5FAFF]/60 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-black text-[#153451] block text-xs">
                          {tender.title}
                        </span>
                        <span className="text-[11px] text-[#7697B3] flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-[#2583D5]" /> {tender.projectName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#153451]">
                        <span className="bg-[#EAF6FF] text-[#2583D5] px-2 py-0.5 rounded-md font-bold text-[11px]">
                          {tender.categoryName || 'General Workforce'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#4B6F8E]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#2583D5]" />
                          {tender.city}, {tender.state || 'India'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-[#153451]">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          {tender.workerCountRequired} Workers
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#153451]">
                          ₹{tender.perWorkerRate || 800}/day
                        </span>
                        {tender.totalBudget && (
                          <span className="block text-[10px] text-[#7697B3]">
                            Budget: ₹{tender.totalBudget.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          tender.status === 'OPEN' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : tender.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {tender.status || 'OPEN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
