'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  User, 
  HardHat, 
  Building2, 
  Users, 
  ArrowLeft,
  ExternalLink,
  Home
} from 'lucide-react';
import RoleSidebar, { DashboardRole } from './RoleSidebar';

interface DashboardLayoutProps {
  role: DashboardRole;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardLayout({
  role,
  title,
  subtitle,
  actions,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      console.error(e);
    }
  };

  const roleMeta = {
    WORKER: {
      tag: 'DigiWork Worker (श्रमिक कार्यस्थल)',
      color: 'bg-emerald-500/10 text-emerald-800 border-emerald-300',
      icon: HardHat,
    },
    HIRING_PARTNER: {
      tag: 'DigiWork Hiring Partner (हायरिंग पोर्टल)',
      color: 'bg-blue-500/10 text-blue-800 border-blue-300',
      icon: Users,
    },
    CONTRACTOR: {
      tag: 'DigiWork Contractor (ठेकेदार पोर्टल)',
      color: 'bg-amber-500/10 text-amber-900 border-amber-300',
      icon: Building2,
    },
  }[role];

  const RoleIcon = roleMeta.icon;

  return (
    <div className="min-h-screen bg-[#F8FCFF] flex">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        <RoleSidebar role={role} user={currentUser} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 w-72 bg-white h-full shadow-2xl flex flex-col">
            <div className="p-3 border-b flex justify-end">
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <RoleSidebar role={role} user={currentUser} onCloseMobile={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Workspace Main Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-0">
        
        {/* Workspace Top Navigation Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#D9EEFF] px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#153451] hover:bg-[#EAF6FF] border border-[#D9EEFF]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Home Navigation Key */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#EDF4FC] hover:bg-[#D7E3F1] border border-[#D7E3F1] text-[#2563EB] text-xs font-bold transition shadow-2xs"
              title="Return to DigiWork Public Home"
            >
              <Home className="w-4 h-4 stroke-[2.2]" />
              <span className="hidden xs:inline">Home</span>
            </Link>

            {/* Role Header Badge */}
            <div className="flex items-center gap-2">
              <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleMeta.color}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{roleMeta.tag}</span>
              </span>
            </div>
          </div>

          {/* User Controls & Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={role === 'WORKER' ? '/worker/active-job' : role === 'HIRING_PARTNER' ? '/hiring/post-vacancy' : '/contractor/post-work'}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold transition shadow-xs"
            >
              {role === 'WORKER' && <span>Live GPS Job</span>}
              {role === 'HIRING_PARTNER' && <span>+ Post Vacancy</span>}
              {role === 'CONTRACTOR' && <span>+ Post Project</span>}
            </Link>

            {/* Notification Bell */}
            <button 
              className="p-2 rounded-xl text-[#4B6F8E] hover:bg-[#EAF6FF] hover:text-[#153451] transition relative border border-transparent hover:border-[#D9EEFF]"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2583D5]"></span>
            </button>

            {/* User Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#EAF6FF] transition"
                >
                  <div className="w-8 h-8 rounded-full bg-[#153451] text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#4B6F8E] hidden sm:block" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#D9EEFF] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-[#D9EEFF]">
                      <p className="text-xs font-bold text-[#153451] truncate">{currentUser.fullName}</p>
                      <p className="text-[10px] text-[#4B6F8E] truncate">+91 {currentUser.phoneNumber}</p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-bold transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out of Workspace</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Workspace Title & Actions Header (if provided) */}
        {(title || actions) && (
          <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#153451] tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-[#4B6F8E] mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>

              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content View */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

      </div>
    </div>
  );
}
