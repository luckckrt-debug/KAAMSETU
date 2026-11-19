import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface SessionPayload {
  userId: string;
  phoneNumber: string;
  fullName: string;
  roles: string[];
  activeRole: string;
  exp?: number;
}

function parseJwtPayload(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload) as SessionPayload;
    if (parsed.exp && Date.now() >= parsed.exp * 1000) {
      return null; // Expired
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

function getAuthorizedDashboard(role: string): string {
  const r = (role || '').toUpperCase();
  if (r === 'WORKER' || r === 'TEAM_LEADER') return '/worker/dashboard';
  if (r === 'CONTRACTOR' || r === 'TENDER_OWNER') return '/contractor/dashboard';
  if (r === 'ADMIN' || r === 'SUPER_ADMIN') return '/admin';
  return '/hiring/dashboard';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Seamless legacy customer redirect to hiring portal
  if (pathname === '/customer' || pathname === '/customer/dashboard') {
    return NextResponse.redirect(new URL('/hiring/dashboard', request.url));
  }

  // Check if accessing a protected role route
  const isWorkerRoute = pathname.startsWith('/worker');
  const isHiringRoute = pathname.startsWith('/hiring');
  const isContractorRoute = pathname.startsWith('/contractor');
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isWorkerRoute && !isHiringRoute && !isContractorRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('kaamsetu_session')?.value;

  // Unauthenticated access attempt to protected workspace
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = parseJwtPayload(sessionCookie);

  // Invalid or expired token
  if (!payload || !payload.activeRole) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('kaamsetu_session');
    return response;
  }

  const role = payload.activeRole.toUpperCase();
  const authorizedDashboard = getAuthorizedDashboard(role);

  // Strict role boundaries: Reject access to irrelevant workspaces and redirect to user's authorized workspace
  if (isWorkerRoute && role !== 'WORKER' && role !== 'TEAM_LEADER') {
    return NextResponse.redirect(new URL(authorizedDashboard, request.url));
  }

  if (isHiringRoute && role !== 'HIRING_PARTNER' && role !== 'CUSTOMER') {
    return NextResponse.redirect(new URL(authorizedDashboard, request.url));
  }

  if (isContractorRoute && role !== 'CONTRACTOR' && role !== 'TENDER_OWNER') {
    return NextResponse.redirect(new URL(authorizedDashboard, request.url));
  }

  if (isAdminRoute && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL(authorizedDashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/worker/:path*',
    '/hiring/:path*',
    '/customer/:path*',
    '/contractor/:path*',
    '/admin/:path*',
  ],
};
