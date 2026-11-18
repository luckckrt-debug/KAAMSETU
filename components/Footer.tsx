import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Phone, Mail, MapPin, Heart, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="bg-[#123B5D] text-white border-t border-[#1D4F78]">
      {/* Top CTA Strip */}
      <div className="bg-[#1D4F78] border-b border-[#2196E8]/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-6 h-6 text-[#2196E8]" /> Are you a skilled electrician, plumber or contractor?
            </h3>
            <p className="text-slate-300 text-sm mt-1">
              Join Kaam Setu. Get direct daily bookings, fair hourly rates, and instant digital wallet payouts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/register/worker"
              className="px-6 py-3 rounded-xl bg-[#2196E8] hover:bg-[#1976D2] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              Join as Worker (श्रमिक बनें) <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contractor"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
            >
              Contractor Registration
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="dark" size="md" />
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              India&apos;s trusted digital workforce ecosystem connecting verified skilled workers, customers, contractors, and companies with real-time GPS dispatch and transparent payments.
            </p>
            <div className="pt-2 text-xs text-[#60B5F5] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2196E8] animate-pulse"></span>
              Live in Delhi NCR, Patna, Lucknow, Mumbai, Bengaluru, & 120+ Cities
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#1D4F78] pb-2">
              Categories (श्रेणियां)
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><Link href="/workers?category=electrician" className="hover:text-[#2196E8] transition-colors">Electricians (बिजली मिस्त्री)</Link></li>
              <li><Link href="/workers?category=plumber" className="hover:text-[#2196E8] transition-colors">Plumbers (नल मिस्त्री)</Link></li>
              <li><Link href="/workers?category=mason" className="hover:text-[#2196E8] transition-colors">Masons (राज मिस्त्री)</Link></li>
              <li><Link href="/workers?category=carpenter" className="hover:text-[#2196E8] transition-colors">Carpenters (बढ़ई)</Link></li>
              <li><Link href="/workers?category=painter" className="hover:text-[#2196E8] transition-colors">Painters (रंग मिस्त्री)</Link></li>
              <li><Link href="/workers?category=delivery" className="hover:text-[#2196E8] transition-colors">Delivery Partners (डिलीवरी)</Link></li>
            </ul>
          </div>

          {/* Workforce Solutions */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#1D4F78] pb-2">
              Solutions (समाधान)
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><Link href="/workers" className="hover:text-[#2196E8] transition-colors">Emergency Worker Dispatch</Link></li>
              <li><Link href="/tenders" className="hover:text-[#2196E8] transition-colors">Tender Marketplace</Link></li>
              <li><Link href="/contractor" className="hover:text-[#2196E8] transition-colors">Bulk Manpower Supply</Link></li>
              <li><Link href="/register/worker" className="hover:text-[#2196E8] transition-colors">Worker Verification & KYC</Link></li>
              <li><Link href="/admin" className="hover:text-[#2196E8] transition-colors">Admin Backoffice</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#1D4F78] pb-2">
              Trust & Support
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#2196E8] shrink-0 mt-0.5" />
                <span>1800-KAAMSETU (Toll-Free)</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#2196E8] shrink-0 mt-0.5" />
                <span>support@kaamsetu.in</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#2196E8] shrink-0 mt-0.5" />
                <span>Connaught Place, New Delhi, India</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-8 border-t border-[#1D4F78] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} KAAMSETU Technologies Private Limited. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for India&apos;s proud skilled workforce
          </p>
        </div>
      </div>
    </footer>
  );
}
