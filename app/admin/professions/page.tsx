'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Tag, 
  Edit3, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminProfessionsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [professions, setProfessions] = useState<any[]>([]);
  const [pendingSuggestions, setPendingSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalogue' | 'suggestions' | 'add'>('catalogue');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // New Profession Form State
  const [newProf, setNewProf] = useState({
    name: '',
    nameHi: '',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a1-masonry',
    aliases: '',
    popularSkills: '',
    baseHourlyRate: 350,
    baseDailyRate: 1000,
    isRegulated: false,
    verificationRequirements: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/professions');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setProfessions(data.professions || []);
        setPendingSuggestions(data.pendingSuggestions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Toggle active status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/professions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setProfessions(professions.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Review Suggestion
  const handleReviewSuggestion = async (suggId: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/professions/suggestions/${suggId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (data.success) {
        setPendingSuggestions(pendingSuggestions.filter(s => s.id !== suggId));
        handleRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create New Profession
  const handleCreateProfession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/professions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProf)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Profession successfully added to live catalogue.');
        setNewProf({
          name: '',
          nameHi: '',
          categoryId: 'cat-a-construction',
          subcategoryId: 'sub-a1-masonry',
          aliases: '',
          popularSkills: '',
          baseHourlyRate: 350,
          baseDailyRate: 1000,
          isRegulated: false,
          verificationRequirements: ''
        });
        setActiveTab('catalogue');
        handleRefresh();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered professions
  const filteredProfessions = professions.filter(p => {
    if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q) || p.nameHi.includes(q);
      const matchAlias = p.aliases?.some((a: string) => a.toLowerCase().includes(q));
      const matchSkill = p.popularSkills?.some((s: string) => s.toLowerCase().includes(q));
      return matchName || matchAlias || matchSkill;
    }
    return true;
  });

  return (
    <AdminLayout
      title="Universal Profession Catalogue"
      subtitle="अखिल भारतीय पेशा एवं कौशल प्रबंधन • 26 Industry Categories (A-Z) & 250+ Occupations"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl border border-[#D1E8F8] bg-white text-xs font-bold text-[#153451] flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#2583D5] ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live DB</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-white hover:bg-zinc-900 text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Profession</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#D1E8F8] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7697B3] uppercase">Total Categories</span>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#2583D5] flex items-center justify-center font-black text-xs">
                26
              </span>
            </div>
            <p className="text-2xl font-black text-[#153451] mt-2">{categories.length || 26}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Codes A through Z</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D1E8F8] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7697B3] uppercase">Live Professions</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                ✓
              </span>
            </div>
            <p className="text-2xl font-black text-[#153451] mt-2">{professions.length}</p>
            <p className="text-[11px] text-[#4B6F8E] font-semibold mt-0.5">Across All Industries</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D1E8F8] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7697B3] uppercase">Pending Suggestions</span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">
                {pendingSuggestions.length}
              </span>
            </div>
            <p className="text-2xl font-black text-[#153451] mt-2">{pendingSuggestions.length}</p>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Awaiting Review</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D1E8F8] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7697B3] uppercase">Regulated Professions</span>
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs">
                ⚖️
              </span>
            </div>
            <p className="text-2xl font-black text-[#153451] mt-2">
              {professions.filter(p => p.isRegulated).length}
            </p>
            <p className="text-[11px] text-purple-700 font-semibold mt-0.5">Healthcare & Legal</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#D1E8F8] pb-1">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'catalogue'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            All Professions Catalogue ({professions.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'suggestions'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            <span>Custom User Proposals</span>
            {pendingSuggestions.length > 0 && (
              <span className="bg-amber-400 text-black text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingSuggestions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'add'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-[#4B6F8E] hover:text-[#153451]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Profession</span>
          </button>
        </div>

        {/* TAB 1: ALL PROFESSIONS CATALOGUE */}
        {activeTab === 'catalogue' && (
          <div className="space-y-4">
            
            {/* Search & Category Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#D1E8F8] flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#7697B3] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search profession by name, Hindi, alias (e.g. Raj Mistri, Cook, Driver, Nurse)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1E8F8] text-xs font-semibold focus:outline-none focus:border-[#2583D5]"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-72 px-3 py-2.5 rounded-xl border border-[#D1E8F8] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5]"
              >
                <option value="ALL">All 26 Categories (A to Z)</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name} ({c.nameHi})
                  </option>
                ))}
              </select>
            </div>

            {/* Professions Table */}
            <div className="bg-white rounded-2xl border border-[#D1E8F8] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5FAFF] border-b border-[#D1E8F8] text-[#7697B3] font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Profession Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Registered Workers</th>
                      <th className="py-3 px-4">Search Aliases</th>
                      <th className="py-3 px-4">Base Rate (Hr / Day)</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF6FF]">
                    {filteredProfessions.map(prof => (
                      <tr key={prof.id} className="hover:bg-[#F5FAFF]/60 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#153451]">{prof.name}</p>
                          <p className="text-[11px] text-[#2583D5] font-semibold">{prof.nameHi}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-semibold text-[#4B6F8E]">
                            {categories.find(c => c.id === prof.categoryId)?.name || prof.categoryId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-[#EAF6FF] text-[#2583D5] font-bold text-[11px]">
                            {prof.registeredWorkerCount || 0} active
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {prof.aliases?.slice(0, 3).map((alias: string, i: number) => (
                              <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                                {alias}
                              </span>
                            ))}
                            {(prof.aliases?.length || 0) > 3 && (
                              <span className="text-[10px] text-slate-400">+{prof.aliases.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#153451]">
                          ₹{prof.baseHourlyRate}/hr • ₹{prof.baseDailyRate}/day
                        </td>
                        <td className="py-3 px-4">
                          {prof.isRegulated ? (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                              Regulated
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                              Standard
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(prof.id, prof.isActive)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ml-auto ${
                              prof.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {prof.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{prof.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM PROFESSION SUBMISSIONS */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-[#D1E8F8] shadow-2xs space-y-2">
              <h3 className="font-bold text-sm text-[#153451]">
                User-Submitted Profession Proposals Desk
              </h3>
              <p className="text-xs text-[#4B6F8E]">
                Workers and contractors who could not find their trade submitted these suggestions. 
                Approve them to instantly publish into the live catalogue without redeploying the site.
              </p>
            </div>

            {pendingSuggestions.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-[#D1E8F8] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-[#153451]">All Caught Up!</h4>
                <p className="text-xs text-[#7697B3]">No pending custom profession proposals at this moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSuggestions.map(sugg => (
                  <div key={sugg.id} className="bg-white p-5 rounded-2xl border border-[#D1E8F8] shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-sm text-[#153451]">{sugg.name}</h4>
                        {sugg.nameHi && <p className="text-xs font-bold text-[#2583D5]">{sugg.nameHi}</p>}
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    </div>

                    <p className="text-xs text-[#4B6F8E] leading-relaxed">
                      {sugg.description || 'No description provided by user.'}
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#F5FAFF]">
                      <button
                        onClick={() => handleReviewSuggestion(sugg.id, 'APPROVED')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                      >
                        ✓ Approve & Publish Live
                      </button>
                      <button
                        onClick={() => handleReviewSuggestion(sugg.id, 'REJECTED')}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE NEW PROFESSION FORM */}
        {activeTab === 'add' && (
          <form onSubmit={handleCreateProfession} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D1E8F8] shadow-sm max-w-2xl space-y-4">
            <h3 className="font-black text-base text-[#153451] border-b border-[#EAF6FF] pb-3">
              Add New Profession to Master Catalogue
            </h3>

            {message && (
              <div className="p-3 rounded-xl bg-[#EAF6FF] border border-[#D1E8F8] text-xs font-bold text-[#153451]">
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#153451] block mb-1">Profession Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drone Camera Pilot"
                  value={newProf.name}
                  onChange={(e) => setNewProf({ ...newProf, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#153451] block mb-1">Hindi Title (हिंदी नाम)</label>
                <input
                  type="text"
                  placeholder="e.g. ड्रोन कैमरा ऑपरेटर"
                  value={newProf.nameHi}
                  onChange={(e) => setNewProf({ ...newProf, nameHi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#153451] block mb-1">Industry Category (A-Z) *</label>
              <select
                value={newProf.categoryId}
                onChange={(e) => setNewProf({ ...newProf, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-xs font-bold"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name} ({c.nameHi})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#153451] block mb-1">Search Aliases (Comma separated) *</label>
              <input
                type="text"
                placeholder="e.g. drone operator, drone shooter, aerial camera, quadcopter"
                value={newProf.aliases}
                onChange={(e) => setNewProf({ ...newProf, aliases: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#153451] block mb-1">Key Skill Tags (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Aerial Shoots, Gimbal Control, Video Editing, Battery Care"
                value={newProf.popularSkills}
                onChange={(e) => setNewProf({ ...newProf, popularSkills: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#153451] block mb-1">Base Hourly Rate (₹)</label>
                <input
                  type="number"
                  value={newProf.baseHourlyRate}
                  onChange={(e) => setNewProf({ ...newProf, baseHourlyRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#153451] block mb-1">Base Daily Rate (₹)</label>
                <input
                  type="number"
                  value={newProf.baseDailyRate}
                  onChange={(e) => setNewProf({ ...newProf, baseDailyRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] text-xs font-semibold"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#153451]">
                <input
                  type="checkbox"
                  checked={newProf.isRegulated}
                  onChange={(e) => setNewProf({ ...newProf, isRegulated: e.target.checked })}
                  className="w-4 h-4 rounded text-forest"
                />
                <span>Requires official qualification verification before live listing (e.g. Healthcare, Legal, Architecture)</span>
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
              >
                {submitting ? 'Adding Profession...' : 'Save & Publish to Catalogue'}
              </button>
            </div>
          </form>
        )}

      </div>
    </AdminLayout>
  );
}
