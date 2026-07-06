/**
 * SelectInput - Dropdown select
 */

'use client';

import { useCallback } from 'react';
import styles from '../../../styles/panels.module.css';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectInputProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  disabled?: boolean;
}

/**
 * SelectInput provides a dropdown select for choosing from multiple options.
 */
export function SelectInput({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: SelectInputProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = options.find(opt => opt.value.toString() === e.target.value);
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  }, [options, onChange]);

  return (
    <div className={styles.inputGroup}>
      <label className={styles.inputLabel}>{label}</label>
      <select
        className={styles.select}
        value={value}
        onChange={handleChange}
        disabled={disabled}
      >
        {options.map((option) => (
          <option
            key={option.value.toString()}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
