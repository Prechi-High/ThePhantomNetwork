/**
 * StyleProperties - Style controls (Opacity, Blur, Border, Shadow, Scale)
 */

'use client';

import { useCallback } from 'react';
import { useStudioStore } from '../../../systems/state/store';
import { SliderInput } from '../inputs/SliderInput';
import { SelectInput, type SelectOption } from '../inputs/SelectInput';
import styles from '../../../styles/panels.module.css';

export interface StylePropertiesProps {
  instanceId: string;
}

const SHADOW_OPTIONS: SelectOption[] = [
  { label: 'None', value: 'none' },
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

/**
 * StyleProperties provides controls for visual styling.
 */
export function StyleProperties({ instanceId }: StylePropertiesProps) {
  const component = useStudioStore(state => state.components[instanceId]);
  const updateComponent = useStudioStore(state => state.updateComponent);

  const handleOpacityChange = useCallback((value: number) => {
    updateComponent(instanceId, { opacity: value });
  }, [instanceId, updateComponent]);

  const handleBlurChange = useCallback((value: number) => {
    if (!component) return;
    updateComponent(instanceId, {
      styleOverrides: { ...component.styleOverrides, blur: value },
    });
  }, [component, instanceId, updateComponent]);

  const handleBorderRadiusChange = useCallback((value: number) => {
    if (!component) return;
    updateComponent(instanceId, {
      styleOverrides: { ...component.styleOverrides, borderRadius: value },
    });
  }, [component, instanceId, updateComponent]);

  const handleScaleChange = useCallback((value: number) => {
    if (!component) return;
    updateComponent(instanceId, {
      styleOverrides: { ...component.styleOverrides, scale: value },
    });
  }, [component, instanceId, updateComponent]);

  const handleShadowChange = useCallback((value: string | number) => {
    if (!component) return;
    updateComponent(instanceId, {
      styleOverrides: { 
        ...component.styleOverrides, 
        shadow: value as 'none' | 'small' | 'medium' | 'large' 
      },
    });
  }, [component, instanceId, updateComponent]);

  if (!component) return null;

  return (
    <div className={styles.propertySection}>
      <SliderInput
        label="Opacity"
        value={component.opacity}
        onChange={handleOpacityChange}
        min={0}
        max={1}
        step={0.01}
        disabled={component.locked}
      />

      <SliderInput
        label="Blur"
        value={component.styleOverrides.blur || 0}
        onChange={handleBlurChange}
        min={0}
        max={50}
        step={1}
        suffix="px"
        disabled={component.locked}
      />

      <SliderInput
        label="Border Radius"
        value={component.styleOverrides.borderRadius || 0}
        onChange={handleBorderRadiusChange}
        min={0}
        max={50}
        step={1}
        suffix="px"
        disabled={component.locked}
      />

      <SliderInput
        label="Scale"
        value={component.styleOverrides.scale || 1}
        onChange={handleScaleChange}
        min={0.5}
        max={2}
        step={0.1}
        suffix="x"
        disabled={component.locked}
      />

      <SelectInput
        label="Shadow"
        value={component.styleOverrides.shadow || 'none'}
        onChange={handleShadowChange}
        options={SHADOW_OPTIONS}
        disabled={component.locked}
      />
    </div>
  );
}
