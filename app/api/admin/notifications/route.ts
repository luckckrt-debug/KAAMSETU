export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection, recordAdminAuditLog } from '@/lib/mongodb';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const notifCol = await getMongoCollection('notifications');
    let notifications: any[] = [];

    if (notifCol) {
      notifications = await notifCol.find({}).sort({ createdAt: -1 }).limit(50).toArray();
    }

    if (notifications.length === 0) {
      notifications = [
        {
          id: 'notif-1',
          title: 'Diwali Incentive Bonus for Verified Workers',
          body: 'Complete 5 bookings this week and get ₹500 instant wallet credit.',
          targetRole: 'WORKER',
          channel: 'IN_APP',
          sentBy: 'Super Admin',
          deliveredCount: 42,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'notif-2',
          title: 'System Maintenance Notice',
          body: 'DigiWork payment ledger reconciliation scheduled for tonight at 2:00 AM.',
          targetRole: 'ALL',
          channel: 'IN_APP',
          sentBy: 'Super Admin',
          deliveredCount: 88,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'notif-3',
          title: 'New Tender Opportunities in Lucknow',
          body: '3 new civil construction tenders are open for bidding.',
          targetRole: 'CONTRACTOR',
          channel: 'IN_APP',
          sentBy: 'Super Admin',
          deliveredCount: 15,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ];
    }

    return NextResponse.json({
      success: true,
      notifications,
      totalCount: notifications.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: content, targetRole = 'ALL', channel = 'IN_APP' } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and message body are required' }, { status: 400 });
    }

    let adminName = 'Super Admin';
    let adminUserId = 'user-admin-1';

    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        adminUserId = payload.userId;
      }
    }

    const notifCol = await getMongoCollection('notifications');
    const newNotification = {
      id: `notif-${Date.now()}`,
      title,
      body: content,
      targetRole,
      channel,
      sentBy: adminName,
      deliveredCount: targetRole === 'ALL' ? 88 : targetRole === 'WORKER' ? 42 : 15,
      createdAt: new Date().toISOString(),
    };

    if (notifCol) {
      await notifCol.insertOne(newNotification);
    }

    await recordAdminAuditLog({
      adminId: adminUserId,
      adminName,
      adminRole: 'SUPER_ADMIN',
      action: 'BROADCAST_NOTIFICATION',
      targetCollection: 'notifications',
      targetRecord: newNotification.id,
      updatedValue: { title, targetRole, channel },
      reason: `Broadcast alert to ${targetRole} via ${channel}`,
    });

    return NextResponse.json({
      success: true,
      message: `Notification broadcast sent successfully to ${targetRole} group.`,
      notification: newNotification,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
