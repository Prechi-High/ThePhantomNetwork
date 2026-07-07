'use client';

import { useEffect, useState } from 'react';
import { useLayoutEditor } from '@/lib/hooks/useLayoutEditor';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { useNotifications } from '@/components/ui/NotificationProvider';
import { StatusCard } from './StatusCard';
import { ActionButtons } from './ActionButtons';
import { ResetConfirmationDialog } from './ResetConfirmationDialog';
import type { LayoutStatus } from '@/lib/types/layout';

/**
 * GameplayLayoutSettings Component
 * Main component for managing layout access control settings
 * Displays layout status and role-based action buttons
 */
export function GameplayLayoutSettings() {
  const [status, setStatus] = useState<LayoutStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const { notify } = useNotifications();
  const { isAdmin } = useUserRole();

  /**
   * Load the current layout status on mount
   */
  useEffect(() => {
    loadLayoutStatus();
  }, []);

  /**
   * Fetch the current layout status from the API
   */
  async function loadLayoutStatus() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/layouts/active', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Failed to load layout status'
        );
      }

      const data: LayoutStatus = await response.json();
      setStatus(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load layout status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle reset to default layout
   */
  async function handleReset() {
    try {
      const response = await fetch('/api/layouts/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Failed to reset layout'
        );
      }

      setShowResetDialog(false);
      notify('Layout reset to default', 'success');

      // Reload layout status
      await loadLayoutStatus();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reset layout';
      notify(errorMessage, 'error');
      throw err;
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🎮</span>
        <div>
          <h2 className="text-2xl font-bold">Gameplay Layout</h2>
          <p className="text-sm text-phantom-muted">Customize your HUD</p>
        </div>
      </div>

      {/* Status Card */}
      <StatusCard status={status} loading={loading} error={error} />

      {/* Action Buttons */}
      <ActionButtons
        isAdmin={isAdmin}
        onResetClick={() => setShowResetDialog(true)}
        isLoading={loading}
      />

      {/* Reset Confirmation Dialog */}
      <ResetConfirmationDialog
        open={showResetDialog}
        onConfirm={handleReset}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
}
