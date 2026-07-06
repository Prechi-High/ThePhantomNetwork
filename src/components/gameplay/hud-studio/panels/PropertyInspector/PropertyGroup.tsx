/**
 * PropertyGroup - Collapsible property section
 */

'use client';

import { useState, type ReactNode } from 'react';
import styles from '../../styles/panels.module.css';

export interface PropertyGroupProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/**
 * PropertyGroup provides a collapsible section for grouping related properties.
 */
export function PropertyGroup({ title, children, defaultOpen = true }: PropertyGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.propertyGroup}>
      <button
        className={styles.propertyGroupHeader}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.propertyGroupIcon}>
          {isOpen ? '▼' : '▶'}
        </span>
        <span className={styles.propertyGroupTitle}>{title}</span>
      </button>
      {isOpen && (
        <div className={styles.propertyGroupContent}>
          {children}
        </div>
      )}
    </div>
  );
}
