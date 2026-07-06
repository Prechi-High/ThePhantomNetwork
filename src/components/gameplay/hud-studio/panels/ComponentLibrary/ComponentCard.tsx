/**
 * ComponentCard - Component card in library
 */

'use client';

import { useCallback } from 'react';
import { useStudioStore } from '../../systems/state/store';
import type { HUDComponentMetadata } from '../../systems/registry/types';
import styles from '../../styles/panels.module.css';

export interface ComponentCardProps {
  metadata: HUDComponentMetadata;
}

/**
 * ComponentCard represents a component in the library.
 * Click to add to canvas center.
 */
export function ComponentCard({ metadata }: ComponentCardProps) {
  const addComponent = useStudioStore(state => state.addComponent);
  const viewport = useStudioStore(state => state.viewport);

  const handleClick = useCallback(() => {
    // Generate unique instance ID
    const instanceId = `${metadata.id}-${Date.now()}`;

    // Add component to center of canvas with default size
    addComponent({
      id: instanceId,
      componentId: metadata.id,
      position: { x: 0.4, y: 0.4 }, // Near center
      size: { width: 0.3, height: 0.2 }, // Default size
      zIndex: 1,
      visible: true,
      locked: false,
      opacity: 1,
      props: { ...metadata.defaultProps },
      styleOverrides: {},
    });
  }, [metadata, addComponent]);

  return (
    <button
      className={styles.componentCard}
      onClick={handleClick}
      title={`Add ${metadata.displayName}`}
    >
      <div className={styles.componentCardIcon}>
        {metadata.icon || '📦'}
      </div>
      <div className={styles.componentCardName}>
        {metadata.displayName}
      </div>
    </button>
  );
}
