'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UserProfile, UserRole } from '@/lib/types/layout';

/**
 * Custom hook for managing user role and permissions
 * Loads user profile and provides role-based access control properties
 */
export function useUserRole() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // If no user is authenticated, short-circuit
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Fetch user profile
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || 'Failed to load user profile'
          );
        }

        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load user profile';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Computed properties for permission checks
  const isAdmin =
    profile?.role === 'admin' || profile?.role === 'platform_designer';
  const canPublishGlobalLayout = isAdmin;
  const canViewHistory = isAdmin;
  const userRole: UserRole = profile?.role || 'player';

  return {
    profile,
    loading,
    error,
    isAdmin,
    canPublishGlobalLayout,
    canViewHistory,
    userRole,
  };
}
