'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FolderKanban, 
  PlusCircle, 
  Building2, 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HiringProjectsPage() {
  const projects = [
    {
      id: 'proj-1',
      title: 'Metro Extension Station Electrical Staffing',
      category: 'Commercial Electrical',
      headcount: 14,
      hired: 12,
      location: 'South Delhi Metro Corridor',
      duration: '4 Months',
      budget: '₹4,50,000',
      status: 'IN_PROGRESS',
    },
    {
      id: 'proj-2',
      title: 'Corporate IT Park Facility & Plumbing Overhaul',
      category: 'Plumbing & Pipe Fitting',
      headcount: 8,
      hired: 8,
      location: 'Cyber City, Gurugram',
      duration: '2 Months',
      budget: '₹2,20,000',
      status: 'COMPLETED',
    },
    {
      id: 'proj-3',
      title: 'Logistics Warehouse Assembly & Packaging Crew',
      category: 'General Logistics Staff',
      headcount: 20,
      hired: 16,
      location: 'Noida Express Hub',
      duration: '6 Months',
      budget: '₹8,00,000',
      status: 'RECRUITING',
    },
  ];

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Recruitment Projects & Bulk Workforce"
      subtitle="थोक भर्ती अभियान, कॉर्पोरेट प्रोजेक्ट्स व क्रू डिप्लॉयमेंट"
      actions={
        <Link
          href="/hiring/post-vacancy"
          className="px-4 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-xs flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create Bulk Project</span>
        </Link>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs">
            <span className="text-xs text-[#4B6F8E] font-bold block">Total Projects</span>
            <span className="text-3xl font-black text-[#153451] mt-1 block">3</span>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-1">2 Active on site</span>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs">
            <span className="text-xs text-[#4B6F8E] font-bold block">Total Workforce Deployed</span>
            <span className="text-3xl font-black text-[#2583D5] mt-1 block">36</span>
            <span className="text-[11px] text-[#4B6F8E] font-semibold block mt-1">Goal: 42 personnel</span>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-[#D9EEFF] shadow-xs">
            <span className="text-xs text-[#4B6F8E] font-bold block">Aggregate Project Budget</span>
            <span className="text-3xl font-black text-emerald-700 mt-1 block">₹14.7L</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Escrow Secured</span>
          </div>
        </div>

        <div className="space-y-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white p-6 rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#153451] text-base">{proj.title}</h4>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    proj.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : proj.status === 'RECRUITING'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {proj.status}
                  </span>
                </div>

                <p className="text-xs text-[#4B6F8E]">
                  Trade: <strong>{proj.category}</strong> • Duration: {proj.duration}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#153451] pt-1">
                  <span className="flex items-center gap-1 text-[#4B6F8E]">
                    <MapPin className="w-3.5 h-3.5 text-[#2583D5]" /> {proj.location}
                  </span>
                  <span>•</span>
                  <span>Staffing Progress: <strong>{proj.hired}/{proj.headcount} Hired</strong></span>
                  <span>•</span>
                  <span>Budget: <strong className="text-emerald-800">{proj.budget}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/hiring/applicants"
                  className="px-4 py-2 rounded-xl bg-[#EAF6FF] text-[#2583D5] text-xs font-bold hover:bg-[#D9EEFF] transition"
                >
                  Manage Roster →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
