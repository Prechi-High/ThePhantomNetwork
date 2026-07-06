/**
 * PositionProperties - Position controls (X, Y)
 */

'use client';

import { useCallback } from 'react';
import { useStudioStore } from '../../../systems/state/store';
import { NumberInput } from '../inputs/NumberInput';
import { normalizedToPixels } from '../../../systems/layout/normalizer';
import styles from '../../../styles/panels.module.css';

export interface PositionPropertiesProps {
  instanceId: string;
}

/**
 * PositionProperties provides controls for component position.
 */
export function PositionProperties({ instanceId }: PositionPropertiesProps) {
  const component = useStudioStore(state => state.components[instanceId]);
  const updateComponent = useStudioStore(state => state.updateComponent);
  const viewport = useStudioStore(state => state.viewport);

  const handleXChange = useCallback((value: number) => {
    if (!component) return;
    const normalized = value / viewport.width;
    updateComponent(instanceId, {
      position: { ...component.position, x: Math.max(0, Math.min(1, normalized)) },
    });
  }, [component, instanceId, viewport.width, updateComponent]);

  const handleYChange = useCallback((value: number) => {
    if (!component) return;
    const normalized = value / viewport.height;
    updateComponent(instanceId, {
      position: { ...component.position, y: Math.max(0, Math.min(1, normalized)) },
    });
  }, [component, instanceId, viewport.height, updateComponent]);

  if (!component) return null;

  const pixelPos = normalizedToPixels(
    { x: component.position.x, y: component.position.y, width: 0, height: 0 },
    { width: viewport.width, height: viewport.height }
  );

  return (
    <div className={styles.propertySection}>
      <NumberInput
        label="X"
        value={Math.round(pixelPos.x)}
        onChange={handleXChange}
        min={0}
        max={viewport.width}
        step={1}
        suffix="px"
        disabled={component.locked}
      />
      <NumberInput
        label="Y"
        value={Math.round(pixelPos.y)}
        onChange={handleYChange}
        min={0}
        max={viewport.height}
        step={1}
        suffix="px"
        disabled={component.locked}
      />
    </div>
  );
}
