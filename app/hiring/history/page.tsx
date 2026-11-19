'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Star, 
  Download, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Booking } from '@/lib/types';

export default function CustomerBookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const completedBookings = bookings.filter((b) => 
    ['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID'].includes(b.status)
  );

  const filtered = completedBookings.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (b.serviceCategory || '').toLowerCase().includes(term) ||
      (b.serviceDescription || '').toLowerCase().includes(term) ||
      (b.id || '').toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Service History & Receipts"
      subtitle="पिछली पूर्ण सेवाएं, जीएसटी बिलिंग रसीदें व श्रमिक रेटिंग्स"
      actions={
        <Link
          href="/hiring/book"
          className="px-4 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition"
        >
          Book Again (नया काम बुक करें)
        </Link>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Search & Overview Header */}
        <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#153451]">
              Past Completed Services ({completedBookings.length})
            </h2>
            <p className="text-xs text-[#7697B3]">
              All completed visits backed by 30-day workmanship guarantee.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search past bookings..."
              className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs text-[#153451] focus:outline-none focus:border-[#2583D5]"
            />
            <button
              onClick={fetchBookings}
              className="p-2 rounded-xl border border-[#D1E8F8] text-[#2583D5] hover:bg-[#EAF6FF]"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#D1E8F8] space-y-3">
            <p className="text-base font-black text-[#153451]">No Completed Services Yet</p>
            <p className="text-xs text-[#7697B3]">
              Your service history and payment receipts will be recorded here once a task is finished.
            </p>
            <Link
              href="/hiring/dashboard"
              className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-[#2583D5] text-white text-xs font-bold"
            >
              Book Your First Worker
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-[#D1E8F8] shadow-sm hover:border-[#2583D5] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#2583D5] bg-[#EAF6FF] px-2.5 py-0.5 rounded-md">
                      {b.serviceCategory}
                    </span>
                    <span className="text-xs text-[#7697B3] font-bold">
                      Order #{b.id.slice(-6)} • {new Date(b.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      COMPLETED
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#153451]">
                    {b.serviceDescription || 'Domestic Skilled Service'}
                  </h3>

                  <p className="text-xs text-[#7697B3] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2583D5]" />
                    {b.addressLine}, {b.city}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-[#7697B3] block font-semibold">Paid Amount</span>
                    <span className="text-xl font-black text-[#153451]">
                      ₹{b.finalAmount || b.estimatedAmount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/booking/${b.id}`}
                      className="px-4 py-2 rounded-xl border border-[#D1E8F8] text-xs font-bold text-[#153451] hover:bg-[#F5FAFF] transition"
                    >
                      Receipt
                    </Link>
                    <Link
                      href={`/booking/new?category=${b.serviceCategory}`}
                      className="px-4 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold transition"
                    >
                      Re-book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
