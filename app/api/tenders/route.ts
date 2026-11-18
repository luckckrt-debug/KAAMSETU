import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = searchParams.get('status') || undefined;

    const tenders = dbStore.getTenders({ city, categoryId, status });

    return NextResponse.json({
      success: true,
      count: tenders.length,
      tenders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('kaamsetu_session')?.value;
    let contractorProfileId = 'cont-prof-1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload && (payload.roles.includes('CONTRACTOR') || payload.roles.includes('TENDER_OWNER') || payload.roles.includes('ADMIN'))) {
        const store = dbStore.getUserById(payload.userId);
        // Map to contractor profile
      }
    }

    const body = await req.json();
    const {
      title,
      projectName,
      description,
      categoryId,
      categoryName,
      locationAddress,
      city,
      state,
      pincode,
      workerCountRequired,
      skillsRequired,
      experienceRequired,
      startDate,
      endDate,
      workingHours,
      shifts,
      totalBudget,
      perWorkerRate,
      paymentTerms,
      accommodationProvided,
      foodProvided,
      transportProvided,
      safetyRequirements,
      applicationDeadline,
    } = body;

    if (!title || !projectName || !city || !workerCountRequired) {
      return NextResponse.json({ success: false, error: 'Title, project name, city and worker count required' }, { status: 400 });
    }

    const tender = dbStore.createTender({
      contractorProfileId,
      title,
      projectName,
      description: description || '',
      categoryId: categoryId || 'cat-mason',
      categoryName: categoryName || 'Mason',
      locationAddress: locationAddress || `${city} Construction Site`,
      city,
      state: state || 'Uttar Pradesh',
      pincode: pincode || '201301',
      workerCountRequired: Number(workerCountRequired),
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [skillsRequired || 'General Work'],
      experienceRequired: Number(experienceRequired) || 1,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      workingHours: workingHours || '8 Hours',
      shifts: shifts || 'Day Shift',
      totalBudget: Number(totalBudget) || (Number(workerCountRequired) * 1000 * 30),
      perWorkerRate: Number(perWorkerRate) || 1000,
      paymentTerms: paymentTerms || 'Weekly milestone payout',
      accommodationProvided: Boolean(accommodationProvided),
      foodProvided: Boolean(foodProvided),
      transportProvided: Boolean(transportProvided),
      safetyRequirements,
      applicationDeadline: applicationDeadline || new Date(Date.now() + 7 * 86400000).toISOString(),
    });

    return NextResponse.json({
      success: true,
      tender,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
