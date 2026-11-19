'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  FileText, 
  Briefcase, 
  DollarSign, 
  Wallet, 
  Clock, 
  User, 
  Settings, 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  CalendarCheck, 
  Layers, 
  Award,
  CreditCard,
  UserCheck,
  FolderKanban,
  HardHat,
  ShieldCheck,
  Bell,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export type DashboardRole = 'WORKER' | 'HIRING_PARTNER' | 'CONTRACTOR';

interface NavItem {
  name: string;
  nameHi?: string;
  href: string;
  icon: any;
  badge?: string;
}

export const WORKER_NAV: NavItem[] = [
  { name: 'Home', nameHi: 'डैशबोर्ड', href: '/worker/dashboard', icon: Home },
  { name: 'Find Work', nameHi: 'काम खोजें', href: '/worker/jobs', icon: Search, badge: 'Hot' },
  { name: 'My Applications', nameHi: 'मेरे आवेदन', href: '/worker/applications', icon: FileText },
  { name: 'Active Jobs', nameHi: 'सक्रिय काम', href: '/worker/active-job', icon: Briefcase, badge: 'GPS' },
  { name: 'Earnings', nameHi: 'कमाई', href: '/worker/earnings', icon: DollarSign },
  { name: 'Wallet', nameHi: 'वॉलेट व निकासी', href: '/worker/wallet', icon: Wallet },
  { name: 'Work History', nameHi: 'काम का इतिहास', href: '/worker/history', icon: Clock },
  { name: 'Profile', nameHi: 'मेरी प्रोफाइल', href: '/worker/profile', icon: User },
  { name: 'Documents / KYC', nameHi: 'आधार सत्यापन', href: '/worker/verification', icon: ShieldCheck },
  { name: 'Settings', nameHi: 'सेटिंग्स व मदद', href: '/worker/settings', icon: Settings },
];

export const HIRING_PARTNER_NAV: NavItem[] = [
  { name: 'Home', nameHi: 'डैशबोर्ड', href: '/hiring/dashboard', icon: Home },
  { name: 'Hiring Requirements', nameHi: 'भर्ती आवश्यकताएं', href: '/hiring/requirements', icon: Briefcase },
  { name: 'Post Vacancy', nameHi: 'नई भर्ती पोस्ट करें', href: '/hiring/post-vacancy', icon: PlusCircle, badge: 'New' },
  { name: 'Applicants', nameHi: 'आवेदक', href: '/hiring/applicants', icon: Users },
  { name: 'Shortlisted', nameHi: 'शॉर्टलिस्टेड', href: '/hiring/shortlisted', icon: UserCheck },
  { name: 'Selected Candidates', nameHi: 'चयनित उम्मीदवार', href: '/hiring/selected', icon: CheckCircle2 },
  { name: 'Recruitment Projects', nameHi: 'भर्ती प्रोजेक्ट्स', href: '/hiring/projects', icon: FolderKanban },
  { name: 'Analytics', nameHi: 'भर्ती आंकड़े', href: '/hiring/analytics', icon: TrendingUp },
  { name: 'Profile', nameHi: 'कंपनी प्रोफाइल', href: '/hiring/profile', icon: User },
  { name: 'Settings', nameHi: 'सेटिंग्स व मदद', href: '/hiring/settings', icon: Settings },
];

export const CONTRACTOR_NAV: NavItem[] = [
  { name: 'Home', nameHi: 'डैशबोर्ड', href: '/contractor/dashboard', icon: Home },
  { name: 'Projects', nameHi: 'प्रोजेक्ट्स व टेंडर्स', href: '/contractor/projects', icon: Building2 },
  { name: 'Post Work', nameHi: 'टेंडर / काम पोस्ट करें', href: '/contractor/post-work', icon: PlusCircle, badge: 'Tender' },
  { name: 'Applications', nameHi: 'श्रमिक आवेदन', href: '/contractor/applications', icon: FileText },
  { name: 'Workforce', nameHi: 'कार्यबल प्रबंधन', href: '/contractor/workforce', icon: Users },
  { name: 'Assignments', nameHi: 'साइट डिप्लॉयमेंट', href: '/contractor/assignments', icon: Layers },
  { name: 'Attendance', nameHi: 'मस्टर रोल उपस्थिति', href: '/contractor/attendance', icon: CalendarCheck },
  { name: 'Payments', nameHi: 'बजट व भुगतान', href: '/contractor/payments', icon: CreditCard },
  { name: 'Profile', nameHi: 'ठेकेदार प्रोफाइल', href: '/contractor/profile', icon: User },
  { name: 'Settings', nameHi: 'सेटिंग्स व मदद', href: '/contractor/settings', icon: Settings },
];

interface RoleSidebarProps {
  role: DashboardRole;
  user?: any;
  onCloseMobile?: () => void;
}

export default function RoleSidebar({ role, user, onCloseMobile }: RoleSidebarProps) {
  const pathname = usePathname();

  let navItems = WORKER_NAV;
  let roleTitle = 'KaamSetu Worker';
  let roleSubtitle = 'कुशल श्रमिक कार्यस्थल';
  let roleBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let activeItemClass = 'bg-[#2583D5] text-white shadow-md shadow-[#2583D5]/20 font-bold';
  let inactiveItemClass = 'text-[#153451] hover:bg-[#EAF6FF] hover:text-[#2583D5]';
  let roleIcon = HardHat;

  if (role === 'HIRING_PARTNER') {
    navItems = HIRING_PARTNER_NAV;
    roleTitle = 'Hiring Partner';
    roleSubtitle = 'भर्ती व कर्मचारी चयन पोर्टल';
    roleBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
    activeItemClass = 'bg-[#2583D5] text-white shadow-md shadow-[#2583D5]/20 font-bold';
    inactiveItemClass = 'text-[#153451] hover:bg-[#EAF6FF] hover:text-[#2583D5]';
    roleIcon = Users;
  } else if (role === 'CONTRACTOR') {
    navItems = CONTRACTOR_NAV;
    roleTitle = 'Contractor Hub';
    roleSubtitle = 'निर्माण व प्रोजेक्ट प्रबंधन';
    roleBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
    activeItemClass = 'bg-[#153451] text-lime shadow-md shadow-slate-900/20 font-bold';
    inactiveItemClass = 'text-[#153451] hover:bg-slate-100 hover:text-slate-900';
    roleIcon = Building2;
  }

  const RoleHeaderIcon = roleIcon;

  return (
    <aside className="w-64 bg-white border-r border-[#D9EEFF] flex flex-col justify-between h-full select-none">
      {/* Brand & Role Header */}
      <div>
        <div className="p-5 border-b border-[#D9EEFF]">
          <Link href="/" className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#2583D5] text-white flex items-center justify-center font-black shadow-sm">
              <RoleHeaderIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-[#153451] tracking-tight block">KAAMSETU</span>
              <span className="text-[10px] font-bold text-[#4B6F8E] block -mt-1 tracking-wider uppercase">
                {role.replace('_', ' ')}
              </span>
            </div>
          </Link>

          <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-between ${roleBadgeClass}`}>
            <span className="truncate">{roleTitle}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-1"></span>
          </div>
        </div>

        {/* Dynamic Navigation Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  isActive ? activeItemClass : inactiveItemClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-inherit' : 'text-[#4B6F8E]'}`} />
                  <div>
                    <span className="font-semibold block leading-tight">{item.name}</span>
                    {item.nameHi && (
                      <span className={`text-[10px] block leading-tight opacity-75 ${isActive ? 'text-white/80' : 'text-[#4B6F8E]'}`}>
                        {item.nameHi}
                      </span>
                    )}
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#EAF6FF] text-[#2583D5]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout Info */}
      <div className="p-4 border-t border-[#D9EEFF] bg-[#F8FCFF]">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#153451] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#153451] truncate">{user.fullName || 'User'}</p>
                <p className="text-[10px] text-[#4B6F8E] font-mono truncate">+91 {user.phoneNumber}</p>
              </div>
            </div>
            <Link
              href={`/${role.toLowerCase().replace('_', '-')}/settings`}
              className="p-1.5 rounded-lg text-[#4B6F8E] hover:text-[#153451] hover:bg-white transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="text-[11px] text-[#4B6F8E] flex items-center justify-between">
            <span>KaamSetu Platform v2.0</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        )}
      </div>
    </aside>
  );
}
