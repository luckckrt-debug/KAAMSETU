'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Phone, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  ExternalLink, 
  HardHat, 
  Building2, 
  Briefcase, 
  Wallet, 
  MapPin, 
  Loader2,
  Filter
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function UniversalSearchPage() {
  return (
    <Suspense fallback={
      <AdminLayout title="Universal User Search">
        <div className="p-12 text-center text-xs text-[#7697B3]">Loading search...</div>
      </AdminLayout>
    }>
      <UniversalSearchContent />
    </Suspense>
  );
}

function UniversalSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setResults(data.results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.replace(`/admin/search?q=${encodeURIComponent(query)}`);
    performSearch(query);
  };

  const handleLaunchPreview = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/preview-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, requestedRole: role }),
      });
      const data = await res.json();
      if (data.success && data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredResults = results.filter((r) => {
    if (roleFilter === 'ALL') return true;
    return (r.roles || []).map((role: string) => role.toUpperCase()).includes(roleFilter);
  });

  return (
    <AdminLayout
      title="Universal User Search"
      subtitle="सार्वभौमिक उपयोगकर्ता खोज • Search by mobile number, user ID, name, email or role"
    >
      {/* Search Input Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7697B3] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter 10-digit mobile number (e.g. 9876543210), User ID, Name or Email..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-bold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 rounded-2xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>SEARCH ECOSYSTEM</span>
          </button>
        </form>

        {/* Quick Role Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EAF6FF]">
          <span className="text-[11px] font-black uppercase text-[#7697B3] mr-2">Filter Role:</span>
          {['ALL', 'WORKER', 'CONTRACTOR', 'CUSTOMER', 'ADMIN'].map((rf) => (
            <button
              key={rf}
              type="button"
              onClick={() => setRoleFilter(rf)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                roleFilter === rf
                  ? 'bg-[#2583D5] text-white shadow-xs'
                  : 'bg-[#F5FAFF] hover:bg-[#EAF6FF] text-[#153451] border border-[#D1E8F8]'
              }`}
            >
              {rf}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {searched && (
        <div className="flex items-center justify-between text-xs text-[#7697B3] px-1">
          <span>Found <strong>{filteredResults.length}</strong> user records matching &quot;{query}&quot;</span>
        </div>
      )}

      {/* Results Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#D1E8F8] text-[#7697B3] font-semibold flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-[#2583D5] animate-spin" />
            <span>Scanning MongoDB Atlas users, profiles & ledgers...</span>
          </div>
        ) : searched && filteredResults.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#D1E8F8] space-y-2">
            <p className="font-black text-[#153451] text-base">No users found for &quot;{query}&quot;</p>
            <p className="text-xs text-[#7697B3]">
              Make sure you entered a valid 10-digit Indian mobile number, user ID, or full name.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.map((u) => {
              const isWorker = (u.roles || []).includes('WORKER');
              const isContractor = (u.roles || []).includes('CONTRACTOR');

              return (
                <div
                  key={u.id}
                  className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs hover:border-[#2583D5] transition-all hover:shadow-md flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* User Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#EAF6FF] text-[#2583D5] font-black flex items-center justify-center text-sm border border-[#D1E8F8]">
                          {u.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-black text-[#153451] text-sm truncate">{u.fullName}</h3>
                            {u.kycStatus === 'VERIFIED' && (
                              <span title="KYC Verified"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /></span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-[#2583D5] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            +91 {u.phoneNumber}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        u.status === 'BLOCKED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {u.status}
                      </span>
                    </div>

                    {/* Metadata Strip */}
                    <div className="p-3 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF] text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#7697B3]">User ID:</span>
                        <code className="text-[#153451] font-mono text-[11px]">{u.id}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7697B3]">Role:</span>
                        <span className="font-bold text-[#153451]">{(u.roles || []).join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7697B3]">City / Locality:</span>
                        <span className="font-semibold text-[#153451]">{u.city || 'Delhi NCR'}</span>
                      </div>
                      {isWorker && (
                        <div className="flex justify-between">
                          <span className="text-[#7697B3]">Wallet Balance:</span>
                          <span className="font-black text-emerald-600">₹{u.walletBalance || 0}</span>
                        </div>
                      )}
                      {u.companyName && (
                        <div className="flex justify-between">
                          <span className="text-[#7697B3]">Enterprise:</span>
                          <span className="font-bold text-[#2583D5]">{u.companyName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-2 border-t border-[#EAF6FF] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchPreview(u.id, u.primaryRole)}
                      className="px-3 py-1.5 rounded-xl border border-[#D1E8F8] hover:border-[#2583D5] text-[11px] font-bold text-[#4B6F8E] hover:text-[#2583D5] transition flex items-center gap-1"
                      title="Launch Read-Only View-As-User Preview"
                    >
                      <span>View as User</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <Link
                      href={`/admin/users/${u.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <span>Full Backoffice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </AdminLayout>
  );
}
