'use client';

import React from 'react';
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
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const CATEGORIES_DATA = [
  {
    slug: 'electrician',
    name: 'Electrician',
    nameHi: 'बिजली मिस्त्री',
    desc: 'Wiring, MCB tripping, fan fixing, inverter installation, switchboards',
    icon: Zap,
    color: 'text-amber-500 bg-amber-50 border-amber-200',
    workerCount: '1,420+ Verified',
    avgRate: '₹350/hr',
  },
  {
    slug: 'plumber',
    name: 'Plumber',
    nameHi: 'नल मिस्त्री',
    desc: 'Pipe leaks, tap fixing, bathroom fittings, water tank cleaning, pump motor',
    icon: Wrench,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    workerCount: '980+ Verified',
    avgRate: '₹300/hr',
  },
  {
    slug: 'mason',
    name: 'Mason',
    nameHi: 'राज मिस्त्री',
    desc: 'Brickwork, cement plastering, tile/marble flooring, lintel slab casting',
    icon: Hammer,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    workerCount: '2,150+ Verified',
    avgRate: '₹1,000/day',
  },
  {
    slug: 'carpenter',
    name: 'Carpenter',
    nameHi: 'बढ़ई',
    desc: 'Door locks, modular kitchen cabinets, furniture repair, wooden partitions',
    icon: Boxes,
    color: 'text-amber-800 bg-amber-50/80 border-amber-200',
    workerCount: '840+ Verified',
    avgRate: '₹400/hr',
  },
  {
    slug: 'painter',
    name: 'Painter',
    nameHi: 'रंग मिस्त्री',
    desc: 'Interior wall putty, exterior weathercoat, damp proofing, texture art',
    icon: Paintbrush,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    workerCount: '1,120+ Verified',
    avgRate: '₹850/day',
  },
  {
    slug: 'ac-appliance-technician',
    name: 'AC & Appliances',
    nameHi: 'एसी व उपकरण',
    desc: 'Split AC jet cleaning, gas refill, installation, washing machine, fridge repair',
    icon: Fan,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    workerCount: '760+ Verified',
    avgRate: '₹450/visit',
  },
  {
    slug: 'welder',
    name: 'Welder & Fabricator',
    nameHi: 'वेल्डर व फेब्रिकेटर',
    desc: 'Main gates, balcony grills, railings, tin sheds, spot welding repairs',
    icon: ShieldAlert,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    workerCount: '630+ Verified',
    avgRate: '₹950/day',
  },
  {
    slug: 'construction-labour',
    name: 'Labour & Helpers',
    nameHi: 'निर्माण मजदूर (बेलदार)',
    desc: 'Daily wage site helpers, loading/unloading, debris clearing, excavation',
    icon: Users,
    color: 'text-slate-700 bg-slate-100 border-slate-200',
    workerCount: '4,500+ Verified',
    avgRate: '₹600/day',
  },
];

export default function PopularCategories() {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/5 text-forest text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cta" />
              <span>Skill Categories • काम की श्रेणियां</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-forest tracking-tight">
              Popular Service Categories
            </h2>
            <p className="text-base text-text-secondary mt-1">
              Connect directly with verified local tradesmen ready for instant dispatch or scheduled project work.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-bold text-sage hover:text-forest group transition-colors"
          >
            <span>View All 24+ Categories (सभी श्रेणियां देखें)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES_DATA.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/workers?category=${cat.slug}`}
                className="group p-6 rounded-2xl bg-bg border border-border hover:border-forest/50 hover:bg-white hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${cat.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-bold text-text-muted bg-white px-2 py-0.5 rounded-full border border-border">
                      {cat.workerCount}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-forest group-hover:text-cta transition-colors flex items-baseline gap-2">
                    {cat.name}
                    <span className="text-xs text-text-muted font-normal">({cat.nameHi})</span>
                  </h3>

                  <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-muted">
                    Starts from <strong className="text-forest">{cat.avgRate}</strong>
                  </span>
                  <span className="font-bold text-sage group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Book <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
