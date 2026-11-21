'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FolderGit2, 
  Search, 
  RefreshCw, 
  Building2, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HardHat
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contractorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalWorkersNeeded = projects.reduce((acc, p) => acc + (p.totalWorkersRequired || 0), 0);
  const totalAccepted = projects.reduce((acc, p) => acc + (p.totalWorkersAccepted || 0), 0);

  return (
    <AdminLayout
      title="Contractor Projects & Workforce"
      subtitle="ठेकेदार प्रोजेक्ट्स व दैनिक मस्टर रोल • Multi-trade infrastructure projects, labor quotas, and site muster rolls"
    >
      <div className="space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Total Active Projects</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#153451]">{projects.length}</span>
              <span className="text-xs text-emerald-600 font-bold">In Atlas</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Workforce Quota</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#2583D5]">{totalWorkersNeeded}</span>
              <span className="text-xs text-[#7697B3]">Target deployed</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Allocated on Sites</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">{totalAccepted}</span>
              <span className="text-xs text-[#7697B3]">Active workers</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Muster Roll System</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">Active</span>
              <span className="text-xs text-emerald-600 font-bold">Daily Payouts</span>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-3xl p-4 border border-[#D1E8F8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7697B3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search project title, contractor, city..."
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
              <option value="ALL">All Projects</option>
              <option value="OPEN">Open (Hiring)</option>
              <option value="IN_PROGRESS">Active Site</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <button
              onClick={fetchProjects}
              disabled={loading}
              className="p-2 rounded-xl border border-[#D1E8F8] hover:border-[#2583D5] text-[#2583D5] hover:bg-[#EAF6FF] transition"
              title="Refresh Projects"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading ? (
            <div className="col-span-2 py-16 text-center text-xs text-[#7697B3]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#2583D5] mx-auto mb-2" />
              Loading contractor infrastructure projects...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-2 py-16 text-center text-xs text-[#7697B3] space-y-2 bg-white rounded-3xl border border-[#D1E8F8]">
              <FolderGit2 className="w-8 h-8 text-[#7697B3] mx-auto" />
              <p className="font-bold text-[#153451]">No projects found</p>
              <p>Contractor projects created on DigiWork appear here.</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs hover:border-[#2583D5] transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#2583D5] bg-[#EAF6FF] px-2 py-0.5 rounded-md">
                        {project.projectType || 'Civil Works'}
                      </span>
                      <h4 className="font-black text-[#153451] text-base mt-2">
                        {project.title}
                      </h4>
                      <p className="text-xs text-[#7697B3] flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#2583D5]" />
                        {project.contractorName || 'Contractor Enterprise'}
                      </p>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                      project.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {project.status || 'OPEN'}
                    </span>
                  </div>

                  <p className="text-xs text-[#4B6F8E] mt-3 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#F5FAFF] border border-[#EAF6FF]">
                      <span className="text-[10px] text-[#7697B3] block">Location</span>
                      <strong className="text-[#153451] flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-[#2583D5] shrink-0" />
                        {project.city}, {project.state || 'India'}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F5FAFF] border border-[#EAF6FF]">
                      <span className="text-[10px] text-[#7697B3] block">Workforce</span>
                      <strong className="text-[#153451] flex items-center gap-1">
                        <Users className="w-3 h-3 text-emerald-600 shrink-0" />
                        {project.totalWorkersAccepted || 0} / {project.totalWorkersRequired || 10} Deployed
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAF6FF] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#7697B3] block">Payout Schedule</span>
                    <strong className="text-[#153451] font-bold">
                      {project.payoutSchedule || 'DAILY'} ({project.paymentTerms || 'Bank UPI'})
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/applications`}
                      className="px-3 py-1.5 rounded-xl bg-[#EAF6FF] text-[#2583D5] font-bold text-xs hover:bg-[#2583D5] hover:text-white transition"
                    >
                      Applications ({project.applicationsCount || 0})
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
