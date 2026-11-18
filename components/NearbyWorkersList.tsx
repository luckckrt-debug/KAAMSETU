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
      bio: 'Expert in CPVC/UPVC concealed pipe fittings, grohe/jaquar bathroom installations, motor repair, and overhead tank pipelines.',
      yearsExperience: 6,
      hourlyRate: 300,
      dailyRate: 850,
      ratingAvg: 4.8,
      ratingCount: 62,
      completedJobsCount: 89,
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      locality: 'Sector 18 & Central Noida',
      city: 'Noida',
      distanceKm: 3.4,
      etaMinutes: 24,
      toolsAvailable: ['Pipe Threader', 'Wrench Set', 'Pressure Pump'],
      user: {
        id: 'user-worker-2',
        fullName: 'Murtaza Ali',
        phoneNumber: '9812345678',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        language: 'hi',
        roles: ['WORKER'],
      },
      skills: [{ id: 's2', workerProfileId: '2', categoryId: 'cat-plumber', categoryName: 'Plumber', experienceYears: 6, isPrimary: true }],
    },
    {
      id: 'worker-prof-4',
      userId: 'user-worker-4',
      headline: 'HVAC Split AC Specialist & Appliance Technician',
      bio: 'Trained technician for Daikin, Voltas, LG, and Blue Star ACs. Gas charging (R32/R410), PCB board repair, jet chemical wash.',
      yearsExperience: 5,
      hourlyRate: 350,
      dailyRate: 900,
      ratingAvg: 4.7,
      ratingCount: 48,
      completedJobsCount: 71,
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      locality: 'Dwarka Sector 10',
      city: 'Delhi',
      distanceKm: 4.8,
      etaMinutes: 30,
      toolsAvailable: ['Vacuum Pump', 'Manifold Gauge', 'Jet Pump'],
      user: {
        id: 'user-worker-4',
        fullName: 'Dinesh Yadav',
        phoneNumber: '9711223344',
        avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
        language: 'hi',
        roles: ['WORKER'],
      },
      skills: [{ id: 's4', workerProfileId: '4', categoryId: 'cat-ac-tech', categoryName: 'AC Technician', experienceYears: 5, isPrimary: true }],
    },
    {
      id: 'worker-prof-5',
      userId: 'user-worker-5',
      headline: 'NISE Suryamitra Certified Rooftop Solar PV & Inverter Engineer',
      bio: 'Expert in rooftop solar panel installations (3kW to 50kW), net metering, microinverters, and high-efficiency lithium battery setups.',
      yearsExperience: 7,
      hourlyRate: 500,
      dailyRate: 1400,
      ratingAvg: 4.9,
      ratingCount: 56,
      completedJobsCount: 78,
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      locality: 'Sector 62 Institutional',
      city: 'Noida',
      distanceKm: 2.8,
      etaMinutes: 20,
      toolsAvailable: ['DC Clamp Meter', 'Solar Crimping Tool', 'MC4 Spanner'],
      user: {
        id: 'user-worker-5',
        fullName: 'Arjun Verma',
        phoneNumber: '9871112233',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
        language: 'hi',
        roles: ['WORKER'],
      },
      skills: [{ id: 's5', workerProfileId: '5', categoryId: 'cat-solar-tech', categoryName: 'Solar Engineer', experienceYears: 7, isPrimary: true }],
    },
    {
      id: 'worker-prof-6',
      userId: 'user-worker-6',
      headline: 'Licensed Heavy Excavator & JCB 3DX Backhoe Operator',
      bio: 'Over 10 years experience operating JCB 3DX, Tata Hitachi tracked excavators, and hydra cranes on high-rise foundation and trenching projects.',
      yearsExperience: 10,
      hourlyRate: 500,
      dailyRate: 1500,
      ratingAvg: 4.8,
      ratingCount: 74,
      completedJobsCount: 92,
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: false,
      verificationStatus: 'VERIFIED' as const,
      locality: 'IMT Manesar',
      city: 'Gurugram',
      distanceKm: 5.2,
      etaMinutes: 35,
      toolsAvailable: ['Heavy Diagnostic Scanner', 'Laser Receiver', 'Safety Harness'],
      user: {
        id: 'user-worker-6',
        fullName: 'Gurpreet Singh',
        phoneNumber: '9810009988',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
        language: 'hi',
        roles: ['WORKER'],
      },
      skills: [{ id: 's6', workerProfileId: '6', categoryId: 'cat-heavy-machinery', categoryName: 'JCB Operator', experienceYears: 10, isPrimary: true }],
    },
    {
      id: 'worker-prof-7',
      userId: 'user-worker-7',
      headline: 'Senior Civil Site Engineer & Structural Quality Supervisor',
      bio: 'B.Tech Civil Engineer with 9 years site experience in structural QA/QC, RCC concrete casting, BBS reinforcement checking, and sub-contractor billing.',
      yearsExperience: 9,
      hourlyRate: 600,
      dailyRate: 1800,
      ratingAvg: 5.0,
      ratingCount: 42,
      completedJobsCount: 58,
      isOnline: true,
      isAvailableNow: false,
      emergencyAvailable: false,
      verificationStatus: 'VERIFIED' as const,
      locality: 'Lajpat Nagar & South Delhi',
      city: 'Delhi',
      distanceKm: 3.9,
      etaMinutes: 26,
      toolsAvailable: ['Digital Auto Level', 'Rebound Hammer', 'Concrete Slump Cone'],
      user: {
        id: 'user-worker-7',
        fullName: 'Deepak Rawat',
        phoneNumber: '9818884433',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
        language: 'en',
        roles: ['WORKER', 'TEAM_LEADER'],
      },
      skills: [{ id: 's7', workerProfileId: '7', categoryId: 'cat-civil-engineer', categoryName: 'Civil Site Engineer', experienceYears: 9, isPrimary: true }],
    },
    {
      id: 'worker-prof-9',
      userId: 'user-worker-9',
      headline: 'Verified Commercial Chauffeur & Logistics Fleet Driver',
      bio: 'Clean driving record of 11 years. Verified police clearance, well-versed with Delhi NCR highways, automatic/manual luxury cars, and commercial goods trucks.',
      yearsExperience: 11,
      hourlyRate: 250,
      dailyRate: 850,
      ratingAvg: 4.9,
      ratingCount: 95,
      completedJobsCount: 130,
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      locality: 'Mahipalpur & Airport Area',
      city: 'Delhi',
      distanceKm: 4.1,
      etaMinutes: 28,
      toolsAvailable: ['Commercial Transport Badge', 'Emergency Toolset', 'GPS Smartphone'],
      user: {
        id: 'user-worker-9',
        fullName: 'Satnam Singh',
        phoneNumber: '9872233445',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        language: 'hi',
        roles: ['WORKER'],
      },
      skills: [{ id: 's9', workerProfileId: '9', categoryId: 'cat-driver', categoryName: 'Commercial Driver', experienceYears: 11, isPrimary: true }],
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/5 text-forest text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-cta" />
              <span>Real-time Dispatch • तुरंत उपलब्धता</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-forest tracking-tight">
              Nearby Verified Professionals
            </h2>
            <p className="text-sm sm:text-base text-text-secondary mt-1">
              Top-rated local tradesmen currently active in your service radius.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-border">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'ALL'
                  ? 'bg-forest text-lime shadow-xs'
                  : 'text-text-secondary hover:text-forest'
              }`}
            >
              All Workers
            </button>
            <button
              onClick={() => setSelectedFilter('AVAILABLE_NOW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedFilter === 'AVAILABLE_NOW'
                  ? 'bg-forest text-lime shadow-xs'
                  : 'text-text-secondary hover:text-forest'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
              Available Now
            </button>
            <button
              onClick={() => setSelectedFilter('VERIFIED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'VERIFIED'
                  ? 'bg-forest text-lime shadow-xs'
                  : 'text-text-secondary hover:text-forest'
              }`}
            >
              Verified KYC
            </button>
          </div>
        </div>

        {/* Worker Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-border p-6 shadow-xs hover:shadow-elevated transition-all flex flex-col justify-between"
            >
              {/* Top Profile Strip */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={worker.user?.fullName}
                      className="w-14 h-14 rounded-xl object-cover border border-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-forest text-base leading-snug">{worker.user?.fullName}</h3>
                        <span title="Aadhaar & Trade Verified"><ShieldCheck className="w-4 h-4 text-status-success" /></span>
                      </div>
                      <span className="inline-block text-xs font-bold text-sage bg-sage-soft px-2 py-0.5 rounded-md mt-0.5">
                        {worker.skills?.[0]?.categoryName || 'Skilled Professional'}
                      </span>
                    </div>
                  </div>

                  {/* Online Badge */}
                  {worker.isAvailableNow && (
                    <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-status-success bg-status-successSoft px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-ping"></span>
                      Online
                    </span>
                  )}
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4">
                  {worker.headline || worker.bio}
                </p>

                {/* Badges: Rating, Distance, ETA */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-bg rounded-xl border border-border text-center text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-text-muted block font-semibold">Rating</span>
                    <span className="font-black text-forest flex items-center justify-center gap-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {worker.ratingAvg} <span className="text-[10px] text-text-muted font-normal">({worker.ratingCount})</span>
                    </span>
                  </div>
                  <div className="border-x border-border">
                    <span className="text-[10px] text-text-muted block font-semibold">Distance</span>
                    <span className="font-bold text-forest flex items-center justify-center gap-0.5">
                      <MapPin className="w-3 h-3 text-sage" />
                      {worker.distanceKm ? `${worker.distanceKm} km` : 'Near you'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block font-semibold">Est. ETA</span>
                    <span className="font-bold text-forest flex items-center justify-center gap-0.5">
                      <Clock className="w-3 h-3 text-cta" />
                      {worker.etaMinutes ? `${worker.etaMinutes} mins` : '30 mins'}
                    </span>
                  </div>
                </div>

                {/* Experience & Tools */}
                <div className="flex flex-wrap gap-1.5 mb-5 text-[11px] text-text-muted font-medium">
                  <span className="bg-white border border-border px-2 py-0.5 rounded-md text-text-primary font-semibold">
                    {worker.yearsExperience}+ Yrs Exp
                  </span>
                  <span className="bg-white border border-border px-2 py-0.5 rounded-md text-text-primary font-semibold">
                    {worker.completedJobsCount} Jobs Done
                  </span>
                  {worker.toolsAvailable?.slice(0, 1).map((tool, idx) => (
                    <span key={idx} className="bg-white border border-border px-2 py-0.5 rounded-md truncate max-w-[120px]">
                      🔧 {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Rate & Book Action */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Rate / पारिश्रमिक</span>
                  <span className="text-base font-black text-forest">
                    ₹{worker.hourlyRate}<span className="text-xs font-normal text-text-muted">/hr</span>
                  </span>
                  <span className="text-[11px] text-text-muted ml-1">
                    (₹{worker.dailyRate}/day)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/workers/${worker.id}`}
                    className="p-2.5 rounded-xl border border-border hover:border-forest text-text-primary text-xs font-bold transition-colors"
                    title="View Profile"
                  >
                    Profile
                  </Link>
                  <Link
                    href={`/booking/new?workerId=${worker.id}&category=${worker.skills?.[0]?.categoryId || 'cat-electrician'}`}
                    className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-bold text-xs tracking-wide shadow-xs transition-all flex items-center gap-1.5"
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
        <div className="text-center mt-10">
          <Link
            href="/workers"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-border hover:border-forest text-forest font-bold text-sm shadow-xs transition-all"
          >
            <span>Explore All 5,000+ Verified Workers Nearby (सभी कारीगर देखें)</span>
            <ArrowRight className="w-4 h-4 text-cta" />
          </Link>
        </div>

      </div>
    </section>
  );
}
