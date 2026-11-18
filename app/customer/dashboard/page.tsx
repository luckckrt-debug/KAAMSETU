'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Star,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function CustomerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.user) {
        setUser(meData.user);
      }

      const bookRes = await fetch('/api/bookings');
      const bookData = await bookRes.json();
      if (bookData.success) {
        setBookings(bookData.bookings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg font-bold text-text-muted">
        Loading customer dashboard...
      </div>
    );
  }

  const activeBookings = bookings.filter(b => 
    !['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID', 'CANCELLED'].includes(b.status)
  );

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Greeting & Action Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest text-lime flex items-center justify-center font-black text-2xl shadow-xs">
              {user?.fullName?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-forest">
                Welcome, {user?.fullName || 'Customer'}!
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                +91 {user?.phoneNumber} • Verified Customer Account
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-success mt-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ₹25,000 KaamSetu Guarantee Active
              </span>
            </div>
          </div>

          <Link
            href="/booking/new"
            className="px-6 py-3.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>BOOK A WORKER (काम बुक करें)</span>
          </Link>
        </div>

        {/* Active Bookings (If any) */}
        {activeBookings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-forest flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-ping"></span>
              <span>Active Job In Progress (सक्रिय बुकिंग)</span>
            </h2>

            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="bg-forest text-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-lime/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-lime text-forest px-2.5 py-0.5 rounded-md">
                      {b.serviceCategory}
                    </span>
                    <span className="text-xs text-gray-200 font-bold">
                      Status: {b.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">{b.serviceDescription}</h3>
                  <p className="text-xs text-gray-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-lime" /> {b.addressLine}, {b.city}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <span className="text-xl font-black text-lime">₹{b.finalAmount || b.estimatedAmount}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/booking/${b.id}`}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20"
                    >
                      Details
                    </Link>
                    {b.status === 'WORKER_ON_THE_WAY' && (
                      <Link
                        href={`/track/${b.id}`}
                        className="px-5 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-forest text-xs font-black flex items-center gap-1.5 shadow-md animate-pulse"
                      >
                        <MapPin className="w-4 h-4" /> Track Live
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Bookings History */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-base font-black text-forest">Booking History (पिछली बुकिंग्स)</h2>
            <button onClick={fetchCustomerData} className="text-xs font-bold text-sage hover:underline flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-xs space-y-2">
              <p className="font-bold text-forest text-sm">No bookings found yet.</p>
              <Link href="/booking/new" className="inline-block px-4 py-2 rounded-xl bg-forest text-lime text-xs font-bold">
                Book Your First Worker
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {bookings.map((b) => (
                <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest bg-bg px-2 py-0.5 rounded border border-border">
                        {b.serviceCategory}
                      </span>
                      <span className="text-[11px] font-bold text-text-muted">
                        #{b.id.slice(-6)} • {new Date(b.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-forest">{b.serviceDescription}</h3>
                    <p className="text-xs text-text-muted">{b.addressLine}, {b.city}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-black text-forest">₹{b.finalAmount || b.estimatedAmount}</span>
                      <span className={`block text-[11px] font-bold ${
                        b.status === 'PAYMENT_PAID' ? 'text-status-success' : 'text-cta'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <Link
                      href={`/booking/${b.id}`}
                      className="px-4 py-1.5 rounded-xl border border-border hover:border-forest text-xs font-bold text-forest"
                    >
                      View Booking
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
