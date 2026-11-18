import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { signSessionToken, getRoleDashboardPath } from '@/lib/auth';
import { UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      phoneNumber, 
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
      businessType
    } = body;

    if (!phoneNumber || !fullName || !role) {
      return NextResponse.json({ success: false, error: 'Phone, Full Name and Role are required' }, { status: 400 });
    }

    const assignedRole = (role as UserRole) || 'CUSTOMER';

    // Check if phone already registered
    let existing = dbStore.getUserByPhone(phoneNumber);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Phone number already registered. Please login.' }, { status: 400 });
    }

    // Create user
    const newUser = dbStore.createUser({
      phoneNumber,
      phoneVerified: true,
      fullName,
      email: email || undefined,
      language: language || 'hi',
      roles: [assignedRole],
    });

    // If Worker, enhance profile with specific registration details
    if (assignedRole === 'WORKER') {
      const worker = dbStore.getWorkerById(newUser.id);
      if (worker) {
        dbStore.updateWorkerProfile(worker.id, {
          yearsExperience: Number(yearsExperience) || 1,
          hourlyRate: Number(hourlyRate) || 300,
          dailyRate: Number(dailyRate) || 800,
          state: state || 'Delhi',
          city: city || 'Delhi',
          pincode: pincode || '110001',
          skills: tradeCategory ? [{
            id: `ws-${Date.now()}`,
            workerProfileId: worker.id,
            categoryId: tradeCategory,
            categoryName: tradeCategory,
            experienceYears: Number(yearsExperience) || 1,
            isPrimary: true,
          }] : undefined,
        });
      }
    }

    const token = signSessionToken({
      userId: newUser.id,
      phoneNumber: newUser.phoneNumber,
      fullName: newUser.fullName,
      roles: newUser.roles,
      activeRole: assignedRole,
    });

    const response = NextResponse.json({
      success: true,
      user: newUser,
      token,
      redirectUrl: getRoleDashboardPath(assignedRole),
    });

    response.cookies.set('kaamsetu_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
