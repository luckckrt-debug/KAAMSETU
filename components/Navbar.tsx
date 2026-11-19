'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { 
  Menu, 
  X, 
  User as UserIcon, 
  ShieldCheck, 
  Phone, 
  LogOut,
  ChevronDown,
  ArrowRight,
  Briefcase,
  HardHat,
  Search
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ fullName: string; activeRole: string; phoneNumber: string } | null>(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const [registerDropdown, setRegisterDropdown] = useState(false);

  useEffect(() => {
    // Check authenticated user from session endpoint
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser({
            fullName: data.user.fullName,
            activeRole: data.user.roles[0] || 'CUSTOMER',
            phoneNumber: data.user.phoneNumber,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (e) {
      console.error(e);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.activeRole) {
      case 'WORKER':
        return '/worker/dashboard';
      case 'CONTRACTOR':
      case 'TENDER_OWNER':
        return '/contractor/dashboard';
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/admin';
      default:
        return '/customer/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#D1E8F8]/70 shadow-[0_4px_25px_rgba(37,131,213,0.06)] transition-all">
      {/* Top Micro-Banner: Trust & Helpline */}
      <div className="bg-[#123B5D] text-white text-xs py-1.5 px-4 hidden md:flex justify-between items-center border-b border-[#1D4F78]">
        <div className="flex items-center space-x-4 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1.5 text-[#60B5F5] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2196E8]" /> 100% Aadhaar & Skill Verified Indian Workforce
            </span>
            <span className="text-[#4B6F8E]">|</span>
            <span className="text-slate-300">Right People. Right Place. Right Work.</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-300">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#2196E8]" /> 
              Toll-Free Helpline: <strong className="text-white ml-0.5">1800-KAAMSETU</strong>
            </span>
            <span className="text-[#4B6F8E]">|</span>
            <span className="bg-[#2196E8]/20 text-[#60B5F5] px-2 py-0.5 rounded text-[11px] font-semibold border border-[#2196E8]/30">
              हिन्दी / English
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo & Brand Name */}
          <Logo variant="light" size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-6 text-sm font-bold text-[#153451]">
            <Link href="/" className="hover:text-[#2583D5] transition-colors py-2">
              Home
            </Link>
            <Link href="/register/worker" className="hover:text-[#2583D5] transition-colors py-2 flex items-center gap-1">
              Find Work
              <span className="bg-[#EAF6FF] text-[#2583D5] text-[10px] px-1.5 py-0.5 rounded-full border border-[#D1E8F8]">
                New
              </span>
            </Link>
            <Link href="/workers" className="hover:text-[#2583D5] transition-colors py-2 flex items-center gap-1">
              Find Workers
            </Link>
            <a href="#how-it-works" className="hover:text-[#2583D5] transition-colors py-2">
              How It Works
            </a>
            <a href="#about-us" className="hover:text-[#2583D5] transition-colors py-2">
              About Us
            </a>
            <a href="#contact-us" className="hover:text-[#2583D5] transition-colors py-2">
              Contact Us
            </a>
          </nav>

          {/* Action Buttons & Auth State */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/80 border border-[#D1E8F8] hover:border-[#2583D5] transition-all text-sm font-medium shadow-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-[#153451] text-white flex items-center justify-center font-bold text-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#153451] leading-tight truncate max-w-[120px]">{user.fullName}</p>
                    <p className="text-[10px] text-[#4B6F8E] uppercase font-bold tracking-wider">{user.activeRole}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#4B6F8E]" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#D1E8F8] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#153451] hover:bg-[#EAF6FF] font-semibold"
                    >
                      <UserIcon className="w-4 h-4 text-[#2583D5]" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-xl border border-[#D1E8F8] text-sm font-bold text-[#153451] hover:bg-white hover:border-[#2583D5] transition-all"
                >
                  Login
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setRegisterDropdown(!registerDropdown)}
                    className="px-5 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-sm font-bold shadow-md shadow-[#2583D5]/20 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                  >
                    <span>Register</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {registerDropdown && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-[#D1E8F8] p-2 z-50">
                      <Link
                        href="/register/customer"
                        onClick={() => setRegisterDropdown(false)}
                        className="block p-3 rounded-xl hover:bg-[#EAF6FF] transition group"
                      >
                        <p className="text-xs font-black text-[#153451] group-hover:text-[#2583D5]">Hire Workers (ग्राहक)</p>
                        <p className="text-[11px] text-[#4B6F8E]">Book skilled help or local labour</p>
                      </Link>
                      <Link
                        href="/register/worker"
                        onClick={() => setRegisterDropdown(false)}
                        className="block p-3 rounded-xl hover:bg-[#EAF6FF] transition group"
                      >
                        <p className="text-xs font-black text-[#153451] group-hover:text-[#2583D5]">Find Work (श्रमिक पंजीकरण)</p>
                        <p className="text-[11px] text-[#4B6F8E]">Get daily jobs & direct payouts</p>
                      </Link>
                      <Link
                        href="/contractor"
                        onClick={() => setRegisterDropdown(false)}
                        className="block p-3 rounded-xl hover:bg-[#EAF6FF] transition group"
                      >
                        <p className="text-xs font-black text-[#153451] group-hover:text-[#2583D5]">Contractor / Tenders (ठेकेदार)</p>
                        <p className="text-[11px] text-[#4B6F8E]">Bulk crew hiring & tender bids</p>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="xl:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg border border-[#D1E8F8] text-xs font-bold text-[#153451] bg-white/70"
            >
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#153451] hover:bg-[#EAF6FF] focus:outline-none transition-colors border border-[#D1E8F8]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/95 backdrop-blur-2xl border-b border-[#D1E8F8] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1 text-sm font-bold text-[#153451]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-[#EAF6FF] transition"
            >
              Home
            </Link>
            <Link
              href="/register/worker"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-[#EAF6FF] transition flex items-center justify-between"
            >
              <span>Find Work / Jobs (काम पाएं)</span>
              <span className="text-[10px] font-bold text-[#2583D5] bg-[#EAF6FF] px-2 py-0.5 rounded-full border border-[#D1E8F8]">
                New
              </span>
            </Link>
            <Link
              href="/workers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-[#EAF6FF] transition"
            >
              Find Workers (कारीगर खोजें)
            </Link>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-[#EAF6FF] transition"
            >
              How It Works
            </a>
            <a
              href="#about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-[#EAF6FF] transition"
            >
              About Us
            </a>
            <a
              href="#contact-us"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-[#EAF6FF] transition"
            >
              Contact Us
            </a>
          </nav>

          <div className="pt-3 border-t border-[#D1E8F8] flex flex-col gap-2">
            <Link
              href="/register/worker"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-[#2583D5] text-white font-bold text-center text-sm shadow-md"
            >
              Join as Worker (श्रमिक बनें)
            </Link>
            <Link
              href="/register/customer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-[#F5FAFF] border border-[#D1E8F8] text-[#153451] font-bold text-center text-sm"
            >
              Hire a Worker (कारीगर बुक करें)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
