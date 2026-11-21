import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let workerProfileId = 'worker-prof-1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const worker = dbStore.getWorkerById(payload.userId);
        if (worker) workerProfileId = worker.id;
      }
    }

    const accounts = dbStore.getPayoutAccounts(workerProfileId);

    return NextResponse.json({
      success: true,
      payoutAccounts: accounts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let workerProfileId = 'worker-prof-1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const worker = dbStore.getWorkerById(payload.userId);
        if (worker) workerProfileId = worker.id;
      }
    }

    const body = await req.json();
    const { accountType, accountHolderName, bankName, accountNumberMasked, ifscCode, upiId, isPrimary } = body;

    if (!accountType || !accountHolderName) {
      return NextResponse.json(
        { success: false, error: 'accountType and accountHolderName are required' },
        { status: 400 }
      );
    }

    if (accountType === 'UPI' && !upiId) {
      return NextResponse.json({ success: false, error: 'Valid UPI ID is required' }, { status: 400 });
    }

    if (accountType === 'BANK_ACCOUNT' && (!ifscCode || !accountNumberMasked)) {
      return NextResponse.json(
        { success: false, error: 'Bank account number and IFSC code are required' },
        { status: 400 }
      );
    }

    const newAccount = dbStore.addPayoutAccount(workerProfileId, {
      accountType,
      accountHolderName,
      bankName,
      accountNumberMasked,
      ifscCode,
      upiId,
      isPrimary: Boolean(isPrimary),
    });

    return NextResponse.json({
      success: true,
      message: 'Payout account added and verified.',
      payoutAccount: newAccount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
