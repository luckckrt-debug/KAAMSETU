import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection } from '@/lib/mongodb';
import { verifySessionToken } from '@/lib/auth';
import { ProjectAssignment } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; appId: string } }
) {
  try {
    const { id: projectId, appId } = params;
    const body = await req.json();
    const { action, rejectionReason } = body; // 'SHORTLIST' | 'ACCEPT' | 'REJECT'

    if (!['SHORTLIST', 'ACCEPT', 'REJECT'].includes(action)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid action. Allowed actions are SHORTLIST, ACCEPT, REJECT.' 
      }, { status: 400 });
    }

    const appsCol = await getMongoCollection('project_applications');
    const projectsCol = await getMongoCollection('projects');

    if (!appsCol || !projectsCol) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 });
    }

    const application = await appsCol.findOne({
      $or: [{ id: appId }, { _id: appId as any }],
      projectId,
    });

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    const project = await projectsCol.findOne({
      $or: [{ id: projectId }, { _id: projectId as any }],
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const nowIso = new Date().toISOString();

    if (action === 'SHORTLIST') {
      await appsCol.updateOne(
        { $or: [{ id: appId }, { _id: appId as any }] },
        { $set: { status: 'SHORTLISTED', reviewedAt: nowIso } }
      );

      return NextResponse.json({
        success: true,
        message: 'Worker application shortlisted.',
        status: 'SHORTLISTED',
      });
    }

    if (action === 'REJECT') {
      await appsCol.updateOne(
        { $or: [{ id: appId }, { _id: appId as any }] },
        { $set: { status: 'REJECTED', rejectionReason: rejectionReason || 'Quota or skill mismatch', reviewedAt: nowIso } }
      );

      return NextResponse.json({
        success: true,
        message: 'Worker application rejected.',
        status: 'REJECTED',
      });
    }

    if (action === 'ACCEPT') {
      // Find matching workforce requirement category
      const targetReq = project.requirements?.find((r: any) => 
        (application.requirementId && r.id === application.requirementId) ||
        r.trade.toLowerCase() === application.trade.toLowerCase()
      ) || project.requirements?.[0];

      if (targetReq) {
        // Enforce quota: prevent overbooking
        if (targetReq.acceptedCount >= targetReq.requiredCount) {
          return NextResponse.json({
            success: false,
            error: `Worker quota for ${targetReq.trade} is already full (${targetReq.acceptedCount}/${targetReq.requiredCount} accepted). Increase category requirement count to accept more workers.`,
          }, { status: 400 });
        }

        // Increment category acceptedCount and project total
        await projectsCol.updateOne(
          { 
            $or: [{ id: projectId }, { _id: projectId as any }],
            'requirements.id': targetReq.id 
          },
          { 
            $inc: { 
              'requirements.$.acceptedCount': 1,
              totalWorkersAccepted: 1
            } 
          }
        );
      } else {
        await projectsCol.updateOne(
          { $or: [{ id: projectId }, { _id: projectId as any }] },
          { $inc: { totalWorkersAccepted: 1 } }
        );
      }

      // Update application status to ACCEPTED
      await appsCol.updateOne(
        { $or: [{ id: appId }, { _id: appId as any }] },
        { $set: { status: 'ACCEPTED', reviewedAt: nowIso } }
      );

      // Create Project Assignment in project_assignments
      const assignmentsCol = await getMongoCollection('project_assignments');
      const assignmentId = `asgn-${Date.now()}`;
      if (assignmentsCol) {
        const newAssignment: ProjectAssignment = {
          id: assignmentId,
          projectId,
          workerProfileId: application.workerProfileId,
          contractorProfileId: project.contractorProfileId,
          trade: application.trade,
          agreedDailyRate: application.proposedDailyRate || 900,
          status: 'ACTIVE',
          assignedAt: nowIso,
        };

        await assignmentsCol.insertOne({
          ...newAssignment,
          _id: assignmentId as any,
        });
      }

      // Notify the worker
      const notifsCol = await getMongoCollection('notifications');
      if (notifsCol) {
        await notifsCol.insertOne({
          id: `notif-${Date.now()}`,
          userId: application.workerProfileId,
          title: 'Congratulations! Application Accepted',
          body: `You have been selected for ${project.title} as ${application.trade}. Agreed payout: ₹${application.proposedDailyRate}/day.`,
          actionUrl: `/worker/active-job`,
          type: 'TENDER',
          isRead: false,
          createdAt: nowIso,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Worker ${application.workerName} accepted! Vacancy count updated and assignment created.`,
        status: 'ACCEPTED',
        assignmentId,
      });
    }

    return NextResponse.json({ success: false, error: 'Unhandled action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Application Review Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
