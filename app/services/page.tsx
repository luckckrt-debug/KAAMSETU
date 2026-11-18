'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Search,
  Sparkles,
  Clock,
  Wrench,
  Filter
} from 'lucide-react';
import { CATEGORIES_DATA } from '@/components/PopularCategories';

export default function ServicesPage() {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sectors = ['All', 'Home & Domestic', 'Construction', 'Engineering & Solar', 'Transport & Machinery', 'Facility & Security', 'Agri & Events'];

  const filtered = useMemo(() => {
    return CATEGORIES_DATA.filter((cat) => {
      const matchSector = selectedSector === 'All' || cat.sector === selectedSector;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = 
        !q ||
        cat.name.toLowerCase().includes(q) ||
        cat.nameHi.includes(q) ||
        cat.desc.toLowerCase().includes(q) ||
        cat.popularSkills.some(s => s.toLowerCase().includes(q));
      return matchSector && matchQuery;
    });
  }, [selectedSector, searchQuery]);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/5 text-forest text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cta" />
            <span>Complete Workforce Directory • सभी कार्य श्रेणियां</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-forest tracking-tight">
            Verified Trades & Workforce Services
          </h1>
          <p className="text-text-secondary text-base sm:text-lg">
            Choose from 22+ professional trades across India. All workers undergo Aadhaar identity check, skill testing, and adhere to fixed, fair platform wages.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-lg mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trade, skill (e.g. Electrician, Solar, JCB, Marble)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-white text-sm font-semibold text-forest shadow-xs focus:outline-none focus:border-forest"
              />
            </div>
          </div>
        </div>

        {/* Sector Filter Bar */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {sectors.map((sector) => {
            const count = sector === 'All' 
              ? CATEGORIES_DATA.length 
              : CATEGORIES_DATA.filter(c => c.sector === sector).length;
            const active = selectedSector === sector;
            return (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  active 
                    ? 'bg-forest text-lime shadow-sm' 
                    : 'bg-white hover:bg-forest/5 text-text-secondary border border-border'
                }`}
              >
                <span>{sector}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-forest-light text-lime' : 'bg-bg text-text-muted'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Categories Detailed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-border hover:border-forest/40 shadow-xs hover:shadow-card transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Header */}
                <div className="relative h-44 bg-forest/5 overflow-hidden">
                  {cat.coverImage ? (
                    <img 
                      src={cat.coverImage} 
                      alt={cat.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="w-12 h-12 text-forest/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-forest shadow-xs">
                      {cat.sector}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <h2 className="text-xl font-black leading-tight drop-shadow-sm">
                        {cat.name}
                      </h2>
                      <span className="text-xs text-lime font-bold">({cat.nameHi})</span>
                    </div>
                    <span className="text-xs font-bold text-lime bg-forest px-2.5 py-1 rounded-full">
                      {cat.workerCount}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-text-secondary leading-relaxed mb-4">
                      {cat.desc}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-border text-xs text-text-secondary">
                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                        <span>Instant dispatch & scheduled bookings</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-forest shrink-0" />
                        <span>100% Aadhaar & background verified</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {cat.popularSkills.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-bg text-text-secondary border border-border"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase font-bold block">Standard Wage</span>
                      <div className="text-sm font-black text-forest">
                        {cat.avgRate} <span className="text-xs text-text-muted font-normal">• {cat.dailyRate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/workers?category=${cat.slug}`}
                        className="px-3.5 py-2 rounded-xl bg-bg hover:bg-forest hover:text-lime text-forest text-xs font-bold transition-all border border-border"
                      >
                        Workers
                      </Link>
                      <Link
                        href={`/booking/new?category=${cat.id}`}
                        className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
