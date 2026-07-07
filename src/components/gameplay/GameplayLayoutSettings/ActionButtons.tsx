'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * ActionButtons Component
 * Displays role-based action buttons for layout management
 */

interface ActionButtonsProps {
  isAdmin: boolean;
  onResetClick: () => void;
  isLoading?: boolean;
}

export function ActionButtons({
  isAdmin,
  onResetClick,
  isLoading = false,
}: ActionButtonsProps) {
  return (
    <div className="space-y-3">
      {/* Edit Private Layout Button */}
      <Link href="/profile/gameplay-layout/edit" className="block">
        <Button
          className="w-full min-h-[48px]"
          variant="purple"
          size="lg"
          disabled={isLoading}
        >
          ✏️ Edit Gameplay Layout
        </Button>
      </Link>

      {/* Edit Global Layout Button (Admin Only) */}
      {isAdmin && (
        <Link href="/profile/gameplay-layout/edit-global" className="block">
          <Button
            className="w-full min-h-[48px]"
            variant="secondary"
            size="lg"
            disabled={isLoading}
          >
            🌍 Edit Global Layout
          </Button>
        </Link>
      )}

      {/* Reset to Default Button */}
      <Button
        className="w-full min-h-[48px]"
        variant="danger"
        size="lg"
        onClick={onResetClick}
        disabled={isLoading}
      >
        ↻ Reset to Default
      </Button>

      {/* View Version History Button (Admin Only) */}
      {isAdmin && (
        <Link href="/profile/gameplay-layout/history" className="block">
          <Button
            className="w-full min-h-[48px]"
            variant="ghost"
            size="lg"
            disabled={isLoading}
          >
            📋 View Version History
          </Button>
        </Link>
      )}
    </div>
  );
}
