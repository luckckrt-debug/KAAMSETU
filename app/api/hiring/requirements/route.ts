import { NextRequest, NextResponse } from 'next/server';
import { loadStore, saveStore, dbStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';
import { upsertMongoDocument } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let userId = 'user-customer-1';
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) userId = payload.userId;
    }

    const store = loadStore();
    // Get customer profile
    const custProfile = store.customerProfiles.find((c) => c.userId === userId);
    const custId = custProfile?.id || userId;

    // Filter requirements/bookings created by this hiring partner
    const myRequirements = store.bookings.filter(
      (b) => b.customerProfileId === custId || b.customerProfileId === userId
    );

    return NextResponse.json({
      success: true,
      requirements: myRequirements,
      totalCount: myRequirements.length,
      activeCount: myRequirements.filter((b) =>
        ['REQUESTED', 'SEARCHING_WORKERS', 'ACCEPTED', 'WORKER_ASSIGNED'].includes(b.status)
      ).length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let userId = 'user-customer-1';
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) userId = payload.userId;
    }

    const body = await req.json();
    const { title, category, description, requiredWorkers, locality, city, estimatedBudget } = body;

    const store = loadStore();
    let custProfile = store.customerProfiles.find((c) => c.userId === userId);
    if (!custProfile) {
      custProfile = {
        id: `cust-${Date.now()}`,
        userId,
        createdAt: new Date().toISOString(),
      };
      store.customerProfiles.push(custProfile);
    }

    const newRequirement = {
      id: `hire-req-${Date.now()}`,
      customerProfileId: custProfile.id,
      serviceCategory: category || 'General Labour & Skilled Crew',
      serviceDescription: `${title}: ${description || 'Staffing requirement'} (Positions: ${requiredWorkers || 1})`,
      isUrgent: false,
      scheduledDate: new Date().toISOString(),
      estimatedHours: 8,
      estimatedAmount: Number(estimatedBudget) || 12000,
      addressLine: locality || 'Business Hub',
      locality: locality || 'Central Market',
      city: city || 'Delhi NCR',
      pincode: '110001',
      customerLatitude: 28.6139,
      customerLongitude: 77.209,
      status: 'SEARCHING_WORKERS' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.bookings.unshift(newRequirement as any);
    saveStore();

    // Persist to MongoDB Atlas
    await upsertMongoDocument('bookings', newRequirement.id, newRequirement);

    return NextResponse.json({
      success: true,
      message: 'Hiring vacancy posted successfully! Dispatch broadcasted to verified workers.',
      requirement: newRequirement,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
