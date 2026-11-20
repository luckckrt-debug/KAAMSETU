import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb, recordAdminAuditLog } from '@/lib/mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 });
    }

    const col = db.collection('professions');
    const existing = await col.findOne({ id });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Profession not found' }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (body.name !== undefined) updates.name = body.name;
    if (body.nameHi !== undefined) updates.nameHi = body.nameHi;
    if (body.categoryId !== undefined) updates.categoryId = body.categoryId;
    if (body.subcategoryId !== undefined) updates.subcategoryId = body.subcategoryId;
    if (body.aliases !== undefined) {
      updates.aliases = Array.isArray(body.aliases) ? body.aliases : body.aliases.split(',').map((a: string) => a.trim());
    }
    if (body.popularSkills !== undefined) {
      updates.popularSkills = Array.isArray(body.popularSkills) ? body.popularSkills : body.popularSkills.split(',').map((s: string) => s.trim());
    }
    if (body.baseHourlyRate !== undefined) updates.baseHourlyRate = Number(body.baseHourlyRate);
    if (body.baseDailyRate !== undefined) updates.baseDailyRate = Number(body.baseDailyRate);
    if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);
    if (body.isRegulated !== undefined) updates.isRegulated = Boolean(body.isRegulated);

    await col.updateOne({ id }, { $set: updates });

    await recordAdminAuditLog({
      adminId: 'admin-super',
      adminName: 'Super Admin',
      adminRole: 'SUPER_ADMIN',
      action: 'UPDATE_PROFESSION',
      targetRecord: id,
      targetCollection: 'professions',
      previousValue: existing,
      updatedValue: updates
    });

    return NextResponse.json({
      success: true,
      message: 'Profession updated successfully',
      updates
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
