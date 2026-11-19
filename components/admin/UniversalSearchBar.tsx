'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Phone, User, ShieldCheck, ArrowRight, X } from 'lucide-react';

export default function UniversalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global shortcut (Ctrl+K or /) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement !== inputRef.current)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setResults(data.results);
          setIsOpen(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectUser = (userId: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/admin/users/${userId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/admin/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="w-4 h-4 text-[#7697B3] absolute left-3.5 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Universal Search: Phone 98XXXXXXXX, User ID, Name, Email... (Ctrl+K)"
          className="w-full pl-10 pr-24 py-2.5 rounded-2xl border border-[#D1E8F8] bg-white/90 text-xs text-[#153451] font-semibold placeholder:text-[#7697B3] focus:outline-none focus:border-[#2583D5] focus:bg-white focus:ring-2 focus:ring-[#2583D5]/15 transition shadow-xs"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {loading && <Loader2 className="w-3.5 h-3.5 text-[#2583D5] animate-spin" />}
          {query && !loading && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
              className="text-[#7697B3] hover:text-[#153451]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-bold text-[#7697B3] bg-[#F5FAFF] border border-[#D1E8F8] px-1.5 py-0.5 rounded-md">
            Ctrl+K
          </span>
        </div>
      </form>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-[#D1E8F8] shadow-2xl overflow-hidden z-50 divide-y divide-[#EAF6FF]">
          
          <div className="p-3 bg-[#F5FAFF]/80 flex items-center justify-between text-[11px] font-bold text-[#4B6F8E]">
            <span>Search Results ({results.length})</span>
            <button
              onClick={handleSubmit}
              className="text-[#2583D5] hover:underline flex items-center gap-1"
            >
              <span>View all on Search Page</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#EAF6FF]">
            {results.length === 0 ? (
              <div className="p-5 text-center text-xs text-[#7697B3]">
                No users found matching &quot;{query}&quot;. Try a different mobile number or ID.
              </div>
            ) : (
              results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-[#F5FAFF] transition text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF6FF] text-[#2583D5] font-black flex items-center justify-center text-xs shrink-0 border border-[#D1E8F8]">
                      {user.fullName?.charAt(0) || 'U'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-[#153451] text-xs truncate group-hover:text-[#2583D5]">
                          {user.fullName}
                        </span>
                        {user.kycStatus === 'VERIFIED' && (
                          <span title="KYC Verified"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /></span>
                        )}
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md bg-[#EAF6FF] text-[#2583D5] border border-[#D1E8F8]">
                          {user.primaryRole}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#7697B3] mt-0.5 font-medium">
                        <span className="flex items-center gap-0.5 text-[#153451] font-semibold">
                          <Phone className="w-2.5 h-2.5 text-[#2583D5]" />
                          +91 {user.phoneNumber}
                        </span>
                        <span>•</span>
                        <span className="truncate">{user.city || 'Delhi NCR'}</span>
                        {user.trade && (
                          <>
                            <span>•</span>
                            <span className="text-[#2583D5] truncate">{user.trade}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#7697B3] group-hover:text-[#2583D5] group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </button>
              ))
            )}
          </div>

          <div className="p-2.5 bg-[#F5FAFF] text-center text-[10px] text-[#7697B3]">
            Press Enter to perform deep ecosystem search
          </div>

        </div>
      )}
    </div>
  );
}
