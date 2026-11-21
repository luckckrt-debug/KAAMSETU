export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { requestReferralWithdrawal } from '@/lib/referral';

export async function POST(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let userId = 'user-customer-demo';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload && payload.userId) {
        userId = payload.userId;
      }
    }

    const body = await req.json();
    const { amount, paymentMethod, accountDetails } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: 'Please enter a valid withdrawal amount.' }, { status: 400 });
    }
    if (!accountDetails || !accountDetails.trim()) {
      return NextResponse.json({ success: false, error: 'Please provide UPI ID or bank account details.' }, { status: 400 });
    }

    const result = await requestReferralWithdrawal({
      userId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'UPI',
      accountDetails: accountDetails.trim(),
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Withdrawal processed successfully.',
      transactionId: result.transactionId,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
