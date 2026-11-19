export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { loadStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || '';
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    const db = await getMongoDb();
    const store = loadStore();

    let logs: any[] = [];
    if (db) {
      try {
        let query: any = {};
        if (action) query.action = { $regex: action, $options: 'i' };
        if (search) {
          query.$or = [
            { action: { $regex: search, $options: 'i' } },
            { targetUser: { $regex: search, $options: 'i' } },
            { reason: { $regex: search, $options: 'i' } },
            { adminName: { $regex: search, $options: 'i' } },
          ];
        }
        logs = await db.collection('auditLogs').find(query).sort({ timestamp: -1 }).limit(100).toArray();
      } catch (e) {
        console.warn('[Admin Audit Logs API] MongoDB warning:', e);
      }
    }

    if (logs.length === 0) {
      logs = store.auditLogs || [];
      if (search) {
        logs = logs.filter((l) => JSON.stringify(l).toLowerCase().includes(search));
      }
    }

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
