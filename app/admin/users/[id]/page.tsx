'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Wallet, 
  Receipt, 
  ArrowUpRight, 
  Wrench, 
  Briefcase, 
  Building2, 
  FileText, 
  Bell, 
  Clock, 
  Calendar,
  Send,
  Loader2,
  HardHat,
  ArrowRight,
  Radio,
  FileCheck
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function UserBackofficePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'PROFILE' | 'KYC' | 'JOBS' | 'LEDGER' | 'WALLET' | 'WITHDRAWALS' | 'FEES' | 'DISPUTES' | 'NOTIFICATIONS' | 'AUDIT'
  >('OVERVIEW');

  const [actionLoading, setActionLoading] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; targetStatus: string; reason: string }>({
    open: false,
    targetStatus: '',
    reason: '',
  });

  const [notificationModal, setNotificationModal] = useState<{ open: boolean; title: string; body: string }>({
    open: false,
    title: '',
    body: '',
  });

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      } else {
        alert(result.error || 'User not found');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const handleUpdateStatus = async (targetStatus: string, reason: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus, reason }),
      });
      const resData = await res.json();
      if (resData.success) {
        setStatusModal({ open: false, targetStatus: '', reason: '' });
        fetchUserData();
      } else {
        alert(resData.error || 'Failed to update user status.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLaunchPreview = async (role: string) => {
    try {
      const res = await fetch('/api/admin/preview-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: id, requestedRole: role }),
      });
      const result = await res.json();
      if (result.success && result.redirectUrl) {
        window.open(result.redirectUrl, '_blank');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="User Backoffice Profile">
        <div className="p-16 text-center text-[#7697B3] font-semibold flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#2583D5] animate-spin" />
          <span>Retrieving 360° backoffice data from MongoDB Atlas...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!data || !data.user) {
    return (
      <AdminLayout title="User Not Found">
        <div className="bg-white p-12 rounded-3xl border border-[#D1E8F8] text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-black text-[#153451]">User Record Not Found</h2>
          <p className="text-xs text-[#7697B3]">No user matches ID &quot;{id}&quot; in the database.</p>
          <Link href="/admin/users" className="inline-block px-4 py-2 bg-[#2583D5] text-white text-xs font-bold rounded-xl">
            Return to Users Directory
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const { user, workerProfile, contractorProfile, customerProfile, wallet, kycDocuments, jobs, earningsLedger, withdrawals, platformFees, complaints, notifications, auditHistory } = data;
  const isWorker = (user.roles || []).includes('WORKER');
  const isContractor = (user.roles || []).includes('CONTRACTOR');

  return (
    <AdminLayout
      title={`Backoffice: ${user.fullName}`}
      subtitle={`User ID: ${user.id} • Registered on ${new Date(user.createdAt).toLocaleDateString()}`}
      actions={
        <div className="flex items-center gap-2">
          {/* View as User Preview Button */}
          <button
            type="button"
            onClick={() => handleLaunchPreview((user.roles && user.roles[0]) || 'CUSTOMER')}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#D1E8F8] hover:border-[#2583D5] text-xs font-bold text-[#153451] transition flex items-center gap-1.5 shadow-xs"
            title="Launch read-only view of dashboard"
          >
            <span>View as User</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#2583D5]" />
          </button>

          {/* Account Status Actions */}
          {user.status === 'ACTIVE' ? (
            <button
              onClick={() => setStatusModal({ open: true, targetStatus: 'BLOCKED', reason: '' })}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Block Account</span>
            </button>
          ) : (
            <button
              onClick={() => handleUpdateStatus('ACTIVE', 'Restored by Super Admin')}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unblock Account</span>
            </button>
          )}
        </div>
      }
    >
      {/* USER PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D1E8F8] shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2583D5] to-[#1E70B8] text-white font-black text-2xl flex items-center justify-center shadow-md shadow-[#2583D5]/20">
              {user.fullName?.charAt(0) || 'U'}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-[#153451]">{user.fullName}</h1>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                  user.status === 'BLOCKED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {user.status}
                </span>
                {workerProfile?.verificationStatus === 'VERIFIED' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Aadhaar KYC Verified</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#7697B3] mt-1.5 font-medium">
                <span className="flex items-center gap-1 text-[#153451] font-semibold">
                  <Phone className="w-3.5 h-3.5 text-[#2583D5]" />
                  +91 {user.phoneNumber}
                  {user.phoneVerified && <span className="text-[10px] text-emerald-600 font-bold">(Verified)</span>}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#7697B3]" />
                  {user.email || 'No email registered'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#7697B3]" />
                  {workerProfile?.city || contractorProfile?.city || customerProfile?.city || 'Delhi NCR'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3">
            {isWorker && (
              <div className="bg-[#F5FAFF] p-3 rounded-2xl border border-[#D1E8F8] text-right">
                <span className="text-[10px] uppercase font-black text-[#7697B3] block">Wallet Balance</span>
                <span className="text-base font-black text-emerald-600">₹{wallet?.balance || 0}</span>
              </div>
            )}
            <div className="bg-[#F5FAFF] p-3 rounded-2xl border border-[#D1E8F8] text-right">
              <span className="text-[10px] uppercase font-black text-[#7697B3] block">Bookings / Jobs</span>
              <span className="text-base font-black text-[#153451]">{jobs?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* 11 Backoffice Detail Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-[#EAF6FF] text-xs font-bold scrollbar-none">
          {[
            { id: 'OVERVIEW', label: '1. Overview' },
            { id: 'PROFILE', label: '2. Profile Details' },
            { id: 'KYC', label: `3. KYC & Docs (${kycDocuments?.length || 0})` },
            { id: 'JOBS', label: `4. Jobs & Work (${jobs?.length || 0})` },
            { id: 'LEDGER', label: `5. Earnings Ledger (${earningsLedger?.length || 0})` },
            { id: 'WALLET', label: '6. Wallet' },
            { id: 'WITHDRAWALS', label: `7. Withdrawals (${withdrawals?.length || 0})` },
            { id: 'FEES', label: `8. Platform Fees ₹99 (${platformFees?.length || 0})` },
            { id: 'DISPUTES', label: `9. Complaints (${complaints?.length || 0})` },
            { id: 'NOTIFICATIONS', label: `10. Notifications (${notifications?.length || 0})` },
            { id: 'AUDIT', label: `11. Audit Trail (${auditHistory?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#2583D5] text-white shadow-xs'
                  : 'text-[#4B6F8E] hover:text-[#153451] hover:bg-[#F5FAFF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] space-y-4">
            <h3 className="font-black text-[#153451] text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-[#2583D5]" />
              <span>Identity & Account Roles</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-[#EAF6FF]">
                <span className="text-[#7697B3]">Account Status</span>
                <span className="font-bold text-[#153451]">{user.status}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#EAF6FF]">
                <span className="text-[#7697B3]">Assigned Roles</span>
                <span className="font-bold text-[#2583D5]">{(user.roles || []).join(', ')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#EAF6FF]">
                <span className="text-[#7697B3]">Preferred Language</span>
                <span className="font-bold text-[#153451]">{user.language === 'hi' ? 'हिंदी (Hindi)' : 'English'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#EAF6FF]">
                <span className="text-[#7697B3]">Authentication Security</span>
                <span className="font-bold text-emerald-600">Central Auth • MongoDB Atlas</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#7697B3]">Registration Date</span>
                <span className="font-semibold text-[#153451]">{new Date(user.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] space-y-4">
            <h3 className="font-black text-[#153451] text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#2583D5]" />
              <span>Platform Activity Summary</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-[#EAF6FF]">
                <span className="text-[#7697B3]">Total Jobs Assigned/Booked</span>
                <span className="font-black text-[#153451]">{jobs?.length || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#EAF6FF]">
                <span className="text-[#7697B3]">Total Platform Fees Incurred</span>
                <span className="font-black text-[#2583D5]">₹{(platformFees?.length || 0) * 99}</span>
              </div>
              {isWorker && (
                <>
                  <div className="flex justify-between py-2 border-b border-[#EAF6FF]">
                    <span className="text-[#7697B3]">Completed Jobs Count</span>
                    <span className="font-bold text-[#153451]">{workerProfile?.completedJobsCount || 0}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#7697B3]">Rating Average</span>
                    <span className="font-bold text-amber-600">⭐ {workerProfile?.ratingAvg || 5.0}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFILE DETAILS TAB */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] space-y-6">
          <h3 className="font-black text-[#153451] text-sm">Detailed User Profile Specification</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF] space-y-2">
              <span className="text-[11px] font-black text-[#7697B3] uppercase block">General Attributes</span>
              <p><strong>Full Name:</strong> {user.fullName}</p>
              <p><strong>Mobile:</strong> +91 {user.phoneNumber}</p>
              <p><strong>Email:</strong> {user.email || 'N/A'}</p>
              <p><strong>User ID:</strong> <code className="font-mono text-[#2583D5]">{user.id}</code></p>
            </div>

            {isWorker && workerProfile && (
              <div className="p-4 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF] space-y-2">
                <span className="text-[11px] font-black text-[#7697B3] uppercase block">Worker Trade Fleet Info</span>
                <p><strong>Headline:</strong> {workerProfile.headline || 'N/A'}</p>
                <p><strong>Hourly Charge:</strong> ₹{workerProfile.hourlyRate}/hr</p>
                <p><strong>Daily Charge:</strong> ₹{workerProfile.dailyRate}/day</p>
                <p><strong>Years Experience:</strong> {workerProfile.yearsExperience} Years</p>
                <p><strong>KYC Status:</strong> <span className="font-bold text-emerald-600">{workerProfile.verificationStatus}</span></p>
              </div>
            )}

            {isContractor && contractorProfile && (
              <div className="p-4 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF] space-y-2">
                <span className="text-[11px] font-black text-[#7697B3] uppercase block">Contractor Enterprise Info</span>
                <p><strong>Company:</strong> {contractorProfile.companyName}</p>
                <p><strong>Business Type:</strong> {contractorProfile.businessType || 'General Contracting'}</p>
                <p><strong>GSTIN:</strong> {contractorProfile.gstin || 'Not Provided'}</p>
                <p><strong>PAN:</strong> {contractorProfile.panNumber || 'Not Provided'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. KYC & DOCUMENTS TAB */}
      {activeTab === 'KYC' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[#153451] text-sm">KYC Documents & Verification Records</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              Status: {workerProfile?.verificationStatus || 'ACTIVE'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kycDocuments.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs text-[#7697B3] bg-[#F5FAFF] rounded-2xl border border-[#D1E8F8]">
                No separate KYC documents uploaded for this profile.
              </div>
            ) : (
              kycDocuments.map((doc: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#D1E8F8] bg-[#F5FAFF] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#153451]">{doc.docType}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-[#7697B3]">Doc Number: <strong className="text-[#153451]">{doc.docNumber || 'XXXX-XXXX-4821'}</strong></p>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#2583D5] font-bold hover:underline"
                  >
                    <span>View Secure Document</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. JOBS TAB */}
      {activeTab === 'JOBS' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] space-y-4">
          <h3 className="font-black text-[#153451] text-sm">Jobs & Bookings History ({jobs.length})</h3>
          
          <div className="divide-y divide-[#EAF6FF] text-xs">
            {jobs.length === 0 ? (
              <div className="p-8 text-center text-[#7697B3]">No job history found.</div>
            ) : (
              jobs.map((j: any) => (
                <div key={j.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-black text-[#153451] text-sm">{j.serviceCategory || 'Service'}</span>
                    <p className="text-[#7697B3] mt-0.5">Booking ID: {j.id} • {j.addressLine || 'Delhi NCR'}</p>
                    <p className="text-[#2583D5] font-semibold mt-0.5">
                      Base Charge: ₹{Number(j.finalAmount || j.estimatedAmount || 350) - 99} + Platform Fee: ₹99 = Total ₹{j.finalAmount || j.estimatedAmount || 350}
                    </p>
                  </div>

                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-[#EAF6FF] text-[#2583D5] border border-[#D1E8F8] self-start sm:self-center">
                    {j.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. EARNINGS LEDGER TAB */}
      {activeTab === 'LEDGER' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] space-y-4">
          <h3 className="font-black text-[#153451] text-sm">Worker Earnings Ledger Transactions ({earningsLedger.length})</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAF6FF] text-[10px] font-black text-[#7697B3] uppercase">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Net Amount</th>
                  <th className="py-2.5 px-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF6FF]">
                {earningsLedger.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#7697B3]">No ledger transactions recorded.</td>
                  </tr>
                ) : (
                  earningsLedger.map((l: any) => (
                    <tr key={l.id} className="hover:bg-[#F5FAFF]">
                      <td className="py-3 px-3 text-[#7697B3]">{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3 font-bold text-[#153451]">{l.transactionType}</td>
                      <td className="py-3 px-3 text-[#4B6F8E]">{l.description}</td>
                      <td className={`py-3 px-3 text-right font-black ${l.netAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {l.netAmount >= 0 ? `+₹${l.netAmount}` : `-₹${Math.abs(l.netAmount)}`}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-[#153451]">₹{l.balanceAfter}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. PLATFORM FEES TAB */}
      {activeTab === 'FEES' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D1E8F8] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[#153451] text-sm">₹99 Platform Service Fees Ledger</h3>
            <span className="text-xs font-black text-[#2583D5] bg-[#EAF6FF] px-3 py-1 rounded-xl border border-[#D1E8F8]">
              Total Fees: ₹{platformFees.length * 99}
            </span>
          </div>

          <div className="divide-y divide-[#EAF6FF] text-xs">
            {platformFees.length === 0 ? (
              <div className="p-8 text-center text-[#7697B3]">No platform fee entries for this user.</div>
            ) : (
              platformFees.map((fee: any) => (
                <div key={fee.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-[#153451]">{fee.serviceCategory}</span>
                    <p className="text-[11px] text-[#7697B3]">Booking: {fee.bookingId} • Base: ₹{fee.baseWorkerCharge} + Fee: <strong>₹99</strong></p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {fee.settlementStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: BLOCK / STATUS CHANGE */}
      {statusModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#153451]">
              Confirm Account {statusModal.targetStatus}
            </h3>
            <p className="text-xs text-[#4B6F8E]">
              This will update the user&apos;s active account state and record the operation in the audit trail.
            </p>

            <div>
              <label className="text-[11px] font-bold text-[#153451] uppercase tracking-wider block mb-1">
                Mandatory Reason
              </label>
              <textarea
                value={statusModal.reason}
                onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                placeholder="e.g. Identity verification issue or repeated cancellation"
                rows={3}
                className="w-full p-3 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs text-[#153451] font-semibold focus:outline-none focus:border-[#2583D5]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModal({ open: false, targetStatus: '', reason: '' })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#7697B3] hover:text-[#153451]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !statusModal.reason.trim()}
                onClick={() => handleUpdateStatus(statusModal.targetStatus, statusModal.reason)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : `Confirm ${statusModal.targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
