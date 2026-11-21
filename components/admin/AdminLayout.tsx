'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Bell, 
  ShieldAlert, 
  Database, 
  Radio, 
  CheckCircle2, 
  User, 
  LogOut,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import UniversalSearchBar from './UniversalSearchBar';

export interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

function AdminPreviewBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAdminPreview = searchParams.get('adminPreview') === 'true';

  if (!isAdminPreview) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between text-xs font-black shadow-md z-50 sticky top-0">
      <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1">
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
        <span>⚠️ ADMIN VIEW-AS-USER PREVIEW MODE: You are inspecting this workspace in read-only administrator simulation.</span>
      </div>
      <button
        onClick={() => router.push('/admin')}
        className="px-3 py-1 rounded-lg bg-black text-white hover:bg-neutral-800 text-xs font-bold transition flex items-center gap-1 shrink-0"
      >
        <span>Exit Preview</span>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function AdminLayout({
  children,
  title,
  subtitle,
  actions,
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState({
    pendingKyc: 0,
    pendingWithdrawals: 0,
    activeJobs: 0,
  });

  useEffect(() => {
    const fetchQuickCounts = async () => {
      try {
        const res = await fetch('/api/admin/overview');
        const data = await res.json();
        if (data.success && data.metrics) {
          setCounts({
            pendingKyc: data.metrics.pendingKyc || 0,
            pendingWithdrawals: data.metrics.pendingWithdrawals || 0,
            activeJobs: data.metrics.activeJobs || 0,
          });
        }
      } catch (e) {
        // ignore
      }
    };
    fetchQuickCounts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#153451] flex flex-col font-sans">
      
      {/* Admin Preview Mode Floating Notice */}
      <React.Suspense fallback={null}>
        <AdminPreviewBanner />
      </React.Suspense>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-40">
          <AdminSidebar
            pendingKycCount={counts.pendingKyc}
            pendingWithdrawalsCount={counts.pendingWithdrawals}
            activeJobsCount={counts.activeJobs}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl">
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-[#F5FAFF] text-[#153451] hover:bg-[#EAF6FF]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <AdminSidebar
                onCloseMobile={() => setMobileMenuOpen(false)}
                pendingKycCount={counts.pendingKyc}
                pendingWithdrawalsCount={counts.pendingWithdrawals}
                activeJobsCount={counts.activeJobs}
              />
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Topbar */}
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#D1E8F8] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-[#153451]"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-[#153451] tracking-tight">
                  Control Room
                </span>
                <span className="text-[#D1E8F8]">•</span>
                <span className="text-[11px] text-[#7697B3] font-semibold">
                  MongoDB Atlas Connected
                </span>
              </div>
            </div>

            {/* Universal User Search in Topbar */}
            <div className="flex-1 max-w-xl mx-2">
              <UniversalSearchBar />
            </div>

            {/* Topbar Right Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/admin/database"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF6FF] text-[#2583D5] text-xs font-bold border border-[#D1E8F8] hover:bg-[#D9EEFF] transition"
                title="Open MongoDB Atlas Database Explorer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Atlas Explorer</span>
              </Link>

              <Link
                href="/admin/notifications"
                className="p-2 rounded-xl border border-[#D1E8F8] bg-white hover:bg-[#F5FAFF] text-[#4B6F8E] hover:text-[#153451] relative transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2583D5]" />
              </Link>

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#EAF6FF]">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2583D5] to-[#1E70B8] text-white font-black text-xs flex items-center justify-center shadow-xs">
                  SA
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-black text-[#153451] leading-none">Super Admin</div>
                  <div className="text-[10px] text-[#7697B3] font-semibold mt-0.5">DigiWork HQ</div>
                </div>
              </div>
            </div>

          </header>

          {/* Subheader / Page Title if provided */}
          {(title || actions) && (
            <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {title && <h1 className="text-2xl sm:text-3xl font-black text-[#153451] tracking-tight">{title}</h1>}
                {subtitle && <p className="text-xs sm:text-sm text-[#4B6F8E] mt-1 font-medium">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
            </div>
          )}

          {/* Page Body Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
            {children}
          </main>

        </div>

      </div>

    </div>
  );
}
