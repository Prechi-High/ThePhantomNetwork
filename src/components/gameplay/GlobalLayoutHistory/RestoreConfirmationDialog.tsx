'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import type { GlobalLayoutVersionInfo } from '@/lib/types/layout';

/**
 * RestoreConfirmationDialog Component
 * Modal for confirming the restoration of a previous global layout version
 */

interface RestoreConfirmationDialogProps {
  open: boolean;
  version: GlobalLayoutVersionInfo | null;
  onConfirm: (changeNotes: string) => Promise<void>;
  onCancel: () => void;
}

export function RestoreConfirmationDialog({
  open,
  version,
  onConfirm,
  onCancel,
}: RestoreConfirmationDialogProps) {
  const [changeNotes, setChangeNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(changeNotes);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to restore layout';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setChangeNotes('');
    setError(null);
    onCancel();
  };

  if (!version) return null;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent closeButton={!isLoading}>
        <DialogHeader>
          <DialogTitle>
            Restore {version.versionLabel} as Current?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription>
            The current version will be archived. You can restore it later if
            needed.
          </DialogDescription>

          <div className="p-4 bg-phantom-purple/10 border border-phantom-purple/20 rounded-lg">
            <p className="text-sm text-phantom-muted mb-2">
              <strong>Restoring:</strong> {version.versionLabel}
            </p>
            <p className="text-sm text-phantom-muted">
              <strong>Originally published:</strong> {version.publishedBy}
            </p>
            {version.changeNotes && (
              <p className="text-sm text-phantom-muted mt-2">
                <strong>Notes:</strong> {version.changeNotes}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="restoreNotes"
              className="block text-sm font-semibold mb-2 text-white"
            >
              Reason for Restore (optional)
            </label>
            <textarea
              id="restoreNotes"
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="e.g., 'Reverting due to user feedback'"
              className={`
                w-full p-3 rounded-lg text-sm text-white
                bg-phantom-surface border border-phantom-border
                placeholder-phantom-muted
                focus:outline-none focus:ring-2 focus:ring-phantom-purple
                resize-none
              `}
              rows={2}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-phantom-danger/20 border border-phantom-danger rounded text-phantom-danger text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            variant="purple"
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-h-[44px]"
          >
            {isLoading ? '⏳ Restoring...' : '↻ Restore Version'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
