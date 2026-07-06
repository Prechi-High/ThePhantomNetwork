/**
 * SizeProperties - Size controls (Width, Height)
 */

'use client';

import { useCallback } from 'react';
import { useStudioStore } from '../../../systems/state/store';
import { NumberInput } from '../inputs/NumberInput';
import { normalizedToPixels } from '../../../systems/layout/normalizer';
import styles from '../../../styles/panels.module.css';

export interface SizePropertiesProps {
  instanceId: string;
}

/**
 * SizeProperties provides controls for component size.
 */
export function SizeProperties({ instanceId }: SizePropertiesProps) {
  const component = useStudioStore(state => state.components[instanceId]);
  const updateComponent = useStudioStore(state => state.updateComponent);
  const viewport = useStudioStore(state => state.viewport);

  const handleWidthChange = useCallback((value: number) => {
    if (!component) return;
    const normalized = value / viewport.width;
    updateComponent(instanceId, {
      size: { ...component.size, width: Math.max(0.05, Math.min(1, normalized)) },
    });
  }, [component, instanceId, viewport.width, updateComponent]);

  const handleHeightChange = useCallback((value: number) => {
    if (!component) return;
    const normalized = value / viewport.height;
    updateComponent(instanceId, {
      size: { ...component.size, height: Math.max(0.05, Math.min(1, normalized)) },
    });
  }, [component, instanceId, viewport.height, updateComponent]);

  if (!component) return null;

  const pixelSize = normalizedToPixels(
    { x: 0, y: 0, width: component.size.width, height: component.size.height },
    { width: viewport.width, height: viewport.height }
  );

  return (
    <div className={styles.propertySection}>
      <NumberInput
        label="Width"
        value={Math.round(pixelSize.width)}
        onChange={handleWidthChange}
        min={Math.round(viewport.width * 0.05)}
        max={viewport.width}
        step={1}
        suffix="px"
        disabled={component.locked}
      />
      <NumberInput
        label="Height"
        value={Math.round(pixelSize.height)}
        onChange={handleHeightChange}
        min={Math.round(viewport.height * 0.05)}
        max={viewport.height}
        step={1}
        suffix="px"
        disabled={component.locked}
      />
    </div>
  );
}
