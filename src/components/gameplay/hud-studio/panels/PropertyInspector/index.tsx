/**
 * PropertyInspector - Main property editing panel
 * 
 * Shows editable properties for the selected component.
 */

'use client';

import { useEffect } from 'react';
import { useStudioStore } from '../../systems/state/store';
import { componentRegistry } from '../../systems/registry/ComponentRegistry';
import { PropertyGroup } from './PropertyGroup';
import { PositionProperties } from './properties/PositionProperties';
import { SizeProperties } from './properties/SizeProperties';
import { StyleProperties } from './properties/StyleProperties';
import { LayoutProperties } from './properties/LayoutProperties';
import styles from '../../styles/panels.module.css';

/**
 * PropertyInspector shows all editable properties for the selected component.
 * 
 * Features:
 * - Position controls (X, Y)
 * - Size controls (Width, Height)
 * - Style controls (Opacity, Blur, Border, Shadow)
 * - Layout controls (Z-index, Lock, Visibility)
 * - Collapsible property groups
 * - Real-time updates
 * - Reset to defaults
 */
export function PropertyInspector() {
  const selectedId = useStudioStore(state => state.selectedComponentId);
  const component = useStudioStore(state => 
    selectedId ? state.components[selectedId] : null
  );
  const isVisible = useStudioStore(state => state.panels.inspector);
  const togglePanel = useStudioStore(state => state.togglePanel);

  // Get component metadata from registry
  const metadata = component 
    ? componentRegistry.get(component.componentId)
    : null;

  if (!isVisible) return null;

  if (!component || !selectedId) {
    return (
      <div className={styles.panel} style={{ right: 20, top: 80 }}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Properties</h3>
          <button
            className={styles.panelCloseButton}
            onClick={() => togglePanel('inspector')}
            aria-label="Close panel"
          >
            ×
          </button>
        </div>
        <div className={styles.panelContent}>
          <div className={styles.emptyState}>
            <p>Select a component to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = metadata?.displayName || component.componentId;

  return (
    <div className={styles.panel} style={{ right: 20, top: 80 }}>
      <div className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelTitle}>Properties</h3>
          <p className={styles.panelSubtitle}>{displayName}</p>
        </div>
        <button
          className={styles.panelCloseButton}
          onClick={() => togglePanel('inspector')}
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <div className={styles.panelContent}>
        {/* Layout Properties */}
        <PropertyGroup title="Layout" defaultOpen>
          <LayoutProperties instanceId={selectedId} />
        </PropertyGroup>

        {/* Position Properties */}
        <PropertyGroup title="Position" defaultOpen>
          <PositionProperties instanceId={selectedId} />
        </PropertyGroup>

        {/* Size Properties */}
        <PropertyGroup title="Size" defaultOpen>
          <SizeProperties instanceId={selectedId} />
        </PropertyGroup>

        {/* Style Properties */}
        <PropertyGroup title="Style" defaultOpen={false}>
          <StyleProperties instanceId={selectedId} />
        </PropertyGroup>

        {/* Component-specific properties */}
        {metadata?.editableProps && metadata.editableProps.length > 0 && (
          <PropertyGroup title="Component Properties" defaultOpen={false}>
            <div className={styles.propertyRow}>
              <p className={styles.infoText}>
                Component-specific properties will be available in a future update.
              </p>
            </div>
          </PropertyGroup>
        )}
      </div>
    </div>
  );
}
