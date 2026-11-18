'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  User as UserIcon, 
  ShieldCheck, 
  Briefcase, 
  HardHat, 
  MapPin, 
  LogOut,
  ChevronDown,
  Phone,
  Search,
  Sparkles,
  ArrowRight,
  UserPlus
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D1E8F8] shadow-sm">
      {/* Top Micro-Banner: Trust & Helpline */}
      <div className="bg-[#123B5D] text-white text-xs py-1.5 px-4 hidden md:flex justify-between items-center border-b border-[#1D4F78]">
        <div className="flex items-center space-x-4 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1.5 text-[#2196E8] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Aadhaar & Skill Verified Indian Workforce
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
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#123B5D] to-[#2196E8] flex items-center justify-center text-white shadow-md shadow-[#2196E8]/20 group-hover:scale-105 transition-transform">
              <HardHat className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-[#123B5D] flex items-center gap-1">
                KAAM <span className="text-[#2196E8]">SETU</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#4B6F8E] -mt-1">
                काम सेतु • WORKFORCE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-6 text-sm font-bold text-[#123B5D]">
            <Link href="/" className="hover:text-[#2196E8] transition-colors py-2">
              Home
            </Link>
            <Link href="/register/worker" className="hover:text-[#2196E8] transition-colors py-2 flex items-center gap-1">
              Find Work / Jobs
              <span className="bg-[#EAF6FF] text-[#2196E8] text-[10px] px-1.5 py-0.5 rounded-full border border-[#D1E8F8]">
                New
              </span>
            </Link>
            <Link href="/workers" className="hover:text-[#2196E8] transition-colors py-2 flex items-center gap-1">
              Find Workers
            </Link>
            <a href="#how-it-works" className="hover:text-[#2196E8] transition-colors py-2">
              How It Works
            </a>
            <a href="#about-us" className="hover:text-[#2196E8] transition-colors py-2">
              About Us
            </a>
            <a href="#contact-us" className="hover:text-[#2196E8] transition-colors py-2">
              Contact Us
            </a>
          </nav>

          {/* Action Buttons & Auth State */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#F5FAFF] border border-[#D1E8F8] hover:border-[#2196E8] transition-all text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-[#123B5D] text-white flex items-center justify-center font-bold text-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#123B5D] leading-tight truncate max-w-[120px]">{user.fullName}</p>
                    <p className="text-[10px] text-[#4B6F8E] uppercase font-bold tracking-wider">{user.activeRole}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#4B6F8E]" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#D1E8F8] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#123B5D] hover:bg-[#EAF6FF] font-semibold"
                    >
                      <UserIcon className="w-4 h-4 text-[#2196E8]" /> Dashboard
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
                  className="px-4 py-2.5 rounded-xl border border-[#D1E8F8] text-sm font-bold text-[#123B5D] hover:bg-[#F5FAFF] hover:border-[#2196E8] transition-all"
                >
                  Login
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setRegisterDropdown(!registerDropdown)}
                    className="px-5 py-2.5 rounded-xl bg-[#2196E8] hover:bg-[#1976D2] text-white text-sm font-bold shadow-md shadow-[#2196E8]/20 transition-all flex items-center gap-1.5 hover:shadow-lg"
                  >
                    <span>Register</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {registerDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#D1E8F8] p-2 z-50">
                      <Link
                        href="/register/customer"
                        onClick={() => setRegisterDropdown(false)}
                        className="block p-3 rounded-xl hover:bg-[#EAF6FF] transition group"
                      >
                        <p className="text-xs font-black text-[#123B5D] group-hover:text-[#2196E8]">Hire Workers</p>
                        <p className="text-[11px] text-[#4B6F8E]">Book skilled help or labour</p>
                      </Link>
                      <Link
                        href="/register/worker"
                        onClick={() => setRegisterDropdown(false)}
                        className="block p-3 rounded-xl hover:bg-[#EAF6FF] transition group"
                      >
                        <p className="text-xs font-black text-[#123B5D] group-hover:text-[#2196E8]">Find Work / Join as Worker</p>
                        <p className="text-[11px] text-[#4B6F8E]">Get daily jobs & direct payouts</p>
                      </Link>
                      <Link
                        href="/contractor"
                        onClick={() => setRegisterDropdown(false)}
                        className="block p-3 rounded-xl hover:bg-[#EAF6FF] transition group border-t border-[#D1E8F8] mt-1"
                      >
                        <p className="text-xs font-black text-[#123B5D] group-hover:text-[#2196E8]">Contractor / Tenders</p>
                        <p className="text-[11px] text-[#4B6F8E]">Commercial bulk hiring</p>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex xl:hidden items-center space-x-2">
            {user ? (
              <Link
                href={getDashboardLink()}
                className="w-9 h-9 rounded-full bg-[#123B5D] text-white flex items-center justify-center font-bold text-xs shadow-sm"
              >
                {user.fullName.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-bold text-[#123B5D] border border-[#D1E8F8] rounded-xl bg-white"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#123B5D] bg-[#F5FAFF] border border-[#D1E8F8] hover:bg-[#EAF6FF] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#D1E8F8] bg-white px-5 pt-4 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#D1E8F8]">
            <Link
              href="/register/customer"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3.5 rounded-2xl bg-[#2196E8] text-white font-bold text-center text-sm shadow-md"
            >
              Hire Workers<br />
              <span className="text-[11px] font-normal opacity-90">काम करवाना है</span>
            </Link>
            <Link
              href="/register/worker"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3.5 rounded-2xl bg-[#123B5D] text-white font-bold text-center text-sm shadow-md"
            >
              Find Work<br />
              <span className="text-[11px] font-normal text-[#60B5F5]">काम चाहिए</span>
            </Link>
          </div>

          <div className="flex flex-col space-y-1 font-semibold text-sm text-[#123B5D]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#EAF6FF]"
            >
              Home
            </Link>
            <Link
              href="/register/worker"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#EAF6FF] flex items-center justify-between"
            >
              <span>Find Work / Jobs (काम पाएं)</span>
              <span className="text-xs text-[#2196E8] font-bold">Earn Daily</span>
            </Link>
            <Link
              href="/workers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#EAF6FF] flex items-center justify-between"
            >
              <span>Find Workers (श्रमिक खोजें)</span>
              <span className="text-xs text-emerald-600 font-bold">Live GPS</span>
            </Link>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#EAF6FF]"
            >
              How It Works (कैसे काम करता है)
            </a>
            <a
              href="#about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#EAF6FF]"
            >
              About Us (हमारे बारे में)
            </a>
            <a
              href="#contact-us"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#EAF6FF]"
            >
              Contact Us (संपर्क करें)
            </a>
            {user && (
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-[#2196E8] bg-[#EAF6FF] font-bold flex items-center justify-between"
              >
                <span>My Dashboard ({user.activeRole})</span>
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-[#D1E8F8] flex justify-between items-center text-xs text-[#4B6F8E]">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#2196E8]" /> 1800-KAAMSETU
            </span>
            {user && (
              <button onClick={handleLogout} className="text-red-600 font-bold">
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
