/**
 * NumberInput - Number input with +/- buttons
 */

'use client';

import { useCallback } from 'react';
import styles from '../../../styles/panels.module.css';

export interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
}

/**
 * NumberInput provides a number input with increment/decrement buttons.
 */
export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  disabled = false,
}: NumberInputProps) {
  const handleIncrement = useCallback(() => {
    const newValue = value + step;
    if (max !== undefined && newValue > max) return;
    onChange(newValue);
  }, [value, step, max, onChange]);

  const handleDecrement = useCallback(() => {
    const newValue = value - step;
    if (min !== undefined && newValue < min) return;
    onChange(newValue);
  }, [value, step, min, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (isNaN(newValue)) return;
    
    let clampedValue = newValue;
    if (min !== undefined) clampedValue = Math.max(min, clampedValue);
    if (max !== undefined) clampedValue = Math.min(max, clampedValue);
    
    onChange(clampedValue);
  }, [min, max, onChange]);

  return (
    <div className={styles.inputGroup}>
      <label className={styles.inputLabel}>{label}</label>
      <div className={styles.numberInputContainer}>
        <button
          className={styles.numberButton}
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && value <= min)}
          aria-label="Decrement"
        >
          −
        </button>
        <input
          type="number"
          className={styles.numberInput}
          value={value.toFixed(step < 1 ? 2 : 0)}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />
        {suffix && <span className={styles.inputSuffix}>{suffix}</span>}
        <button
          className={styles.numberButton}
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          aria-label="Increment"
        >
          +
        </button>
      </div>
    </div>
  );
}
