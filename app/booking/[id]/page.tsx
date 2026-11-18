'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Star, 
  AlertTriangle, 
  CreditCard, 
  ArrowRight,
  Eye,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { Booking, BookingStatus } from '@/lib/types';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Review state
  const [reviewModal, setReviewModal] = useState(false);
  const [ratingQuality, setRatingQuality] = useState(5);
  const [ratingTimeliness, setRatingTimeliness] = useState(5);
  const [ratingBehaviour, setRatingBehaviour] = useState(5);
  const [comment, setComment] = useState('');

  // Dispute state
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('POOR_QUALITY');
  const [disputeDescription, setDisputeDescription] = useState('');

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      const data = await res.json();
      if (data.success && data.booking) {
        setBooking(data.booking);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    const interval = setInterval(fetchBooking, 5000); // Polling status every 5s
    return () => clearInterval(interval);
  }, [bookingId]);

  // Customer confirms completion
  const handleConfirmCompletion = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage('Work confirmed! Please complete settlement.');
        fetchBooking();
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Pay Now (Razorpay test mode simulator)
  const handlePayNow = async () => {
    setActionLoading(true);
    try {
      // 1. Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount: booking?.finalAmount || booking?.estimatedAmount }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setError(orderData.error);
        setActionLoading(false);
        return;
      }

      // 2. Verify payment (Razorpay test callback simulation)
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentId: orderData.order.paymentId,
          providerOrderId: orderData.order.id,
          providerPaymentId: `pay_test_${Date.now()}`,
          providerSignature: 'valid_test_signature',
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setMessage('Payment successful! ₹' + (booking?.finalAmount || booking?.estimatedAmount) + ' paid via UPI/Card.');
        fetchBooking();
        setReviewModal(true); // Prompt review immediately after payment
      } else {
        setError(verifyData.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          ratingQuality,
          ratingTimeliness,
          ratingBehaviour,
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Review submitted successfully!');
        setReviewModal(false);
        fetchBooking();
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Raise Dispute
  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          reason: disputeReason,
          description: disputeDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Dispute registered. Our resolution officer will contact you within 2 hours.');
        setDisputeModal(false);
        fetchBooking();
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg font-bold text-text-muted">
        Loading booking details & live status...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-bg space-y-4">
        <p className="text-forest font-bold text-lg">Booking not found.</p>
        <Link href="/customer/dashboard" className="px-5 py-2.5 rounded-xl bg-forest text-lime text-xs font-bold">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'REQUESTED', label: 'Requested' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'WORKER_ON_THE_WAY', label: 'On The Way' },
    { key: 'ARRIVED', label: 'Arrived' },
    { key: 'WORK_STARTED', label: 'Work Started' },
    { key: 'WORK_COMPLETED', label: 'Completed' },
    { key: 'PAYMENT_PAID', label: 'Paid' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === booking.status);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Booking Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-forest uppercase tracking-wider bg-forest/5 px-2.5 py-1 rounded-md">
                  Booking #{booking.id.slice(-6)}
                </span>
                <span className="text-xs font-bold text-sage bg-sage-soft px-2.5 py-1 rounded-md">
                  {booking.serviceCategory}
                </span>
                {booking.isUrgent && (
                  <span className="text-xs font-bold text-status-danger bg-status-dangerSoft px-2.5 py-1 rounded-md">
                    Urgent 30-Min
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-forest mt-2">
                {booking.serviceDescription}
              </h1>
              <p className="text-xs text-text-muted mt-1">
                Created: {new Date(booking.createdAt).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Estimated Fee</span>
              <span className="text-2xl font-black text-forest">₹{booking.finalAmount || booking.estimatedAmount}</span>
              <span className={`block text-xs font-bold mt-0.5 ${
                booking.status === 'PAYMENT_PAID' ? 'text-status-success' : 'text-cta'
              }`}>
                {booking.status === 'PAYMENT_PAID' ? '✓ Paid Online' : 'Pay After Inspection'}
              </span>
            </div>
          </div>

          {/* Status Progress Stepper */}
          <div className="py-6 border-b border-border">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-4">
              Live Job Lifecycle Status: <strong className="text-forest font-black">{booking.status}</strong>
            </span>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-[10px] font-bold">
              {steps.map((st, i) => {
                const isPassed = currentStepIndex >= i && booking.status !== 'CANCELLED';
                const isCurrent = currentStepIndex === i;
                return (
                  <div key={st.key} className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-xs transition-all ${
                      isPassed
                        ? 'bg-status-success text-white'
                        : isCurrent
                        ? 'bg-cta text-white ring-4 ring-cta/20'
                        : 'bg-bg text-text-muted border border-border'
                    }`}>
                      {isPassed ? '✓' : i + 1}
                    </div>
                    <span className={isPassed || isCurrent ? 'text-forest' : 'text-text-muted'}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Alerts */}
          {message && (
            <div className="mt-4 p-3 rounded-xl bg-status-successSoft text-status-success text-xs font-bold border border-status-success/20">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-status-dangerSoft text-status-danger text-xs font-bold border border-status-danger/20">
              {error}
            </div>
          )}

          {/* Action Center depending on status */}
          <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
            
            {/* Live GPS tracking button if on the way */}
            {booking.status === 'WORKER_ON_THE_WAY' && (
              <Link
                href={`/track/${booking.id}`}
                className="px-6 py-3 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2 animate-pulse"
              >
                <MapPin className="w-4 h-4 text-lime" />
                <span>Track Worker Live on GPS (लाइव लोकेशन देखें)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {/* Customer Confirms Work */}
            {booking.status === 'WORK_COMPLETED' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmCompletion}
                className="px-6 py-3 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>CONFIRM WORK COMPLETION (काम पूरा हुआ)</span>
              </button>
            )}

            {/* Customer Pays */}
            {(booking.status === 'CUSTOMER_CONFIRMED' || booking.status === 'PAYMENT_PENDING') && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handlePayNow}
                className="px-6 py-3 rounded-xl bg-cta hover:bg-cta-hover text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>PAY ₹{booking.finalAmount || booking.estimatedAmount} (सुरक्षित भुगतान करें)</span>
              </button>
            )}

            {/* Rate Worker button */}
            {booking.status === 'PAYMENT_PAID' && !booking.review && (
              <button
                type="button"
                onClick={() => setReviewModal(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Star className="w-4 h-4 fill-white" /> Rate Worker (रेटिंग दें)
              </button>
            )}

            {/* Raise Dispute button */}
            {!booking.dispute && ['WORK_STARTED', 'WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID'].includes(booking.status) && (
              <button
                type="button"
                onClick={() => setDisputeModal(true)}
                className="text-xs font-bold text-status-danger hover:underline flex items-center gap-1 ml-auto"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Need Help / Raise Dispute
              </button>
            )}
          </div>
        </div>

        {/* Assigned Worker Details Card */}
        {booking.assignedWorker && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs">
            <h2 className="text-base font-bold text-forest mb-4">Assigned Service Professional</h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={booking.assignedWorker.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'}
                  alt={booking.assignedWorker.user?.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border border-border"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-forest text-base">{booking.assignedWorker.user?.fullName}</h3>
                    <ShieldCheck className="w-4 h-4 text-status-success" />
                  </div>
                  <p className="text-xs text-text-secondary">{booking.assignedWorker.headline}</p>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-1 font-semibold">
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {booking.assignedWorker.ratingAvg}
                    </span>
                    <span>{booking.assignedWorker.completedJobsCount} jobs completed</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${booking.assignedWorker.user?.phoneNumber || '9876543210'}`}
                  className="px-4 py-2.5 rounded-xl border border-border hover:border-forest text-xs font-bold text-forest flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-sage" /> Call Worker
                </a>
                <Link
                  href={`/track/${booking.id}`}
                  className="px-4 py-2.5 rounded-xl bg-forest text-lime text-xs font-bold flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" /> Live Map
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Work Completion Proofs */}
        {(booking.beforeWorkNotes || booking.afterWorkNotes) && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
            <h2 className="text-base font-bold text-forest">Work Inspection Proof & Notes</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {booking.beforeWorkNotes && (
                <div className="p-4 rounded-2xl bg-bg border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Before Work Diagnosis</span>
                  <p className="text-xs text-text-secondary mt-1">{booking.beforeWorkNotes}</p>
                </div>
              )}
              {booking.afterWorkNotes && (
                <div className="p-4 rounded-2xl bg-bg border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Completed Work Notes</span>
                  <p className="text-xs text-text-secondary mt-1">{booking.afterWorkNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-black text-forest">Rate Your Experience</h3>
            <p className="text-xs text-text-secondary">Your feedback directly rewards quality workmanship.</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Work Quality (काम की गुणवत्ता)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingQuality(s)}
                      className={`p-2 rounded-xl border text-sm font-bold ${
                        ratingQuality >= s ? 'bg-amber-500 text-white border-amber-500' : 'bg-bg text-text-primary'
                      }`}
                    >
                      ★ {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Timeliness & Punctuality</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingTimeliness(s)}
                      className={`p-2 rounded-xl border text-sm font-bold ${
                        ratingTimeliness >= s ? 'bg-amber-500 text-white border-amber-500' : 'bg-bg text-text-primary'
                      }`}
                    >
                      ★ {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Worker Behaviour & Professionalism</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingBehaviour(s)}
                      className={`p-2 rounded-xl border text-sm font-bold ${
                        ratingBehaviour >= s ? 'bg-amber-500 text-white border-amber-500' : 'bg-bg text-text-primary'
                      }`}
                    >
                      ★ {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Comments (वैकल्पिक टिप्पणी)</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="The worker was punctual and fixed the MCB wiring cleanly."
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-forest text-lime text-xs font-black"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-black text-status-danger flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Raise Booking Dispute
            </h3>
            <p className="text-xs text-text-secondary">
              Our resolution team will review your report and arrange a free rework or refund under the ₹25,000 guarantee.
            </p>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Reason for Dispute</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-xs font-semibold"
                >
                  <option value="POOR_QUALITY">Poor Workmanship / Problem Not Solved</option>
                  <option value="OVERCHARGING">Overcharging / Rate Discrepancy</option>
                  <option value="WORKER_NO_SHOW">Worker Did Not Show Up</option>
                  <option value="PROPERTY_DAMAGE">Accidental Property Damage</option>
                  <option value="UNPROFESSIONAL_BEHAVIOUR">Unprofessional Behaviour</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Details & Description</label>
                <textarea
                  rows={4}
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Describe exactly what happened..."
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-xs font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-status-danger text-white text-xs font-black"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
