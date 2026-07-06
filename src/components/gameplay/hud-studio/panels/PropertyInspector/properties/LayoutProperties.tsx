/**
 * LayoutProperties - Layout controls (Z-index, Lock, Visibility)
 */

'use client';

import { useCallback } from 'react';
import { useStudioStore } from '../../../systems/state/store';
import { NumberInput } from '../inputs/NumberInput';
import { ToggleInput } from '../inputs/ToggleInput';
import styles from '../../../styles/panels.module.css';

export interface LayoutPropertiesProps {
  instanceId: string;
}

/**
 * LayoutProperties provides controls for layout-related properties.
 */
export function LayoutProperties({ instanceId }: LayoutPropertiesProps) {
  const component = useStudioStore(state => state.components[instanceId]);
  const updateComponent = useStudioStore(state => state.updateComponent);

  const handleZIndexChange = useCallback((value: number) => {
    updateComponent(instanceId, { zIndex: Math.round(value) });
  }, [instanceId, updateComponent]);

  const handleLockedChange = useCallback((value: boolean) => {
    updateComponent(instanceId, { locked: value });
  }, [instanceId, updateComponent]);

  const handleVisibleChange = useCallback((value: boolean) => {
    updateComponent(instanceId, { visible: value });
  }, [instanceId, updateComponent]);

  if (!component) return null;

  return (
    <div className={styles.propertySection}>
      <NumberInput
        label="Z-Index"
        value={component.zIndex}
        onChange={handleZIndexChange}
        min={0}
        max={100}
        step={1}
      />

      <ToggleInput
        label="Visible"
        value={component.visible}
        onChange={handleVisibleChange}
      />

      <ToggleInput
        label="Locked"
        value={component.locked}
        onChange={handleLockedChange}
      />
    </div>
  );
}
