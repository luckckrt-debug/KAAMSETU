export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore } from '@/lib/store';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { action, providerPayoutId, failureReason } = body;

    const store = loadStore();
    const withdrawal = store.withdrawals?.find(w => w.id === params.id);
    if (!withdrawal) {
      return NextResponse.json({ success: false, error: 'Withdrawal not found' }, { status: 404 });
    }

    if (withdrawal.status === 'SUCCESS' || withdrawal.status === 'FAILED') {
      return NextResponse.json(
        { success: false, error: `Withdrawal has already been finalized with status ${withdrawal.status}` },
        { status: 400 }
      );
    }

    if (action === 'APPROVE') {
      const updated = dbStore.finalizeWithdrawal(
        params.id,
        true,
        providerPayoutId || `adm_pout_${Date.now()}`
      );
      dbStore.recordFinancialAudit(
        'admin-user-1',
        'SUPER_ADMIN',
        'ADMIN_WITHDRAWAL_APPROVE',
        'WITHDRAWAL',
        params.id,
        `Approved withdrawal of ₹${withdrawal.amount} to ${withdrawal.payoutTargetMasked}`,
        withdrawal.amount
      );
      return NextResponse.json({
        success: true,
        message: `Withdrawal ${params.id} approved and finalized.`,
        withdrawal: updated,
      });
    } else if (action === 'REJECT') {
      const updated = dbStore.finalizeWithdrawal(
        params.id,
        false,
        undefined,
        failureReason || 'Rejected by Administrator review'
      );
      dbStore.recordFinancialAudit(
        'admin-user-1',
        'SUPER_ADMIN',
        'ADMIN_WITHDRAWAL_REJECT',
        'WITHDRAWAL',
        params.id,
        `Rejected withdrawal of ₹${withdrawal.amount}. Funds restored to wallet. Reason: ${failureReason || 'Admin rejection'}`,
        withdrawal.amount
      );
      return NextResponse.json({
        success: true,
        message: `Withdrawal ${params.id} rejected. ₹${withdrawal.amount} restored to worker wallet.`,
        withdrawal: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Must be APPROVE or REJECT' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
