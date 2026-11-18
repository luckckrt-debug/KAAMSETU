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
  Users
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
      <section id="about-us" className="py-16 sm:py-24 bg-[#EAF6FF] border-b border-[#D1E8F8] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Mission & Vision */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-black uppercase tracking-wider text-[#2196E8] bg-white px-3.5 py-1 rounded-full border border-[#D1E8F8] inline-block shadow-xs">
                ABOUT KAAM SETU • हमारे बारे में
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-[#123B5D] tracking-tight leading-tight">
                India&apos;s Digital Bridge for Dignity, Fair Work & Rapid Hiring.
              </h2>

              <p className="text-sm sm:text-base text-[#4B6F8E] font-medium leading-relaxed">
                Kaam Setu was founded with a singular purpose: to transform India&apos;s fragmented informal labour ecosystem into a transparent, location-enabled digital marketplace. For generations, skilled artisans and daily wage workers had to stand at unorganized labour chowks without income guarantee.
              </p>

              <p className="text-sm sm:text-base text-[#4B6F8E] font-medium leading-relaxed">
                By bridging workers, customers, contractors, and infrastructure enterprises through GPS dispatch, upfront transparent pricing, and instant UPI escrow payouts, Kaam Setu brings digital dignity and financial empowerment to millions of working hands.
              </p>

              {/* 4 Core Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-[#D1E8F8] shadow-xs space-y-1">
                  <div className="flex items-center gap-2 text-sm font-black text-[#123B5D]">
                    <ShieldCheck className="w-4 h-4 text-[#2196E8]" />
                    <span>Aadhaar Verified</span>
                  </div>
                  <p className="text-xs text-[#4B6F8E]">Strict identity, address, and criminal record screening for safe homes.</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#D1E8F8] shadow-xs space-y-1">
                  <div className="flex items-center gap-2 text-sm font-black text-[#123B5D]">
                    <Award className="w-4 h-4 text-[#2196E8]" />
                    <span>Fair Wage Guarantee</span>
                  </div>
                  <p className="text-xs text-[#4B6F8E]">No extortionate middlemen cuts. Workers receive 90%+ directly in their digital wallet.</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#D1E8F8] shadow-xs space-y-1">
                  <div className="flex items-center gap-2 text-sm font-black text-[#123B5D]">
                    <Clock className="w-4 h-4 text-[#2196E8]" />
                    <span>Rapid Dispatch</span>
                  </div>
                  <p className="text-xs text-[#4B6F8E]">Live GPS mapping and ETA routing ensure workers arrive at your doorstep in under 30 minutes.</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#D1E8F8] shadow-xs space-y-1">
                  <div className="flex items-center gap-2 text-sm font-black text-[#123B5D]">
                    <HeartHandshake className="w-4 h-4 text-[#2196E8]" />
                    <span>Secure Escrow</span>
                  </div>
                  <p className="text-xs text-[#4B6F8E]">Funds are held securely and released only after your job inspection and confirmation.</p>
                </div>
              </div>

            </div>

            {/* Right Column: Platform Metrics & Impact */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-8 border border-[#D1E8F8] shadow-xl space-y-6">
                <div className="border-b border-[#EAF6FF] pb-4">
                  <h3 className="text-xl font-black text-[#123B5D]">Our Nationwide Impact</h3>
                  <p className="text-xs text-[#4B6F8E] mt-0.5">Empowering Bharat through technology</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8]">
                    <span className="text-3xl font-black text-[#2196E8] block">15,000+</span>
                    <span className="text-xs font-bold text-[#123B5D] mt-1 block">Verified Workers</span>
                    <span className="text-[10px] text-[#7697B3]">Across 9+ trades</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8]">
                    <span className="text-3xl font-black text-[#123B5D] block">120+</span>
                    <span className="text-xs font-bold text-[#123B5D] mt-1 block">Cities & Towns</span>
                    <span className="text-[10px] text-[#7697B3]">Pan-India Coverage</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8]">
                    <span className="text-3xl font-black text-emerald-600 block">₹12 Cr+</span>
                    <span className="text-xs font-bold text-[#123B5D] mt-1 block">Wages Disbursed</span>
                    <span className="text-[10px] text-[#7697B3]">Direct to UPI wallets</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#D1E8F8]">
                    <span className="text-3xl font-black text-amber-500 block">99.4%</span>
                    <span className="text-xs font-bold text-[#123B5D] mt-1 block">Satisfaction Rate</span>
                    <span className="text-[10px] text-[#7697B3]">Over 48,000 bookings</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#EAF6FF] border border-[#D1E8F8] text-xs text-[#123B5D] font-medium leading-relaxed">
                  &ldquo;Kaam Setu has eliminated the uncertainty of our morning wait. Now I get bookings right on my mobile phone and payment instantly.&rdquo;
                  <span className="block font-bold text-[#2196E8] mt-1">— Ramchandra Paswan, Senior Mason (Patna)</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* CONTACT US SECTION */}
      <section id="contact-us" className="py-16 sm:py-24 bg-[#F5FAFF] border-b border-[#D1E8F8] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#2196E8] bg-white px-3.5 py-1 rounded-full border border-[#D1E8F8] inline-block shadow-xs">
              24x7 DEDICATED SUPPORT • संपर्क करें
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#123B5D] tracking-tight">
              Get in Touch with Kaam Setu
            </h2>
            <p className="text-sm sm:text-base text-[#4B6F8E] font-medium leading-relaxed">
              Have a question, need assistance with a booking, or looking for enterprise contractor partnerships? Our team is available round the clock.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Contact Info Cards */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-white p-6 rounded-3xl border border-[#D1E8F8] shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF6FF] text-[#2196E8] flex items-center justify-center text-xl shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#123B5D]">Toll-Free Helpline</h4>
                  <p className="text-xs text-[#4B6F8E] mt-0.5">24 hours a day, 7 days a week</p>
                  <a href="tel:18005226738" className="text-base font-black text-[#2196E8] mt-2 block hover:underline">
                    1800-KAAMSETU (1800-522-6738)
                  </a>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#D1E8F8] shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF6FF] text-[#2196E8] flex items-center justify-center text-xl shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#123B5D]">Email Support</h4>
                  <p className="text-xs text-[#4B6F8E] mt-0.5">Responses within 2 business hours</p>
                  <p className="text-sm font-bold text-[#123B5D] mt-2">support@kaamsetu.in</p>
                  <p className="text-xs text-[#4B6F8E]">partners@kaamsetu.in (Commercial)</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#D1E8F8] shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF6FF] text-[#2196E8] flex items-center justify-center text-xl shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#123B5D]">Central Headquarters</h4>
                  <p className="text-xs text-[#4B6F8E] mt-1 leading-relaxed">
                    KaamSetu Towers, Connaught Place, New Delhi 110001.<br />
                    Regional Operations: Patna, Lucknow, Mumbai, Bengaluru.
                  </p>
                </div>
              </div>

            </div>

            {/* Right: Quick Inquiry / Message Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 border border-[#D1E8F8] shadow-xl">
                <h3 className="text-xl font-black text-[#123B5D] mb-1">Send Us a Direct Message</h3>
                <p className="text-xs text-[#4B6F8E] mb-6">Leave your details and our relationship manager will call you back within 15 minutes.</p>

                {submitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-base font-bold text-emerald-900">Message Received!</h4>
                    <p className="text-xs text-emerald-700">Thank you for reaching out. A KaamSetu representative will call you shortly on your provided phone number.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-[#123B5D] block mb-1">Your Full Name (नाम)</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ankit Sharma"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-sm text-[#123B5D] focus:bg-white focus:outline-none focus:border-[#2196E8]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#123B5D] block mb-1">Phone Number (मोबाइल नंबर)</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-sm text-[#123B5D] focus:bg-white focus:outline-none focus:border-[#2196E8]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#123B5D] block mb-1">Topic / Service Needed</label>
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-sm text-[#123B5D] focus:bg-white focus:outline-none focus:border-[#2196E8]"
                      >
                        <option value="General Inquiry">General Inquiry (सामान्य जानकारी)</option>
                        <option value="Worker Registration">Worker Registration Help (श्रमिक पंजीकरण सहायता)</option>
                        <option value="Customer Booking">Customer Booking Assistance (बुकिंग सहायता)</option>
                        <option value="Contractor Bulk Workforce">Contractor Bulk Workforce (बल्क मैनपावर व टेंडर)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#123B5D] block mb-1">Message / Requirements</label>
                      <textarea
                        rows={3}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us what trade or assistance you need..."
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-sm text-[#123B5D] focus:bg-white focus:outline-none focus:border-[#2196E8]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-[#2196E8] hover:bg-[#1976D2] text-white text-sm font-bold shadow-md shadow-[#2196E8]/20 transition flex items-center justify-center gap-2"
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
