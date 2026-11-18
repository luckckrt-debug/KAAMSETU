import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      latitude,
      longitude,
      categorySlug,
      profession,
      service,
      verifiedOnly,
      initialRadiusKm,
      maxRadiusKm,
    } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'Latitude and Longitude are required for geospatial discovery' },
        { status: 400 }
      );
    }

    const result = dbStore.discoverNearbyWorkers({
      latitude: Number(latitude),
      longitude: Number(longitude),
      categorySlug: categorySlug || profession,
      profession,
      service,
      verifiedOnly: Boolean(verifiedOnly),
      initialRadiusKm: initialRadiusKm ? Number(initialRadiusKm) : 3,
      maxRadiusKm: maxRadiusKm ? Number(maxRadiusKm) : 25,
    });

    return NextResponse.json({
      success: true,
      ...result,
      count: result.workers.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const categorySlug = searchParams.get('categorySlug') || searchParams.get('profession') || undefined;
    const initialRadiusKm = searchParams.get('radius') ? Number(searchParams.get('radius')) : 3;

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Query parameters lat and lng are required' },
        { status: 400 }
      );
    }

    const result = dbStore.discoverNearbyWorkers({
      latitude: Number(lat),
      longitude: Number(lng),
      categorySlug,
      initialRadiusKm,
    });

    return NextResponse.json({
      success: true,
      ...result,
      count: result.workers.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
