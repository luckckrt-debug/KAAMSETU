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
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ fullName: string; activeRole: string; phoneNumber: string } | null>(null);
  const [userDropdown, setUserDropdown] = useState(false);

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-xs">
      {/* Top micro-banner for trust & helpline */}
      <div className="bg-forest text-white text-xs py-1.5 px-4 hidden md:flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 text-lime font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Aadhaar & Skill Verified Indian Workforce
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-200">Right People. Right Place. Right Work.</span>
        </div>
        <div className="flex items-center space-x-4 text-gray-200">
          <span>Helpline: <strong className="text-white">+91 1800-KAAMSETU</strong></span>
          <span className="text-gray-400">|</span>
          <span className="bg-lime/20 text-lime px-2 py-0.5 rounded text-[11px] font-semibold">हिंदी / English</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-forest flex items-center justify-center text-lime shadow-md group-hover:scale-105 transition-transform">
              <HardHat className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-forest flex items-center gap-1">
                KAAM<span className="text-cta">SETU</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted -mt-1">
                कामसेतु • WORKFORCE
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-text-primary">
            <Link href="/workers" className="hover:text-forest transition-colors py-2 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-sage" /> Find Workers <span className="text-xs text-text-muted font-normal">(श्रमिक खोजें)</span>
            </Link>
            <Link href="/services" className="hover:text-forest transition-colors py-2">
              Services <span className="text-xs text-text-muted font-normal">(सेवाएं)</span>
            </Link>
            <Link href="/tenders" className="hover:text-forest transition-colors py-2">
              Tenders <span className="text-xs text-text-muted font-normal">(टेंडर)</span>
            </Link>
            <Link href="/contractor" className="hover:text-forest transition-colors py-2">
              Bulk Hiring <span className="text-xs text-text-muted font-normal">(बल्क हायरिंग)</span>
            </Link>
            <Link href="/register/worker" className="text-sage font-bold hover:text-forest transition-colors py-2 flex items-center gap-1">
              Join as Worker <span className="bg-sage/10 text-forest text-[11px] px-2 py-0.5 rounded-full">Earn ₹30k+</span>
            </Link>
          </nav>

          {/* Action Buttons / Auth State */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-bg border border-border hover:border-forest transition-all text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-forest text-lime flex items-center justify-center font-bold text-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-text-primary leading-tight truncate max-w-[120px]">{user.fullName}</p>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{user.activeRole}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-elevated border border-border py-2 z-50">
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-bg font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-forest" /> Go to Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-status-danger hover:bg-status-dangerSoft font-medium text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-bold text-forest hover:bg-bg transition-colors"
                >
                  Login <span className="text-xs font-normal text-text-muted">(लॉगिन)</span>
                </Link>
                <Link
                  href="/register/customer"
                  className="px-4 py-2.5 rounded-xl bg-cta hover:bg-cta-hover text-white text-sm font-bold shadow-sm transition-all hover:shadow"
                >
                  Book Worker <span className="text-xs font-medium opacity-90">(काम बुक करें)</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            {user ? (
              <Link
                href={getDashboardLink()}
                className="w-9 h-9 rounded-full bg-forest text-lime flex items-center justify-center font-bold text-xs shadow-xs"
              >
                {user.fullName.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-bold text-forest border border-border rounded-lg"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-primary hover:bg-bg transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border">
            <Link
              href="/register/customer"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-cta text-white font-bold text-center text-sm shadow-sm"
            >
              Need Worker<br />
              <span className="text-xs font-normal opacity-90">काम करवाना है</span>
            </Link>
            <Link
              href="/register/worker"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-forest text-lime font-bold text-center text-sm shadow-sm"
            >
              Join as Worker<br />
              <span className="text-xs font-normal opacity-90">काम चाहिए</span>
            </Link>
          </div>

          <div className="flex flex-col space-y-1">
            <Link
              href="/workers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg flex items-center justify-between"
            >
              <span>Find Workers (श्रमिक खोजें)</span>
              <span className="text-xs text-sage font-semibold">Instant Dispatch</span>
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg"
            >
              All Services (सभी सेवाएं)
            </Link>
            <Link
              href="/tenders"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg"
            >
              Workforce Tenders (टेंडर व ठेके)
            </Link>
            <Link
              href="/contractor"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg"
            >
              Bulk Hiring for Contractors (बल्क मैनपावर)
            </Link>
            {user && (
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-bold text-forest bg-sage/10 flex items-center justify-between"
              >
                <span>My Dashboard ({user.activeRole})</span>
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </Link>
            )}
          </div>

          <div className="pt-2 border-t border-border flex justify-between items-center text-xs text-text-muted">
            <span>24x7 Helpline: 1800-KAAMSETU</span>
            {user && (
              <button onClick={handleLogout} className="text-status-danger font-bold">
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
