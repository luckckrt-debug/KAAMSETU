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
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { CATEGORIES_DATA } from '@/components/PopularCategories';

export default function ServicesPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-forest uppercase tracking-wider bg-forest/5 px-3 py-1 rounded-full">
            All Trade Categories • सभी कार्य श्रेणियां
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-forest tracking-tight">
            Verified Trades & Workforce Services
          </h1>
          <p className="text-text-secondary text-base">
            Choose a skilled trade category to view available certified professionals in your locality with fixed fair wages.
          </p>
        </div>

        {/* Categories Detailed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES_DATA.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.slug}
                className="bg-white rounded-3xl p-7 border border-border hover:border-forest/40 shadow-xs hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${cat.color}`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold text-forest bg-sage-soft px-2.5 py-1 rounded-full">
                      {cat.workerCount}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-forest flex items-baseline gap-2 mb-1">
                    {cat.name}
                    <span className="text-xs text-text-muted font-normal">({cat.nameHi})</span>
                  </h2>

                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    {cat.desc}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-border text-xs text-text-secondary">
                    <div className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                      <span>Same-day emergency & scheduled appointments</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                      <span>Standard diagnostic & replacement toolkits</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Base Rate</span>
                    <span className="text-sm font-black text-forest">{cat.avgRate}</span>
                  </div>

                  <Link
                    href={`/workers?category=${cat.slug}`}
                    className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <span>Browse Workers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
