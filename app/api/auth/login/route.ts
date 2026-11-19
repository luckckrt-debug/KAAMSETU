import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { comparePassword, hashPassword, signSessionToken, getRoleDashboardPath, normalizeRole, verifyOtp } from '@/lib/auth';
import { getMongoCollection } from '@/lib/mongodb';
import { UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, password, otp } = body;

    if (!phoneNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'Mobile number is required.' 
      }, { status: 400 });
    }

    const cleanPhone = String(phoneNumber).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please enter a valid 10-digit Indian mobile number.' 
      }, { status: 400 });
    }

    // 1. Lookup user in MongoDB Atlas users collection
    let user: any = null;
    const usersCol = await getMongoCollection('users');
    if (usersCol) {
      user = await usersCol.findOne({ phoneNumber: cleanPhone });
    }

    // Fallback to in-memory dbStore if not found in MongoDB
    if (!user) {
      user = dbStore.getUserByPhone(cleanPhone);
    }

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'No account found with this mobile number. Please register first.' 
      }, { status: 404 });
    }

    // 2. Check if account is suspended or blocked
    if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      return NextResponse.json({ 
        success: false, 
        error: 'Your account has been suspended or restricted by KaamSetu Operations. Please contact support.' 
      }, { status: 403 });
    }

    // 3. Password Verification (or OTP verification if OTP was provided)
    if (otp) {
      const otpRes = verifyOtp(cleanPhone, otp);
      if (!otpRes.success) {
        return NextResponse.json({ success: false, error: otpRes.message }, { status: 400 });
      }
    } else {
      if (!password) {
        return NextResponse.json({ 
          success: false, 
          error: 'Password is required to log in.' 
        }, { status: 400 });
      }

      // If user has a hashed password
      if (user.passwordHash) {
        const isMatch = comparePassword(String(password), user.passwordHash);
        if (!isMatch) {
          return NextResponse.json({ 
            success: false, 
            error: 'Incorrect password. Please try again or use OTP verification.' 
          }, { status: 401 });
        }
      } else {
        // Legacy / Pre-seeded demo user (accepts default demo password "KaamSetu@2026" or "123456")
        const isDemoPass = password === 'KaamSetu@2026' || password === '123456' || password === 'password123';
        if (!isDemoPass) {
          return NextResponse.json({ 
            success: false, 
            error: 'Incorrect password. (For demo accounts, use: KaamSetu@2026)' 
          }, { status: 401 });
        }
        // Save hashed password for next time
        const newHash = hashPassword(String(password));
        if (usersCol) {
          await usersCol.updateOne({ phoneNumber: cleanPhone }, { $set: { passwordHash: newHash } });
        }
        user.passwordHash = newHash;
      }
    }

    // 4. Role determination and authorized dashboard route
    const roles: UserRole[] = user.roles && user.roles.length > 0 ? user.roles : ['CUSTOMER'];
    const primaryRole = roles[0];
    const normalized = normalizeRole(primaryRole);
    const redirectUrl = getRoleDashboardPath(normalized);

    // 5. Generate signed JWT session token
    const token = signSessionToken({
      userId: user.id || String(user._id),
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      roles,
      activeRole: primaryRole,
    });

    // 6. Build response and set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      user: {
        id: user.id || String(user._id),
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        email: user.email,
        roles,
        activeRole: primaryRole,
      },
      token,
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
    console.error('[Login API Error]:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Login failed due to internal error.' 
    }, { status: 500 });
  }
}
