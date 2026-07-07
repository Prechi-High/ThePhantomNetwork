'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { GlobalLayoutVersionInfo } from '@/lib/types/layout';
import { formatDistanceToNow } from 'date-fns';

/**
 * VersionList Component
 * Renders a list of global layout versions with restore buttons
 */

interface VersionListProps {
  versions: GlobalLayoutVersionInfo[];
  loading: boolean;
  onRestore: (versionId: string) => void;
  isRestoring?: boolean;
}

export function VersionList({
  versions,
  loading,
  onRestore,
  isRestoring = false,
}: VersionListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-20" />
          </Card>
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-phantom-muted">No versions published yet</p>
        <p className="text-sm text-phantom-muted mt-2">
          Start editing and publishing layouts to build version history
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {versions.map((version) => (
        <Card
          key={version.id}
          className="p-4 hover:bg-phantom-surface/80 transition-all"
          hoverable
        >
          <div className="space-y-3">
            {/* Version Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">
                    {version.versionLabel}
                  </h3>
                  <span className="text-xs text-phantom-muted">
                    v{version.version}
                  </span>
                </div>

                <p className="text-sm text-phantom-muted mb-2">
                  Published {formatDistanceToNow(
                    new Date(version.publishedAt),
                    { addSuffix: true }
                  )}
                </p>

                <p className="text-sm text-phantom-muted">
                  by <span className="text-white font-semibold">
                    {version.publishedBy}
                  </span>
                </p>
              </div>

              {/* Restore Button */}
              <Button
                variant="purple"
                onClick={() => onRestore(version.id)}
                disabled={isRestoring}
                className="min-w-[100px] min-h-[44px] flex-shrink-0"
              >
                {isRestoring ? '⏳' : '↻'} Restore
              </Button>
            </div>

            {/* Change Notes */}
            {version.changeNotes && (
              <>
                <div className="h-px bg-phantom-border" />
                <div className="rounded-lg bg-phantom-background/50 p-3 border border-phantom-border/50">
                  <p className="text-xs text-phantom-muted uppercase font-bold mb-1">
                    Change Notes
                  </p>
                  <p className="text-sm text-phantom-muted">
                    {version.changeNotes}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
