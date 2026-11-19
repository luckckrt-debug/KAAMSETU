'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Layers, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ContractorAssignmentsPage() {
  const assignments = [
    {
      id: 'asg-1',
      siteName: 'Sector 62 Expressway Commercial Complex',
      supervisor: 'Vikram Singh (Contractor Lead)',
      crewCount: 14,
      trade: 'Civil Construction & Masonry',
      shift: 'Day Shift (8:00 AM - 5:00 PM)',
      status: 'ACTIVE_ON_SITE',
    },
    {
      id: 'asg-2',
      siteName: 'Tower 4 Basement High-Voltage Cabling',
      supervisor: 'Deepak Rawat (Electrical Lead)',
      crewCount: 6,
      trade: 'Commercial Electrical',
      shift: 'Overtime Shift (6:00 PM - 11:00 PM)',
      status: 'IN_PROGRESS',
    },
    {
      id: 'asg-3',
      siteName: 'Logistics Facility Stormwater Drainage',
      supervisor: 'Satish Kumar (Plumbing Foreman)',
      crewCount: 8,
      trade: 'Drainage & Pipe Fitting',
      shift: 'Day Shift (8:00 AM - 5:00 PM)',
      status: 'ACTIVE_ON_SITE',
    },
  ];

  return (
    <DashboardLayout
      role="CONTRACTOR"
      title="Site Assignments & Crew Allocations"
      subtitle="कार्यस्थल तैनाती, शिफ्ट आवंटन व साइट सुपरवाइजर समन्वय"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="space-y-4">
          {assignments.map((asg) => (
            <div
              key={asg.id}
              className="bg-white p-6 rounded-3xl border border-[#D9EEFF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#153451] text-base">{asg.siteName}</h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {asg.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-[#4B6F8E]">
                  Trade: <strong>{asg.trade}</strong> • Shift: {asg.shift}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#153451] pt-1 font-medium">
                  <span className="flex items-center gap-1 text-forest">
                    <Users className="w-3.5 h-3.5" /> <strong>{asg.crewCount} Workers Deployed</strong>
                  </span>
                  <span>•</span>
                  <span>Supervisor: <strong>{asg.supervisor}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/contractor/attendance"
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-black shadow-xs transition"
                >
                  View Attendance Muster →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
