'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2, 
  Calendar,
  AlertCircle,
  RefreshCw,
  Zap,
  Users,
  CheckCheck
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AttendanceRecord, Project } from '@/lib/types';

export default function ContractorDailyPaymentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [batchReceipt, setBatchReceipt] = useState<any | null>(null);
  const [error, setError] = useState('');

  // Fetch projects
  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.projects) && d.projects.length > 0) {
          setProjects(d.projects);
          setSelectedProjectId(d.projects[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch attendance records for payout
  const fetchRecords = async (projId: string, dt: string) => {
    if (!projId) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/attendance?projectId=${projId}&date=${dt}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        setRecords(data.records);
      }
    } catch (e: any) {
      setError(e.message || 'Error loading records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchRecords(selectedProjectId, selectedDate);
    }
  }, [selectedProjectId, selectedDate]);

  // Execute Daily Payouts Batch
  const handleProcessDailyPayouts = async () => {
    setProcessing(true);
    setError('');
    setBatchReceipt(null);

    try {
      const res = await fetch('/api/payouts/process-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          batchDate: selectedDate,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to process daily payout batch.');
        setProcessing(false);
        return;
      }

      setBatchReceipt(data.batch);
      // Refresh attendance records to show PAID
      fetchRecords(selectedProjectId, selectedDate);
    } catch (err: any) {
      setError(err.message || 'Network error processing batch.');
    } finally {
      setProcessing(false);
    }
  };

  // Calculations
  const totalWorkers = records.length;
  const presentWorkers = records.filter(r => r.status === 'PRESENT' || r.status === 'OVERTIME' || r.status === 'HALF_DAY').length;
  const verifiedWorkers = records.filter(r => r.verificationStatus === 'VERIFIED').length;
  const pendingVerification = totalWorkers - verifiedWorkers;

  const eligibleForPayout = records.filter(r => r.verificationStatus === 'VERIFIED' && r.paymentStatus === 'ELIGIBLE_FOR_PAYOUT' && r.grossAmount > 0);
  const paidCount = records.filter(r => r.paymentStatus === 'PAID').length;

  const grossPayroll = eligibleForPayout.reduce((sum, r) => sum + r.grossAmount, 0);
  const platformFees = eligibleForPayout.reduce((sum, r) => sum + r.platformFee, 0);
  const netWorkerPayouts = eligibleForPayout.reduce((sum, r) => sum + r.netAmount, 0);

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Daily Payroll & Worker Payout Management"
      subtitle="दैनिक वेतन सत्यापन, प्लेटफॉर्म शुल्क पारदर्शकता व तत्काल बैंक/UPI निकासी"
      actions={
        <Link
          href={`/contractor/attendance?projectId=${selectedProjectId}`}
          className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-text-primary hover:bg-bg transition flex items-center gap-1.5"
        >
          <span>Open Muster Roll</span>
        </Link>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Success Settlement Receipt Banner */}
        {batchReceipt && (
          <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-400 shadow-md space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-black text-emerald-900">
                  Daily Payout Batch Settled Successfully!
                </h3>
              </div>
              <span className="text-xs font-mono font-bold bg-white px-3 py-1 rounded-full text-emerald-800 border border-emerald-300">
                Ref: {batchReceipt.transactionReference}
              </span>
            </div>

            <p className="text-xs text-emerald-800">
              Total <strong>₹{batchReceipt.netPayoutTotal?.toLocaleString('en-IN')}</strong> net wages dispatched to <strong>{batchReceipt.totalWorkers}</strong> verified workers via centralized gateway. All worker earning ledgers and platform fee ledgers have been recorded in MongoDB Atlas.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                <span className="text-[10px] text-gray-500 block">Gross Payroll</span>
                <strong className="text-forest font-black">₹{batchReceipt.grossPayroll}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                <span className="text-[10px] text-gray-500 block">Platform Fee Deducted</span>
                <strong className="text-forest font-black">₹{batchReceipt.platformFeeTotal}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                <span className="text-[10px] text-gray-500 block">Net Worker Payout</span>
                <strong className="text-emerald-700 font-black">₹{batchReceipt.netPayoutTotal}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                <span className="text-[10px] text-gray-500 block">Gateway Status</span>
                <strong className="text-emerald-700 font-black">✓ {batchReceipt.status}</strong>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Project & Date Selector */}
        <div className="bg-white rounded-3xl p-5 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                Project (परियोजना)
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-xs font-bold text-forest focus:outline-none focus:border-forest"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.payoutSchedule} PAY)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                Payout Batch Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-border bg-bg text-xs font-bold text-forest focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          <button
            onClick={() => fetchRecords(selectedProjectId, selectedDate)}
            className="text-xs font-bold text-forest hover:underline flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Batch
          </button>
        </div>

        {/* MODULE 10: KPI Metric Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="bg-white p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] text-text-muted uppercase font-bold block">Total Crew</span>
            <span className="text-lg font-black text-forest">{totalWorkers}</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] text-text-muted uppercase font-bold block">Present</span>
            <span className="text-lg font-black text-forest">{presentWorkers}</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] text-text-muted uppercase font-bold block">Verified</span>
            <span className="text-lg font-black text-status-success">{verifiedWorkers}</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] text-text-muted uppercase font-bold block">Pending Verify</span>
            <span className="text-lg font-black text-amber-600">{pendingVerification}</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] text-text-muted uppercase font-bold block">Gross Payroll</span>
            <span className="text-lg font-black text-forest">₹{grossPayroll}</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] text-text-muted uppercase font-bold block">Platform Fee</span>
            <span className="text-lg font-black text-text-muted">-₹{platformFees}</span>
          </div>

          <div className="bg-forest text-lime p-3.5 rounded-2xl shadow-md">
            <span className="text-[10px] text-lime/80 uppercase font-black block">Net Payouts</span>
            <span className="text-lg font-black text-lime">₹{netWorkerPayouts}</span>
          </div>
        </div>

        {/* Eligible Workers Payout Table */}
        <div className="bg-white rounded-3xl border border-border shadow-elevated overflow-hidden">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-black text-forest">
                  Eligible Daily Payout Queue ({eligibleForPayout.length} Workers Ready)
                </h2>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Only attendance verified by supervisor/contractor can be disbursed.
              </p>
            </div>

            <button
              type="button"
              disabled={processing || eligibleForPayout.length === 0}
              onClick={handleProcessDailyPayouts}
              className="px-6 py-3 rounded-2xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-lime" />
              <span>{processing ? 'PROCESSING BATCH...' : `PROCESS DAILY PAYOUTS (₹${netWorkerPayouts})`}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg text-text-secondary font-bold uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Worker Name & ID</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Gross Earning</th>
                  <th className="py-3 px-4">Platform Fee (5%)</th>
                  <th className="py-3 px-4">Net Worker Payout</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r, idx) => {
                  const isReady = r.verificationStatus === 'VERIFIED' && r.paymentStatus === 'ELIGIBLE_FOR_PAYOUT';
                  const isPaid = r.paymentStatus === 'PAID';

                  return (
                    <tr key={r.id || idx} className={`transition ${isReady ? 'bg-emerald-50/30' : ''}`}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-forest text-lime flex items-center justify-center font-bold text-xs shrink-0">
                            {r.workerName?.charAt(0) || 'W'}
                          </div>
                          <div>
                            <span className="font-bold text-forest block">{r.workerName}</span>
                            <span className="text-[10px] text-text-muted">ID: {r.workerProfileId.slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-forest">
                        {r.status} ({r.hoursWorked} hrs)
                      </td>

                      <td className="py-3.5 px-4 text-text-muted">
                        ₹{r.dailyRate}/day
                      </td>

                      <td className="py-3.5 px-4 font-black text-forest">
                        ₹{r.grossAmount}
                      </td>

                      <td className="py-3.5 px-4 text-text-muted">
                        -₹{r.platformFee}
                      </td>

                      <td className="py-3.5 px-4 font-black text-status-success">
                        ₹{r.netAmount}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.verificationStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          isPaid 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isReady 
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isPaid ? '✓ PAID' : isReady ? '● READY FOR PAYOUT' : r.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
