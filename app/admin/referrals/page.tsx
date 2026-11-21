'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  RefreshCw, 
  Settings, 
  Users, 
  Wallet, 
  Check, 
  X, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminReferralManagementPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'approvals' | 'fraud'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Campaign form state
  const [campaignName, setCampaignName] = useState('');
  const [campaignStatus, setCampaignStatus] = useState<'ACTIVE' | 'PAUSED' | 'ENDED'>('ACTIVE');
  const [workerReward, setWorkerReward] = useState('150');
  const [workerApproval, setWorkerApproval] = useState<'AUTOMATIC' | 'MANUAL_REVIEW'>('AUTOMATIC');
  const [workerQualifying, setWorkerQualifying] = useState('FIRST_BOOKING_COMPLETED');
  
  const [partnerReward, setPartnerReward] = useState('200');
  const [partnerApproval, setPartnerApproval] = useState<'AUTOMATIC' | 'MANUAL_REVIEW'>('AUTOMATIC');
  const [partnerQualifying, setPartnerQualifying] = useState('FIRST_BOOKING_COMPLETED');

  const [contractorReward, setContractorReward] = useState('350');
  const [contractorApproval, setContractorApproval] = useState<'AUTOMATIC' | 'MANUAL_REVIEW'>('MANUAL_REVIEW');
  const [contractorQualifying, setContractorQualifying] = useState('FIRST_ASSIGNMENT_COMPLETED');
  
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [campaignNotice, setCampaignNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Approval action modal state
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; action: 'APPROVE' | 'REJECT'; referralId: string; referredName: string; amount: number } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchOverview = () => {
    fetch('/api/admin/referrals/overview')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setOverview(d);
          const c = d.campaign;
          if (c) {
            setCampaignName(c.name || 'DigiWork Partner Rewards 2026');
            setCampaignStatus(c.status || 'ACTIVE');
            if (c.rewards?.WORKER) {
              setWorkerReward(String(c.rewards.WORKER.rewardAmount));
              setWorkerApproval(c.rewards.WORKER.approvalMode);
              setWorkerQualifying(c.rewards.WORKER.qualifyingAction);
            }
            if (c.rewards?.HIRING_PARTNER) {
              setPartnerReward(String(c.rewards.HIRING_PARTNER.rewardAmount));
              setPartnerApproval(c.rewards.HIRING_PARTNER.approvalMode);
              setPartnerQualifying(c.rewards.HIRING_PARTNER.qualifyingAction);
            }
            if (c.rewards?.CONTRACTOR) {
              setContractorReward(String(c.rewards.CONTRACTOR.rewardAmount));
              setContractorApproval(c.rewards.CONTRACTOR.approvalMode);
              setContractorQualifying(c.rewards.CONTRACTOR.qualifyingAction);
            }
          }
        }
      })
      .catch((e) => console.error('Overview fetch error:', e));
  };

  const fetchRecords = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);

    fetch(`/api/admin/referrals/list?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setRecords(d.records || []);
        }
      })
      .catch((e) => console.error('Records fetch error:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
    fetchRecords();
  }, [statusFilter]);

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCampaign(true);
    setCampaignNotice(null);

    try {
      const res = await fetch('/api/admin/referrals/campaign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          status: campaignStatus,
          rewards: {
            WORKER: {
              rewardAmount: Number(workerReward),
              qualifyingAction: workerQualifying,
              approvalMode: workerApproval,
              title: 'Skilled Worker Referral',
              description: 'Reward when referred worker completes first verified booking',
            },
            HIRING_PARTNER: {
              rewardAmount: Number(partnerReward),
              qualifyingAction: partnerQualifying,
              approvalMode: partnerApproval,
              title: 'Hiring Partner Referral',
              description: 'Reward when referred partner completes first verified service booking',
            },
            CONTRACTOR: {
              rewardAmount: Number(contractorReward),
              qualifyingAction: contractorQualifying,
              approvalMode: contractorApproval,
              title: 'Contractor Referral',
              description: 'Reward when referred contractor deploys workforce',
            },
          },
        }),
      });
      const d = await res.json();
      if (d.success) {
        setCampaignNotice({ type: 'success', text: 'Campaign rules and reward rates updated successfully!' });
        fetchOverview();
      } else {
        setCampaignNotice({ type: 'error', text: d.error || 'Failed to update campaign.' });
      }
    } catch (err: any) {
      setCampaignNotice({ type: 'error', text: err?.message || 'Network error saving campaign.' });
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleReviewAction = async () => {
    if (!actionModal) return;
    setSubmittingAction(true);

    try {
      const res = await fetch('/api/admin/referrals/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionModal.action,
          referralId: actionModal.referralId,
          reason: actionReason || (actionModal.action === 'APPROVE' ? 'Approved after routine manual review' : 'Rejected by administrator'),
        }),
      });
      const d = await res.json();
      if (d.success) {
        setActionModal(null);
        setActionReason('');
        fetchOverview();
        fetchRecords();
      } else {
        alert(d.error || 'Action failed');
      }
    } catch (e: any) {
      alert(e?.message || 'Error executing action');
    } finally {
      setSubmittingAction(false);
    }
  };

  const pendingApprovalsList = records.filter(r => r.status === 'REWARD_PENDING');
  const fraudFlaggedList = records.filter(r => r.fraudCheck && !r.fraudCheck.passed);

  return (
    <AdminLayout
      title="Referral & Partner Rewards Engine"
      subtitle="रेफरल अभियान नियंत्रण कक्ष • नियम विन्यास, पुरस्कार स्वीकृति, धोखाधड़ी निवारण व लेखा परीक्षा"
      actions={
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/referrals/export"
            download
            className="px-4 py-2 rounded-xl bg-white border border-[#D1E8F8] text-[#153451] hover:bg-[#F5FAFF] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV Report</span>
          </a>
          <button
            onClick={() => { fetchOverview(); fetchRecords(); }}
            className="p-2 rounded-xl bg-white border border-[#D1E8F8] text-[#153451] hover:bg-[#F5FAFF] transition"
            title="Refresh referral engine"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">

        {/* 5 TOP METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D1E8F8] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#2563EB]" /> Total Referrals
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
              {overview?.metrics?.totalReferrals || 0}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Relationships logged</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D1E8F8] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Approvals
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-600">
              {overview?.metrics?.pendingApprovals || 0}
            </div>
            <p className="text-[10px] text-amber-700 font-bold">Needs manual review</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D1E8F8] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fully Credited
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">
              {overview?.metrics?.totalCreditedCount || 0}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Successfully settled</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D1E8F8] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Rewards Disbursed
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
              ₹{overview?.metrics?.totalRewardsDisbursed || 0}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Paid out via ledger</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D1E8F8] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#7697B3] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Fraud Radar
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-600">
              {overview?.metrics?.flaggedSuspiciousCount || 0}
            </div>
            <p className="text-[10px] text-rose-700 font-bold">Flagged attempts blocked</p>
          </div>

        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-[#D1E8F8] gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Campaign Rules & Configuration', icon: Settings },
            { id: 'records', label: `All Referral Records (${records.length})`, icon: Users },
            { id: 'approvals', label: `Pending Approvals (${pendingApprovalsList.length})`, icon: Clock, badge: pendingApprovalsList.length > 0 ? String(pendingApprovalsList.length) : undefined },
            { id: 'fraud', label: `Fraud & Abuse Radar (${fraudFlaggedList.length})`, icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-[#7697B3] hover:text-[#0B1F3A]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: CAMPAIGN RULES & CONFIGURATION */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D1E8F8] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5EEF8]">
              <div>
                <h3 className="text-base font-black text-[#0B1F3A]">Referral Campaign Engine Configuration</h3>
                <p className="text-xs text-[#7697B3]">Define role-based reward rates, qualifying events, and approval rules</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Campaign Status:</span>
                <select
                  value={campaignStatus}
                  onChange={(e) => setCampaignStatus(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-[#D1E8F8] font-bold text-xs bg-[#F5F8FC] focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Rewarding enabled)</option>
                  <option value="PAUSED">PAUSED (No new rewards)</option>
                  <option value="ENDED">ENDED (Archived)</option>
                </select>
              </div>
            </div>

            {campaignNotice && (
              <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                campaignNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}>
                {campaignNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{campaignNotice.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveCampaign} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-[#0B1F3A]">Campaign Display Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1E8F8] font-semibold text-xs bg-[#F5F8FC]"
                    required
                  />
                </div>
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-[#0B1F3A]">Referrer Max Earnings Cap (₹)</label>
                  <input
                    type="number"
                    defaultValue="50000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1E8F8] font-semibold text-xs bg-[#F5F8FC]"
                  />
                </div>
              </div>

              {/* 3 ROLE REWARD CONFIG CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
                
                {/* WORKER RULE */}
                <div className="p-5 rounded-2xl bg-[#F5F8FC] border border-[#D1E8F8] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[#0B1F3A] uppercase tracking-wider">Worker Referral</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Labour Pool
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-slate-600">Reward Amount (₹)</label>
                    <input
                      type="number"
                      value={workerReward}
                      onChange={(e) => setWorkerReward(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-white font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-slate-600">Qualifying Action</label>
                    <select
                      value={workerQualifying}
                      onChange={(e) => setWorkerQualifying(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-white font-semibold"
                    >
                      <option value="FIRST_BOOKING_COMPLETED">First Verified Booking Completed</option>
                      <option value="ACCOUNT_VERIFIED">Aadhaar KYC Verification Approved</option>
                      <option value="REGISTRATION_COMPLETED">Registration Completed (Instant)</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-slate-600">Reward Approval Mode</label>
                    <select
                      value={workerApproval}
                      onChange={(e) => setWorkerApproval(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-white font-semibold"
                    >
                      <option value="AUTOMATIC">AUTOMATIC (Instant credit)</option>
                      <option value="MANUAL_REVIEW">MANUAL_REVIEW (Admin approval queue)</option>
                    </select>
                  </div>
                </div>

                {/* HIRING PARTNER RULE */}
                <div className="p-5 rounded-2xl bg-[#F5F8FC] border border-[#D1E8F8] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[#0B1F3A] uppercase tracking-wider">Hiring Partner Referral</span>
                    <span className="text-[10px] font-bold text-[#2563EB] bg-[#EDF4FC] px-2 py-0.5 rounded-full">
                      Homeowner/SME
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-slate-600">Reward Amount (₹)</label>
                    <input
                      type="number"
                      value={partnerReward}
                      onChange={(e) => setPartnerReward(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-white font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-slate-600">Qualifying Action</label>
                    <select
                      value={partnerQualifying}
                      onChange={(e) => setPartnerQualifying(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-white font-semibold"
                    >
                      <option value="FIRST_BOOKING_COMPLETED">First Verified Service Booking</option>
                      <option value="REGISTRATION_COMPLETED">Registration Completed (Instant)</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-slate-600">Reward Approval Mode</label>
                    <select
                      value={partnerApproval}
                      onChange={(e) => setPartnerApproval(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-white font-semibold"
                    >
                      <option value="AUTOMATIC">AUTOMATIC (Instant credit)</option>
                      <option value="MANUAL_REVIEW">MANUAL_REVIEW (Admin approval queue)</option>
                    </select>
                  </div>
                </div>

                {/* CONTRACTOR RULE */}
                <div className="p-5 rounded-2xl bg-[#F5F8FC] border border-[#D1E8F8] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[#0B1F3A] uppercase tracking-wider">Contractor Referral</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Infra & Builder
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-slate-600">Reward Amount (₹)</label>
                    <input
                      type="number"
                      value={contractorReward}
                      onChange={(e) => setContractorReward(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-white font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-slate-600">Qualifying Action</label>
                    <select
                      value={contractorQualifying}
                      onChange={(e) => setContractorQualifying(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-white font-semibold"
                    >
                      <option value="FIRST_ASSIGNMENT_COMPLETED">Workforce Deployed to Project</option>
                      <option value="ACCOUNT_VERIFIED">GSTIN & Contractor KYC Verified</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-slate-600">Reward Approval Mode</label>
                    <select
                      value={contractorApproval}
                      onChange={(e) => setContractorApproval(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-white font-semibold"
                    >
                      <option value="MANUAL_REVIEW">MANUAL_REVIEW (High security)</option>
                      <option value="AUTOMATIC">AUTOMATIC (Instant credit)</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-4 border-t border-[#E5EEF8]">
                <button
                  type="submit"
                  disabled={savingCampaign}
                  className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition shadow-md shadow-[#2563EB]/20 disabled:opacity-50"
                >
                  {savingCampaign ? 'Saving Campaign Rules...' : 'Save & Publish Referral Rules'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 2: ALL REFERRAL RECORDS */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            
            <div className="bg-white p-4 rounded-2xl border border-[#D1E8F8] flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by code, referrer, or referred user ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchRecords(); }}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D1E8F8] text-xs bg-[#F5F8FC]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#D1E8F8] text-xs font-bold bg-[#F5F8FC]"
              >
                <option value="ALL">All Statuses</option>
                <option value="REWARD_PENDING">Pending Review</option>
                <option value="REWARD_CREDITED">Credited</option>
                <option value="QUALIFYING_ACTIVITY_PENDING">Qualifying Pending</option>
                <option value="INELIGIBLE">Ineligible / Reversed</option>
              </select>

              <button
                onClick={fetchRecords}
                className="px-4 py-2 rounded-xl bg-[#0B1F3A] text-white text-xs font-bold hover:bg-[#153451] transition"
              >
                Filter
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#D1E8F8] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F8FC] border-b border-[#D1E8F8] text-[#7697B3] uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th className="py-4 px-6">Referral Code</th>
                      <th className="py-4 px-6">Referrer Account</th>
                      <th className="py-4 px-6">Referred User</th>
                      <th className="py-4 px-6">Role Category</th>
                      <th className="py-4 px-6">Reward (₹)</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EEF8]">
                    {records.map((r: any) => (
                      <tr key={r.id} className="hover:bg-[#F8FCFF] transition">
                        <td className="py-4 px-6 font-mono font-bold text-[#0B1F3A]">
                          {r.referralCode}
                        </td>
                        <td className="py-4 px-6 font-medium text-[#0B1F3A]">
                          <div>{r.referrerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{r.referrerUserId}</div>
                        </td>
                        <td className="py-4 px-6 font-medium text-[#0B1F3A]">
                          <div>{r.referredName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{r.referredUserId}</div>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-700">
                          {r.referredRole}
                        </td>
                        <td className="py-4 px-6 font-black text-sm text-[#0B1F3A]">
                          ₹{r.rewardAmount}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'REWARD_CREDITED' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'REWARD_PENDING' ? 'bg-blue-100 text-blue-800' :
                            r.status === 'INELIGIBLE' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {r.status === 'REWARD_PENDING' && (
                            <button
                              onClick={() => setActionModal({ isOpen: true, action: 'APPROVE', referralId: r.id, referredName: r.referredName, amount: r.rewardAmount })}
                              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition"
                            >
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PENDING APPROVALS QUEUE */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-[#0B1F3A]">Pending Reward Review Queue ({pendingApprovalsList.length})</h3>
              <p className="text-xs text-[#7697B3]">Manual approval required before funds disburse to referrer partner balances</p>
            </div>

            {pendingApprovalsList.length === 0 ? (
              <div className="p-8 text-center bg-[#F5F8FC] rounded-2xl border border-[#D1E8F8]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-[#0B1F3A]">Queue is Clear!</h4>
                <p className="text-xs text-slate-500">No pending referral rewards currently require manual review.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5EEF8]">
                {pendingApprovalsList.map((item: any) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0B1F3A]">{item.referredName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF4FC] text-[#2563EB]">
                          {item.referredRole}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">Code: {item.referralCode}</span>
                      </div>
                      <p className="text-xs text-[#7697B3]">
                        Referrer: <strong>{item.referrerName}</strong> ({item.referrerUserId})
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Qualifying Milestone: <strong>{item.qualifyingActivity}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-emerald-600">₹{item.rewardAmount}</span>
                      <button
                        onClick={() => setActionModal({ isOpen: true, action: 'APPROVE', referralId: item.id, referredName: item.referredName, amount: item.rewardAmount })}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => setActionModal({ isOpen: true, action: 'REJECT', referralId: item.id, referredName: item.referredName, amount: item.rewardAmount })}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FRAUD & ABUSE RADAR */}
        {activeTab === 'fraud' && (
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EEF8]">
              <div>
                <h3 className="text-base font-black text-[#0B1F3A]">Referral Fraud Radar & Abuse Prevention</h3>
                <p className="text-xs text-[#7697B3]">Self-referrals, IP velocity bursts, and bot registrations automatically intercepted</p>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                Strict Guardrails Active
              </span>
            </div>

            {fraudFlaggedList.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                <h4 className="text-sm font-bold text-emerald-900">Zero Suspicious Accounts Flagged</h4>
                <p className="text-xs text-emerald-700">All registered referrals have passed self-referral & velocity checks.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fraudFlaggedList.map((f: any) => (
                  <div key={f.id} className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span className="font-bold text-xs text-rose-900">{f.referredName} ({f.referralCode})</span>
                      </div>
                      <p className="text-[11px] text-rose-700 mt-1">
                        Flags: <code>{JSON.stringify(f.fraudCheck?.flags || ['SUSPICIOUS_PATTERN'])}</code>
                      </p>
                    </div>
                    <button
                      onClick={() => setActionModal({ isOpen: true, action: 'REJECT', referralId: f.id, referredName: f.referredName, amount: f.rewardAmount })}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                    >
                      Ban & Invalidate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* APPROVAL / REJECTION CONFIRMATION MODAL */}
      {actionModal && actionModal.isOpen && (
        <div className="fixed inset-0 bg-[#0B1F3A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D1E8F8] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#0B1F3A]">
                {actionModal.action === 'APPROVE' ? 'Approve Referral Reward' : 'Reject / Reverse Referral Reward'}
              </h3>
              <button
                onClick={() => setActionModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EEF8] text-xs space-y-1">
              <div>Referred User: <strong>{actionModal.referredName}</strong></div>
              <div>Reward Amount: <strong className="text-emerald-600">₹{actionModal.amount}</strong></div>
              <div>Action: <strong className={actionModal.action === 'APPROVE' ? 'text-emerald-700' : 'text-rose-700'}>{actionModal.action}</strong></div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-[#0B1F3A]">Admin Reason / Audit Note</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={actionModal.action === 'APPROVE' ? 'e.g. Verified genuine homeowner with legitimate completed booking.' : 'e.g. Ineligible: Referral was rejected due to suspicious duplicate registration pattern.'}
                rows={3}
                className="w-full p-3 rounded-xl border border-[#D1E8F8] text-xs bg-[#F5F8FC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                required={actionModal.action === 'REJECT'}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#D1E8F8] text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewAction}
                disabled={submittingAction || (actionModal.action === 'REJECT' && !actionReason.trim())}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 ${
                  actionModal.action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submittingAction ? 'Processing...' : `Confirm ${actionModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
