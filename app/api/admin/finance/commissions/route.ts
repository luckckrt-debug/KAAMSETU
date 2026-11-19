export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const rules = dbStore.getCommissionRules();
    return NextResponse.json({
      success: true,
      commissionRules: rules,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, professionSlug, serviceCategory, commissionType, percentageRate, fixedAmount, isActive } = body;

    const rule = dbStore.createOrUpdateCommissionRule({
      id: body.id,
      name,
      professionSlug,
      serviceCategory,
      commissionType: commissionType || 'PERCENTAGE',
      percentageRate: percentageRate !== undefined ? Number(percentageRate) : 10,
      fixedAmount: fixedAmount ? Number(fixedAmount) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    dbStore.recordFinancialAudit(
      'admin-user-1',
      'SUPER_ADMIN',
      'COMMISSION_RULE_UPDATE',
      'COMMISSION_RULE',
      rule.id,
      `Configured rule: ${rule.name} with rate ${rule.percentageRate}%`
    );

    return NextResponse.json({
      success: true,
      message: 'Commission rule saved successfully.',
      rule,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
