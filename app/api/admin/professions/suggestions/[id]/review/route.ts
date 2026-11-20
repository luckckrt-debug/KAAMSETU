import { NextRequest, NextResponse } from 'next/server';
import { reviewProfessionSuggestion } from '@/lib/mongodb-professions';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { decision, approvedCategoryId, approvedSubcategoryId, standardName, standardNameHi, adminNotes, aliases } = body;

    if (!decision || (decision !== 'APPROVED' && decision !== 'REJECTED')) {
      return NextResponse.json({ success: false, error: 'decision must be APPROVED or REJECTED' }, { status: 400 });
    }

    const result = await reviewProfessionSuggestion(
      id,
      decision,
      {
        approvedCategoryId,
        approvedSubcategoryId,
        standardName,
        standardNameHi,
        adminNotes,
        aliases
      },
      {
        id: 'admin-super',
        name: 'Super Admin',
        role: 'SUPER_ADMIN'
      }
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Suggestion ${decision === 'APPROVED' ? 'approved & published to live catalogue' : 'rejected'}`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
