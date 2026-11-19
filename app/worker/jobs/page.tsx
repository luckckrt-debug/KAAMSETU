'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  Filter, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  HardHat
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function WorkerFindWorkPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenRes, catRes] = await Promise.all([
          fetch('/api/tenders'),
          fetch('/api/categories'),
        ]);
        const tenData = await tenRes.json();
        const catData = await catRes.json();

        if (tenData.success) {
          setTenders(tenData.tenders || []);
        }
        if (catData.success) {
          setCategories(catData.categories || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApply = async (tenderId: string, title: string) => {
    setApplyingId(tenderId);
    try {
      const res = await fetch(`/api/tenders/${tenderId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyRate: 900,
          notes: 'Available immediately. Verified skills and full tool set ready.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedIds((prev) => [...prev, tenderId]);
        setSuccessMsg(`✅ Successfully applied to "${title}"! The contractor has been notified.`);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApplyingId(null);
    }
  };

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.workType?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout
      role="WORKER"
      title="Find Work & Available Jobs"
      subtitle="दैनिक साइट जॉब्स, ठेकेदार टेंडर्स व भर्ती अवसर • डायरेक्ट अप्लाई करें"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#4B6F8E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by trade (e.g. Electrician, Plumber), location, or site..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#F8FCFF] rounded-xl border border-[#D9EEFF] text-xs text-[#153451] focus:outline-none focus:ring-2 focus:ring-[#2583D5]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 bg-[#F8FCFF] rounded-xl border border-[#D9EEFF] text-xs font-semibold text-[#153451] focus:outline-none"
            >
              <option value="ALL">All Categories (सभी श्रेणियां)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} ({c.nameHi || ''})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Available Jobs Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#4B6F8E] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2583D5]" />
            <span>Loading verified job postings...</span>
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#D9EEFF] p-8">
            <HardHat className="w-12 h-12 text-[#4B6F8E] mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-[#153451] text-sm">No job openings found matching your criteria</h3>
            <p className="text-xs text-[#4B6F8E] mt-1">Try clearing your filters or check back shortly for new contractor tenders.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTenders.map((job) => {
              const isApplied = appliedIds.includes(job.id);
              const isApplying = applyingId === job.id;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-5 border border-[#D9EEFF] hover:border-[#2583D5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#153451] text-sm line-clamp-1">{job.title}</h4>
                          <span className="text-[11px] text-[#4B6F8E] block">
                            Contractor: {job.contractor?.user?.fullName || 'KaamSetu Verified Contractor'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {job.status || 'ACTIVE'}
                      </span>
                    </div>

                    <p className="text-xs text-[#4B6F8E] line-clamp-2 leading-relaxed">
                      {job.description || 'Skilled workforce requirement with daily wage payout and on-site escrow protection.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#153451] pt-1">
                      <span className="inline-flex items-center gap-1 bg-[#F8FCFF] px-2 py-1 rounded-lg border border-[#D9EEFF]">
                        <MapPin className="w-3.5 h-3.5 text-[#2583D5]" /> {job.location || 'Delhi NCR'}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#F8FCFF] px-2 py-1 rounded-lg border border-[#D9EEFF]">
                        <Clock className="w-3.5 h-3.5 text-[#2583D5]" /> {job.durationDays || 30} Days
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#F8FCFF] px-2 py-1 rounded-lg border border-[#D9EEFF] font-bold text-emerald-800">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> ₹{job.budgetTotal?.toLocaleString('en-IN') || '25,000'} Total Budget
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D9EEFF] flex items-center justify-between">
                    <span className="text-[11px] text-[#4B6F8E] font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Escrow Protected
                    </span>

                    <button
                      type="button"
                      disabled={isApplied || isApplying}
                      onClick={() => handleApply(job.id, job.title)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 ${
                        isApplied
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-[#2583D5] hover:bg-[#1E70B8] text-white'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Applied (आवेदन भेजा)</span>
                        </>
                      ) : isApplying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Apply for Work (आवेदन करें)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
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
