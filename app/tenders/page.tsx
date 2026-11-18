'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  Building, 
  CheckCircle2, 
  ArrowRight,
  PlusCircle,
  Search,
  Filter
} from 'lucide-react';
import { Tender } from '@/lib/types';

export default function TendersMarketplacePage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');

  const fetchTenders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (city) params.set('city', city);

    try {
      const res = await fetch(`/api/tenders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let list = data.tenders || [];
        if (search) {
          const q = search.toLowerCase();
          list = list.filter((t: any) => 
            t.title.toLowerCase().includes(q) ||
            t.projectName.toLowerCase().includes(q) ||
            t.categoryName?.toLowerCase().includes(q)
          );
        }
        setTenders(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, [city]);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-border shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/5 text-forest text-xs font-bold uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5 text-cta" />
              <span>Bulk Workforce & Contracts • सक्रिय टेंडर</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-forest tracking-tight">
              Workforce Tender Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Commercial projects hiring skilled crews, brigades, and verified tradesmen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tenders/create"
              className="px-5 py-3 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish New Tender (टेंडर जारी करें)</span>
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="w-5 h-5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTenders()}
              placeholder="Search by project name, trade or requirements (e.g. Godrej, Masons)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white text-sm font-semibold focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-xs font-bold text-forest focus:outline-none focus:border-forest"
            >
              <option value="">All Indian Cities (सभी शहर)</option>
              <option value="Noida">Noida & Greater Noida</option>
              <option value="Gurugram">Gurugram & Manesar</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Mumbai">Mumbai & Thane</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
            </select>
          </div>
        </div>

        {/* Tenders Grid */}
        {loading ? (
          <div className="p-12 text-center text-text-muted font-bold bg-white rounded-3xl border border-border">
            Loading active workforce tenders...
          </div>
        ) : tenders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-border space-y-2">
            <p className="text-forest font-bold text-base">No tenders matching this filter.</p>
            <p className="text-xs text-text-muted">Check back soon or create a custom workforce tender.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-white rounded-3xl border border-border hover:border-forest/40 p-6 sm:p-8 shadow-xs hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-forest bg-sage-soft px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-sage" /> {tender.projectName}
                    </span>
                    <span className="text-xs font-bold text-status-success bg-status-successSoft px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-ping"></span>
                      Open for Bids
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-forest mb-2">
                    <Link href={`/tenders/${tender.id}`} className="hover:text-cta transition-colors">
                      {tender.title}
                    </Link>
                  </h2>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-5">
                    {tender.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-bg rounded-2xl border border-border text-center text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-text-muted block font-semibold">Crew Required</span>
                      <span className="font-black text-forest flex items-center justify-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-sage" /> {tender.workerCountRequired}
                      </span>
                    </div>
                    <div className="border-x border-border">
                      <span className="text-[10px] text-text-muted block font-semibold">Daily Wage</span>
                      <span className="font-black text-forest block mt-0.5">
                        ₹{tender.perWorkerRate}<span className="text-[10px] font-normal text-text-muted">/day</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block font-semibold">Total Budget</span>
                      <span className="font-black text-cta block mt-0.5">
                        ₹{tender.totalBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary pb-4 border-b border-border">
                    <span className="flex items-center gap-1 font-semibold text-text-primary">
                      <MapPin className="w-3.5 h-3.5 text-sage" /> {tender.city}, {tender.state}
                    </span>
                    {tender.accommodationProvided && (
                      <span className="text-status-success font-semibold">✓ Free Stay</span>
                    )}
                    {tender.transportProvided && (
                      <span className="text-status-success font-semibold">✓ Site Cab</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-[11px] text-text-muted flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Closes {new Date(tender.applicationDeadline).toLocaleDateString('en-IN')}
                  </span>

                  <Link
                    href={`/tenders/${tender.id}`}
                    className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
