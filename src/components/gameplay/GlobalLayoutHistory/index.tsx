'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useNotifications } from '@/components/ui/NotificationProvider';
import { VersionList } from './VersionList';
import { RestoreConfirmationDialog } from './RestoreConfirmationDialog';
import type {
  GlobalLayoutVersionInfo,
  GetGlobalHistoryResponse,
} from '@/lib/types/layout';

/**
 * GlobalLayoutHistory Component
 * Admin-only view for managing global layout version history
 * Allows viewing, previewing, and restoring previous versions
 */
export function GlobalLayoutHistory() {
  const router = useRouter();
  const { notify } = useNotifications();

  const [versions, setVersions] = useState<GlobalLayoutVersionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] =
    useState<GlobalLayoutVersionInfo | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  /**
   * Load version history on mount
   */
  useEffect(() => {
    loadVersions();
  }, []);

  /**
   * Fetch the global layout version history from the API
   */
  async function loadVersions() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/layouts/global/history', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to view layout history');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Failed to load version history'
        );
      }

      const data: GetGlobalHistoryResponse = await response.json();
      setVersions(data.versions || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load version history';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle restore version confirmation
   */
  async function handleRestore(changeNotes: string) {
    if (!selectedVersion) return;

    try {
      setIsRestoring(true);

      const response = await fetch('/api/layouts/global/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          versionId: selectedVersion.id,
          changeNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Failed to restore layout'
        );
      }

      const result = await response.json();

      notify(
        `Layout restored as v${result.newVersion}`,
        'success'
      );

      setShowRestoreDialog(false);
      setSelectedVersion(null);

      // Reload versions
      await loadVersions();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to restore layout';
      notify(errorMessage, 'danger');
    } finally {
      setIsRestoring(false);
    }
  }

  const handleOpenRestore = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (version) {
      setSelectedVersion(version);
      setShowRestoreDialog(true);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-phantom-surface rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-phantom-purple" />
        </button>
        <div>
          <h2 className="text-2xl font-bold">Version History</h2>
          <p className="text-sm text-phantom-muted">
            Manage global layout versions
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-phantom-danger/20 border border-phantom-danger rounded-lg">
          <p className="text-phantom-danger font-semibold">{error}</p>
          <button
            onClick={loadVersions}
            className="mt-3 px-4 py-2 bg-phantom-purple text-white rounded-lg hover:bg-phantom-purple/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Version List */}
      {!error && (
        <VersionList
          versions={versions}
          loading={loading}
          onRestore={handleOpenRestore}
          isRestoring={isRestoring}
        />
      )}

      {/* Restore Confirmation Dialog */}
      {selectedVersion && (
        <RestoreConfirmationDialog
          open={showRestoreDialog}
          version={selectedVersion}
          onConfirm={handleRestore}
          onCancel={() => {
            setShowRestoreDialog(false);
            setSelectedVersion(null);
          }}
        />
      )}
    </div>
  );
}
