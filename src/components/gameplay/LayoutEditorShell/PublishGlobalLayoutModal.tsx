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
 * PublishGlobalLayoutModal Component
 * Confirmation dialog for publishing a global layout (admin only)
 */

interface PublishGlobalLayoutModalProps {
  open: boolean;
  onConfirm: (changeNotes: string) => Promise<void>;
  onCancel: () => void;
}

export function PublishGlobalLayoutModal({
  open,
  onConfirm,
  onCancel,
}: PublishGlobalLayoutModalProps) {
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
        err instanceof Error ? err.message : 'Failed to publish layout';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent closeButton={!isLoading}>
        <DialogHeader>
          <DialogTitle>Publish as Global Layout?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription>
            This layout will become the default for all players without custom
            layouts.
          </DialogDescription>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400 font-semibold">
              ⚠️ This will affect all players on the platform
            </p>
            <p className="text-sm text-yellow-300 mt-2">
              The previous version will be archived and can be restored later.
            </p>
          </div>

          <div>
            <label
              htmlFor="changeNotes"
              className="block text-sm font-semibold mb-2 text-white"
            >
              Change Notes (optional)
            </label>
            <textarea
              id="changeNotes"
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="e.g., 'Improved button visibility, moved controls for better accessibility'"
              className={`
                w-full p-3 rounded-lg text-sm text-white
                bg-phantom-surface border border-phantom-border
                placeholder-phantom-muted
                focus:outline-none focus:ring-2 focus:ring-phantom-purple
                resize-none
              `}
              rows={3}
              disabled={isLoading}
            />
            <p className="text-xs text-phantom-muted mt-1">
              {changeNotes.length} / 500 characters
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
            {isLoading ? '⏳ Publishing...' : '🌍 Publish Layout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
