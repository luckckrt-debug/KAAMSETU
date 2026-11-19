'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  ExternalLink,
  Lock,
  Unlock
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AllUsersDirectoryPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?role=${roleFilter}&status=${statusFilter}&search=${encodeURIComponent(search)}&page=${page}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <AdminLayout
      title="All Users Directory"
      subtitle={`सभी पंजीकृत उपयोगकर्ता • Complete user directory (${totalCount} users recorded in MongoDB Atlas)`}
      actions={
        <Link
          href="/admin/search"
          className="px-4 py-2 rounded-xl bg-[#2583D5] text-white text-xs font-black shadow-xs hover:bg-[#1E70B8] transition flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Universal Mobile Lookup</span>
        </Link>
      }
    >
      {/* Controls Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7697B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, or user ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451] focus:outline-none focus:border-[#2583D5] focus:bg-white transition"
          />
        </form>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F5FAFF] p-1 rounded-2xl border border-[#D1E8F8]">
          {[
            { id: 'ALL', label: 'All Roles' },
            { id: 'WORKER', label: 'Workers' },
            { id: 'CONTRACTOR', label: 'Contractors' },
            { id: 'HIRING_PARTNER', label: 'Customers' },
            { id: 'ADMIN', label: 'Admins' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setRoleFilter(tab.id); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                roleFilter === tab.id
                  ? 'bg-[#2583D5] text-white shadow-xs'
                  : 'text-[#4B6F8E] hover:text-[#153451]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#D1E8F8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5FAFF] border-b border-[#EAF6FF] text-[10px] font-black uppercase text-[#7697B3]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Mobile / Contact</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">KYC Status</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Backoffice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF6FF]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7697B3] font-semibold">
                    Loading users from MongoDB Atlas...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7697B3] font-semibold">
                    No users matching selected filter.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F5FAFF] transition font-medium">
                    <td className="py-3.5 px-4">
                      <Link href={`/admin/users/${u.id}`} className="font-bold text-[#153451] hover:text-[#2583D5] block truncate">
                        {u.fullName}
                      </Link>
                      <span className="font-mono text-[10px] text-[#7697B3]">{u.id}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#EAF6FF] text-[#2583D5] border border-[#D1E8F8]">
                        {u.primaryRole}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[#153451] font-semibold block">+91 {u.phoneNumber}</span>
                      <span className="text-[11px] text-[#7697B3] truncate block">{u.email || 'N/A'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-[#153451]">
                      {u.city || 'Delhi NCR'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        u.kycStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : u.kycStatus === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {u.kycStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        u.status === 'BLOCKED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-[#7697B3]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#D1E8F8] hover:border-[#2583D5] text-[#2583D5] text-xs font-bold transition inline-flex items-center gap-1 shadow-2xs"
                      >
                        <span>Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#EAF6FF] flex items-center justify-between text-xs font-bold text-[#7697B3]">
            <span>Showing page {page} of {totalPages} ({totalCount} total)</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-xl border border-[#D1E8F8] bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-xl border border-[#D1E8F8] bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </AdminLayout>
  );
}
