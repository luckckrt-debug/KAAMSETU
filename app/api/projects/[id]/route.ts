import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection } from '@/lib/mongodb';
import { dbStore } from '@/lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const projectsCol = await getMongoCollection('projects');
    let project: any = null;

    if (projectsCol) {
      project = await projectsCol.findOne({
        $or: [{ id }, { _id: id as any }]
      });
    }

    if (!project) {
      const tender = dbStore.getTenderById(id);
      if (tender) {
        project = {
          id: tender.id,
          contractorProfileId: tender.contractorProfileId,
          contractorName: tender.contractor?.companyName || 'Contractor Enterprise',
          title: tender.title,
          description: tender.description,
          projectType: 'Civil Construction',
          locationAddress: tender.locationAddress,
          city: tender.city,
          state: tender.state,
          pincode: tender.pincode,
          startDate: tender.startDate,
          endDate: tender.endDate,
          durationDays: 30,
          shiftTiming: tender.shifts || '08:00 AM - 05:00 PM',
          workHoursPerDay: 8,
          accommodationDetails: tender.accommodationProvided ? 'Provided' : 'Not Provided',
          foodDetails: tender.foodProvided ? 'Provided' : 'Self-arranged',
          safetyRequirements: tender.safetyRequirements,
          payoutSchedule: 'DAILY',
          attendanceVerification: 'DAILY_SUPERVISOR',
          paymentTerms: tender.paymentTerms,
          estimatedBudget: tender.totalBudget,
          status: 'OPEN',
          applicationsCount: tender.applicationsCount || 0,
          totalWorkersRequired: tender.workerCountRequired,
          totalWorkersAccepted: 2,
          requirements: [
            {
              id: `req-${tender.id}-1`,
              projectId: tender.id,
              trade: tender.categoryName || 'Mason',
              skillLevel: 'SKILLED',
              requiredCount: tender.workerCountRequired,
              acceptedCount: 2,
              experienceYears: tender.experienceRequired || 2,
              dailyWage: tender.perWorkerRate || 950,
              workDescription: tender.description,
              shift: 'DAY',
            }
          ],
          createdAt: tender.createdAt,
          updatedAt: tender.createdAt,
        };
      }
    }

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // Fetch applications for this project
    const appsCol = await getMongoCollection('project_applications');
    let applications: any[] = [];
    if (appsCol) {
      applications = await appsCol.find({ projectId: id }).toArray();
    }

    return NextResponse.json({
      success: true,
      project,
      applications,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
