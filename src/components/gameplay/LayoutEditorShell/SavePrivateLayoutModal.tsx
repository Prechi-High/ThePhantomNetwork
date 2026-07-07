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
 * SavePrivateLayoutModal Component
 * Confirmation dialog for saving a private layout
 */

interface SavePrivateLayoutModalProps {
  open: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function SavePrivateLayoutModal({
  open,
  onConfirm,
  onCancel,
}: SavePrivateLayoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save layout';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent closeButton={!isLoading}>
        <DialogHeader>
          <DialogTitle>Save Gameplay Layout?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription>
            This layout will be saved to your account and used only in your
            gameplay. Other players will not be affected.
          </DialogDescription>

          <div className="p-4 bg-phantom-purple/10 border border-phantom-purple/20 rounded-lg">
            <p className="text-sm text-phantom-muted">
              ✓ Your changes will be saved to your device
            </p>
            <p className="text-sm text-phantom-muted mt-2">
              ✓ You can edit this layout anytime
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
            {isLoading ? '⏳ Saving...' : '💾 Save Layout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
