'use client';

import { LayoutEditorShell } from '@/components/gameplay/LayoutEditorShell';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EditGlobalLayoutPage() {
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
        <Skeleton className="h-16" />
        <Skeleton className="flex-1" />
      </div>
    );
  }

  // Don't render if not admin (redirect will happen)
  if (!isAdmin) {
    return null;
  }

  return (
    <LayoutEditorShell
      layoutType="global"
      onSaved={() => {
        // Return to profile after successful publish
        router.push('/profile?tab=overview');
      }}
    />
  );
}
