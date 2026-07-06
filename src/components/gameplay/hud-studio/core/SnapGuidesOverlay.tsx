/**
 * SnapGuidesOverlay - Global snap guides overlay
 * 
 * Renders snap guides at the canvas level.
 * Receives snap lines from the drag hook via Zustand store.
 */

'use client';

import { useStudioStore } from '../systems/state/store';
import { SnapGuides } from './SnapGuides';

/**
 * SnapGuidesOverlay component
 * 
 * Wraps SnapGuides and provides snap lines from the store.
 */
export function SnapGuidesOverlay() {
  const activeSnapLines = useStudioStore(state => state.activeSnapLines);

  return <SnapGuides snapLines={activeSnapLines || []} />;
}
