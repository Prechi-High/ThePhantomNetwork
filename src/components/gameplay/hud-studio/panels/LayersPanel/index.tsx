/**
 * LayersPanel - Layer management panel
 * 
 * Shows all components in z-index order with visibility/lock controls.
 */

'use client';

import { useMemo } from 'react';
import { useStudioStore } from '../../systems/state/store';
import { LayerItem } from './LayerItem';
import styles from '../../styles/panels.module.css';

/**
 * LayersPanel displays all components as layers with management controls.
 * 
 * Features:
 * - Z-index order display (top = highest)
 * - Visibility toggle
 * - Lock toggle
 * - Delete button
 * - Duplicate button
 * - Click to select
 * - Drag to reorder (TODO)
 */
export function LayersPanel() {
  const components = useStudioStore(state => state.components);
  const selectedId = useStudioStore(state => state.selectedComponentId);
  const isVisible = useStudioStore(state => state.panels.layers);
  const togglePanel = useStudioStore(state => state.togglePanel);

  // Sort components by z-index (highest first)
  const sortedComponents = useMemo(() => {
    return Object.values(components).sort((a, b) => b.zIndex - a.zIndex);
  }, [components]);

  if (!isVisible) return null;

  return (
    <div className={styles.panel} style={{ left: 20, top: 80 }}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Layers</h3>
        <button
          className={styles.panelCloseButton}
          onClick={() => togglePanel('layers')}
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <div className={styles.panelContent}>
        {sortedComponents.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No components yet</p>
          </div>
        ) : (
          <div className={styles.layerList}>
            {sortedComponents.map((component) => (
              <LayerItem
                key={component.id}
                instanceId={component.id}
                isSelected={selectedId === component.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
