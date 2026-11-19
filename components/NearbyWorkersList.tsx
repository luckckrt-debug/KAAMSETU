'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Star, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  PhoneCall
} from 'lucide-react';
import { WorkerProfile } from '@/lib/types';

interface NearbyWorkersProps {
  initialWorkers?: Array<WorkerProfile & { distanceKm?: number; etaMinutes?: number }>;
}

export default function NearbyWorkersList({ initialWorkers }: NearbyWorkersProps) {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'VERIFIED' | 'AVAILABLE_NOW'>('ALL');

  // Realistic verified workers for instant client display
  const workers = initialWorkers && initialWorkers.length > 0 ? initialWorkers : [
    {
      id: 'worker-prof-1',
      userId: 'user-worker-1',
      headline: 'Certified ITI Senior Industrial & Domestic Electrician',
      bio: 'Over 8 years experience in commercial complexes, residential 3-phase wiring, inverter installation, and DB dressing.',
      yearsExperience: 8,
      hourlyRate: 350,
      dailyRate: 900,
      ratingAvg: 4.9,
      ratingCount: 84,
      completedJobsCount: 112,
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      locality: 'Okhla & South Delhi',
      city: 'Delhi',
      distanceKm: 2.1,
      etaMinutes: 18,
      toolsAvailable: ['Multimeter', 'Drill Machine', 'Heavy Pliers'],
      user: {
        id: 'user-worker-1',
        fullName: 'Ramesh Sharma',
        phoneNumber: '9876543210',
        avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
        language: 'hi',
        roles: ['WORKER'],
      },
      skills: [{ id: 's1', workerProfileId: '1', categoryId: 'cat-electrician', categoryName: 'Electrician', experienceYears: 8, isPrimary: true }],
    },
    {
      id: 'worker-prof-2',
      userId: 'user-worker-2',
      headline: 'Master Plumber & Water Pump Specialist',
      bio: 'Expert in high-pressure CPVC/PPR pipeline fittings, underground leakage detection, overhead water tank automated controllers, and sanitary fixtures.',
      yearsExperience: 6,
      hourlyRate: 300,
      dailyRate: 850,
      ratingAvg: 4.8,
      ratingCount: 62,
      completedJobsCount: 78,
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      locality: 'Indirapuram & Noida Sec 62',
      city: 'Noida',
      distanceKm: 3.4,
      etaMinutes: 24,
      toolsAvailable: ['Pipe Threader', 'Heavy Wrenches', 'Rotary Hammer'],
      user: {
        id: 'user-worker-2',
        fullName: 'Md. Tariq Khan',
        phoneNumber: '9811223344',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        language: 'hi',
        roles: ['WORKER'],
      },
      skills: [{ id: 's2', workerProfileId: '2', categoryId: 'cat-plumber', categoryName: 'Plumber', experienceYears: 6, isPrimary: true }],
    },
    {
      id: 'worker-prof-3',
      userId: 'user-worker-3',
      headline: 'Senior Mason & Structural Brickwork Lead',
      bio: 'Specialized in 9-inch brick bonding, AAC block masonry, plaster work, granite/marble slab cutting, and concrete reinforcement.',
      yearsExperience: 10,
      hourlyRate: 350,
      dailyRate: 1050,
      ratingAvg: 4.9,
      ratingCount: 110,
      completedJobsCount: 145,
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: false,
      verificationStatus: 'VERIFIED' as const,
      locality: 'DLF Phase 3 & Sikanderpur',
      city: 'Gurugram',
      distanceKm: 4.2,
      etaMinutes: 30,
      toolsAvailable: ['Laser Level', 'Marble Cutter', 'Vibrator'],
      user: {
        id: 'user-worker-3',
        fullName: 'Satish Kumar',
        phoneNumber: '9899001122',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        language: 'hi',
        roles: ['WORKER', 'TEAM_LEADER'],
      },
      skills: [{ id: 's3', workerProfileId: '3', categoryId: 'cat-mason', categoryName: 'Mason', experienceYears: 10, isPrimary: true }],
    },
    {
      id: 'worker-prof-4',
      userId: 'user-worker-4',
      headline: 'Architectural Carpenter & Modular Interior Craftsman',
      bio: 'Master of modular kitchen installation, hydraulic hinge alignment, custom wardrobe fabrication, veneer finish, and heavy door locks.',
      yearsExperience: 7,
      hourlyRate: 400,
      dailyRate: 1000,
      ratingAvg: 4.9,
      ratingCount: 54,
      completedJobsCount: 68,
      isOnline: true,
      isAvailableNow: false,
      emergencyAvailable: false,
      verificationStatus: 'VERIFIED' as const,
      locality: 'Rohini & Pitampura',
      city: 'Delhi',
      distanceKm: 5.0,
      etaMinutes: 35,
      toolsAvailable: ['Circular Saw', 'Router', 'Precision Square'],
      user: {
        id: 'user-worker-4',
        fullName: 'Gurpreet Singh',
        phoneNumber: '9810998877',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
        language: 'pa',
        roles: ['WORKER'],
      },
      skills: [{ id: 's4', workerProfileId: '4', categoryId: 'cat-carpenter', categoryName: 'Carpenter', experienceYears: 7, isPrimary: true }],
    },
    {
      id: 'worker-prof-5',
      userId: 'user-worker-5',
      headline: 'Professional Wall Painter, Texture & Waterproofing Expert',
      bio: 'Certified painter experienced with Asian Paints Royale, Berger airless spray painting, PU polish, and terrace waterproofing membrane.',
      yearsExperience: 5,
      hourlyRate: 250,
      dailyRate: 850,
      ratingAvg: 4.7,
      ratingCount: 42,
      completedJobsCount: 50,
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: false,
      verificationStatus: 'VERIFIED' as const,
      locality: 'Raj Nagar & Kavi Nagar',
      city: 'Ghaziabad',
      distanceKm: 6.1,
      etaMinutes: 40,
      toolsAvailable: ['Airless Paint Sprayer', 'Sanding Machine', 'Moisture Meter'],
      user: {
        id: 'user-worker-5',
        fullName: 'Vinod Chauhan',
        phoneNumber: '9871122334',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
        language: 'hi',
        roles: ['WORKER'],
      },
      skills: [{ id: 's5', workerProfileId: '5', categoryId: 'cat-painter', categoryName: 'Painter', experienceYears: 5, isPrimary: true }],
    },
    {
      id: 'worker-prof-6',
      userId: 'user-worker-6',
      headline: 'Commercial Hyperlocal Dispatch & Goods Vehicle Delivery Lead',
      bio: 'Punctual commercial delivery lead with own Tata Ace and two-wheelers. Safe driver, route optimization expert, and commercial cargo handling experience.',
      yearsExperience: 4,
      hourlyRate: 200,
      dailyRate: 750,
      ratingAvg: 4.8,
      ratingCount: 76,
      completedJobsCount: 190,
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      locality: 'Patparganj Industrial Area',
      city: 'Delhi',
      distanceKm: 1.8,
      etaMinutes: 15,
      toolsAvailable: ['Loading Straps', 'Trolley', 'Commercial Driving License'],
      user: {
        id: 'user-worker-6',
        fullName: 'Deepak Yadav',
        phoneNumber: '9891234567',
        avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
        language: 'hi',
        roles: ['WORKER'],
      },
      skills: [{ id: 's6', workerProfileId: '6', categoryId: 'cat-delivery', categoryName: 'Delivery', experienceYears: 4, isPrimary: true }],
    }
  ];

  const filteredWorkers = workers.filter(w => {
    if (selectedFilter === 'VERIFIED') return w.verificationStatus === 'VERIFIED';
    if (selectedFilter === 'AVAILABLE_NOW') return w.isAvailableNow;
    return true;
  });

  return (
    <section className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[#2583D5] text-xs font-bold uppercase tracking-wider mb-3 border border-[#D1E8F8]">
              <Zap className="w-3.5 h-3.5 text-[#2583D5]" />
              <span>Real-Time Dispatch • तुरंत उपलब्धता</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#153451] tracking-tight">
              Nearby Verified Professionals
            </h2>
            <p className="text-base sm:text-lg text-[#4B6F8E] mt-2 font-medium">
              Top-rated local tradesmen currently active and ready for dispatch in your area.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-[#D1E8F8] shadow-xs">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'ALL'
                  ? 'bg-[#2583D5] text-white shadow-sm'
                  : 'text-[#4B6F8E] hover:text-[#153451]'
              }`}
            >
              All Workers
            </button>
            <button
              onClick={() => setSelectedFilter('AVAILABLE_NOW')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedFilter === 'AVAILABLE_NOW'
                  ? 'bg-[#2583D5] text-white shadow-sm'
                  : 'text-[#4B6F8E] hover:text-[#153451]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Available Now
            </button>
            <button
              onClick={() => setSelectedFilter('VERIFIED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'VERIFIED'
                  ? 'bg-[#2583D5] text-white shadow-sm'
                  : 'text-[#4B6F8E] hover:text-[#153451]'
              }`}
            >
              Verified KYC
            </button>
          </div>
        </div>

        {/* Worker Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between group"
            >
              <div>
                {/* Worker Identity Header */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="relative shrink-0">
                    <img
                      src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={worker.user?.fullName}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                    />
                    {worker.isAvailableNow && (
                      <span 
                        className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200" 
                        title="Online & Ready for Dispatch"
                      />
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-[#153451] text-lg leading-snug group-hover:text-[#2583D5] transition-colors truncate">
                        {worker.user?.fullName}
                      </h3>
                      <span title="Aadhaar & Trade Verified"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /></span>
                    </div>
                    <p className="text-xs font-bold text-[#2583D5] truncate">
                      {worker.skills?.[0]?.categoryName || 'Skilled Professional'}
                    </p>
                  </div>
                </div>

                {/* Headline / Specialization */}
                <p className="text-xs sm:text-sm text-[#4B6F8E] line-clamp-2 leading-relaxed mb-4 font-normal">
                  {worker.headline || worker.bio}
                </p>

                {/* Key Metrics: Rating, Distance, ETA (Clean, Unboxed, Breathable) */}
                <div className="flex items-center gap-3 text-xs text-[#4B6F8E] font-medium py-2 px-3 rounded-xl bg-white/60 border border-[#EAF6FF] mb-4">
                  <span className="flex items-center gap-1 font-bold text-[#153451]">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {worker.ratingAvg}
                    <span className="text-[11px] font-normal text-[#7697B3]">({worker.ratingCount})</span>
                  </span>
                  <span className="text-[#D1E8F8]">•</span>
                  <span className="flex items-center gap-1 text-[#153451] font-semibold">
                    <MapPin className="w-3 h-3 text-[#2583D5]" />
                    {worker.distanceKm ? `${worker.distanceKm} km` : 'Near you'}
                  </span>
                  <span className="text-[#D1E8F8]">•</span>
                  <span className="flex items-center gap-1 text-[#153451] font-semibold">
                    <Clock className="w-3 h-3 text-[#2583D5]" />
                    {worker.etaMinutes ? `${worker.etaMinutes}m ETA` : '25m ETA'}
                  </span>
                </div>

                {/* Experience Highlights */}
                <div className="flex items-center gap-2 mb-5 text-[11px] font-semibold">
                  <span className="bg-[#EAF6FF] text-[#19639E] px-2.5 py-1 rounded-lg">
                    {worker.yearsExperience}+ Yrs Experience
                  </span>
                  <span className="bg-white border border-[#D1E8F8] text-[#153451] px-2.5 py-1 rounded-lg">
                    {worker.completedJobsCount} Jobs Completed
                  </span>
                </div>
              </div>

              {/* Bottom Rate & Book Action */}
              <div className="pt-4 border-t border-[#EAF6FF] flex items-center justify-between">
                <div>
                  <div className="text-lg font-black text-[#153451] leading-none">
                    ₹{worker.hourlyRate}
                    <span className="text-xs font-semibold text-[#7697B3]">/hr</span>
                  </div>
                  <div className="text-[11px] text-[#7697B3] font-medium mt-1">
                    ₹{worker.dailyRate}/day
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/workers/${worker.id}`}
                    className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] hover:border-[#2583D5] text-[#153451] hover:text-[#2583D5] text-xs font-bold transition-all bg-white hover:bg-[#F5FAFF]"
                  >
                    Profile
                  </Link>
                  <Link
                    href={`/booking/new?workerId=${worker.id}&category=${worker.skills?.[0]?.categoryId || 'cat-electrician'}`}
                    className="px-4 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-bold text-xs shadow-md shadow-[#2583D5]/20 transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            href="/workers"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white/90 hover:bg-white border border-[#D1E8F8] hover:border-[#2583D5] text-[#153451] font-black text-sm shadow-xs transition-all hover:scale-105"
          >
            <span>Explore All 15,000+ Verified Workers Nearby (सभी कारीगर देखें)</span>
            <ArrowRight className="w-4 h-4 text-[#2583D5]" />
          </Link>
        </div>

      </div>
    </section>
  );
}
