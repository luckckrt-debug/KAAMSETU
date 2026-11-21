export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore } from '@/lib/store';
import { finalizeWorkerWithdrawal } from '@/lib/financial-ledger';
import { verifySessionToken } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let adminId = 'user-admin-1';
    let adminName = 'Super Admin';

    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        adminId = payload.userId;
        adminName = payload.fullName || 'Operations Admin';
      }
    }

    const body = await req.json();
    const { action, providerPayoutId, bankTransferReference, failureReason } = body;

    const store = loadStore();
    const withdrawal = store.withdrawals?.find((w) => w.id === params.id);
    if (!withdrawal) {
      return NextResponse.json({ success: false, error: 'Withdrawal not found' }, { status: 404 });
    }

    if (withdrawal.status === 'SUCCESS' || withdrawal.status === 'PAID' || withdrawal.status === 'FAILED') {
      return NextResponse.json(
        { success: false, error: `Withdrawal has already been finalized with status ${withdrawal.status}` },
        { status: 400 }
      );
    }

    if (action === 'APPROVE') {
      const utrRef = bankTransferReference || `UTR_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const result = await finalizeWorkerWithdrawal({
        withdrawalId: params.id,
        isSuccess: true,
        bankTransferReference: utrRef,
        providerPayoutId: providerPayoutId || `pout_adm_${Date.now()}`,
        adminId,
        adminName,
      });

      return NextResponse.json({
        success: true,
        message: `Withdrawal ${params.id} approved and bank transfer confirmed (UTR: ${utrRef}).`,
        withdrawal: result.withdrawal,
      });
    } else if (action === 'REJECT') {
      const reason = failureReason || 'Rejected by Administrator review';
      const result = await finalizeWorkerWithdrawal({
        withdrawalId: params.id,
        isSuccess: false,
        failureReason: reason,
        adminId,
        adminName,
      });

      return NextResponse.json({
        success: true,
        message: `Withdrawal ${params.id} rejected. ₹${withdrawal.amount} safely restored to worker wallet.`,
        withdrawal: result.withdrawal,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Must be APPROVE or REJECT' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
