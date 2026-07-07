'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * EditorHeader Component
 * Header bar for the layout editor with back button, title, and save button
 */

interface EditorHeaderProps {
  title: string;
  onSave: () => void;
  isSaving: boolean;
}

export function EditorHeader({ title, onSave, isSaving }: EditorHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-4 p-4 border-b border-phantom-border bg-phantom-surface/95 backdrop-blur">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        disabled={isSaving}
        className={cn(
          'p-2 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center',
          'hover:bg-phantom-surface/80 disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6 text-phantom-purple" />
      </button>

      {/* Title */}
      <h1 className="text-lg font-bold text-center flex-1 truncate text-white">
        {title}
      </h1>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className={cn(
          'px-6 py-2 rounded-lg font-semibold transition-all flex-shrink-0 min-h-[44px]',
          'bg-phantom-purple text-white hover:bg-phantom-purple/90',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-95'
        )}
      >
        {isSaving ? '⏳' : '💾'} {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
