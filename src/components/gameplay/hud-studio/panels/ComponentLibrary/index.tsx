/**
 * ComponentLibrary - Component library panel
 * 
 * Shows all registered components that can be added to the canvas.
 */

'use client';

import { useMemo } from 'react';
import { useStudioStore } from '../../systems/state/store';
import { componentRegistry } from '../../systems/registry/ComponentRegistry';
import { ComponentCard } from './ComponentCard';
import styles from '../../styles/panels.module.css';
import type { ComponentCategory } from '../../systems/registry/types';

/**
 * ComponentLibrary displays all registered components.
 * 
 * Features:
 * - Grouped by category
 * - Click to add to canvas
 * - Search/filter (TODO)
 * - Drag to add (TODO)
 */
export function ComponentLibrary() {
  const isVisible = useStudioStore(state => state.panels.library);
  const togglePanel = useStudioStore(state => state.togglePanel);

  // Get all components grouped by category
  const componentsByCategory = useMemo(() => {
    const allComponents = componentRegistry.getAll();
    const grouped: Partial<Record<ComponentCategory, typeof allComponents>> = {};

    allComponents.forEach((component) => {
      if (!grouped[component.category]) {
        grouped[component.category] = [];
      }
      grouped[component.category]!.push(component);
    });

    return grouped;
  }, []);

  if (!isVisible) return null;

  const categories = Object.keys(componentsByCategory) as ComponentCategory[];

  return (
    <div className={styles.panel} style={{ left: 20, bottom: 20, maxHeight: '400px' }}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Component Library</h3>
        <button
          className={styles.panelCloseButton}
          onClick={() => togglePanel('library')}
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <div className={styles.panelContent}>
        {categories.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No components registered</p>
            <p className={styles.infoText}>
              Register components using componentRegistry.register()
            </p>
          </div>
        ) : (
          <div className={styles.componentLibrary}>
            {categories.map((category) => {
              const components = componentsByCategory[category]!;
              return (
                <div key={category} className={styles.libraryCategory}>
                  <h4 className={styles.libraryCategoryTitle}>
                    {formatCategoryName(category)}
                  </h4>
                  <div className={styles.libraryComponentGrid}>
                    {components.map((component) => (
                      <ComponentCard
                        key={component.id}
                        metadata={component}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format category name for display
 */
function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
