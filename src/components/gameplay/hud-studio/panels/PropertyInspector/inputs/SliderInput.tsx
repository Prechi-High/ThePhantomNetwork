/**
 * SliderInput - Range slider with value display
 */

'use client';

import { useCallback } from 'react';
import styles from '../../../styles/panels.module.css';

export interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
}

/**
 * SliderInput provides a range slider with live value display.
 */
export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = '',
  disabled = false,
}: SliderInputProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  }, [onChange]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.inputGroup}>
      <div className={styles.sliderHeader}>
        <label className={styles.inputLabel}>{label}</label>
        <span className={styles.sliderValue}>
          {step < 1 ? value.toFixed(2) : Math.round(value)}{suffix}
        </span>
      </div>
      <div className={styles.sliderContainer}>
        <input
          type="range"
          className={styles.slider}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          style={{
            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${percentage}%, #374151 ${percentage}%, #374151 100%)`,
          }}
        />
      </div>
    </div>
  );
}
