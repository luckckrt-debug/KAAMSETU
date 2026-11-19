'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/hiring/dashboard');
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#F8FCFF] font-bold text-[#4B6F8E] text-xs">
      Redirecting to Hiring Partner Workspace...
    </div>
  );
}
