'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  MessageSquare, 
  ArrowRight, 
  Users, 
  Wallet, 
  Clock, 
  TrendingUp, 
  HardHat, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  ChevronRight, 
  Gift, 
  Info,
  Sparkles,
  ExternalLink,
  Download,
  X
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HiringReferralsDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/referrals/me')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error('Error fetching referral data:', err))
      .finally(() => setLoading(false));
  }, []);

  const referralCode = data?.referral?.code || 'DW-HP-2026';
  const referralLink = data?.referral?.link || (typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${referralCode}` : `https://kaamsetu-gamma.vercel.app/register?ref=${referralCode}`);
  const qrCodeUrl = data?.referral?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(referralLink)}`;
  const shareMessage = data?.referral?.shareMessage || `Join DigiWork — India's verified platform for skilled workforce, daily services and contractor jobs! Register using my referral link to get priority booking and verification benefits: ${referralLink}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: "DigiWork Refer & Earn",
          text: shareMessage,
          url: referralLink,
        });
      } catch (e) {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Refer & Earn Rewards"
      subtitle="दोस्तों, श्रमिकों व ठेकेदारों को जोड़ें और हर सफल सत्यापन पर पाएं नकद पुरस्कार"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/hiring/referrals/ledger"
            className="px-4 py-2 rounded-xl bg-white border border-[#D7E3F1] text-[#0B1F3A] hover:bg-[#F5F8FC] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Wallet className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Referral Ledger</span>
          </Link>
          <Link
            href="/hiring/referrals/list"
            className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-[#2563EB]/20"
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Referrals ({data?.stats?.totalInvited || 0})</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-12">

        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1F3A] via-[#153451] to-[#0B1F3A] text-white p-6 sm:p-8 shadow-xl border border-white/10">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unlimited Referral Rewards Active</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Invite Workers, Friends & Contractors. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-[#93C5FD]">
                  Earn Up to ₹350 Per Successful Referral.
                </span>
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Every verified contact you invite benefits India&apos;s digital workforce. Rewards are credited directly to your partner wallet once your referral completes their first verified booking or work assignment.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs transition shadow-md flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Share via WhatsApp</span>
                </button>
                <button
                  onClick={handleNativeShare}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Referral Link</span>
                </button>
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show QR</span>
                </button>
              </div>
            </div>

            {/* Quick Share Code Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Referral Code</span>
                <span className="text-[11px] font-bold text-[#38BDF8] bg-[#38BDF8]/20 px-2.5 py-0.5 rounded-full border border-[#38BDF8]/30">
                  Instant Verification
                </span>
              </div>

              {/* Code display pill */}
              <div className="bg-[#0B1F3A]/80 border border-white/20 rounded-xl p-3 flex items-center justify-between">
                <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-widest pl-2">
                  {referralCode}
                </span>
                <button
                  onClick={copyCode}
                  className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Personal Link */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-300">Personal Registration Link:</span>
                <div className="bg-[#0B1F3A]/60 border border-white/15 rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-200 truncate font-mono">
                    {referralLink}
                  </span>
                  <button
                    onClick={copyLink}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition shrink-0"
                    title="Copy full referral link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Clicks tracked: <strong className="text-white">{data?.referral?.clicksCount || 0}</strong></span>
                <span>Fraud prevention: <strong className="text-emerald-400">Strict Lock Active</strong></span>
              </div>
            </div>

          </div>
        </div>

        {/* METRICS OVERVIEW */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D7E3F1] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#2563EB]" /> Total Earned
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
              ₹{data?.stats?.totalEarnings || 0}
            </div>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <span>Lifetime referral rewards</span>
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D7E3F1] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Available Balance
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">
              ₹{data?.stats?.availableBalance || 0}
            </div>
            <Link href="/hiring/referrals/ledger" className="text-[10px] text-[#2563EB] font-bold hover:underline flex items-center gap-0.5">
              <span>Withdraw or spend →</span>
            </Link>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D7E3F1] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Rewards
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-600">
              ₹{data?.stats?.pendingRewards || 0}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Awaiting review/qualifying</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D7E3F1] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Successful
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
              {data?.stats?.successfulReferrals || 0}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Rewards fully credited</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D7E3F1] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#2563EB]" /> Total Invited
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
              {data?.stats?.totalInvited || 0}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Registered via your link</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D7E3F1] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Conversion Rate
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
              {data?.stats?.conversionRate || 0}%
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Invited to rewarded</p>
          </div>

        </div>

        {/* 3 REFERRAL USER TYPES & REWARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0B1F3A]">Referral Categories & Reward Rates</h2>
              <p className="text-xs text-[#7697B3]">You can invite workers, other hiring partners, or civil contractors</p>
            </div>
            <span className="text-xs font-bold text-[#2563EB] bg-[#EDF4FC] px-3 py-1 rounded-full border border-[#D7E3F1]">
              Live Rates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* WORKER */}
            <div className="bg-white rounded-3xl p-6 border border-[#D7E3F1] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                    <HardHat className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                    ₹{data?.campaign?.rewards?.WORKER?.rewardAmount || 150} Reward
                  </span>
                </div>
                <h3 className="text-base font-black text-[#0B1F3A]">Skilled Trades & Labour</h3>
                <p className="text-xs text-[#7697B3] leading-relaxed">
                  Electricians, plumbers, carpenters, painters, masons & daily wage workers seeking job calls.
                </p>
                <div className="bg-[#F5F8FC] p-3 rounded-xl border border-[#E5EEF8] space-y-1.5 text-[11px] text-[#0B1F3A]">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <Check className="w-3.5 h-3.5" />
                    <span>Qualifying Event:</span>
                  </div>
                  <p className="text-[#55738E] pl-5">Worker completes first verified booking on DigiWork.</p>
                </div>
              </div>
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-2.5 rounded-xl bg-white border border-[#2563EB] text-[#2563EB] hover:bg-[#EDF4FC] text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Invite Skilled Worker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* HIRING PARTNER */}
            <div className="bg-white rounded-3xl p-6 border border-[#2563EB]/40 ring-1 ring-[#2563EB]/20 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-[#2563EB] text-white text-[9px] font-black px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                Popular
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#EDF4FC] text-[#2563EB] flex items-center justify-center font-black">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-[#2563EB] bg-[#EDF4FC] px-3 py-1 rounded-full border border-[#D7E3F1]">
                    ₹{data?.campaign?.rewards?.HIRING_PARTNER?.rewardAmount || 200} Reward
                  </span>
                </div>
                <h3 className="text-base font-black text-[#0B1F3A]">Homeowners, SMEs & Peers</h3>
                <p className="text-xs text-[#7697B3] leading-relaxed">
                  Neighbors, business associates, contractors, and friends who need reliable on-demand help.
                </p>
                <div className="bg-[#F5F8FC] p-3 rounded-xl border border-[#E5EEF8] space-y-1.5 text-[11px] text-[#0B1F3A]">
                  <div className="flex items-center gap-1.5 font-bold text-[#2563EB]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Qualifying Event:</span>
                  </div>
                  <p className="text-[#55738E] pl-5">Partner completes their first verified service booking.</p>
                </div>
              </div>
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-[#2563EB]/20"
              >
                <span>Invite Hiring Partner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CONTRACTOR */}
            <div className="bg-white rounded-3xl p-6 border border-[#D7E3F1] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-indigo-800 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-300">
                    ₹{data?.campaign?.rewards?.CONTRACTOR?.rewardAmount || 350} Reward
                  </span>
                </div>
                <h3 className="text-base font-black text-[#0B1F3A]">Civil Contractors & Builders</h3>
                <p className="text-xs text-[#7697B3] leading-relaxed">
                  Construction firms, site engineers & infra companies needing bulk workforce muster rolls.
                </p>
                <div className="bg-[#F5F8FC] p-3 rounded-xl border border-[#E5EEF8] space-y-1.5 text-[11px] text-[#0B1F3A]">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-700">
                    <Check className="w-3.5 h-3.5" />
                    <span>Qualifying Event:</span>
                  </div>
                  <p className="text-[#55738E] pl-5">Contractor creates project & deploys active workforce.</p>
                </div>
              </div>
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-2.5 rounded-xl bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Invite Builder / Contractor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* HOW IT WORKS / STEP PROGRESS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D7E3F1] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0B1F3A]">How Referral Rewards Work</h2>
              <p className="text-xs text-[#7697B3]">Transparent, non-custodial milestone reward steps</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Fraud Protected</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            
            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-[#E5EEF8] space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-black text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="text-xs font-black text-[#0B1F3A]">Share Your Link</h4>
              <p className="text-[11px] text-[#7697B3] leading-relaxed">
                Send your unique referral code or invitation link to friends, workers, or builders.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-[#E5EEF8] space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-black text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="text-xs font-black text-[#0B1F3A]">They Register</h4>
              <p className="text-[11px] text-[#7697B3] leading-relaxed">
                They sign up on DigiWork with your code. Attribution is locked to your account permanently.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-[#E5EEF8] space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-black text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="text-xs font-black text-[#0B1F3A]">Qualifying Activity</h4>
              <p className="text-[11px] text-[#7697B3] leading-relaxed">
                They complete their first verified booking or work deployment. Fraud checks run automatically.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                4
              </div>
              <h4 className="text-xs font-black text-emerald-900">Instant Wallet Credit</h4>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Reward (₹150 - ₹350) is credited to your balance. Withdraw via UPI or use toward bookings.
              </p>
            </div>

          </div>
        </div>

        {/* QUICK NAVIGATION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/hiring/referrals/list"
            className="p-6 bg-white rounded-3xl border border-[#D7E3F1] shadow-sm hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Real-time Tracking
              </span>
              <h3 className="text-base font-black text-[#0B1F3A] group-hover:text-[#2563EB] transition">
                View My Referred Users ({data?.stats?.totalInvited || 0})
              </h3>
              <p className="text-xs text-[#7697B3]">
                Check individual verification status, qualifying milestones, and earned rewards.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#EDF4FC] text-[#2563EB] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition shrink-0 ml-4">
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>

          <Link
            href="/hiring/referrals/ledger"
            className="p-6 bg-white rounded-3xl border border-[#D7E3F1] shadow-sm hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4" /> Immutable Ledger
              </span>
              <h3 className="text-base font-black text-[#0B1F3A] group-hover:text-[#2563EB] transition">
                Referral Earning Ledger & Balance (₹{data?.stats?.availableBalance || 0})
              </h3>
              <p className="text-xs text-[#7697B3]">
                Audit complete transaction history, reward credits, and initiate instant UPI withdrawals.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition shrink-0 ml-4">
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        </div>

      </div>

      {/* QR CODE MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-[#0B1F3A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#D7E3F1] space-y-5 text-center relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#0B1F3A] p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#0B1F3A]">Scan & Join DigiWork</h3>
              <p className="text-xs text-[#7697B3]">Point phone camera to register with your referral code</p>
            </div>

            <div className="bg-[#F5F8FC] p-4 rounded-2xl border border-[#D7E3F1] inline-block shadow-inner">
              <img
                src={qrCodeUrl}
                alt="DigiWork Referral QR Code"
                className="w-48 h-48 mx-auto rounded-xl shadow-sm bg-white p-2"
              />
            </div>

            <div className="bg-[#EDF4FC] p-2.5 rounded-xl border border-[#D7E3F1] flex items-center justify-center gap-2">
              <span className="text-xs font-mono font-bold text-[#0B1F3A]">{referralCode}</span>
              <button
                onClick={copyCode}
                className="text-[11px] font-bold text-[#2563EB] hover:underline"
              >
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#0B1F3A] text-white text-xs font-bold hover:bg-[#153451] transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
