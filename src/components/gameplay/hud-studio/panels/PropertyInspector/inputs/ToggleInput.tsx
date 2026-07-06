/**
 * ToggleInput - Boolean toggle switch
 */

'use client';

import { useCallback } from 'react';
import styles from '../../../styles/panels.module.css';

export interface ToggleInputProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

/**
 * ToggleInput provides a toggle switch for boolean values.
 */
export function ToggleInput({
  label,
  value,
  onChange,
  disabled = false,
}: ToggleInputProps) {
  const handleChange = useCallback(() => {
    onChange(!value);
  }, [value, onChange]);

  return (
    <div className={styles.inputGroup}>
      <label className={styles.inputLabel}>{label}</label>
      <button
        className={`${styles.toggle} ${value ? styles.toggleOn : styles.toggleOff}`}
        onClick={handleChange}
        disabled={disabled}
        role="switch"
        aria-checked={value}
        aria-label={label}
      >
        <span className={styles.toggleSlider} />
      </button>
    </div>
  );
}
