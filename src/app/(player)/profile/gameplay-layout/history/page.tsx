'use client';

import { GlobalLayoutHistory } from '@/components/gameplay/GlobalLayoutHistory';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function HistoryPage() {
  const router = useRouter();
  const { isAdmin, loading } = useUserRole();

  // Redirect non-admins to profile
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/profile');
    }
  }, [isAdmin, loading, router]);

  // Show loading state while checking role
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-phantom-background p-4 gap-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  // Don't render if not admin (redirect will happen)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <GlobalLayoutHistory />
    </div>
  );
}
