'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToCustomerDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/hiring/dashboard');
  }, [router]);
  return null;
}
