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

/**
 * ResetConfirmationDialog Component
 * Modal for confirming the reset to default layout action
 */

interface ResetConfirmationDialogProps {
  open: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ResetConfirmationDialog({
  open,
  onConfirm,
  onCancel,
  isLoading = false,
}: ResetConfirmationDialogProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsResetting(true);
    setError(null);

    try {
      await onConfirm();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reset layout';
      setError(errorMessage);
      setIsResetting(false);
    }
  };

  const loading = isLoading || isResetting;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent closeButton={!loading}>
        <DialogHeader>
          <DialogTitle>Reset to Default Layout?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription>
            Your custom layout will be deleted. You will use the current global
            layout.
          </DialogDescription>

          <div className="p-4 bg-phantom-danger/10 border border-phantom-danger/20 rounded-lg">
            <p className="text-sm text-phantom-muted">
              ⚠️ This action cannot be undone. You can always create a new custom
              layout later.
            </p>
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
            onClick={onCancel}
            disabled={loading}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={loading}
            className="min-h-[44px]"
          >
            {loading ? 'Resetting...' : 'Reset Layout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
