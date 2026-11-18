import { NextRequest, NextResponse } from 'next/server';
import { loadStore, saveStore } from '@/lib/store';
import { TenderTeam } from '@/lib/types';

export async function GET() {
  try {
    const store = loadStore();
    return NextResponse.json({
      success: true,
      teams: store.tenderTeams,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, leaderWorkerProfileId, primaryTrade, description, memberCount } = body;

    if (!name || !primaryTrade) {
      return NextResponse.json({ success: false, error: 'Team name and primary trade required' }, { status: 400 });
    }

    const newTeam: TenderTeam = {
      id: `team-${Date.now()}`,
      name,
      leaderWorkerProfileId: leaderWorkerProfileId || 'worker-prof-3',
      primaryTrade,
      description,
      memberCount: Number(memberCount) || 10,
      createdAt: new Date().toISOString(),
    };

    const store = loadStore();
    store.tenderTeams.push(newTeam);
    saveStore();

    return NextResponse.json({
      success: true,
      team: newTeam,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
