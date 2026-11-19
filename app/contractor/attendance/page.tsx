'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  Users, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Save, 
  RefreshCw, 
  Calendar, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  DollarSign
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AttendanceRecord, AttendanceStatus, Project } from '@/lib/types';

export default function ContractorAttendancePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch contractor projects
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

  // Fetch attendance for selected project and date
  const fetchAttendance = async (projId: string, dt: string) => {
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
      setError(e.message || 'Error loading muster roll.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchAttendance(selectedProjectId, selectedDate);
    }
  }, [selectedProjectId, selectedDate]);

  const handleStatusChange = (index: number, newStatus: AttendanceStatus) => {
    const updated = [...records];
    const rec = updated[index];
    const rate = rec.dailyRate || 900;

    let gross = 0;
    let hours = 8;
    if (newStatus === 'PRESENT') {
      gross = rate;
      hours = 8;
    } else if (newStatus === 'HALF_DAY') {
      gross = Math.round(rate * 0.5);
      hours = 4;
    } else if (newStatus === 'OVERTIME') {
      gross = Math.round(rate * 1.25);
      hours = 10;
    } else if (newStatus === 'ABSENT') {
      gross = 0;
      hours = 0;
    }

    const fee = gross > 0 ? Math.round(gross * 0.05) : 0;
    const net = Math.max(0, gross - fee);

    updated[index] = {
      ...rec,
      status: newStatus,
      hoursWorked: hours,
      grossAmount: gross,
      platformFee: fee,
      netAmount: net,
    };

    setRecords(updated);
  };

  const handleSaveAttendance = async (autoVerify: boolean = false) => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          date: selectedDate,
          records,
          autoVerify,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to save muster roll.');
        setSaving(false);
        return;
      }

      setMessage(
        autoVerify
          ? '✅ Attendance verified and approved for payroll! Workers are now eligible for daily payout.'
          : '✅ Muster roll draft saved successfully!'
      );

      // Refresh records
      fetchAttendance(selectedProjectId, selectedDate);
    } catch (e: any) {
      setError(e.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = records.filter(r => r.status === 'PRESENT' || r.status === 'OVERTIME').length;
  const halfDayCount = records.filter(r => r.status === 'HALF_DAY').length;
  const absentCount = records.filter(r => r.status === 'ABSENT').length;
  const verifiedCount = records.filter(r => r.verificationStatus === 'VERIFIED').length;
  const grossTotal = records.reduce((sum, r) => sum + r.grossAmount, 0);
  const netTotal = records.reduce((sum, r) => sum + r.netAmount, 0);

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Daily Attendance & Work Verification"
      subtitle="दैनिक मस्टर रोल, कार्य सत्यापन व दैनिक भुगतान पात्रता"
      actions={
        <Link
          href={`/contractor/payments?projectId=${selectedProjectId}`}
          className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
        >
          <CreditCard className="w-4 h-4" />
          <span>Process Daily Payout</span>
        </Link>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Status Alerts */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
            <Link
              href={`/contractor/payments?projectId=${selectedProjectId}`}
              className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
            >
              Go to Payouts →
            </Link>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Project & Date Filter Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                Select Active Project (परियोजना चुनें)
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-xs font-bold text-forest focus:outline-none focus:border-forest"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-primary uppercase tracking-wider block mb-1">
                Muster Roll Date (तारीख)
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
            onClick={() => fetchAttendance(selectedProjectId, selectedDate)}
            className="text-xs font-bold text-forest hover:underline flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Roster
          </button>
        </div>

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-border shadow-xs text-center">
            <span className="text-[10px] text-text-muted uppercase font-bold block">Present (P)</span>
            <span className="text-xl font-black text-forest">{presentCount}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border shadow-xs text-center">
            <span className="text-[10px] text-text-muted uppercase font-bold block">Half Day (HD)</span>
            <span className="text-xl font-black text-amber-600">{halfDayCount}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border shadow-xs text-center">
            <span className="text-[10px] text-text-muted uppercase font-bold block">Absent (A)</span>
            <span className="text-xl font-black text-red-500">{absentCount}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border shadow-xs text-center">
            <span className="text-[10px] text-text-muted uppercase font-bold block">Verified</span>
            <span className="text-xl font-black text-status-success">{verifiedCount}/{records.length}</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-border shadow-xs text-center">
            <span className="text-[10px] text-text-muted uppercase font-bold block">Eligible Net Payroll</span>
            <span className="text-xl font-black text-forest">₹{netTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Muster Roll Table */}
        <div className="bg-white rounded-3xl border border-border shadow-elevated overflow-hidden">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-forest">
                Daily Worker Muster Roll & Verification Sheet
              </h2>
              <p className="text-xs text-text-secondary">
                Select status for each assigned worker. Only verified work generates payable earnings.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveAttendance(false)}
                className="px-4 py-2 rounded-xl border border-border hover:border-forest text-xs font-bold text-forest transition"
              >
                Save Draft
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveAttendance(true)}
                className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
              >
                {saving ? 'Verifying...' : 'VERIFY & APPROVE ALL (कार्य सत्यापित करें)'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg text-text-secondary font-bold uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Worker Profile</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Approved Rate</th>
                  <th className="py-3 px-4">Gross Wage</th>
                  <th className="py-3 px-4">Platform Fee</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r, idx) => {
                  const isVerified = r.verificationStatus === 'VERIFIED';
                  const isPaid = r.paymentStatus === 'PAID';

                  return (
                    <tr key={r.id || idx} className="hover:bg-bg/50 transition">
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

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {(['PRESENT', 'HALF_DAY', 'OVERTIME', 'ABSENT'] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(idx, st)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-black transition ${
                                r.status === st
                                  ? st === 'PRESENT'
                                    ? 'bg-forest text-lime'
                                    : st === 'HALF_DAY'
                                    ? 'bg-amber-500 text-white'
                                    : st === 'OVERTIME'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-red-500 text-white'
                                  : 'bg-bg text-text-primary hover:bg-slate-200'
                              }`}
                            >
                              {st === 'PRESENT' ? 'P' : st === 'HALF_DAY' ? 'HD' : st === 'OVERTIME' ? 'OT' : 'A'}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-forest">
                        {r.hoursWorked} hrs
                      </td>

                      <td className="py-3.5 px-4 text-text-muted">
                        ₹{r.dailyRate}/day
                      </td>

                      <td className="py-3.5 px-4 font-black text-forest">
                        ₹{r.grossAmount}
                      </td>

                      <td className="py-3.5 px-4 text-text-muted">
                        -₹{r.platformFee} (5%)
                      </td>

                      <td className="py-3.5 px-4 font-black text-status-success">
                        ₹{r.netAmount}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isVerified ? '✓ Verified' : 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : r.paymentStatus === 'ELIGIBLE_FOR_PAYOUT'
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {r.paymentStatus}
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
