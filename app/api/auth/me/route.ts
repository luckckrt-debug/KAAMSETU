import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('kaamsetu_session')?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const user = dbStore.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
      activeRole: payload.activeRole,
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
