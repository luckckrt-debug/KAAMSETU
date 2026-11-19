'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  MapPin, 
  Navigation, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight,
  ExternalLink,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Booking } from '@/lib/types';

export default function CustomerActiveBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const activeBookings = bookings.filter((b) => 
    !['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID', 'CANCELLED'].includes(b.status)
  );

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Active Bookings & Live Tracking"
      subtitle="सक्रिय सेवा अनुरोध, कुशल कारीगर स्थिति व रियल-टाइम GPS ट्रैकिंग"
      actions={
        <Link
          href="/hiring/book"
          className="px-4 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
        >
          <span>+ New Service Request</span>
        </Link>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#153451]">
              Live In-Progress Orders ({activeBookings.length})
            </h2>
            <p className="text-xs text-[#7697B3] mt-0.5">
              Live telemetry updates approximately every 3–5 seconds from worker GPS.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            className="text-xs font-bold text-[#2583D5] hover:underline flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {activeBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#D1E8F8] space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>
            <h3 className="text-lg font-black text-[#153451]">No Active Bookings Right Now</h3>
            <p className="text-xs text-[#7697B3] max-w-md mx-auto">
              You do not have any ongoing worker visits at this moment. You can browse nearby professionals or request instant dispatch.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/hiring/dashboard"
                className="px-6 py-3 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition"
              >
                Book a Worker Now
              </Link>
              <Link
                href="/hiring/history"
                className="px-6 py-3 rounded-xl border border-[#D1E8F8] text-[#153451] hover:bg-[#F5FAFF] font-bold text-xs"
              >
                View Past History
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBookings.map((b) => {
              const isMoving = b.status === 'WORKER_ON_THE_WAY';

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D1E8F8] shadow-sm hover:border-[#2583D5] transition-all space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAF6FF]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black uppercase text-[#2583D5] tracking-wider">
                          {b.serviceCategory}
                        </span>
                        <span className="text-xs text-[#7697B3] font-bold">
                          • Order #{b.id.slice(-6)}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-[#153451] mt-1">
                        {b.serviceDescription || 'Domestic Skilled Service Call'}
                      </h3>
                      <p className="text-xs text-[#7697B3] flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#2583D5]" />
                        {b.addressLine}, {b.city}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      <span className="text-xs text-[#7697B3] font-bold">Estimated Fare</span>
                      <span className="text-2xl font-black text-[#153451]">
                        ₹{b.finalAmount || b.estimatedAmount}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Escrow Protected
                      </span>
                    </div>
                  </div>

                  {/* Status Progress Stepper */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center text-xs">
                    <div className={`p-2.5 rounded-xl border ${['ACCEPTED', 'WORKER_ON_THE_WAY', 'WORKER_ARRIVED', 'WORK_STARTED'].includes(b.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      1. Accepted
                    </div>
                    <div className={`p-2.5 rounded-xl border ${['WORKER_ON_THE_WAY', 'WORKER_ARRIVED', 'WORK_STARTED'].includes(b.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      2. On The Way
                    </div>
                    <div className={`p-2.5 rounded-xl border ${['WORKER_ARRIVED', 'WORK_STARTED'].includes(b.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      3. Arrived at Site
                    </div>
                    <div className={`p-2.5 rounded-xl border ${b.status === 'WORK_STARTED' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      4. In Progress
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/booking/${b.id}`}
                        className="px-4 py-2 rounded-xl border border-[#D1E8F8] text-xs font-bold text-[#153451] hover:bg-[#F5FAFF] transition"
                      >
                        Order Details
                      </Link>
                      <button
                        onClick={() => alert('Worker contact details: +91 98765 43210. Worker is on route.')}
                        className="px-4 py-2 rounded-xl border border-[#D1E8F8] text-xs font-bold text-[#153451] hover:bg-[#F5FAFF] transition flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#2583D5]" />
                        <span>Call Worker</span>
                      </button>
                    </div>

                    <Link
                      href={`/track/${b.id}`}
                      className="px-6 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#2583D5]/20 transition flex items-center gap-2 active:scale-95"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>TRACK LIVE MAP (लाइव मैप देखें)</span>
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
