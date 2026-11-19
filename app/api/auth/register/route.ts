import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { hashPassword, signSessionToken, getRoleDashboardPath } from '@/lib/auth';
import { getMongoCollection } from '@/lib/mongodb';
import { UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      phoneNumber, 
      password,
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

    // 1. Field validation
    if (!phoneNumber || !fullName || !role) {
      return NextResponse.json({ 
        success: false, 
        error: 'Full Name, Mobile Number and Account Role are required.' 
      }, { status: 400 });
    }

    const cleanPhone = String(phoneNumber).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please enter a valid 10-digit Indian mobile number.' 
      }, { status: 400 });
    }

    // Password is only validated if provided (supports passwordless Customer registration & email-link auth)
    let passwordHash: string | undefined = undefined;
    if (password && String(password).trim().length > 0) {
      if (String(password).length < 6) {
        return NextResponse.json({ 
          success: false, 
          error: 'Password must be at least 6 characters long.' 
        }, { status: 400 });
      }
      passwordHash = hashPassword(String(password));
    }

    // Normalize role
    let assignedRole: UserRole = 'CUSTOMER';
    const rUpper = String(role).toUpperCase();
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
          error: 'This mobile number is already registered. Please login with your password.' 
        }, { status: 400 });
      }
    }

    const existingInStore = dbStore.getUserByPhone(cleanPhone);
    if (existingInStore) {
      return NextResponse.json({ 
        success: false, 
        error: 'This mobile number is already registered. Please login with your password.' 
      }, { status: 400 });
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

    // 5. Create role-specific profile in MongoDB Atlas
    if (assignedRole === 'CONTRACTOR') {
      const contractorProfilesCol = await getMongoCollection('contractorProfiles');
      const contractorDoc = {
        id: `cont-prof-${Date.now()}`,
        userId,
        companyName: companyName?.trim() || `${fullName.trim()} Contracting Services`,
        businessType: businessType || 'Civil Construction & Contracting',
        city: city || 'Delhi',
        state: state || 'Delhi',
        pincode: pincode || '110001',
        gstin: gstin?.trim() || undefined,
        panNumber: panNumber?.trim() || undefined,
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
        dailyRate: Number(dailyRate) || 900,
        state: state || 'Delhi',
        city: city || 'Delhi',
        pincode: pincode || '110001',
        verificationStatus: 'VERIFIED',
        isOnline: true,
        isAvailableNow: true,
        ratingAvg: 5.0,
        ratingCount: 1,
        completedJobsCount: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      if (workerProfilesCol) {
        try {
          await workerProfilesCol.insertOne({
            ...workerDoc,
            _id: workerDoc.id as any,
          });
        } catch (err) {
          console.error('[MongoDB Worker Profile Error]:', err);
        }
      }
    } else if (assignedRole === 'CUSTOMER') {
      const customerProfilesCol = await getMongoCollection('customerProfiles');
      const customerDoc = {
        id: `cust-prof-${Date.now()}`,
        userId,
        city: city || 'Noida',
        addressLine: addressLine || 'Address',
        createdAt: nowIso,
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

    // 6. Also sync to in-memory dbStore for seamless fallback
    const storeUser = dbStore.createUser({
      phoneNumber: cleanPhone,
      phoneVerified: true,
      fullName: fullName.trim(),
      email: email ? email.trim() : undefined,
      language: language || 'hi',
      roles: [assignedRole],
    });
    // Attach passwordHash to in-memory user
    storeUser.passwordHash = passwordHash;
    storeUser.status = 'ACTIVE';

    if (assignedRole === 'WORKER') {
      const worker = dbStore.getWorkerById(storeUser.id);
      if (worker) {
        dbStore.updateWorkerProfile(worker.id, {
          yearsExperience: Number(yearsExperience) || 2,
          hourlyRate: Number(hourlyRate) || 350,
          dailyRate: Number(dailyRate) || 900,
          state: state || 'Delhi',
          city: city || 'Delhi',
          pincode: pincode || '110001',
          skills: tradeCategory ? [{
            id: `ws-${Date.now()}`,
            workerProfileId: worker.id,
            categoryId: tradeCategory,
            categoryName: tradeCategory,
            experienceYears: Number(yearsExperience) || 2,
            isPrimary: true,
          }] : undefined,
        });
      }
    }

    // 7. Generate session token for seamless authentication
    const token = signSessionToken({
      userId,
      phoneNumber: cleanPhone,
      fullName: fullName.trim(),
      roles: [assignedRole],
      activeRole: assignedRole,
    });

    const redirectPath = getRoleDashboardPath(assignedRole);

    const response = NextResponse.json({
      success: true,
      message: 'Account registered successfully! Welcome to KaamSetu.',
      userId,
      role: assignedRole,
      redirectUrl: redirectPath,
      token,
    });

    // Set secure session cookie
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
      error: error.message || 'Registration failed due to internal error.' 
    }, { status: 500 });
  }
}
