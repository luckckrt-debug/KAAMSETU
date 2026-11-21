import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection } from '@/lib/mongodb';
import { verifySessionToken } from '@/lib/auth';
import { dbStore } from '@/lib/store';
import { Project, ProjectWorkerRequirement, PayoutSchedule } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contractorId = searchParams.get('contractorId');
    const city = searchParams.get('city');
    const trade = searchParams.get('trade');
    const status = searchParams.get('status');
    const payoutSchedule = searchParams.get('payoutSchedule');

    const projectsCol = await getMongoCollection('projects');
    let projects: any[] = [];

    if (projectsCol) {
      const query: any = {};
      if (contractorId) query.contractorProfileId = contractorId;
      if (city) query.city = new RegExp(city, 'i');
      if (status) query.status = status;
      if (payoutSchedule) query.payoutSchedule = payoutSchedule;

      projects = await projectsCol.find(query).sort({ createdAt: -1 }).toArray();
    }

    // If MongoDB has fewer projects, merge from dbStore tenders as fallback
    if (projects.length === 0) {
      const tenders = dbStore.getTenders({});
      projects = tenders.map((t) => ({
        id: t.id,
        contractorProfileId: t.contractorProfileId,
        contractorName: t.contractor?.companyName || 'Apex Construction Infrastructure',
        title: t.title,
        description: t.description,
        projectType: 'Civil Infrastructure',
        locationAddress: t.locationAddress,
        city: t.city,
        state: t.state,
        startDate: t.startDate,
        endDate: t.endDate,
        shiftTiming: t.shifts || '08:00 AM - 05:00 PM',
        workHoursPerDay: 8,
        accommodationDetails: t.accommodationProvided ? 'Provided on-site' : 'Not Provided',
        foodDetails: t.foodProvided ? 'Subsidized mess provided' : 'Self-arranged',
        safetyRequirements: t.safetyRequirements || 'Helmets and safety boots required',
        payoutSchedule: (t.paymentTerms.toLowerCase().includes('daily') ? 'DAILY' : 'WEEKLY') as PayoutSchedule,
        attendanceVerification: 'DAILY_SUPERVISOR',
        paymentTerms: t.paymentTerms,
        estimatedBudget: t.totalBudget,
        status: t.status === 'PUBLISHED' ? 'OPEN' : 'OPEN',
        applicationsCount: t.applicationsCount || 0,
        totalWorkersRequired: t.workerCountRequired,
        totalWorkersAccepted: 2,
        requirements: [
          {
            id: `req-${t.id}-1`,
            projectId: t.id,
            trade: t.categoryName || 'Mason',
            skillLevel: 'SKILLED',
            requiredCount: t.workerCountRequired,
            acceptedCount: 2,
            experienceYears: t.experienceRequired || 2,
            dailyWage: t.perWorkerRate || 950,
            workDescription: t.description,
            shift: 'DAY',
          }
        ],
        createdAt: t.createdAt,
        updatedAt: t.createdAt,
      }));
    }

    // Filter by trade if requested
    if (trade && trade !== 'all') {
      projects = projects.filter(p => 
        p.requirements?.some((r: any) => r.trade.toLowerCase().includes(trade.toLowerCase()))
      );
    }

    return NextResponse.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error: any) {
    console.error('[Projects GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let contractorProfileId = 'cont-prof-1';
    let contractorName = 'Apex Infra Construction';
    let contractorPhone = '9811002233';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        contractorProfileId = payload.userId;
        contractorName = payload.fullName;
        contractorPhone = payload.phoneNumber;
      }
    }

    const body = await req.json();
    const {
      title,
      description,
      projectType,
      locationAddress,
      city,
      state,
      pincode,
      siteLatitude,
      siteLongitude,
      startDate,
      endDate,
      durationDays,
      shiftTiming,
      workHoursPerDay,
      workConditions,
      accommodationDetails,
      foodDetails,
      toolsEquipmentInfo,
      safetyRequirements,
      contactCoordinationDetails,
      requirements,
      payoutSchedule,
      attendanceVerification,
      paymentDueDate,
      paymentTerms,
      estimatedBudget,
    } = body;

    // Validation
    if (!title || !description || !city) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project title, description and city location are required.' 
      }, { status: 400 });
    }

    if (!Array.isArray(requirements) || requirements.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'At least one worker category requirement must be added to the project.' 
      }, { status: 400 });
    }

    const projectId = `proj-${Date.now()}`;
    const nowIso = new Date().toISOString();

    // Format workforce requirements
    const formattedRequirements: ProjectWorkerRequirement[] = requirements.map((r: any, idx: number) => ({
      id: `req-${projectId}-${idx + 1}`,
      projectId,
      trade: r.trade || 'General Worker',
      skillLevel: r.skillLevel || 'SKILLED',
      requiredCount: Number(r.requiredCount) || 1,
      acceptedCount: 0,
      experienceYears: Number(r.experienceYears) || 1,
      dailyWage: Number(r.dailyWage) || 800,
      workDescription: r.workDescription || '',
      shift: r.shift || 'DAY',
      additionalNotes: r.additionalNotes || '',
    }));

    const totalWorkersRequired = formattedRequirements.reduce((sum, r) => sum + r.requiredCount, 0);

    const newProject: Project = {
      id: projectId,
      contractorProfileId,
      contractorName,
      contractorPhone,
      title: title.trim(),
      description: description.trim(),
      projectType: projectType || 'Commercial Construction',
      locationAddress: locationAddress || `${city} Site`,
      city: city.trim(),
      state: state || 'Uttar Pradesh',
      pincode: pincode || '201301',
      siteLatitude: siteLatitude || 28.5355,
      siteLongitude: siteLongitude || 77.3910,
      startDate: startDate || nowIso,
      endDate: endDate || new Date(Date.now() + (Number(durationDays) || 30) * 86400000).toISOString(),
      durationDays: Number(durationDays) || 30,
      shiftTiming: shiftTiming || '08:00 AM - 05:00 PM',
      workHoursPerDay: Number(workHoursPerDay) || 8,
      workConditions: workConditions || 'Standard on-site civil works',
      accommodationDetails: accommodationDetails || 'Not Provided',
      foodDetails: foodDetails || 'Self-arranged',
      toolsEquipmentInfo: toolsEquipmentInfo || 'Standard PPE & tools provided by contractor',
      safetyRequirements: safetyRequirements || 'Hard hats and safety boots mandatory',
      contactCoordinationDetails: contactCoordinationDetails || `Site Supervisor: ${contractorPhone}`,
      requirements: formattedRequirements,
      payoutSchedule: (payoutSchedule as PayoutSchedule) || 'DAILY',
      attendanceVerification: attendanceVerification || 'DAILY_SUPERVISOR',
      paymentDueDate: paymentDueDate || 'Same day 08:00 PM',
      paymentTerms: paymentTerms || 'Daily verified wage transfer via DigiWork central payout',
      estimatedBudget: Number(estimatedBudget) || (totalWorkersRequired * 900 * 30),
      status: 'OPEN',
      applicationsCount: 0,
      totalWorkersRequired,
      totalWorkersAccepted: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Save to MongoDB Atlas projects collection
    const projectsCol = await getMongoCollection('projects');
    if (projectsCol) {
      await projectsCol.insertOne({
        ...newProject,
        _id: projectId as any,
      });
    }

    // Also sync as tender in dbStore
    dbStore.createTender({
      contractorProfileId,
      title: newProject.title,
      projectName: newProject.projectType,
      description: newProject.description,
      categoryId: 'cat-construction',
      categoryName: formattedRequirements[0]?.trade || 'Construction',
      locationAddress: newProject.locationAddress,
      city: newProject.city,
      state: newProject.state,
      pincode: newProject.pincode || '201301',
      workerCountRequired: totalWorkersRequired,
      skillsRequired: formattedRequirements.map(r => r.trade),
      experienceRequired: formattedRequirements[0]?.experienceYears || 2,
      startDate: newProject.startDate,
      endDate: newProject.endDate || nowIso,
      workingHours: `${newProject.workHoursPerDay} Hours`,
      shifts: newProject.shiftTiming,
      totalBudget: newProject.estimatedBudget,
      perWorkerRate: formattedRequirements[0]?.dailyWage || 900,
      paymentTerms: `${newProject.payoutSchedule} Payout - ${newProject.paymentTerms}`,
      accommodationProvided: newProject.accommodationDetails.includes('Provided'),
      foodProvided: newProject.foodDetails.includes('Provided'),
      transportProvided: false,
      safetyRequirements: newProject.safetyRequirements,
      applicationDeadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Project published successfully with workforce requirements and payment terms.',
      project: newProject,
    });
  } catch (error: any) {
    console.error('[Projects POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
