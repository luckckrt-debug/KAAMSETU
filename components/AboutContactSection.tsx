'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2, 
  Award, 
  HeartHandshake,
  Users,
  CreditCard,
  Zap
} from 'lucide-react';

export default function AboutContactSection() {
  const [formData, setFormData] = useState({ name: '', phone: '', topic: 'General Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', phone: '', topic: 'General Inquiry', message: '' });
    }, 4000);
  };

  return (
    <>
      {/* ABOUT US SECTION */}
      <section id="about-us" className="py-20 sm:py-28 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Mission & Vision */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-black uppercase tracking-wider text-[#2583D5] bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D1E8F8] inline-block shadow-xs">
                ABOUT DIGIWORK • हमारे बारे में
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#153451] tracking-tight leading-tight">
                India&apos;s Digital Platform for Dignity, Fair Work & Rapid Hiring.
              </h2>

              <p className="text-base sm:text-lg text-[#4B6F8E] font-medium leading-relaxed">
                DigiWork was founded with a singular purpose: to transform India&apos;s fragmented informal workforce ecosystem into a modern, transparent, location-enabled digital marketplace. For generations, skilled artisans and daily wage workers had to stand at unorganized labour chowks without income guarantee.
              </p>

              <p className="text-base sm:text-lg text-[#4B6F8E] font-medium leading-relaxed">
                By bridging workers, customers, contractors, and infrastructure enterprises through GPS dispatch, upfront transparent pricing, and instant UPI escrow payouts, DigiWork brings digital dignity and financial empowerment to millions of working hands.
              </p>

              {/* 4 Core Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="p-5 glass-card rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-black text-[#153451]">
                    <ShieldCheck className="w-5 h-5 text-[#2583D5]" />
                    <span>Aadhaar Verified</span>
                  </div>
                  <p className="text-xs text-[#4B6F8E] leading-relaxed">Strict identity, address, and criminal record screening for safe homes.</p>
                </div>

                <div className="p-5 glass-card rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-black text-[#153451]">
                    <Award className="w-5 h-5 text-[#2583D5]" />
                    <span>Fair Wage Guarantee</span>
                  </div>
                  <p className="text-xs text-[#4B6F8E] leading-relaxed">Standard hourly and daily wages benchmarked across states with 0% cut from basic labour.</p>
                </div>

                <div className="p-5 glass-card rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-black text-[#153451]">
                    <HeartHandshake className="w-5 h-5 text-[#2583D5]" />
                    <span>Digital Wallet Settlement</span>
                  </div>
                  <p className="text-xs text-[#4B6F8E] leading-relaxed">Direct instant payments to UPI, bank accounts, or digital cash cards within minutes.</p>
                </div>

                <div className="p-5 glass-card rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-black text-[#153451]">
                    <Users className="w-5 h-5 text-[#2583D5]" />
                    <span>Accident Insurance</span>
                  </div>
                  <p className="text-xs text-[#4B6F8E] leading-relaxed">Medical cover and accidental hospitalization protection on active dispatches.</p>
                </div>
              </div>

            </div>

            {/* Right Column: Visual Impact Stats */}
            <div className="lg:col-span-5">
              <div className="glass-panel rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-black text-[#153451] pb-4 border-b border-[#EAF6FF]">
                  Platform Impact at a Glance
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#F5FAFF] rounded-2xl border border-[#D1E8F8]">
                    <div>
                      <p className="text-2xl font-black text-[#153451]">15,400+</p>
                      <p className="text-xs font-bold text-[#4B6F8E]">Verified Tradesmen Onboarded</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#F5FAFF] rounded-2xl border border-[#D1E8F8]">
                    <div>
                      <p className="text-2xl font-black text-[#153451]">₹4.2+ Cr</p>
                      <p className="text-xs font-bold text-[#4B6F8E]">Direct Worker Wage Payouts</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#F5FAFF] rounded-2xl border border-[#D1E8F8]">
                    <div>
                      <p className="text-2xl font-black text-[#153451]">120+ Cities</p>
                      <p className="text-xs font-bold text-[#4B6F8E]">Active Across 18 Indian States</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#F5FAFF] rounded-2xl border border-[#D1E8F8]">
                    <div>
                      <p className="text-2xl font-black text-[#153451]">25 Mins</p>
                      <p className="text-xs font-bold text-[#4B6F8E]">Average Live GPS Arrival Time</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#EAF6FF] to-[#D9EEFF] border border-[#D1E8F8] text-center">
                  <p className="text-xs font-bold text-[#153451]">Recognized Under Digital India Initiative</p>
                  <p className="text-[11px] text-[#4B6F8E] mt-0.5">Empowering informal blue-collar workforce through open technology</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* CONTACT US SECTION */}
      <section id="contact-us" className="py-20 sm:py-28 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-[#2583D5] bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D1E8F8] inline-block shadow-xs">
              GET IN TOUCH • संपर्क करें
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#153451] tracking-tight">
              We&apos;re Here to Help You 24x7
            </h2>
            <p className="text-base sm:text-lg text-[#4B6F8E] font-medium leading-relaxed">
              Have a question, need assistance with a booking, or looking for enterprise contractor partnerships? Our team is available round the clock.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Contact Info Cards */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="glass-card p-6 rounded-3xl flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EAF6FF] to-[#D9EEFF] text-[#2583D5] flex items-center justify-center text-xl shrink-0 border border-white">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#153451]">Toll-Free Helpline</h4>
                  <p className="text-xs text-[#4B6F8E] mt-0.5">24 hours a day, 7 days a week</p>
                  <a href="tel:18003444967" className="text-base font-black text-[#2583D5] mt-2 block hover:underline">
                    1800-DIGIWORK (1800-3444-9675)
                  </a>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EAF6FF] to-[#D9EEFF] text-[#2583D5] flex items-center justify-center text-xl shrink-0 border border-white">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#153451]">Email Support</h4>
                  <p className="text-xs text-[#4B6F8E] mt-0.5">Responses within 2 business hours</p>
                  <p className="text-sm font-bold text-[#153451] mt-2">support@digiwork.in</p>
                  <p className="text-xs text-[#4B6F8E]">partners@digiwork.in (Commercial)</p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EAF6FF] to-[#D9EEFF] text-[#2583D5] flex items-center justify-center text-xl shrink-0 border border-white">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#153451]">Central Headquarters</h4>
                  <p className="text-xs text-[#4B6F8E] mt-1 leading-relaxed">
                    DigiWork Towers, Connaught Place, New Delhi 110001.<br />
                    Regional Operations: Patna, Lucknow, Mumbai, Bengaluru.
                  </p>
                </div>
              </div>

            </div>

            {/* Right: Quick Inquiry / Message Form */}
            <div className="lg:col-span-7">
              <div className="glass-panel rounded-3xl p-8">
                <h3 className="text-xl font-black text-[#153451] mb-1">Send Us a Direct Message</h3>
                <p className="text-xs text-[#4B6F8E] mb-6">Leave your details and our relationship manager will call you back within 15 minutes.</p>

                {submitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-base font-bold text-emerald-900">Message Received!</h4>
                    <p className="text-xs text-emerald-700">Thank you for reaching out. A DigiWork representative will call you shortly on your provided phone number.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-[#153451] block mb-1">Your Full Name (नाम)</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ankit Sharma"
                          className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-white text-sm text-[#153451] focus:outline-none focus:border-[#2583D5] focus:ring-2 focus:ring-[#2583D5]/20 transition"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#153451] block mb-1">Phone Number (मोबाइल नंबर)</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-white text-sm text-[#153451] focus:outline-none focus:border-[#2583D5] focus:ring-2 focus:ring-[#2583D5]/20 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#153451] block mb-1">Topic / Service Needed</label>
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-white text-sm text-[#153451] focus:outline-none focus:border-[#2583D5] focus:ring-2 focus:ring-[#2583D5]/20 transition"
                      >
                        <option value="General Inquiry">General Inquiry (सामान्य जानकारी)</option>
                        <option value="Worker Registration">Worker Registration Help (श्रमिक पंजीकरण सहायता)</option>
                        <option value="Customer Booking">Customer Booking Assistance (बुकिंग सहायता)</option>
                        <option value="Contractor Bulk Workforce">Contractor Bulk Workforce (बल्क मैनपावर व टेंडर)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#153451] block mb-1">Message / Requirements</label>
                      <textarea
                        rows={3}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us what trade or assistance you need..."
                        className="w-full px-4 py-3 rounded-xl border border-[#D1E8F8] bg-white text-sm text-[#153451] focus:outline-none focus:border-[#2583D5] focus:ring-2 focus:ring-[#2583D5]/20 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-sm font-bold shadow-md shadow-[#2583D5]/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Request Immediate Callback (कॉल बैक अनुरोध)</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}
