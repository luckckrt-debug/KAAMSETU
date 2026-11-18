import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore, loadStore } from '@/lib/store';
import { calculateJobCommission } from '@/lib/commission';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('kaamsetu_session')?.value;
    let workerProfileId = 'worker-prof-1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const worker = dbStore.getWorkerById(payload.userId);
        if (worker) workerProfileId = worker.id;
      }
    }

    const store = loadStore();
    // Find all bookings assigned to this worker
    const workerBookings = store.bookings
      .filter(b => b.assignedWorkerProfileId === workerProfileId)
      .map(b => {
        const payment = store.payments.find(p => p.bookingId === b.id);
        const jobAmount = b.finalAmount || b.estimatedAmount;
        const commission = calculateJobCommission({
          jobAmount,
          professionSlug: b.serviceCategory,
          workerProfileId,
          customRules: store.commissionRules,
        });

        return {
          id: b.id,
          serviceCategory: b.serviceCategory,
          serviceDescription: b.serviceDescription,
          status: b.status,
          completionDate: b.workCompletedAt || b.confirmedAt || b.updatedAt,
          grossAmount: commission.jobAmount,
          commissionAmount: commission.commissionAmount,
          commissionPercent: commission.commissionRatePercent,
          netAmount: commission.workerNetEarning,
          paymentStatus: payment?.status || (b.status === 'PAYMENT_PAID' ? 'PAID' : 'PENDING'),
          paymentMethod: payment?.paymentMethod || 'ONLINE',
          isPaid: b.status === 'PAYMENT_PAID' || payment?.status === 'PAID',
        };
      })
      .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());

    return NextResponse.json({
      success: true,
      jobEarnings: workerBookings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
