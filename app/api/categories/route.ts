import { NextRequest, NextResponse } from 'next/server';
import { getAllProfessions } from '@/lib/professions';
import { dbStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sector = searchParams.get('sector') || undefined;
    const query = searchParams.get('q') || undefined;

    let professions = getAllProfessions();

    if (sector && sector !== 'All Sectors') {
      professions = professions.filter((p) => p.sector === sector);
    }

    if (query) {
      const q = query.toLowerCase().trim();
      professions = professions.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameHi.includes(q) ||
          p.slug.includes(q) ||
          p.popularSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Attach actual verified worker counts from DB
    const list = professions.map((p) => {
      const actualWorkers = dbStore.getWorkers({ categorySlug: p.slug });
      return {
        ...p,
        liveWorkerCount: actualWorkers.length,
      };
    });

    return NextResponse.json({
      success: true,
      count: list.length,
      professions: list,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
