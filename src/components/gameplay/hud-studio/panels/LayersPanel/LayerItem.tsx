/**
 * LayerItem - Single layer in the layers panel
 */

'use client';

import { useCallback } from 'react';
import { useStudioStore } from '../../systems/state/store';
import { componentRegistry } from '../../systems/registry/ComponentRegistry';
import styles from '../../styles/panels.module.css';

export interface LayerItemProps {
  instanceId: string;
  isSelected: boolean;
}

/**
 * LayerItem represents a single component in the layers list.
 */
export function LayerItem({ instanceId, isSelected }: LayerItemProps) {
  const component = useStudioStore(state => state.components[instanceId]);
  const selectComponent = useStudioStore(state => state.selectComponent);
  const updateComponent = useStudioStore(state => state.updateComponent);
  const removeComponent = useStudioStore(state => state.removeComponent);
  const duplicateComponent = useStudioStore(state => state.duplicateComponent);

  const handleClick = useCallback(() => {
    selectComponent(instanceId);
  }, [instanceId, selectComponent]);

  const handleToggleVisible = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateComponent(instanceId, { visible: !component?.visible });
  }, [instanceId, component, updateComponent]);

  const handleToggleLock = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateComponent(instanceId, { locked: !component?.locked });
  }, [instanceId, component, updateComponent]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateComponent(instanceId);
  }, [instanceId, duplicateComponent]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this component?')) {
      removeComponent(instanceId);
    }
  }, [instanceId, removeComponent]);

  if (!component) return null;

  const metadata = componentRegistry.get(component.componentId);
  const displayName = metadata?.displayName || component.componentId;

  return (
    <div
      className={`${styles.layerItem} ${isSelected ? styles.layerItemSelected : ''}`}
      onClick={handleClick}
    >
      <div className={styles.layerItemContent}>
        <span className={styles.layerItemName}>{displayName}</span>
        <span className={styles.layerItemZIndex}>z:{component.zIndex}</span>
      </div>

      <div className={styles.layerItemActions}>
        <button
          className={`${styles.layerActionButton} ${!component.visible ? styles.layerActionInactive : ''}`}
          onClick={handleToggleVisible}
          title={component.visible ? 'Hide' : 'Show'}
          aria-label={component.visible ? 'Hide component' : 'Show component'}
        >
          {component.visible ? '👁' : '👁‍🗨'}
        </button>

        <button
          className={`${styles.layerActionButton} ${component.locked ? styles.layerActionActive : ''}`}
          onClick={handleToggleLock}
          title={component.locked ? 'Unlock' : 'Lock'}
          aria-label={component.locked ? 'Unlock component' : 'Lock component'}
        >
          {component.locked ? '🔒' : '🔓'}
        </button>

        <button
          className={styles.layerActionButton}
          onClick={handleDuplicate}
          title="Duplicate"
          aria-label="Duplicate component"
        >
          📋
        </button>

        <button
          className={`${styles.layerActionButton} ${styles.layerActionDanger}`}
          onClick={handleDelete}
          title="Delete"
          aria-label="Delete component"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
