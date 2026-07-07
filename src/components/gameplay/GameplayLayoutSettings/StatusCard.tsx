'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { LayoutStatus } from '@/lib/types/layout';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * StatusCard Component
 * Displays current layout information including source, version, and last updated time
 */

interface StatusCardProps {
  status: LayoutStatus | null;
  loading: boolean;
  error?: string | null;
}

export function StatusCard({ status, loading, error }: StatusCardProps) {
  if (loading) {
    return <SkeletonCard />;
  }

  if (error || !status) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-sm text-phantom-danger font-semibold mb-2">
            {error || 'Failed to load layout status'}
          </p>
          <p className="text-xs text-phantom-muted">Please try again</p>
        </div>
      </Card>
    );
  }

  const sourceLabel =
    status.source === 'private'
      ? 'Private Layout'
      : status.source === 'global'
        ? 'Global Layout'
        : 'System Default';

  const sourceEmoji =
    status.source === 'private'
      ? '🔒'
      : status.source === 'global'
        ? '🌍'
        : '⚙️';

  const badgeVariant =
    status.source === 'private'
      ? 'purple'
      : status.source === 'global'
        ? 'success'
        : 'muted';

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{sourceEmoji}</span>
          <span className="text-sm text-phantom-muted uppercase font-bold tracking-wider">
            Current Active Layout
          </span>
        </div>
        <Badge variant={badgeVariant} className="text-xs">
          {sourceLabel}
        </Badge>
      </div>

      <div className="h-px bg-gradient-to-r from-phantom-border via-phantom-border to-transparent" />

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-phantom-muted">Source:</span>
          <span className="font-semibold text-white">{sourceLabel}</span>
        </div>

        {status.metadata.version && (
          <div className="flex justify-between items-center">
            <span className="text-phantom-muted">Version:</span>
            <span className="font-semibold text-white">
              {status.metadata.versionLabel || `v${status.metadata.version}`}
            </span>
          </div>
        )}

        {status.metadata.publishedBy && (
          <div className="flex justify-between items-center">
            <span className="text-phantom-muted">Published by:</span>
            <span className="font-semibold text-white">
              {status.metadata.publishedBy}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-phantom-muted">Last Updated:</span>
          <span className="font-semibold text-white">
            {formatDistanceToNow(new Date(status.metadata.lastUpdated), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </Card>
  );
}

/**
 * SkeletonCard Component
 * Loading skeleton for StatusCard
 */
function SkeletonCard() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="h-px bg-gradient-to-r from-phantom-border via-phantom-border to-transparent" />

      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    </Card>
  );
}
