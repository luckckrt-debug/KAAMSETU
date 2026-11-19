import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection } from '@/lib/mongodb';
import { verifySessionToken } from '@/lib/auth';
import { dbStore } from '@/lib/store';
import { ProjectApplication } from '@/lib/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const token = req.cookies.get('kaamsetu_session')?.value;
    
    let workerProfileId = 'work-prof-1';
    let workerName = 'Ramesh Sharma';
    let workerPhone = '9876543210';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        workerProfileId = payload.userId;
        workerName = payload.fullName;
        workerPhone = payload.phoneNumber;
      }
    }

    const body = await req.json();
    const {
      requirementId,
      trade,
      proposedDailyRate,
      availabilityDate,
      coverNote,
      workerExperienceYears,
      workerSkills
    } = body;

    const appsCol = await getMongoCollection('project_applications');
    const projectsCol = await getMongoCollection('projects');

    // 1. Prevent duplicate applications for the same worker and project
    if (appsCol) {
      const existingApp = await appsCol.findOne({
        projectId,
        workerProfileId,
      });

      if (existingApp) {
        return NextResponse.json({
          success: false,
          error: 'You have already applied for this project. Check "My Applications" for updates.',
        }, { status: 400 });
      }
    }

    // 2. Lookup project
    let projectTitle = 'Contractor Project';
    if (projectsCol) {
      const p = await projectsCol.findOne({ $or: [{ id: projectId }, { _id: projectId as any }] });
      if (p) projectTitle = p.title;
    }

    const appId = `papp-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newApplication: ProjectApplication = {
      id: appId,
      projectId,
      projectTitle,
      requirementId: requirementId || undefined,
      trade: trade || 'General Worker',
      workerProfileId,
      workerName,
      workerPhone,
      workerRating: 4.9,
      workerSkills: Array.isArray(workerSkills) ? workerSkills : [trade || 'Skilled Labour'],
      workerExperienceYears: Number(workerExperienceYears) || 3,
      proposedDailyRate: Number(proposedDailyRate) || 900,
      availabilityDate: availabilityDate || nowIso,
      coverNote: coverNote || 'Ready to deploy with complete toolkit.',
      status: 'APPLIED',
      appliedAt: nowIso,
    };

    // Save to MongoDB Atlas project_applications
    if (appsCol) {
      await appsCol.insertOne({
        ...newApplication,
        _id: appId as any,
      });
    }

    // Increment application count on project
    if (projectsCol) {
      await projectsCol.updateOne(
        { $or: [{ id: projectId }, { _id: projectId as any }] },
        { $inc: { applicationsCount: 1 } }
      );
    }

    // Create notification for contractor
    const notifsCol = await getMongoCollection('notifications');
    if (notifsCol) {
      await notifsCol.insertOne({
        id: `notif-${Date.now()}`,
        userId: 'user-contractor-1',
        title: 'New Worker Application',
        body: `${workerName} applied for ${trade} on ${projectTitle} @ ₹${newApplication.proposedDailyRate}/day.`,
        actionUrl: `/contractor/applications`,
        type: 'TENDER',
        isRead: false,
        createdAt: nowIso,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! Contractor has been notified.',
      application: newApplication,
    });
  } catch (error: any) {
    console.error('[Apply Project Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
