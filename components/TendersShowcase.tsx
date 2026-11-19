'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, Calendar, Users, ArrowRight, Clock, Building, CheckCircle2 } from 'lucide-react';
import { Tender } from '@/lib/types';

interface TendersShowcaseProps {
  initialTenders?: Tender[];
}

export default function TendersShowcase({ initialTenders }: TendersShowcaseProps) {
  const tenders: Tender[] = initialTenders && initialTenders.length > 0 ? initialTenders : [
    {
      id: 'tender-1',
      contractorProfileId: 'cont-prof-1',
      categoryId: 'cat-mason',
      categoryName: 'Mason',
      title: 'Structural Masonry & Brickwork for Sector 150 Luxury Towers',
      projectName: 'Godrej Palm Retreat Phase 2',
      description: 'Requirement of 20 skilled masons and 30 construction helpers for brickwork, external cement plastering, and balcony flooring over 45 days.',
      locationAddress: 'Plot GH-01, Sector 150 Expressway',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201310',
      siteLatitude: 28.4500,
      siteLongitude: 77.4800,
      workerCountRequired: 20,
      skillsRequired: ['9-inch Brickwork', 'External Sand Plaster', 'Laser Levelling'],
      experienceRequired: 3,
      startDate: '2026-03-01T08:00:00.000Z',
      endDate: '2026-04-15T18:00:00.000Z',
      workingHours: '8 Hours (08:30 AM to 05:30 PM)',
      shifts: 'Day Shift',
      totalBudget: 990000,
      perWorkerRate: 1100,
      paymentTerms: 'Weekly muster-roll settlement with 10% advance upon site onboarding.',
      accommodationProvided: true,
      foodProvided: false,
      transportProvided: true,
      applicationDeadline: '2026-03-01T23:59:59.000Z',
      status: 'PUBLISHED',
      applicationsCount: 4,
      createdAt: '2026-02-10T10:00:00.000Z',
    },
    {
      id: 'tender-2',
      contractorProfileId: 'cont-prof-1',
      categoryId: 'cat-electrician',
      categoryName: 'Electrician',
      title: 'Commercial Office Fitout Cable Tray & DB Installation',
      projectName: 'DLF CyberPark Block C Fitout',
      description: 'Requirement of 8 licensed industrial electricians for heavy cable pulling, distribution panel termination, and emergency UPS circuitry.',
      locationAddress: 'DLF CyberPark, 405 NH-8',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      siteLatitude: 28.4900,
      siteLongitude: 77.0900,
      workerCountRequired: 8,
      skillsRequired: ['LT Panel Termination', 'Cable Tray Fixing', 'Concealed Conduit'],
      experienceRequired: 4,
      startDate: '2026-03-05T09:00:00.000Z',
      endDate: '2026-03-25T19:00:00.000Z',
      workingHours: '9 Hours',
      shifts: 'Day Shift',
      totalBudget: 420000,
      perWorkerRate: 1050,
      paymentTerms: 'Bi-weekly direct bank transfer based on signed site engineer measurements.',
      accommodationProvided: false,
      foodProvided: true,
      transportProvided: false,
      applicationDeadline: '2026-03-01T18:00:00.000Z',
      status: 'PUBLISHED',
      applicationsCount: 2,
      createdAt: '2026-02-12T14:30:00.000Z',
    },
  ];

  return (
    <section className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[#2583D5] text-xs font-bold uppercase tracking-wider mb-3 border border-[#D1E8F8]">
              <Briefcase className="w-3.5 h-3.5 text-[#2583D5]" />
              <span>Commercial Marketplace • सक्रिय कार्य ठेके</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#153451] tracking-tight">
              Active Workforce Tenders
            </h2>
            <p className="text-base sm:text-lg text-[#4B6F8E] mt-2 font-medium">
              Prime contractors and companies hiring verified teams, trade crews, and skilled professionals.
            </p>
          </div>

          <Link
            href="/tenders"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#2583D5] hover:text-[#1E70B8] transition-colors group"
          >
            <span>Browse All Tenders (सभी टेंडर देखें)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Tenders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tenders.map((tender) => (
            <div
              key={tender.id}
              className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group"
            >
              <div>
                {/* Meta Top */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-bold text-[#153451] bg-[#F5FAFF] px-3.5 py-1 rounded-full border border-[#D1E8F8] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#2583D5]" /> {tender.projectName}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Applications Open
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#153451] mb-2 group-hover:text-[#2583D5] transition-colors">
                  <Link href={`/tenders/${tender.id}`}>{tender.title}</Link>
                </h3>

                <p className="text-xs sm:text-sm text-[#4B6F8E] line-clamp-2 leading-relaxed mb-6 font-normal">
                  {tender.description}
                </p>

                {/* Requirements Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6 text-xs font-medium">
                  <div className="bg-white/80 p-3 rounded-2xl border border-[#D1E8F8]">
                    <span className="text-[10px] text-[#7697B3] block font-semibold">Headcount Needed</span>
                    <span className="font-bold text-[#153451] flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-[#2583D5]" /> {tender.workerCountRequired} Workers
                    </span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl border border-[#D1E8F8]">
                    <span className="text-[10px] text-[#7697B3] block font-semibold">Daily Wage</span>
                    <span className="font-black text-[#153451] mt-0.5 block">
                      ₹{tender.perWorkerRate}<span className="text-[10px] font-normal text-[#7697B3]">/day</span>
                    </span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl border border-[#D1E8F8] col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[#7697B3] block font-semibold">Total Budget</span>
                    <span className="font-black text-emerald-600 mt-0.5 block">
                      ₹{(tender.totalBudget / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                </div>

                {/* Location & Dates */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#4B6F8E] mb-6">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2583D5]" /> {tender.city}, {tender.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#2583D5]" /> {tender.workingHours}
                  </span>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="pt-4 border-t border-[#EAF6FF] flex items-center justify-between">
                <span className="text-xs text-[#7697B3]">
                  {tender.applicationsCount} teams applied so far
                </span>
                <Link
                  href={`/tenders/${tender.id}`}
                  className="px-5 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 hover:scale-[1.02]"
                >
                  <span>View Tender Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
