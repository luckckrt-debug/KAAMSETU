'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Crosshair, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  CheckCircle2,
  DollarSign,
  Radar
} from 'lucide-react';
import LiveDispatchModal from '@/components/LiveDispatchModal';

export default function NewBookingPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#F7F7F2] py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#173D2B] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#173D2B]">Loading booking form...</p>
        </div>
      </div>
    }>
      <NewBookingForm />
    </React.Suspense>
  );
}

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preWorkerId = searchParams.get('workerId') || '';
  const preCategory = searchParams.get('category') || 'cat-electrician';
  const isUrgentParam = searchParams.get('urgent') === 'true';

  const [serviceCategory, setServiceCategory] = useState(preCategory);
  const [serviceDescription, setServiceDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(isUrgentParam);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 16));
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [addressLine, setAddressLine] = useState('Flat 402, Lotus Boulevard, Sector 100');
  const [locality, setLocality] = useState('Sector 100');
  const [city, setCity] = useState('Noida');
  const [pincode, setPincode] = useState('201304');
  const [latitude, setLatitude] = useState(28.5355);
  const [longitude, setLongitude] = useState(77.3910);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  // Base rate calculation
  const hourlyRates: Record<string, number> = {
    'cat-electrician': 350,
    'cat-plumber': 300,
    'cat-mason': 400,
    'cat-carpenter': 350,
    'cat-painter': 300,
    'cat-ac-tech': 450,
    'cat-welder': 400,
    'cat-labour': 200,
    'cat-tiles-stone': 400,
    'cat-solar-tech': 500,
    'cat-cctv-security': 400,
    'cat-civil-engineer': 600,
    'cat-driver': 250,
    'cat-housekeeping': 250,
    'cat-gardener': 200,
    'cat-security-guard': 250,
    'cat-pest-control': 350,
    'cat-ro-appliance': 300,
    'cat-heavy-machinery': 500,
    'cat-steel-barbender': 400,
    'cat-packaging-logistics': 200,
    'cat-event-stewards': 250,
  };

  const rate = hourlyRates[serviceCategory] || 350;
  const urgentSurcharge = isUrgent ? 149 : 0;
  const estimatedAmount = (rate * estimatedHours) + urgentSurcharge;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      () => {},
      { timeout: 6000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceCategory,
          serviceDescription: serviceDescription || 'General diagnostic and repair service.',
          isUrgent,
          scheduledDate: isUrgent ? new Date().toISOString() : new Date(scheduledDate).toISOString(),
          estimatedHours,
          estimatedAmount,
          addressLine,
          locality,
          city,
          pincode,
          customerLatitude: latitude,
          customerLongitude: longitude,
          assignedWorkerProfileId: preWorkerId || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to create booking');
        setLoading(false);
        return;
      }

      // If pre-assigned worker and urgent, navigate directly to tracking
      if (data.booking.status === 'WORKER_ON_THE_WAY') {
        router.push(`/track/${data.booking.id}`);
      } else {
        router.push(`/booking/${data.booking.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-elevated">
        
        {/* Header */}
        <div className="text-center mb-8 border-b border-border pb-6">
          <span className="text-xs font-bold text-forest uppercase tracking-wider bg-forest/5 px-3 py-1 rounded-full">
            Direct Worker Booking • कार्य बुकिंग
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-forest mt-2">
            Schedule a Verified Professional
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Zero advance required. Pay only after work is inspected and completed.
          </p>

          {/* Instant Radar Dispatch Button */}
          <div className="mt-4 pt-3">
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#173D2B] hover:bg-[#2D6547] text-[#B7E36A] font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 border border-[#B7E36A]/30 active:scale-98"
            >
              <Radar className="w-4 h-4 text-[#F2A65A] animate-spin" style={{ animationDuration: '4s' }} />
              <span>INSTANT RADAR DISPATCH & LIVE MAP (तुरंत लाइव मैप पर खोजें)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-status-dangerSoft border border-status-danger/20 text-status-danger text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Urgent Dispatch Banner Toggle */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isUrgent ? 'bg-status-dangerSoft border-status-danger/30' : 'bg-bg border-border'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-5 h-5 accent-status-danger rounded mt-0.5"
              />
              <div>
                <span className="font-bold text-sm text-forest block flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-status-danger" /> Urgent Dispatch (इमरजेंसी 30 मिनट में)
                </span>
                <span className="text-xs text-text-muted">
                  Requires immediate arrival within 30 minutes. Surcharge of ₹149 applies.
                </span>
              </div>
            </label>
          </div>

          {/* Trade Category */}
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
              Service Category (कार्य का प्रकार) *
            </label>
            <select
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm font-bold text-forest focus:outline-none focus:border-forest"
            >
              <optgroup label="🏠 Home Repair & Maintenance">
                <option value="cat-electrician">Electrician (बिजली मिस्त्री - ₹350/hr)</option>
                <option value="cat-plumber">Plumber & Sanitary Specialist (नल मिस्त्री - ₹300/hr)</option>
                <option value="cat-carpenter">Carpenter & Woodworker (बढ़ई - ₹350/hr)</option>
                <option value="cat-painter">Painter & Waterproofing (रंग मिस्त्री - ₹300/hr)</option>
                <option value="cat-ac-tech">AC & Refrigeration Tech (एसी रिपेयर - ₹450/hr)</option>
                <option value="cat-ro-appliance">Water Purifier & RO Tech (आरओ - ₹300/hr)</option>
                <option value="cat-pest-control">Pest Control Specialist (पेस्ट कंट्रोल - ₹350/hr)</option>
              </optgroup>
              <optgroup label="🏗️ Construction & Infrastructure">
                <option value="cat-mason">Mason / Raj Mistri (राज मिस्त्री - ₹400/hr)</option>
                <option value="cat-labour">Construction Labour / Beldar (मजदूर - ₹200/hr)</option>
                <option value="cat-steel-barbender">Steel Barbender & Saria Mistri (सरिया मिस्त्री - ₹400/hr)</option>
                <option value="cat-tiles-stone">Tiles, Marble & Granite Setter (टाइल मिस्त्री - ₹400/hr)</option>
                <option value="cat-welder">Welder & Metal Fabricator (वेल्डर - ₹400/hr)</option>
              </optgroup>
              <optgroup label="⚡ Engineering & Supervision">
                <option value="cat-solar-tech">Solar & Inverter Engineer (सोलर पैनल - ₹500/hr)</option>
                <option value="cat-cctv-security">CCTV & Smart Security Tech (सीसीटीवी - ₹400/hr)</option>
                <option value="cat-civil-engineer">Civil Site Engineer & Lead (सिविल इंजीनियर - ₹600/hr)</option>
              </optgroup>
              <optgroup label="🚚 Logistics, Transport & Heavy Machinery">
                <option value="cat-driver">Commercial Driver & Chauffeur (ड्राइवर - ₹250/hr)</option>
                <option value="cat-heavy-machinery">Heavy Machinery & JCB Operator (जेसीबी - ₹500/hr)</option>
                <option value="cat-packaging-logistics">Warehouse & Packaging Staff (पैकेजिंग - ₹200/hr)</option>
              </optgroup>
              <optgroup label="🏢 Facility & Security">
                <option value="cat-housekeeping">Deep Cleaning & Housekeeping (डीप क्लीनिंग - ₹250/hr)</option>
                <option value="cat-security-guard">Security Personnel & Guards (सुरक्षा गार्ड - ₹250/hr)</option>
              </optgroup>
              <optgroup label="🌿 Agriculture & Events">
                <option value="cat-gardener">Gardener / Mali & Landscaper (माली - ₹200/hr)</option>
                <option value="cat-event-stewards">Event Setup & Banquet Staff (इवेंट टीम - ₹250/hr)</option>
              </optgroup>
            </select>
          </div>

          {/* Problem Description */}
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
              Describe the Issue / Work Required (काम का विवरण) *
            </label>
            <textarea
              rows={3}
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="e.g. Main MCB tripping repeatedly in kitchen and geyser line. Need inspection and replacement."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-medium focus:outline-none focus:border-forest"
              required
            />
          </div>

          {/* Scheduling Date & Duration */}
          {!isUrgent && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                  Estimated Duration (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Service Address (काम का पता) *
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="text-xs font-bold text-sage hover:underline flex items-center gap-1"
              >
                <Crosshair className="w-3.5 h-3.5 text-cta" /> Set Current GPS Pin
              </button>
            </div>

            <input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Flat / House No., Building Name, Street"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold"
              required
            />

            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Locality / Sector"
                className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs font-semibold"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs font-semibold"
                required
              />
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="PIN Code"
                className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs font-semibold"
                required
              />
            </div>
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-sage-soft p-5 rounded-2xl border border-sage/20 space-y-2">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Hourly Rate ({estimatedHours} hr est.):</span>
              <span className="font-semibold text-forest">₹{rate * estimatedHours}</span>
            </div>
            {isUrgent && (
              <div className="flex justify-between text-xs text-status-danger font-semibold">
                <span>Emergency 30-Min Dispatch:</span>
                <span>+ ₹149</span>
              </div>
            )}
            <div className="pt-2 border-t border-sage/30 flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase text-forest">Total Estimated Fee:</span>
              <span className="text-2xl font-black text-forest">₹{estimatedAmount}</span>
            </div>
            <p className="text-[11px] text-text-muted italic">
              * Payment is strictly due upon completion and customer inspection.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'CONFIRMING BOOKING...' : 'CONFIRM & DISPATCH WORKER (बुकिंग कन्फर्म करें)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Live Dispatch Modal */}
        <LiveDispatchModal
          isOpen={isDispatchModalOpen}
          onClose={() => setIsDispatchModalOpen(false)}
          serviceCategory={serviceCategory}
          initialAddress={`${addressLine}, ${city}`}
          initialLat={latitude}
          initialLng={longitude}
          estimatedAmount={estimatedAmount}
        />

      </div>
    </div>
  );
}
