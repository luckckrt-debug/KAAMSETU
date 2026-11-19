import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb, upsertMongoDocument } from '@/lib/mongodb';
import { signSessionToken, hashPassword } from '@/lib/auth';
import { loadStore, saveStore, dbStore } from '@/lib/store';
import { User, UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      firebaseUid, 
      phoneNumber, 
      email, 
      displayName, 
      photoURL,
      requestedRole = 'CUSTOMER',
      idToken 
    } = body;

    if (!firebaseUid && !phoneNumber && !email) {
      return NextResponse.json(
        { success: false, error: 'Firebase authentication identifier (UID, phone, or email) is required.' },
        { status: 400 }
      );
    }

    // Standardize Indian phone number (remove +91 if present for 10-digit format)
    let cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
    if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.slice(2);
    }

    const store = loadStore();
    let user: any = null;
    let db: any = null;

    try {
      db = await getMongoDb();
    } catch (e) {
      console.warn('[Firebase Auth API] MongoDB Atlas offline, using store fallback:', e);
    }

    // 1. Check if user already exists by phone, email, or firebaseUid
    if (db) {
      const orConditions: any[] = [];
      if (cleanPhone) orConditions.push({ phoneNumber: cleanPhone });
      if (email) orConditions.push({ email: email.toLowerCase() });
      if (firebaseUid) orConditions.push({ firebaseUid: firebaseUid });

      if (orConditions.length > 0) {
        user = await db.collection('users').findOne({ $or: orConditions });
      }
    }

    // Fallback store search
    if (!user) {
      user = store.users.find((u) => 
        (cleanPhone && u.phoneNumber === cleanPhone) ||
        (email && u.email && u.email.toLowerCase() === email.toLowerCase()) ||
        ((u as any).firebaseUid && (u as any).firebaseUid === firebaseUid)
      );
    }

    // 2. Determine target role
    let targetRole: UserRole = 'CUSTOMER';
    if (user && user.roles && user.roles.length > 0) {
      targetRole = user.roles[0];
    } else {
      if (['WORKER', 'CONTRACTOR', 'CUSTOMER', 'HIRING_PARTNER', 'ADMIN'].includes(requestedRole)) {
        targetRole = requestedRole === 'HIRING_PARTNER' ? 'CUSTOMER' : (requestedRole as UserRole);
      }
    }

    // 3. Create user if not existing
    const now = new Date().toISOString();
    if (!user) {
      const newUserId = `user-fb-${Date.now().toString().slice(-6)}`;
      const fullName = displayName || (cleanPhone ? `User ${cleanPhone.slice(-4)}` : 'KaamSetu User');

      user = {
        id: newUserId,
        fullName,
        phoneNumber: cleanPhone || '98' + Math.floor(10000000 + Math.random() * 90000000),
        email: email || `${newUserId}@kaamsetu.in`,
        avatarUrl: photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        roles: [targetRole],
        status: 'ACTIVE',
        language: 'hi',
        firebaseUid: firebaseUid || '',
        createdAt: now,
        updatedAt: now,
      };

      // Create in MongoDB Atlas
      if (db) {
        await db.collection('users').insertOne(user);
      }
      store.users.push(user);

      // Create role profile
      if (targetRole === 'WORKER') {
        const workerProf = {
          id: `worker-prof-${Date.now().toString().slice(-6)}`,
          userId: user.id,
          headline: 'Verified Professional Worker',
          yearsExperience: 3,
          hourlyRate: 350,
          dailyRate: 900,
          ratingAvg: 4.9,
          verificationStatus: 'VERIFIED',
          city: 'Noida',
          createdAt: now,
        };
        if (db) await db.collection('workerProfiles').insertOne(workerProf);
        store.workerProfiles.push(workerProf as any);

        const wallet = {
          id: `wallet-${Date.now().toString().slice(-6)}`,
          workerProfileId: workerProf.id,
          balance: 0,
          pendingBalance: 0,
          updatedAt: now,
        };
        if (db) await db.collection('wallets').insertOne(wallet);
        store.wallets.push(wallet as any);

      } else if (targetRole === 'CONTRACTOR') {
        const contractorProf = {
          id: `contractor-prof-${Date.now().toString().slice(-6)}`,
          userId: user.id,
          companyName: `${user.fullName} Contracting`,
          representativeName: user.fullName,
          city: 'Noida',
          state: 'Uttar Pradesh',
          verificationStatus: 'VERIFIED',
          activeProjectsCount: 0,
          totalWorkersHired: 0,
          createdAt: now,
          updatedAt: now,
        };
        if (db) await db.collection('contractorProfiles').insertOne(contractorProf);
        store.contractorProfiles.push(contractorProf as any);

      } else {
        const customerProf = {
          id: `cust-prof-${Date.now().toString().slice(-6)}`,
          userId: user.id,
          createdAt: now,
        };
        if (db) await db.collection('customerProfiles').insertOne(customerProf);
        store.customerProfiles.push(customerProf as any);
      }

      saveStore();
    } else {
      // Update existing user with firebaseUid if not set
      if (firebaseUid && user.firebaseUid !== firebaseUid) {
        user.firebaseUid = firebaseUid;
        if (db) {
          await db.collection('users').updateOne(
            { id: user.id },
            { $set: { firebaseUid: firebaseUid, updatedAt: now } }
          );
        }
        saveStore();
      }
    }

    // 4. Verify account status
    if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, error: 'Your KaamSetu account has been suspended or blocked by administration.' },
        { status: 403 }
      );
    }

    // 5. Generate secure JWT session token
    const token = signSessionToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName || 'KaamSetu User',
      roles: user.roles || [targetRole],
      activeRole: (user.roles && user.roles[0]) || targetRole,
    });

    // 6. Map redirect path
    let redirectUrl = '/hiring/dashboard';
    if (user.roles?.includes('ADMIN')) redirectUrl = '/admin';
    else if (user.roles?.includes('WORKER')) redirectUrl = '/worker/dashboard';
    else if (user.roles?.includes('CONTRACTOR')) redirectUrl = '/contractor/dashboard';
    else redirectUrl = '/hiring/dashboard';

    // 7. Set HTTP-Only Cookie
    const response = NextResponse.json({
      success: true,
      message: 'Firebase authentication successful! Welcome to KaamSetu.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        roles: user.roles,
        avatarUrl: user.avatarUrl,
      },
      role: user.roles[0],
      redirectUrl,
    });

    response.cookies.set('kaamsetu_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[Firebase Auth API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during Firebase authentication.' },
      { status: 500 }
    );
  }
}
