'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  CheckCircle2, 
  PlusCircle, 
  Clock, 
  MapPin, 
  Star, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Search,
  Building
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HiringPartnerDashboard() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHiringData = async () => {
      try {
        const [reqRes, workersRes] = await Promise.all([
          fetch('/api/hiring/requirements'),
          fetch('/api/workers?verifiedOnly=true'),
        ]);
        const reqData = await reqRes.json();
        const workersData = await workersRes.json();

        if (reqData.success) {
          setRequirements(reqData.requirements || []);
        }
        if (workersData.success) {
          // Verified workers as candidate pool
          setApplicants(workersData.workers ? workersData.workers.slice(0, 8) : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchHiringData();
  }, []);

  const totalRequirements = requirements.length || 3;
  const activeVacancies = requirements.filter((r) => r.status !== 'WORK_COMPLETED' && r.status !== 'CANCELLED').length || 2;
  const totalApplicants = 18;
  const shortlistedCandidates = 6;
  const selectedCandidates = 4;

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Hiring Partner Recruitment Dashboard"
      subtitle="कार्यबल भर्ती, उम्मीदवार शॉर्टलिस्टिंग व मानव संसाधन प्रबंधन"
      actions={
        <Link
          href="/hiring/post-vacancy"
          className="px-4 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Vacancy (भर्ती निकालें)</span>
        </Link>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 4 KPI Recruitment Pipeline Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#2583D5]">
              <Briefcase className="w-5 h-5" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Live</span>
            </div>
            <div className="text-3xl font-black text-[#153451]">{activeVacancies}</div>
            <span className="text-xs text-[#4B6F8E] font-medium block">Active Job Vacancies</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#2583D5]">
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">+8 New</span>
            </div>
            <div className="text-3xl font-black text-[#153451]">{totalApplicants}</div>
            <span className="text-xs text-[#4B6F8E] font-medium block">Total Candidate Applicants</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-amber-600">
              <UserCheck className="w-5 h-5" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">In Review</span>
            </div>
            <div className="text-3xl font-black text-[#153451]">{shortlistedCandidates}</div>
            <span className="text-xs text-[#4B6F8E] font-medium block">Shortlisted for Interview</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Hired</span>
            </div>
            <div className="text-3xl font-black text-emerald-700">{selectedCandidates}</div>
            <span className="text-xs text-[#4B6F8E] font-medium block">Selected & Onboarded</span>
          </div>
        </div>

        {/* Section 1: Active Vacancies & Requirements */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9EEFF]">
            <div>
              <h3 className="font-black text-[#153451] text-base">Active Hiring Requirements & Vacancies</h3>
              <p className="text-xs text-[#4B6F8E]">Your live workforce posts broadcasted to 1,420+ verified candidates</p>
            </div>
            <Link
              href="/hiring/requirements"
              className="text-xs font-bold text-[#2583D5] hover:underline"
            >
              Manage All Requirements →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#4B6F8E] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2583D5]" />
              <span>Loading hiring requirements...</span>
            </div>
          ) : requirements.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-[#4B6F8E]">You haven't posted any hiring vacancies yet.</p>
              <Link
                href="/hiring/post-vacancy"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2583D5] text-white text-xs font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Your First Vacancy</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#D9EEFF]">
              {requirements.slice(0, 4).map((req) => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#153451] text-sm">{req.serviceCategory || 'Commercial Technician Requirement'}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {req.status || 'ACTIVE'}
                      </span>
                    </div>
                    <p className="text-xs text-[#4B6F8E] line-clamp-1">{req.serviceDescription}</p>
                    <div className="flex items-center gap-3 text-xs text-[#153451] pt-1">
                      <span className="flex items-center gap-1 text-[#4B6F8E]">
                        <MapPin className="w-3.5 h-3.5 text-[#2583D5]" /> {req.locality || req.city || 'Delhi NCR'}
                      </span>
                      <span>•</span>
                      <span>Est. Budget: <strong>₹{(req.estimatedAmount || 15000).toLocaleString('en-IN')}</strong></span>
                      <span>•</span>
                      <span className="text-[11px] text-[#4B6F8E]">Posted: {new Date(req.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/hiring/applicants"
                      className="px-4 py-2 rounded-xl bg-[#EAF6FF] hover:bg-[#D9EEFF] text-[#2583D5] text-xs font-bold transition flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Review Applicants ({totalApplicants})</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Recent Candidate Applicants Pool */}
        <div className="bg-white rounded-3xl p-6 border border-[#D9EEFF] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9EEFF]">
            <div>
              <h3 className="font-black text-[#153451] text-base">Top Verified Candidate Applicants</h3>
              <p className="text-xs text-[#4B6F8E]">Candidates matched with your recruitment requirements</p>
            </div>
            <Link
              href="/hiring/applicants"
              className="text-xs font-bold text-[#2583D5] hover:underline"
            >
              View Full Applicant Roster →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applicants.slice(0, 4).map((cand) => (
              <div
                key={cand.id}
                className="p-4 rounded-2xl bg-[#F8FCFF] border border-[#D9EEFF] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={cand.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100'}
                    alt={cand.user?.fullName}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#D9EEFF]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-[#153451] text-xs">{cand.user?.fullName}</h4>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        Aadhaar Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4B6F8E] truncate max-w-[180px]">
                      {cand.headline || 'Senior Skilled Professional'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#153451] mt-0.5">
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-500" /> {cand.ratingAvg || 4.9}
                      </span>
                      <span>•</span>
                      <span>₹{cand.hourlyRate || 350}/hr</span>
                      <span>•</span>
                      <span>{cand.city}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/hiring/shortlisted"
                  className="px-3 py-1.5 rounded-xl bg-[#2583D5] text-white text-[11px] font-bold hover:bg-[#1E70B8] transition shrink-0"
                >
                  Shortlist
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
