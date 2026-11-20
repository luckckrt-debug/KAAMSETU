'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  UserPlus, 
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';

interface AuthUser {
  fullName: string;
  activeRole: string;
  phoneNumber: string;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication session on mount and on route changes
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser({
          fullName: data.user.fullName,
          activeRole: data.user.roles?.[0] || 'CUSTOMER',
          phoneNumber: data.user.phoneNumber,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, [pathname]);

  // Determine user-specific dashboard link
  const getDashboardLink = () => {
    if (!user) return '/login?redirect=dashboard';
    const role = (user.activeRole || '').toUpperCase();
    if (role === 'WORKER') return '/worker/dashboard';
    if (role === 'CONTRACTOR' || role === 'TENDER_OWNER') return '/contractor/dashboard';
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return '/admin';
    return '/hiring/dashboard';
  };

  // Determine role display tag
  const getRoleLabel = () => {
    if (!user) return 'लॉगिन';
    const role = (user.activeRole || '').toUpperCase();
    if (role === 'WORKER') return 'कारीगर';
    if (role === 'CONTRACTOR' || role === 'TENDER_OWNER') return 'ठेकेदार';
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return 'व्यवस्थापक';
    return 'ग्राहक';
  };

  // Active status checks
  const isHomeActive = pathname === '/';
  const isFindWorkerActive = pathname.startsWith('/workers') || pathname.startsWith('/hiring/nearby');
  const isRegisterActive = pathname.startsWith('/register') || pathname === '/contractor';
  const isDashboardActive = 
    pathname.includes('/dashboard') || 
    pathname.startsWith('/admin') ||
    (user && (pathname.startsWith('/worker') || pathname.startsWith('/contractor') || pathname.startsWith('/hiring')));

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-[#D1E8F8] shadow-[0_-8px_25px_rgba(37,131,213,0.12)] transition-all select-none"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="grid grid-cols-4 items-center px-2 py-1.5 max-w-lg mx-auto">
        
        {/* 1. HOME TAB */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative group ${
            isHomeActive
              ? 'text-[#2583D5] font-black'
              : 'text-[#7697B3] hover:text-[#153451] font-semibold'
          }`}
        >
          {isHomeActive && (
            <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-[#2583D5] shadow-xs" />
          )}
          <div className={`p-1 rounded-xl transition-transform ${
            isHomeActive ? 'scale-110 bg-[#EAF6FF]' : 'group-active:scale-95'
          }`}>
            <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5] text-[#2583D5]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[11px] leading-tight mt-0.5 ${isHomeActive ? 'text-[#153451] font-black' : ''}`}>
            Home
          </span>
          <span className="text-[9px] leading-none text-[#7697B3]">
            होम
          </span>
        </Link>

        {/* 2. FIND WORKER TAB */}
        <Link
          href="/workers"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative group ${
            isFindWorkerActive
              ? 'text-[#2583D5] font-black'
              : 'text-[#7697B3] hover:text-[#153451] font-semibold'
          }`}
        >
          {isFindWorkerActive && (
            <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-[#2583D5] shadow-xs" />
          )}
          <div className={`p-1 rounded-xl transition-transform ${
            isFindWorkerActive ? 'scale-110 bg-[#EAF6FF]' : 'group-active:scale-95'
          }`}>
            <Search className={`w-5 h-5 ${isFindWorkerActive ? 'stroke-[2.5] text-[#2583D5]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[11px] leading-tight mt-0.5 truncate max-w-full ${isFindWorkerActive ? 'text-[#153451] font-black' : ''}`}>
            Find Worker
          </span>
          <span className="text-[9px] leading-none text-[#7697B3]">
            कारीगर
          </span>
        </Link>

        {/* 3. REGISTER TAB */}
        <Link
          href="/register"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative group ${
            isRegisterActive
              ? 'text-[#2583D5] font-black'
              : 'text-[#7697B3] hover:text-[#153451] font-semibold'
          }`}
        >
          {isRegisterActive && (
            <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-[#2583D5] shadow-xs" />
          )}
          <div className={`p-1 rounded-xl transition-transform ${
            isRegisterActive ? 'scale-110 bg-[#EAF6FF]' : 'group-active:scale-95'
          }`}>
            <UserPlus className={`w-5 h-5 ${isRegisterActive ? 'stroke-[2.5] text-[#2583D5]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[11px] leading-tight mt-0.5 ${isRegisterActive ? 'text-[#153451] font-black' : ''}`}>
            Register
          </span>
          <span className="text-[9px] leading-none text-[#7697B3]">
            पंजीकरण
          </span>
        </Link>

        {/* 4. DASHBOARD TAB (With Live Session & Home Navigation) */}
        <Link
          href={getDashboardLink()}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative group ${
            isDashboardActive
              ? 'text-[#2583D5] font-black'
              : 'text-[#7697B3] hover:text-[#153451] font-semibold'
          }`}
        >
          {isDashboardActive && (
            <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-[#2583D5] shadow-xs" />
          )}
          
          <div className="relative">
            <div className={`p-1 rounded-xl transition-transform ${
              isDashboardActive ? 'scale-110 bg-[#EAF6FF]' : 'group-active:scale-95'
            }`}>
              <LayoutDashboard className={`w-5 h-5 ${isDashboardActive ? 'stroke-[2.5] text-[#2583D5]' : 'stroke-[1.8]'}`} />
            </div>

            {/* Authenticated active session pulse dot */}
            {user && (
              <span 
                className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300"
                title={`${user.fullName} (${user.activeRole})`}
              />
            )}
          </div>

          <span className={`text-[11px] leading-tight mt-0.5 truncate max-w-full ${isDashboardActive ? 'text-[#153451] font-black' : ''}`}>
            Dashboard
          </span>
          <span className={`text-[9px] leading-none ${user ? 'text-emerald-700 font-bold' : 'text-[#7697B3]'}`}>
            {getRoleLabel()}
          </span>
        </Link>

      </div>
    </nav>
  );
}
