'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Award, 
  Wrench, 
  CheckCircle2, 
  ArrowRight,
  Phone,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export default function WorkerProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
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
      <div className="min-h-[70vh] flex items-center justify-center bg-bg text-text-muted font-bold">
        Loading verified worker credentials...
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-bg space-y-4">
        <p className="text-forest font-bold text-lg">Worker profile not found.</p>
        <Link href="/workers" className="px-5 py-2.5 rounded-xl bg-forest text-lime text-xs font-bold">
          Back to Workers Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Worker Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-elevated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-start sm:items-center gap-5">
              <img
                src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
                alt={worker.user?.fullName}
                className="w-24 h-24 rounded-3xl object-cover border-2 border-border shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-forest">
                    {worker.user?.fullName}
                  </h1>
                  <span className="flex items-center gap-1 text-xs font-bold text-status-success bg-status-successSoft px-2.5 py-1 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-status-success" /> 100% Aadhaar Verified
                  </span>
                </div>

                <p className="text-sm font-bold text-sage">
                  {worker.headline || 'Certified Senior Tradesman'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1">
                  <span className="flex items-center gap-1 font-bold text-forest">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {worker.ratingAvg} ({worker.ratingCount} Customer Reviews)
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-4 h-4 text-sage" />
                    {worker.locality}, {worker.city}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Award className="w-4 h-4 text-cta" />
                    {worker.yearsExperience} Years Experience
                  </span>
                </div>
              </div>
            </div>

            {/* Price & Book Action */}
            <div className="bg-bg p-5 rounded-2xl border border-border w-full md:w-auto text-left md:text-right space-y-2 shrink-0">
              <div>
                <span className="text-[10px] text-text-muted uppercase font-bold block">Base Rate / पारिश्रमिक</span>
                <span className="text-2xl font-black text-forest">
                  ₹{worker.hourlyRate}<span className="text-sm font-normal text-text-muted">/hr</span>
                </span>
                <span className="text-xs text-text-muted block">(₹{worker.dailyRate}/full day)</span>
              </div>

              <Link
                href={`/booking/new?workerId=${worker.id}&category=${worker.skills?.[0]?.categoryId || 'cat-electrician'}`}
                className="w-full px-6 py-3 rounded-xl bg-cta hover:bg-cta-hover text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-3">
              <h2 className="text-base font-bold text-forest">Professional Bio & Experience</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {worker.bio || 'Experienced trade professional with proven track record across commercial installations, residential repairs, and complex fault diagnostics.'}
              </p>
            </div>

            {/* Skills & Tools */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
              <h2 className="text-base font-bold text-forest">Trade Expertise & Available Toolsets</h2>
              
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Skills Covered</span>
                <div className="flex flex-wrap gap-2">
                  {worker.skills?.map((s: any) => (
                    <span key={s.id} className="bg-sage-soft text-forest text-xs font-bold px-3 py-1.5 rounded-xl border border-sage/20">
                      ✓ {s.categoryName || 'Trade Skill'} ({s.experienceYears} Yrs)
                    </span>
                  ))}
                </div>
              </div>

              {worker.toolsAvailable && worker.toolsAvailable.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Tools & Equipment</span>
                  <div className="flex flex-wrap gap-2">
                    {worker.toolsAvailable.map((t: string, i: number) => (
                      <span key={i} className="bg-bg text-text-primary text-xs font-semibold px-3 py-1.5 rounded-xl border border-border">
                        🔧 {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Reviews */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="text-base font-bold text-forest">Verified Customer Reviews</h2>
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500" /> {worker.ratingAvg} / 5.0 Rating
                </span>
              </div>

              {worker.reviews && worker.reviews.length > 0 ? (
                <div className="space-y-4">
                  {worker.reviews.map((rev: any) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-bg border border-border space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-forest">{rev.customerName}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.ratingOverall ? 'fill-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-text-muted text-xs">
                  No public reviews recorded yet. Be the first to book and rate!
                </div>
              )}
            </div>

          </div>

          {/* Right Verification & Guarantee Card */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-4">
              <h3 className="font-bold text-forest text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-status-success" /> Trust & Compliance Checklist
              </h3>

              <div className="space-y-3 text-xs text-text-secondary">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                  <span>Aadhaar ID verified with UIDAI biometric check</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                  <span>Trade credentials & past apprenticeships vetted</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                  <span>Clean criminal record check on file</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                  <span>Backed by ₹25,000 KaamSetu Workmanship Insurance</span>
                </div>
              </div>
            </div>

            <div className="bg-forest text-white rounded-3xl p-6 space-y-3">
              <h3 className="font-bold text-sm text-lime">Need Help Booking?</h3>
              <p className="text-xs text-gray-200 leading-relaxed">
                Our support team is available 24x7 to assist with urgent dispatches, billing queries, and custom scopes.
              </p>
              <div className="pt-1">
                <a
                  href="tel:18005226738"
                  className="w-full py-2.5 rounded-xl bg-lime text-forest text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Helpline: 1800-KAAMSETU
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
