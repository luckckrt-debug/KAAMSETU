'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Wrench, 
  Hammer, 
  Paintbrush, 
  Truck, 
  Building2, 
  Sparkles, 
  Monitor, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  icon: any;
  description: string;
  workerCount: string;
  avgRate: string;
  popularServices: string[];
}

export const MAIN_CATEGORIES: CategoryItem[] = [
  {
    id: 'electrician',
    name: 'Electrician',
    nameHi: 'बिजली मिस्त्री',
    slug: 'electrician',
    icon: Zap,
    description: 'House wiring, switchboards, inverters, circuit breakers, fan fitting, and emergency repairs.',
    workerCount: '1,420+ Verified',
    avgRate: '₹350/hr',
    popularServices: ['Concealed Wiring', 'Inverter Setup', 'MCB Box']
  },
  {
    id: 'plumber',
    name: 'Plumber',
    nameHi: 'नल मिस्त्री',
    slug: 'plumber',
    icon: Wrench,
    description: 'Pipe leaks, sanitary fittings, overhead tank sanitation, water motor, and drainage fixing.',
    workerCount: '980+ Verified',
    avgRate: '₹300/hr',
    popularServices: ['Pipe Leakage', 'Water Motor', 'Bathroom Fittings']
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    nameHi: 'बढ़ई / कारपेंटर',
    slug: 'carpenter',
    icon: Hammer,
    description: 'Custom furniture, door & window frames, wood polishing, modular kitchen, and lock repair.',
    workerCount: '1,150+ Verified',
    avgRate: '₹400/hr',
    popularServices: ['Door Repairs', 'Modular Kitchen', 'Furniture Polish']
  },
  {
    id: 'painter',
    name: 'Painter',
    nameHi: 'पेंटर / रंग मिस्त्री',
    slug: 'painter',
    icon: Paintbrush,
    description: 'Interior & exterior wall painting, wall putty, waterproof coatings, texture, and stencil art.',
    workerCount: '870+ Verified',
    avgRate: '₹850/day',
    popularServices: ['Interior Walls', 'Wall Putty', 'Waterproofing']
  },
  {
    id: 'delivery',
    name: 'Delivery',
    nameHi: 'डिलीवरी पार्टनर',
    slug: 'delivery',
    icon: Truck,
    description: 'Hyperlocal delivery partners, courier logistics, van drivers, and heavy vehicle transport.',
    workerCount: '2,300+ Verified',
    avgRate: '₹750/day',
    popularServices: ['Hyperlocal Delivery', 'Van Transport', 'E-commerce']
  },
  {
    id: 'construction',
    name: 'Construction',
    nameHi: 'निर्माण श्रमिक',
    slug: 'construction',
    icon: Building2,
    description: 'Masons (Raj Mistri), concrete slab casting, tile & marble fitting, rebar, and daily wage labour.',
    workerCount: '3,450+ Verified',
    avgRate: '₹1,050/day',
    popularServices: ['Brickwork', 'Tile & Marble', 'Daily Labour']
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    nameHi: 'हाउसकीपिंग व सफाई',
    slug: 'housekeeping',
    icon: Sparkles,
    description: 'Residential deep cleaning, office sanitation, sofa & carpet shampooing, and domestic help.',
    workerCount: '1,620+ Verified',
    avgRate: '₹499/visit',
    popularServices: ['Deep Cleaning', 'Bathroom Wash', 'Sofa Shampoo']
  },
  {
    id: 'computer-operator',
    name: 'Computer Operator',
    nameHi: 'कंप्यूटर ऑपरेटर',
    slug: 'computer-operator',
    icon: Monitor,
    description: 'Data entry specialists, GST billing operators, MS Office assistants, and front desk office staff.',
    workerCount: '780+ Verified',
    avgRate: '₹600/day',
    popularServices: ['Data Entry', 'Tally / Billing', 'Excel Reports']
  },
  {
    id: 'other',
    name: 'Other Services',
    nameHi: 'अन्य कुशल सेवाएं',
    slug: 'other',
    icon: Layers,
    description: 'Welders, AC mechanics, gardeners, solar engineers, security guards, and event workforce.',
    workerCount: '1,950+ Verified',
    avgRate: '₹450/hr',
    popularServices: ['AC Servicing', 'Welding Fabrication', 'Gardening']
  }
];

export default function CategoriesSection() {
  return (
    <section className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-[#2583D5] bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D1E8F8] inline-block shadow-xs">
            POPULAR WORKFORCE SECTORS • श्रेणियां
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#153451] tracking-tight">
            Explore Workforce Categories
          </h2>
          <p className="text-base sm:text-lg text-[#4B6F8E] font-medium leading-relaxed">
            Find skilled, background-checked Indian professionals across 9 core industry disciplines with transparent pricing and live availability.
          </p>
        </div>

        {/* 9 Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {MAIN_CATEGORIES.map((cat) => {
            return (
              <div
                key={cat.id}
                className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between group"
              >
                <div>
                  {/* Title & Description */}
                  <div className="mb-3">
                    <h3 className="text-xl font-black text-[#153451] group-hover:text-[#2583D5] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#7697B3] mt-0.5">{cat.nameHi}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#4B6F8E] leading-relaxed mb-5 font-normal">
                    {cat.description}
                  </p>

                  {/* Popular Service Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {cat.popularServices.map((service, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold text-[#153451] bg-[#F5FAFF] border border-[#D1E8F8] px-2.5 py-0.5 rounded-lg"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Rate + Button */}
                <div className="pt-4 border-t border-[#EAF6FF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#7697B3] font-bold block uppercase tracking-wider">Starting from</span>
                    <span className="text-base font-black text-[#153451]">{cat.avgRate}</span>
                  </div>

                  <Link
                    href={`/workers?category=${cat.slug}`}
                    className="px-4 py-2 rounded-xl bg-white/90 group-hover:bg-[#2583D5] text-[#153451] group-hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-[#D1E8F8] group-hover:border-[#2583D5] shadow-xs group-hover:shadow-md"
                  >
                    <span>View Workers</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center font-black text-xl shrink-0 border border-[#D1E8F8]">
              ⚡
            </div>
            <div>
              <h4 className="text-lg font-black text-[#153451]">Need a Specialized Trade or Bulk Crew?</h4>
              <p className="text-xs sm:text-sm text-[#4B6F8E] mt-0.5">Explore 22+ verified industrial trades, commercial construction crews, and contractor tenders.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/services"
              className="px-5 py-2.5 rounded-xl border border-[#D1E8F8] text-xs font-bold text-[#153451] bg-white/90 hover:bg-white hover:border-[#2583D5] transition"
            >
              All 22+ Professions
            </Link>
            <Link
              href="/contractor"
              className="px-5 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold shadow-md shadow-[#2583D5]/20 transition"
            >
              Bulk Workforce Hiring
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
