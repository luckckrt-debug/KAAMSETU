import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { hashPassword, getRoleDashboardPath, normalizeRole, signSessionToken } from '@/lib/auth';
import { getMongoCollection } from '@/lib/mongodb';
import { UserRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      phoneNumber, 
      password,
      confirmPassword,
      fullName, 
      email, 
      role, 
      language, 
      state, 
      city, 
      pincode, 
      tradeCategory, 
      yearsExperience, 
      hourlyRate, 
      dailyRate,
      companyName,
      businessType,
      gstin,
      panNumber,
      addressLine
    } = body;

    // 1. Mandatory Field validation
    if (!fullName || String(fullName).trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Full Name is required for registration.' 
      }, { status: 400 });
    }

    if (!phoneNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'Mobile Number is required for registration.' 
      }, { status: 400 });
    }

    const cleanPhone = String(phoneNumber).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please enter a valid 10-digit Indian mobile number.' 
      }, { status: 400 });
    }

    // Password validation - required for all roles
    if (!password || String(password).trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password is required to create a secure KaamSetu account.' 
      }, { status: 400 });
    }

    if (String(password).length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 6 characters long.' 
      }, { status: 400 });
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Passwords do not match. Please verify both password fields.' 
      }, { status: 400 });
    }

    const passwordHash = hashPassword(String(password));

    // Normalize role
    let assignedRole: UserRole = 'CUSTOMER';
    const rUpper = String(role || 'CUSTOMER').toUpperCase();
    if (rUpper === 'WORKER') assignedRole = 'WORKER';
    else if (rUpper === 'CONTRACTOR') assignedRole = 'CONTRACTOR';
    else if (rUpper === 'CUSTOMER' || rUpper === 'HIRING_PARTNER') assignedRole = 'CUSTOMER';

    // 2. Prevent duplicate mobile accounts (Check MongoDB Atlas & dbStore)
    const usersCol = await getMongoCollection('users');
    if (usersCol) {
      const existingInMongo = await usersCol.findOne({ phoneNumber: cleanPhone });
      if (existingInMongo) {
        return NextResponse.json({ 
          success: false, 
          error: 'This mobile number is already registered. Please log in with your password.' 
        }, { status: 409 });
      }
    }

    const existingInStore = dbStore.getUserByPhone(cleanPhone);
    if (existingInStore) {
      return NextResponse.json({ 
        success: false, 
        error: 'This mobile number is already registered. Please log in with your password.' 
      }, { status: 409 });
    }

    // 3. User ID and timestamp
    const userId = `user-${assignedRole.toLowerCase()}-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newUserDoc = {
      id: userId,
      phoneNumber: cleanPhone,
      phoneVerified: true,
      passwordHash,
      fullName: fullName.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      language: language || 'hi',
      roles: [assignedRole],
      status: 'ACTIVE' as const,
      accountStatus: 'ACTIVE' as const,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 4. Save to MongoDB Atlas users collection
    if (usersCol) {
      try {
        await usersCol.insertOne({
          ...newUserDoc,
          _id: userId as any,
        });
      } catch (err: any) {
        console.error('[MongoDB Register Error] Failed to insert user:', err);
      }
    }

    // Fallback store save
    dbStore.createUser(newUserDoc);

    // 5. Create role-specific profile in MongoDB Atlas
    if (assignedRole === 'CONTRACTOR') {
      const contractorProfilesCol = await getMongoCollection('contractorProfiles');
      const contractorDoc = {
        id: `cont-prof-${Date.now()}`,
        userId,
        companyName: companyName?.trim() || `${fullName.trim()} Contracting Services`,
        businessType: businessType || 'Civil Construction & Contracting',
        city: city?.trim() || 'Delhi',
        state: state?.trim() || 'Delhi',
        pincode: pincode?.trim() || '110001',
        gstin: gstin?.trim().toUpperCase() || undefined,
        panNumber: panNumber?.trim().toUpperCase() || undefined,
        verification: 'SUBMITTED',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      if (contractorProfilesCol) {
        try {
          await contractorProfilesCol.insertOne({
            ...contractorDoc,
            _id: contractorDoc.id as any,
          });
        } catch (err) {
          console.error('[MongoDB Contractor Profile Error]:', err);
        }
      }
    } else if (assignedRole === 'WORKER') {
      const workerProfilesCol = await getMongoCollection('workerProfiles');
      const workerDoc = {
        id: `work-prof-${Date.now()}`,
        userId,
        trade: tradeCategory || 'Electrician',
        yearsExperience: Number(yearsExperience) || 2,
        hourlyRate: Number(hourlyRate) || 350,
        dailyRate: Number(dailyRate) || 800,
        city: city?.trim() || 'Delhi',
        state: state?.trim() || 'Delhi',
        pincode: pincode?.trim() || '110020',
        verificationStatus: 'PENDING',
        ratingAvg: 5.0,
        reviewCount: 0,
        jobsCompleted: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      if (workerProfilesCol) {
        try {
          await workerProfilesCol.insertOne({
            ...workerDoc,
            _id: workerDoc.id as any,
          });

          // Multi-Profession Mapping Save
          if (body.professions && Array.isArray(body.professions)) {
            const workerProfCol = await getMongoCollection('worker_professions');
            if (workerProfCol) {
              const profEntries = body.professions.map((p: any, idx: number) => ({
                id: `wp-${workerDoc.id}-${idx}-${Date.now()}`,
                workerProfileId: workerDoc.id,
                userId,
                professionId: p.professionId || p.id || p.name,
                professionName: p.name || p.professionName || p.trade,
                isPrimary: p.isPrimary !== undefined ? p.isPrimary : idx === 0,
                experienceYears: Number(p.experienceYears) || Number(yearsExperience) || 2,
                hourlyRate: Number(p.hourlyRate) || Number(hourlyRate) || 350,
                dailyRate: Number(p.dailyRate) || Number(dailyRate) || 1000,
                skills: p.skills || [],
                isActive: true,
                createdAt: nowIso
              }));
              if (profEntries.length > 0) {
                await workerProfCol.insertMany(profEntries).catch(() => {});
              }
            }
          }
        } catch (err) {
          console.error('[MongoDB Worker Profile Error]:', err);
        }
      }

      // Initialize worker wallet
      const walletsCol = await getMongoCollection('wallets');
      if (walletsCol) {
        try {
          await walletsCol.insertOne({
            id: `wal-${workerDoc.id}`,
            _id: `wal-${workerDoc.id}` as any,
            workerProfileId: workerDoc.id,
            balance: 0,
            pendingBalance: 0,
            totalEarnings: 0,
            totalWithdrawn: 0,
            updatedAt: nowIso,
          });
        } catch (wErr) {
          console.warn('[MongoDB Wallet Init]:', wErr);
        }
      }
    } else {
      // CUSTOMER / HIRING PARTNER
      const customerProfilesCol = await getMongoCollection('customerProfiles');
      const customerDoc = {
        id: `cust-prof-${Date.now()}`,
        userId,
        fullName: fullName.trim(),
        phoneNumber: cleanPhone,
        email: email ? email.trim().toLowerCase() : undefined,
        city: city?.trim() || 'Delhi',
        address: addressLine?.trim() || `${city || 'Delhi'}, India`,
        pincode: pincode?.trim() || '110001',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      if (customerProfilesCol) {
        try {
          await customerProfilesCol.insertOne({
            ...customerDoc,
            _id: customerDoc.id as any,
          });
        } catch (err) {
          console.error('[MongoDB Customer Profile Error]:', err);
        }
      }
    }

    const redirectPath = getRoleDashboardPath(normalizeRole(assignedRole));

    // Sign session token for automatic login option
    const token = signSessionToken({
      userId,
      phoneNumber: cleanPhone,
      fullName: fullName.trim(),
      roles: [assignedRole],
      activeRole: assignedRole,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account registered successfully! Welcome to KaamSetu.',
      user: {
        id: userId,
        phoneNumber: cleanPhone,
        fullName: fullName.trim(),
        roles: [assignedRole],
        activeRole: assignedRole,
      },
      token,
      redirectUrl: redirectPath,
    }, { status: 201 });

    response.cookies.set('kaamsetu_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;

  } catch (error: any) {
    console.error('[Register API Error]:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error during registration.' 
    }, { status: 500 });
  }
}
