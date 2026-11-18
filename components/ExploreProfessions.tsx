'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Wrench, 
  Hammer, 
  Boxes, 
  Paintbrush, 
  Fan, 
  ShieldAlert, 
  Users, 
  ClipboardCheck, 
  Sparkles, 
  Truck, 
  Shield, 
  TreePine, 
  Car, 
  Package, 
  Layers, 
  PartyPopper, 
  ArrowRight, 
  Search, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { getAllProfessions, getProfessionSectors, ProfessionData } from '@/lib/professions';

// Icon mapper
function getProfessionIcon(iconName: string) {
  switch (iconName) {
    case 'Zap': return Zap;
    case 'Wrench': return Wrench;
    case 'Hammer': return Hammer;
    case 'Boxes': return Boxes;
    case 'Paintbrush': return Paintbrush;
    case 'Fan': return Fan;
    case 'ShieldAlert': return ShieldAlert;
    case 'Users': return Users;
    case 'ClipboardCheck': return ClipboardCheck;
    case 'Sparkles': return Sparkles;
    case 'Truck': return Truck;
    case 'Shield': return Shield;
    case 'TreePine': return TreePine;
    case 'Car': return Car;
    case 'Package': return Package;
    case 'Layers': return Layers;
    case 'PartyPopper': return PartyPopper;
    default: return Wrench;
  }
}

export default function ExploreProfessions() {
  const [selectedSector, setSelectedSector] = useState<string>('All Sectors');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const professions = getAllProfessions();
  const sectors = getProfessionSectors();

  const filtered = useMemo(() => {
    return professions.filter((p) => {
      const matchSector = selectedSector === 'All Sectors' || p.sector === selectedSector;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.nameHi.includes(q) ||
        p.slug.includes(q) ||
        p.popularSkills.some((s) => s.toLowerCase().includes(q));
      return matchSector && matchQuery;
    });
  }, [professions, selectedSector, searchQuery]);

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-border" id="explore-professions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header as requested */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/5 text-forest text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-cta" />
              <span>Dedicated Profession Portals • व्यवसाय अनुसार खोज</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-forest tracking-tight">
              EXPLORE PROFESSIONS
            </h2>
            <p className="text-base sm:text-lg text-text-secondary mt-2">
              Find skilled professionals for every kind of work. Click any profession to explore dedicated profiles, specialized search, and fair wage rates.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 25 professions & skills..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold text-forest focus:outline-none focus:border-forest"
            />
          </div>
        </div>

        {/* Sector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {sectors.map((sector) => {
            const count = sector === 'All Sectors' 
              ? professions.length 
              : professions.filter((p) => p.sector === sector).length;
            const active = selectedSector === sector;
            return (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  active 
                    ? 'bg-forest text-lime shadow-sm' 
                    : 'bg-bg hover:bg-forest/5 text-text-secondary border border-border'
                }`}
              >
                <span>{sector}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-forest-light text-lime' : 'bg-white text-text-muted'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Professions Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((prof) => {
            const Icon = getProfessionIcon(prof.iconName);
            return (
              <Link
                key={prof.slug}
                href={`/profession/${prof.slug}`}
                className="group rounded-3xl bg-bg border border-border hover:border-forest/50 hover:bg-white hover:shadow-card transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Image Header */}
                <div className="relative h-36 overflow-hidden bg-forest/5">
                  <img
                    src={prof.coverImage}
                    alt={prof.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  
                  {/* Sector Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-forest">
                      {prof.sector}
                    </span>
                  </div>

                  {/* Worker Count */}
                  <div className="absolute bottom-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest text-lime">
                      {prof.workerCountEstimate}
                    </span>
                  </div>

                  {/* Title on Image */}
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-base font-black leading-tight drop-shadow-sm group-hover:text-lime transition-colors">
                      {prof.name}
                    </h3>
                    <span className="text-xs text-lime-light font-bold">({prof.nameHi})</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {prof.intro}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {prof.popularSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-text-muted border border-border"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase font-bold block">Base Rate</span>
                      <span className="font-black text-forest">₹{prof.baseHourlyRate}/hr</span>
                    </div>

                    <span className="font-bold text-sage group-hover:text-forest group-hover:translate-x-1 transition-all flex items-center gap-1">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
