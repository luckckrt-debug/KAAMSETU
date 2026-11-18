'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Upload, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText 
} from 'lucide-react';

export default function WorkerVerificationPage() {
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState<'AADHAAR' | 'PAN' | 'TRADE_CERTIFICATE'>('AADHAAR');
  const [docNumber, setDocNumber] = useState('');
  const [fileUrl, setFileUrl] = useState('/uploads/documents/worker_id.jpg');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchWorker = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      const userId = meData.user?.id || 'user-worker-1';

      const res = await fetch(`/api/workers/${userId}`);
      const data = await res.json();
      if (data.success) {
        setWorker(data.worker);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorker();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/worker/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          docNumber,
          fileUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Document submitted! Our Operations Officer will verify within 4 hours.');
        fetchWorker();
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg font-bold text-text-muted">
        Loading verification status...
      </div>
    );
  }

  const status = worker?.verificationStatus || 'VERIFIED';

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/worker/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-bold text-text-muted">
            UIDAI & Police Verification Hub
          </span>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-status-successSoft text-status-success text-xs font-bold border border-status-success/20">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-2xl bg-status-dangerSoft text-status-danger text-xs font-bold border border-status-danger/20">
            {error}
          </div>
        )}

        {/* Current Verification Status Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-elevated space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">
                Current KYC Standing
              </span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-status-success" />
                <h1 className="text-2xl font-black text-forest">
                  Status: {status}
                </h1>
              </div>
            </div>

            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
              status === 'VERIFIED'
                ? 'bg-status-successSoft text-status-success border border-status-success/30'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {status === 'VERIFIED' ? '✓ Verified Partner' : 'Under Review'}
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            {status === 'VERIFIED'
              ? 'Your Aadhaar and technical credentials have been authenticated. You have unrestricted access to accept customer jobs and apply for high-value tenders.'
              : 'Your submitted documents are currently being checked by our compliance staff.'}
          </p>
        </div>

        {/* Upload Additional Document Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-4">
          <h2 className="text-base font-black text-forest">Submit Additional Trade Certificate or ID</h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-xs font-bold text-forest"
                >
                  <option value="AADHAAR">Aadhaar Card (आधार कार्ड)</option>
                  <option value="PAN">PAN Card (पैन कार्ड)</option>
                  <option value="TRADE_CERTIFICATE">ITI / Trade Skill Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Document Number (Last 4 Digits)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="e.g. 9124"
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-xs font-semibold"
                  required
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center bg-bg/50">
              <Upload className="w-8 h-8 text-sage mx-auto mb-2" />
              <p className="text-xs font-bold text-forest">Attach Clear Photo / PDF</p>
              <p className="text-[10px] text-text-muted mt-0.5">Kept strictly encrypted and private</p>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="mt-2 w-full max-w-sm px-3 py-1.5 rounded-lg border border-border text-xs bg-white text-center text-text-muted"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-xs uppercase tracking-wider shadow-md transition-all"
            >
              {actionLoading ? 'SUBMITTING...' : 'UPLOAD FOR VERIFICATION (दस्तावेज जमा करें)'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
