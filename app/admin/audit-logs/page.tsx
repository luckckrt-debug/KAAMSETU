'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Eye, 
  X,
  FileJson
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/admin/audit-logs?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  return (
    <AdminLayout
      title="Security & Immutable Audit Trail"
      subtitle="सुरक्षा व ऑडिट लॉग • Cryptographically recorded operations across users, KYC, fees, and MongoDB Atlas"
      actions={
        <button
          onClick={() => { setLoading(true); fetchLogs(); }}
          className="px-3.5 py-2 rounded-xl border border-[#D1E8F8] bg-white hover:bg-[#F5FAFF] text-xs font-bold text-[#153451] transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#2583D5]" />
          <span>Refresh Audit Trail</span>
        </button>
      }
    >
      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7697B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, admin name, target record or reason..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451] focus:outline-none focus:border-[#2583D5]"
          />
        </div>

        <span className="text-xs text-[#7697B3] font-bold">
          {logs.length} Immutable Records Found
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-[#D1E8F8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5FAFF] border-b border-[#EAF6FF] text-[10px] font-black uppercase text-[#7697B3]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Record</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF6FF]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7697B3] font-semibold">
                    Loading audit trail from MongoDB Atlas...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7697B3] font-semibold">
                    No audit logs matching current query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5FAFF] transition font-medium">
                    <td className="py-3 px-4 text-[11px] text-[#7697B3] whitespace-nowrap">
                      {new Date(log.timestamp || log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#153451] block">{log.adminName || log.adminUserId || 'Super Admin'}</span>
                      <span className="text-[10px] text-[#7697B3] uppercase">{log.adminRole || 'ADMIN'}</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-[#2583D5] text-[11px]">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#153451]">
                      {log.targetRecord || log.targetUser || log.targetCollection || 'System'}
                    </td>

                    <td className="py-3 px-4 text-[#4B6F8E] max-w-xs truncate">
                      {log.reason || log.details || 'Administrative operation'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        log.status === 'SUCCESS' || !log.status
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {log.status || 'SUCCESS'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg border border-[#D1E8F8] bg-white hover:bg-[#EAF6FF] text-[#2583D5] font-bold text-[11px] transition inline-flex items-center gap-1 shadow-2xs"
                      >
                        <FileJson className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT LOG MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-xl w-full bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
              <span className="font-mono font-bold text-xs text-[#2583D5]">
                Audit Record: {selectedLog.id}
              </span>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg hover:bg-[#F5FAFF] text-[#7697B3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="flex-1 overflow-auto p-4 rounded-2xl bg-[#0D1D2D] text-emerald-400 font-mono text-[11px] leading-relaxed select-all">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-[#2583D5] text-white text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
