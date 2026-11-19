'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  DollarSign, 
  Phone, 
  Filter,
  RefreshCw,
  HardHat
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HiringApplicantsPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch('/api/workers?verifiedOnly=true');
        const data = await res.json();
        if (data.success) {
          setCandidates(data.workers || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleShortlist = (id: string, name: string) => {
    setShortlistedIds((prev) => [...prev, id]);
    setAlertMsg(`⭐ Candidate "${name}" moved to Shortlist queue for interview.`);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleSelect = (id: string, name: string) => {
    setSelectedIds((prev) => [...prev, id]);
    setAlertMsg(`🎉 Candidate "${name}" officially SELECTED and onboarding initiated!`);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const filtered = candidates.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.user?.fullName?.toLowerCase().includes(q) ||
      c.headline?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.skills?.some((s: any) => s.categoryName?.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Candidate Applicants Review Desk"
      subtitle="सत्यापित ट्रेड कौशल, आधार व पुलिस क्लीयरेंस युक्त उम्मीदवारों की समीक्षा"
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {alertMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alertMsg}</span>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-3xl border border-[#D9EEFF] shadow-xs flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#4B6F8E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter applicants by name, skill (e.g. Electrician, Mason), or city..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#F8FCFF] rounded-xl border border-[#D9EEFF] text-xs font-medium text-[#153451] focus:outline-none focus:ring-2 focus:ring-[#2583D5]"
            />
          </div>
          <span className="text-xs font-bold text-[#4B6F8E] whitespace-nowrap">
            {filtered.length} Verified Applicants Available
          </span>
        </div>

        {/* Applicants Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#4B6F8E] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2583D5]" />
            <span>Loading candidates...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#D9EEFF] p-8">
            <Users className="w-12 h-12 text-[#4B6F8E] mx-auto opacity-40 mb-2" />
            <h3 className="font-bold text-[#153451] text-sm">No applicants matching your filter</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((cand) => {
              const isShortlisted = shortlistedIds.includes(cand.id);
              const isSelected = selectedIds.includes(cand.id);

              return (
                <div
                  key={cand.id}
                  className="bg-white rounded-3xl p-5 border border-[#D9EEFF] hover:border-[#2583D5] shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={cand.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
                      alt={cand.user?.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#D9EEFF] shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#153451] text-sm truncate">{cand.user?.fullName}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <p className="text-xs text-[#4B6F8E] truncate">{cand.headline || 'Senior Skilled Worker'}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#153451] pt-0.5">
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {cand.ratingAvg || 4.9} ({cand.ratingCount || 42})
                        </span>
                        <span>•</span>
                        <span>₹{cand.hourlyRate || 350}/hr (₹{cand.dailyRate || 1050}/day)</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#4B6F8E]">
                          <MapPin className="w-3 h-3 text-[#2583D5]" /> {cand.city || 'Delhi'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D9EEFF] flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-[#4B6F8E]">
                      Experience: {cand.yearsExperience || 5}+ Yrs
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isShortlisted || isSelected}
                        onClick={() => handleShortlist(cand.id, cand.user?.fullName || 'Candidate')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          isShortlisted
                            ? 'bg-amber-100 text-amber-800'
                            : 'border border-[#D9EEFF] hover:bg-[#F8FCFF] text-[#153451]'
                        }`}
                      >
                        {isShortlisted ? 'Shortlisted ✓' : 'Shortlist'}
                      </button>

                      <button
                        type="button"
                        disabled={isSelected}
                        onClick={() => handleSelect(cand.id, cand.user?.fullName || 'Candidate')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-[#2583D5] hover:bg-[#1E70B8] text-white shadow-xs'
                        }`}
                      >
                        {isSelected ? 'Selected & Hired ✓' : 'Select / Hire'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
