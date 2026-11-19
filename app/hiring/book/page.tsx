'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  MapPin, 
  Crosshair, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LiveDispatchModal from '@/components/LiveDispatchModal';

const TRADES = [
  { id: 'cat-electrician', name: 'Electrician (बिजली मिस्त्री)', rate: 350, desc: 'House wiring, fans, inverters, switchboard fixes' },
  { id: 'cat-plumber', name: 'Plumber (नल मिस्त्री)', rate: 300, desc: 'Pipes, taps, motor installation, bathroom leakages' },
  { id: 'cat-carpenter', name: 'Carpenter (बढ़ई)', rate: 400, desc: 'Furniture, doors, locks, wooden repairs & frames' },
  { id: 'cat-painter', name: 'Painter (रंग मिस्त्री)', rate: 850, desc: 'Wall painting, putty, texture, waterproof coating' },
  { id: 'cat-mason', name: 'Mason / Labour (राज मिस्त्री)', rate: 1050, desc: 'Brickwork, plaster, tiles, flooring, construction labour' },
  { id: 'cat-cleaning', name: 'Housekeeping (सफाई कर्मी)', rate: 250, desc: 'Deep cleaning, sanitization, post-construction cleanup' },
  { id: 'cat-delivery', name: 'Delivery Partner (डिलीवरी)', rate: 150, desc: 'Material transport, hyperlocal courier & heavy shifting' }
];

export default function InstantBookServicePage() {
  const router = useRouter();

  const [selectedTrade, setSelectedTrade] = useState(TRADES[0]);
  const [description, setDescription] = useState('');
  const [addressLine, setAddressLine] = useState('Flat 402, Lotus Boulevard, Sector 100');
  const [locality, setLocality] = useState('Sector 100');
  const [city, setCity] = useState('Noida');
  const [pincode, setPincode] = useState('201304');
  const [isImmediate, setIsImmediate] = useState(true);
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLiveDispatchOpen, setIsLiveDispatchOpen] = useState(false);

  const estimatedAmount = selectedTrade.rate * estimatedHours;

  const handleInstantDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLiveDispatchOpen(true);
  };

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Instant Service Booking"
      subtitle="तत्काल कारीगर अनुरोध व लाइव डिस्पैच टेलीमेट्री"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Brand Top Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D1E8F8] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-9 h-9 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-[#2583D5]" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#2583D5]">
              ON-DEMAND LOCAL DISPATCH
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#153451]">
            Book a Verified Professional to Your Doorstep
          </h1>
          <p className="text-xs text-[#7697B3] mt-1">
            Choose your requirement below. We ping nearest verified professionals and connect live GPS tracking upon acceptance.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleInstantDispatchSubmit} className="space-y-6">
          
          {/* Step 1: Select Trade */}
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#153451]">
              1. Choose Required Trade (सेवा श्रेणी)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRADES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTrade(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    selectedTrade.id === t.id
                      ? 'border-[#2583D5] bg-[#EAF6FF]/50 ring-2 ring-[#2583D5]/20 shadow-sm'
                      : 'border-[#D1E8F8] hover:border-[#2583D5]/50 bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-[#153451]">{t.name}</h3>
                    <p className="text-xs text-[#7697B3]">{t.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-[#2583D5]">₹{t.rate}</span>
                    <span className="text-[10px] text-[#7697B3] block">/hr standard</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Problem Description */}
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#153451]">
              2. Describe the Task (काम का विवरण)
            </h2>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Inverter tripping MCB constantly, needs fuse inspection and wiring test."
              className="w-full p-4 rounded-2xl border border-[#D1E8F8] bg-[#F5FAFF]/60 text-xs font-medium text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
            />
          </div>

          {/* Step 3: Service Address */}
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#153451]">
                3. Service Location (सेवा का पता)
              </h2>
              <span className="text-xs text-[#2583D5] font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Doorstep Arrival
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-[#7697B3] uppercase block mb-1">
                  Full House / Flat / Street Address
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF]/60 text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#7697B3] uppercase block mb-1">Locality</label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF]/60 text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#7697B3] uppercase block mb-1">City & Pincode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-2/3 px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF]/60 text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5]"
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-1/3 px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF]/60 text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Dispatch Confirmation */}
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs text-[#7697B3] uppercase font-bold block">Estimated Standard Amount</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#153451]">₹{estimatedAmount}</span>
                <span className="text-xs text-[#7697B3]">({estimatedHours} hrs @ ₹{selectedTrade.rate}/hr)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
                ✓ Pay only after job completion & satisfaction
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-2xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#2583D5]/25 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>REQUEST INSTANT DISPATCH</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>

      <LiveDispatchModal
        isOpen={isLiveDispatchOpen}
        onClose={() => setIsLiveDispatchOpen(false)}
        serviceCategory={selectedTrade.id}
        categoryName={selectedTrade.name}
        initialAddress={`${addressLine}, ${locality}, ${city}`}
        initialLat={28.5355}
        initialLng={77.3910}
        estimatedAmount={estimatedAmount}
      />
    </DashboardLayout>
  );
}
