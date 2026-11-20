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
  Search,
  Smartphone
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
    const role = (user.activeRole || '').toUpperCase();
    if (role === 'WORKER') return '/worker/dashboard';
    if (role === 'CONTRACTOR' || role === 'TENDER_OWNER') return '/contractor/dashboard';
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return '/admin';
    return '/hiring/dashboard';
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
            <Link href="/apps" className="hover:text-[#2583D5] text-[#2583D5] transition-colors py-2 flex items-center gap-1.5 font-black">
              <Smartphone className="w-4 h-4" />
              <span>Launch 3 Apps</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-200 font-bold">
                Live
              </span>
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
                    className="px-5 py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-800 text-white text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 hover:scale-[1.01] border border-zinc-600/30"
                  >
                    <span className="text-white font-bold">Register</span>
                    <ChevronDown className="w-4 h-4 text-white" />
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

          {/* Mobile Auth / Hamburger Button */}
          <div className="xl:hidden flex items-center gap-2">
            {user ? (
              <Link
                href={getDashboardLink()}
                className="px-2.5 py-1.5 rounded-xl bg-[#EAF6FF] border border-[#D1E8F8] text-xs font-bold text-[#2583D5] flex items-center gap-1.5 shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#153451] text-white flex items-center justify-center font-bold text-[10px]">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-[80px]">{user.fullName.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl border border-[#D1E8F8] text-xs font-bold text-[#153451] bg-white/80"
              >
                Login
              </Link>
            )}
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
          {user && (
            <div className="p-3 rounded-2xl bg-[#EAF6FF]/70 border border-[#D1E8F8] flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#153451] text-white flex items-center justify-center font-bold text-xs">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-black text-[#153451] leading-tight">{user.fullName}</p>
                  <p className="text-[10px] text-[#2583D5] uppercase font-bold">{user.activeRole}</p>
                </div>
              </div>
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[#2583D5] text-white text-xs font-bold"
              >
                Dashboard
              </Link>
            </div>
          )}

          <nav className="flex flex-col space-y-1 text-sm font-bold text-[#153451]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-[#EAF6FF] transition"
            >
              Home (मुख्य पृष्ठ)
            </Link>
            <Link
              href="/apps"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-[#EAF6FF] text-[#2583D5] font-black transition flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>Launch 3 Apps (ऐप्स डाउनलोड)</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Live</span>
            </Link>
            <Link
              href="/workers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-[#EAF6FF] transition"
            >
              Find Workers (कारीगर खोजें)
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-[#EAF6FF] transition"
            >
              Register (पंजीकरण)
            </Link>
            <Link
              href={getDashboardLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-[#EAF6FF] transition flex items-center justify-between text-[#2583D5]"
            >
              <span>My Workspace Dashboard (डैशबोर्ड)</span>
              {user && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
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
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-center text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out ({user.fullName.split(' ')[0]})</span>
              </button>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-zinc-700 hover:bg-zinc-800 text-white font-bold text-center text-sm shadow-sm border border-zinc-600/30"
                >
                  Register Now (पंजीकरण करें)
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#F5FAFF] border border-[#D1E8F8] text-[#153451] font-bold text-center text-sm"
                >
                  Login (लॉगिन करें)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
