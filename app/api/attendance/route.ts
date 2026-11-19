import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection } from '@/lib/mongodb';
import { verifySessionToken } from '@/lib/auth';
import { calculateJobCommission } from '@/lib/commission';
import { AttendanceRecord, AttendanceStatus, WorkVerificationStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    const attendanceCol = await getMongoCollection('attendance_records');
    let records: any[] = [];

    if (attendanceCol) {
      records = await attendanceCol.find({ projectId, date }).toArray();
    }

    // If no records found for today, check project assignments to return muster roll roster
    if (records.length === 0) {
      const assignmentsCol = await getMongoCollection('project_assignments');
      let assignments: any[] = [];
      if (assignmentsCol) {
        assignments = await assignmentsCol.find({ projectId, status: 'ACTIVE' }).toArray();
      }

      // Default seed worker assignments if none in MongoDB
      if (assignments.length === 0) {
        assignments = [
          { workerProfileId: 'work-prof-1', workerName: 'Ramesh Sharma', trade: 'Mason', agreedDailyRate: 950 },
          { workerProfileId: 'work-prof-2', workerName: 'Mohan Kumar', trade: 'Helper', agreedDailyRate: 650 },
          { workerProfileId: 'work-prof-3', workerName: 'Suresh Verma', trade: 'Electrician', agreedDailyRate: 850 },
          { workerProfileId: 'work-prof-4', workerName: 'Dinesh Yadav', trade: 'Mason', agreedDailyRate: 950 }
        ];
      }

      records = assignments.map((asgn, idx) => {
        const rate = asgn.agreedDailyRate || 900;
        const comm = calculateJobCommission({ jobAmount: rate });
        return {
          id: `att-${projectId}-${asgn.workerProfileId}-${date}`,
          projectId,
          workerProfileId: asgn.workerProfileId,
          workerName: asgn.workerName || `Worker #${idx + 1}`,
          contractorProfileId: asgn.contractorProfileId || 'cont-prof-1',
          date,
          status: 'PRESENT' as AttendanceStatus,
          hoursWorked: 8,
          dailyRate: rate,
          grossAmount: rate,
          platformFee: comm.commissionAmount || Math.round(rate * 0.05),
          netAmount: rate - (comm.commissionAmount || Math.round(rate * 0.05)),
          verificationStatus: 'PENDING_VERIFICATION' as WorkVerificationStatus,
          paymentStatus: 'UNPAID',
          createdAt: new Date().toISOString(),
        };
      });
    }

    return NextResponse.json({
      success: true,
      projectId,
      date,
      count: records.length,
      records,
    });
  } catch (error: any) {
    console.error('[Attendance GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, date, records, autoVerify } = body;

    if (!projectId || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project ID and attendance records array are required.' 
      }, { status: 400 });
    }

    const attendanceDate = date || new Date().toISOString().slice(0, 10);
    const attendanceCol = await getMongoCollection('attendance_records');
    const nowIso = new Date().toISOString();

    const processedRecords: AttendanceRecord[] = [];

    for (const item of records) {
      const status: AttendanceStatus = item.status || 'PRESENT';
      let hours = Number(item.hoursWorked) || 8;
      const rate = Number(item.dailyRate) || 900;

      let gross = 0;
      if (status === 'PRESENT') {
        gross = rate;
      } else if (status === 'HALF_DAY') {
        gross = Math.round(rate * 0.5);
        hours = 4;
      } else if (status === 'OVERTIME') {
        gross = Math.round(rate * 1.25);
        hours = 10;
      } else if (status === 'ABSENT') {
        gross = 0;
        hours = 0;
      }

      // Calculate platform fee transparently
      const feeBreakdown = calculateJobCommission({ jobAmount: gross });
      const platformFee = feeBreakdown.commissionAmount || (gross > 0 ? Math.round(gross * 0.05) : 0);
      const netAmount = Math.max(0, gross - platformFee);

      const isVerified = Boolean(autoVerify || item.verified);
      const verificationStatus: WorkVerificationStatus = isVerified ? 'VERIFIED' : 'PENDING_VERIFICATION';
      const paymentStatus = isVerified && gross > 0 ? 'ELIGIBLE_FOR_PAYOUT' : 'UNPAID';

      const attRecord: AttendanceRecord = {
        id: item.id || `att-${projectId}-${item.workerProfileId}-${attendanceDate}`,
        projectId,
        workerProfileId: item.workerProfileId,
        workerName: item.workerName || 'Worker',
        contractorProfileId: item.contractorProfileId || 'cont-prof-1',
        date: attendanceDate,
        status,
        hoursWorked: hours,
        dailyRate: rate,
        grossAmount: gross,
        platformFee,
        netAmount,
        verificationStatus,
        verifiedAt: isVerified ? nowIso : undefined,
        paymentStatus,
        createdAt: nowIso,
      };

      if (attendanceCol) {
        // Upsert to prevent duplicate attendance records for same worker, project, date
        await attendanceCol.updateOne(
          {
            projectId,
            workerProfileId: item.workerProfileId,
            date: attendanceDate,
          },
          {
            $set: attRecord,
          },
          { upsert: true }
        );
      }

      processedRecords.push(attRecord);
    }

    return NextResponse.json({
      success: true,
      message: `Attendance updated for ${processedRecords.length} workers.`,
      records: processedRecords,
    });
  } catch (error: any) {
    console.error('[Attendance POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
