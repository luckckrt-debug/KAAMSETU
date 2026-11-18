// KAAMSETU - Authentication, Session & RBAC Module
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, UserRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'kaamsetu_super_secure_jwt_secret_dev_2026_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  phoneNumber: string;
  fullName: string;
  roles: UserRole[];
  activeRole: UserRole;
}

// In-memory OTP Store with TTL & Rate Limiting
interface OtpEntry {
  code: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpEntry>();
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Generate a 6-digit numeric OTP with 5 minute expiration and 60-second cooldown
 */
export function generateOtp(phoneNumber: string): { success: boolean; message: string; cooldownSeconds?: number; testCode?: string } {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return { success: false, message: 'Invalid Indian phone number' };
  }

  const now = Date.now();

  // Rate limit check: Max 5 OTP requests per 10 minutes per phone
  const rateLimit = rateLimitStore.get(cleanPhone);
  if (rateLimit && now < rateLimit.resetAt) {
    if (rateLimit.count >= 5) {
      const waitMins = Math.ceil((rateLimit.resetAt - now) / 60000);
      return { success: false, message: `Too many attempts. Please try again after ${waitMins} minutes.` };
    }
  }

  // Cooldown check: 60 seconds
  const existing = otpStore.get(cleanPhone);
  if (existing && now - existing.lastSentAt < 60000) {
    const remaining = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
    return { success: false, message: `Please wait ${remaining} seconds before requesting a new OTP.`, cooldownSeconds: remaining };
  }

  // Generate 6 digit OTP (or '123456' in dev simulator mode)
  const isDev = process.env.NODE_ENV !== 'production' || process.env.OTP_PROVIDER === 'simulator';
  const otpCode = isDev ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(cleanPhone, {
    code: otpCode,
    expiresAt: now + 5 * 60 * 1000, // 5 minutes
    lastSentAt: now,
    attempts: 0,
  });

  // Update rate limiter
  if (!rateLimit || now >= rateLimit.resetAt) {
    rateLimitStore.set(cleanPhone, { count: 1, resetAt: now + 10 * 60 * 1000 });
  } else {
    rateLimit.count += 1;
  }

  // In production, integrate with SMS gateway (e.g. Fast2SMS / MSG91)
  console.log(`[KAAMSETU OTP SERVICE] Sent OTP to +91-${cleanPhone}: ${otpCode}`);

  return {
    success: true,
    message: 'OTP sent successfully to your phone.',
    testCode: isDev ? otpCode : undefined,
  };
}

/**
 * Verify OTP submitted by user
 */
export function verifyOtp(phoneNumber: string, code: string): { success: boolean; message: string } {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const entry = otpStore.get(cleanPhone);
  const now = Date.now();

  // Allow standard dev OTP in non-production
  const isDev = process.env.NODE_ENV !== 'production' || process.env.OTP_PROVIDER === 'simulator';
  if (isDev && code === '123456') {
    otpStore.delete(cleanPhone);
    return { success: true, message: 'OTP verified successfully.' };
  }

  if (!entry) {
    return { success: false, message: 'OTP expired or not requested. Please request a new OTP.' };
  }

  if (now > entry.expiresAt) {
    otpStore.delete(cleanPhone);
    return { success: false, message: 'OTP has expired. Please request a new code.' };
  }

  if (entry.attempts >= 5) {
    otpStore.delete(cleanPhone);
    return { success: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (entry.code !== code.trim()) {
    entry.attempts += 1;
    return { success: false, message: `Incorrect OTP. ${5 - entry.attempts} attempts remaining.` };
  }

  // Valid
  otpStore.delete(cleanPhone);
  return { success: true, message: 'OTP verified successfully.' };
}

/**
 * Create a signed JWT token
 */
export function signSessionToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

/**
 * Verify a JWT token
 */
export function verifySessionToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get authorized landing dashboard route based on user role
 */
export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case 'WORKER':
      return '/worker/dashboard';
    case 'CUSTOMER':
      return '/customer/dashboard';
    case 'CONTRACTOR':
    case 'TENDER_OWNER':
      return '/contractor/dashboard';
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/admin';
    default:
      return '/customer/dashboard';
  }
}
