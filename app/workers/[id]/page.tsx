'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  MapPin, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Phone,
  MessageSquare
} from 'lucide-react';

export default function WorkerProfileDetailPage() {
  const params = useParams();
  const workerId = params.id as string;

  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workers/${workerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.worker) {
          setWorker(data.worker);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workerId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-[#EAF6FF]/60 to-[#F5FAFF] text-[#7697B3] font-bold">
        Loading verified worker credentials...
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-b from-[#EAF6FF]/60 to-[#F5FAFF] space-y-4">
        <p className="text-[#153451] font-bold text-lg">Worker profile not found.</p>
        <Link href="/workers" className="px-5 py-2.5 rounded-xl bg-[#2583D5] text-white text-xs font-bold">
          Back to Workers Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EAF6FF]/60 via-[#F5FAFF] to-[#EAF6FF]/40 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Worker Hero Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-[#D1E8F8] shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
                  alt={worker.user?.fullName}
                  className="w-24 h-24 rounded-3xl object-cover ring-2 ring-white shadow-sm"
                />
                {worker.isAvailableNow && (
                  <span 
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200" 
                    title="Online"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#153451]">
                    {worker.user?.fullName}
                  </h1>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Aadhaar Verified
                  </span>
                </div>

                <p className="text-sm font-bold text-[#2583D5]">
                  {worker.headline || 'Certified Senior Tradesman'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#4B6F8E] pt-1">
                  <span className="flex items-center gap-1 font-bold text-[#153451]">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {worker.ratingAvg} ({worker.ratingCount} Reviews)
                  </span>
                  <span className="text-[#D1E8F8]">•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-4 h-4 text-[#2583D5]" />
                    {worker.locality}, {worker.city}
                  </span>
                  <span className="text-[#D1E8F8]">•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Award className="w-4 h-4 text-[#2583D5]" />
                    {worker.yearsExperience} Years Experience
                  </span>
                </div>
              </div>
            </div>

            {/* Price & Book Action */}
            <div className="bg-[#F5FAFF] p-5 rounded-2xl border border-[#D1E8F8] w-full md:w-auto text-left md:text-right space-y-2 shrink-0">
              <div>
                <span className="text-[10px] text-[#7697B3] uppercase font-bold block">Base Rate</span>
                <span className="text-2xl font-black text-[#153451]">
                  ₹{worker.hourlyRate}<span className="text-sm font-normal text-[#7697B3]">/hr</span>
                </span>
                <span className="text-xs text-[#7697B3] block">₹{worker.dailyRate}/day</span>
              </div>

              <Link
                href={`/booking/new?workerId=${worker.id}&category=${worker.skills?.[0]?.categoryId || 'cat-electrician'}`}
                className="w-full px-6 py-3 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>BOOK THIS WORKER</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Bio */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#D1E8F8] shadow-xs space-y-3">
              <h2 className="text-base font-bold text-[#153451]">Professional Bio & Experience</h2>
              <p className="text-sm text-[#4B6F8E] leading-relaxed">
                {worker.bio || 'Experienced trade professional with proven track record across commercial installations, residential repairs, and complex fault diagnostics.'}
              </p>
            </div>

            {/* Skills & Tools */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#D1E8F8] shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#153451]">Trade Expertise & Available Toolsets</h2>
              
              <div>
                <span className="text-xs font-bold text-[#7697B3] uppercase tracking-wider block mb-2">Skills Covered</span>
                <div className="flex flex-wrap gap-2">
                  {worker.skills?.map((s: any) => (
                    <span key={s.id} className="bg-[#EAF6FF] text-[#153451] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#D1E8F8]">
                      ✓ {s.categoryName || 'Trade Skill'} ({s.experienceYears} Yrs)
                    </span>
                  ))}
                </div>
              </div>

              {worker.toolsAvailable && worker.toolsAvailable.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-[#7697B3] uppercase tracking-wider block mb-2">Tools & Equipment</span>
                  <div className="flex flex-wrap gap-2">
                    {worker.toolsAvailable.map((t: string, i: number) => (
                      <span key={i} className="bg-white text-[#153451] text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#D1E8F8]">
                        🔧 {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Reviews */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#D1E8F8] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAF6FF]">
                <h2 className="text-base font-bold text-[#153451]">Customer Reviews</h2>
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500" /> {worker.ratingAvg} / 5.0 Rating
                </span>
              </div>

              {worker.reviews && worker.reviews.length > 0 ? (
                <div className="space-y-4">
                  {worker.reviews.map((rev: any) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#153451]">{rev.customerName}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.ratingOverall ? 'fill-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#4B6F8E] leading-relaxed">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-[#7697B3] text-xs">
                  No public reviews recorded yet. Be the first to book and rate!
                </div>
              )}
            </div>

          </div>

          {/* Right Verification & Guarantee Card */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
              <h3 className="font-bold text-[#153451] text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Trust & Compliance Checklist
              </h3>

              <div className="space-y-3 text-xs text-[#4B6F8E]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Aadhaar ID verified with UIDAI biometric check</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Trade credentials & past apprenticeships vetted</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Police character clearance certificate verified</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>100% Escrow protected payment release</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAF6FF] flex items-center justify-between text-[11px] text-[#7697B3]">
                <span>DigiWork Verified Partner</span>
                <span className="font-bold text-emerald-600">Active</span>
              </div>
            </div>

            {/* Direct Connect Options */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-3">
              <h3 className="font-bold text-[#153451] text-sm">Need Assistance Booking?</h3>
              <p className="text-xs text-[#4B6F8E] leading-relaxed">
                Connect with our multilingual customer support team for help booking this worker.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="tel:18003444967"
                  className="w-full py-2.5 rounded-xl border border-[#D1E8F8] text-[#153451] hover:border-[#2583D5] text-xs font-bold text-center flex items-center justify-center gap-2 transition bg-white"
                >
                  <Phone className="w-3.5 h-3.5 text-[#2583D5]" />
                  <span>Call 1800-DIGIWORK</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
