'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Search, 
  Phone, 
  MapPin, 
  ArrowRight,
  ExternalLink,
  Users
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminHiringPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    try {
      const res = await fetch(`/api/admin/users?role=HIRING_PARTNER&limit=100&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setPartners(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [search]);

  return (
    <AdminLayout
      title="Hiring Partners & Customers"
      subtitle="ग्राहक व सेवा अनुरोधकर्ता • Everyday service customers, residential bookers & enterprise clients"
    >
      <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7697B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name, mobile, or city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451] focus:outline-none focus:border-[#2583D5]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-[#7697B3] font-semibold bg-white rounded-3xl border border-[#D1E8F8]">
            Loading customer records...
          </div>
        ) : partners.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-[#7697B3] font-semibold bg-white rounded-3xl border border-[#D1E8F8]">
            No customers found.
          </div>
        ) : (
          partners.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-3xl border border-[#D1E8F8] shadow-xs hover:border-[#2583D5] transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF6FF] text-[#2583D5] font-black flex items-center justify-center text-sm border border-[#D1E8F8]">
                      {p.fullName?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h4 className="font-black text-[#153451] text-sm">{p.fullName}</h4>
                      <span className="text-xs font-bold text-[#2583D5] block">Customer / Service Booker</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.status}
                  </span>
                </div>

                <div className="p-3 bg-[#F5FAFF] rounded-2xl border border-[#EAF6FF] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#7697B3]">Mobile:</span>
                    <span className="font-bold text-[#153451]">+91 {p.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7697B3]">Location:</span>
                    <span className="font-semibold text-[#153451]">{p.city || 'Noida / NCR'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAF6FF] flex items-center justify-between">
                <Link
                  href={`/hiring/dashboard`}
                  target="_blank"
                  className="text-xs font-bold text-[#4B6F8E] hover:text-[#2583D5] flex items-center gap-1"
                >
                  <span>Customer App</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <Link
                  href={`/admin/users/${p.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <span>Backoffice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
