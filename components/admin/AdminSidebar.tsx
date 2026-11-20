'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  Search,
  Users,
  HardHat,
  Building2,
  Briefcase,
  ShieldCheck,
  Wrench,
  FileText,
  UserCheck,
  FolderGit2,
  Wallet,
  Receipt,
  ArrowUpRight,
  CreditCard,
  Radio,
  BarChart3,
  Database,
  Bell,
  HelpCircle,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { LogoIcon } from '@/components/Logo';

export interface AdminSidebarProps {
  onCloseMobile?: () => void;
  pendingKycCount?: number;
  pendingWithdrawalsCount?: number;
  activeJobsCount?: number;
}

export default function AdminSidebar({
  onCloseMobile,
  pendingKycCount = 0,
  pendingWithdrawalsCount = 0,
  activeJobsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navGroups = [
    {
      group: 'COMMAND & SEARCH',
      items: [
        { label: 'Control Room', href: '/admin', icon: LayoutDashboard },
        { label: 'Universal Search', href: '/admin/search', icon: Search, badge: 'Ctrl+K' },
      ],
    },
    {
      group: 'IDENTITY & WORKFORCE',
      items: [
        { label: 'All Users', href: '/admin/users', icon: Users },
        { label: 'Workers Fleet', href: '/admin/workers', icon: HardHat },
        { label: 'Contractors', href: '/admin/contractors', icon: Building2 },
        { label: 'Hiring Partners', href: '/admin/hiring-partners', icon: Briefcase },
        { 
          label: 'KYC Management', 
          href: '/admin/kyc', 
          icon: ShieldCheck, 
          badge: pendingKycCount > 0 ? `${pendingKycCount} pending` : undefined,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
        },
      ],
    },
    {
      group: 'OPERATIONS & RECRUITMENT',
      items: [
        { 
          label: 'Jobs & Work', 
          href: '/admin/jobs', 
          icon: Wrench, 
          badge: activeJobsCount > 0 ? `${activeJobsCount} live` : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        },
        { label: 'Applications', href: '/admin/applications', icon: FileText },
        { label: 'Recruitment & Tenders', href: '/admin/recruitment', icon: UserCheck },
        { label: 'Projects & Workforce', href: '/admin/projects', icon: FolderGit2 },
        { label: 'Live Operations Radar', href: '/admin/operations', icon: Radio },
      ],
    },
    {
      group: 'FINANCE & LEDGERS',
      items: [
        { label: 'Wallet & Earnings', href: '/admin/wallets', icon: Wallet },
        { 
          label: 'Platform Fee Ledger (₹99)', 
          href: '/admin/platform-fees', 
          icon: Receipt,
          highlight: true 
        },
        { 
          label: 'Withdrawals & Payouts', 
          href: '/admin/withdrawals', 
          icon: ArrowUpRight,
          badge: pendingWithdrawalsCount > 0 ? `${pendingWithdrawalsCount} new` : undefined,
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
        },
        { label: 'Payment Gateway', href: '/admin/finance', icon: CreditCard },
      ],
    },
    {
      group: 'SYSTEM & GOVERNANCE',
      items: [
        { label: 'Database Explorer (Atlas)', href: '/admin/database', icon: Database, isNew: true },
        { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
        { label: 'Notifications Hub', href: '/admin/notifications', icon: Bell },
        { label: 'Support & Disputes', href: '/admin/support', icon: HelpCircle },
        { label: 'System Settings', href: '/admin/settings', icon: Settings },
        { label: 'Security & Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-white/95 backdrop-blur-xl border-r border-[#D1E8F8] flex flex-col h-full shadow-sm select-none">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-[#EAF6FF] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2583D5] to-[#1E70B8] flex items-center justify-center text-white shadow-md shadow-[#2583D5]/20">
            <LogoIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-black text-base tracking-tight">KAAM<span className="text-[#2583D5]">SETU</span></span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#EAF6FF] text-[#2583D5] px-1.5 py-0.5 rounded-md border border-[#D1E8F8]">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-[11px] text-[#7697B3] font-semibold">Central Command Center</p>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 custom-scrollbar text-xs">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-black tracking-wider uppercase text-[#7697B3]">
              {group.group}
            </h3>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                      isActive
                        ? 'bg-[#2583D5] text-white shadow-sm shadow-[#2583D5]/20'
                        : item.highlight
                        ? 'text-[#2583D5] bg-[#EAF6FF]/80 hover:bg-[#EAF6FF] border border-[#D1E8F8]'
                        : 'text-[#4B6F8E] hover:text-[#153451] hover:bg-[#F5FAFF]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-[#2583D5]' : 'text-[#7697B3]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.badge && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${
                          isActive 
                            ? 'bg-white/20 text-white border-white/30' 
                            : item.badgeColor || 'bg-[#F5FAFF] text-[#4B6F8E] border-[#D1E8F8]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.isNew && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-500 text-white animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Quick Switch & Exit */}
      <div className="p-4 border-t border-[#EAF6FF] bg-[#F5FAFF]/60 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#2583D5] text-white font-bold flex items-center justify-center text-[11px] shrink-0">
              SA
            </div>
            <div className="min-w-0 truncate">
              <p className="font-black text-[#153451] text-[11px] truncate">Admin Control Room</p>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MongoDB Atlas Active
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <Link
            href="/hiring/dashboard"
            className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-[#D1E8F8] hover:border-[#2583D5] text-[11px] font-bold text-[#153451] text-center transition flex items-center justify-center gap-1"
            title="Open Customer Discovery Portal"
          >
            <span>Customer App</span>
            <ExternalLink className="w-3 h-3 text-[#7697B3]" />
          </Link>
          <Link
            href="/api/auth/logout"
            className="py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition flex items-center gap-1"
            title="Logout"
          >
            <LogOut className="w-3 h-3" />
          </Link>
        </div>
      </div>

    </aside>
  );
}
