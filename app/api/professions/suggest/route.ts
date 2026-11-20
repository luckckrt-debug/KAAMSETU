import { NextRequest, NextResponse } from 'next/server';
import { submitProfessionSuggestion } from '@/lib/mongodb-professions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nameHi, categorySuggestion, skills, description, submittedByRole, submittedByUserId } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Profession name is required' }, { status: 400 });
    }

    const result = await submitProfessionSuggestion({
      name: name.trim(),
      nameHi,
      categorySuggestion,
      skills: Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : [],
      description,
      submittedByRole,
      submittedByUserId
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profession suggestion submitted successfully. Our team will review and publish it.',
      suggestionId: result.suggestionId
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
