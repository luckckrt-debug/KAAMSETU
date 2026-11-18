import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category') || undefined;
    const city = searchParams.get('city') || undefined;
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const radiusKm = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 25;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const isAvailableNow = searchParams.get('available') === 'true';
    const verifiedOnly = searchParams.get('verified') === 'true';
    const query = searchParams.get('q') || undefined;

    const workers = dbStore.getWorkers({
      categorySlug,
      city,
      latitude: lat,
      longitude: lng,
      radiusKm,
      minRating,
      isAvailableNow,
      verifiedOnly,
      query,
    });

    return NextResponse.json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
