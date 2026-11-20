import { NextRequest, NextResponse } from 'next/server';
import { 
  ensureProfessionCatalogueInitialized, 
  getDynamicCategories, 
  getDynamicProfessions,
  upsertProfession,
  getProfessionSuggestions
} from '@/lib/mongodb-professions';
import { getMongoDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    await ensureProfessionCatalogueInitialized();

    const [categories, professions, pendingSuggestions] = await Promise.all([
      getDynamicCategories(),
      getDynamicProfessions({ includeInactive: true }),
      getProfessionSuggestions('PENDING')
    ]);

    // Live counts of registered workers per profession
    let workerCountsByProf: Record<string, number> = {};
    const db = await getMongoDb();
    if (db) {
      const wpCol = db.collection('worker_professions');
      const agg = await wpCol.aggregate([
        { $group: { _id: '$professionId', count: { $sum: 1 } } }
      ]).toArray();
      agg.forEach(a => {
        workerCountsByProf[a._id] = a.count;
      });
    }

    const enrichedProfessions = professions.map(p => ({
      ...p,
      registeredWorkerCount: workerCountsByProf[p.id] || 0,
    }));

    return NextResponse.json({
      success: true,
      totalProfessions: professions.length,
      pendingSuggestionsCount: pendingSuggestions.length,
      categories,
      professions: enrichedProfessions,
      pendingSuggestions
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nameHi, categoryId, subcategoryId, aliases, popularSkills, baseHourlyRate, baseDailyRate, isRegulated, verificationRequirements } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ success: false, error: 'Name and Category ID are required' }, { status: 400 });
    }

    const result = await upsertProfession({
      name,
      nameHi,
      categoryId,
      subcategoryId,
      aliases: Array.isArray(aliases) ? aliases : typeof aliases === 'string' ? aliases.split(',').map(a => a.trim()) : [],
      popularSkills: Array.isArray(popularSkills) ? popularSkills : typeof popularSkills === 'string' ? popularSkills.split(',').map(s => s.trim()) : [],
      baseHourlyRate: baseHourlyRate ? Number(baseHourlyRate) : 350,
      baseDailyRate: baseDailyRate ? Number(baseDailyRate) : 1000,
      isRegulated: Boolean(isRegulated),
      verificationRequirements: Array.isArray(verificationRequirements) ? verificationRequirements : []
    }, {
      id: 'admin-super',
      name: 'Super Admin',
      role: 'SUPER_ADMIN'
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profession created successfully in live catalogue',
      profession: result.profession
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
