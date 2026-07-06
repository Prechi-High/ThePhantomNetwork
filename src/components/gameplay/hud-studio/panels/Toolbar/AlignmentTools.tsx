/**
 * AlignmentTools - Alignment and distribution toolbar buttons
 * 
 * Provides quick access to alignment operations.
 */

'use client';

import { useCallback } from 'react';
import { useStudioStore } from '../../systems/state/store';
import { AlignmentEngine } from '../../systems/alignment/AlignmentEngine';
import { AlignmentCommand } from '../../systems/history/commands/AlignmentCommand';
import { commandHistory } from '../../systems/history/CommandHistory';
import type { AlignmentType, DistributionType, SizeMatchType } from '../../systems/alignment/types';
import styles from '../../styles/panels.module.css';

/**
 * AlignmentTools provides alignment, distribution, and size matching buttons.
 * 
 * Features:
 * - Align left/right/top/bottom/center
 * - Distribute horizontally/vertically
 * - Match width/height
 * - Disabled when < 2 components selected
 * - Creates undo/redo history
 */
export function AlignmentTools() {
  const selectedComponentId = useStudioStore(state => state.selectedComponentId);
  const components = useStudioStore(state => state.components);
  const updateComponent = useStudioStore(state => state.updateComponent);

  // Get selected components (for multi-select, we'll just use the selected one for now)
  // TODO: Implement multi-select support
  const selectedComponents = selectedComponentId 
    ? [components[selectedComponentId]].filter(Boolean)
    : [];

  const canAlign = selectedComponents.length >= 2;
  const canDistribute = selectedComponents.length >= 3;

  /**
   * Execute alignment operation
   */
  const executeAlignment = useCallback((alignType: AlignmentType) => {
    if (selectedComponents.length < 2) return;

    const result = AlignmentEngine.align(selectedComponents, alignType);

    if (result.results.length > 0) {
      const command = new AlignmentCommand(
        result.description,
        selectedComponents,
        result.results,
        (id, updates) => {
          useStudioStore.getState().updateComponent(id, updates);
        }
      );

      commandHistory.execute(command);
    }
  }, [selectedComponents]);

  /**
   * Execute distribution operation
   */
  const executeDistribution = useCallback((distributionType: DistributionType) => {
    if (selectedComponents.length < 3) return;

    const result = AlignmentEngine.distribute(selectedComponents, distributionType);

    if (result.results.length > 0) {
      const command = new AlignmentCommand(
        result.description,
        selectedComponents,
        result.results,
        (id, updates) => {
          useStudioStore.getState().updateComponent(id, updates);
        }
      );

      commandHistory.execute(command);
    }
  }, [selectedComponents]);

  /**
   * Execute size matching operation
   */
  const executeMatchSize = useCallback((matchType: SizeMatchType) => {
    if (selectedComponents.length < 2) return;

    const result = AlignmentEngine.matchSize(selectedComponents, matchType);

    if (result.results.length > 0) {
      const command = new AlignmentCommand(
        result.description,
        selectedComponents,
        result.results,
        (id, updates) => {
          useStudioStore.getState().updateComponent(id, updates);
        }
      );

      commandHistory.execute(command);
    }
  }, [selectedComponents]);

  return (
    <div className={styles.toolbarSection}>
      <div className={styles.toolbarDivider} />
      
      {/* Align Tools */}
      <button
        className={styles.toolbarButton}
        onClick={() => executeAlignment('left')}
        disabled={!canAlign}
        title="Align Left"
        aria-label="Align left"
      >
        ⫷
      </button>
      <button
        className={styles.toolbarButton}
        onClick={() => executeAlignment('center-horizontal')}
        disabled={!canAlign}
        title="Center Horizontally"
        aria-label="Center horizontally"
      >
        ⊟
      </button>
      <button
        className={styles.toolbarButton}
        onClick={() => executeAlignment('right')}
        disabled={!canAlign}
        title="Align Right"
        aria-label="Align right"
      >
        ⫸
      </button>

      <div className={styles.toolbarDivider} />

      <button
        className={styles.toolbarButton}
        onClick={() => executeAlignment('top')}
        disabled={!canAlign}
        title="Align Top"
        aria-label="Align top"
      >
        ⫴
      </button>
      <button
        className={styles.toolbarButton}
        onClick={() => executeAlignment('center-vertical')}
        disabled={!canAlign}
        title="Center Vertically"
        aria-label="Center vertically"
      >
        ⊞
      </button>
      <button
        className={styles.toolbarButton}
        onClick={() => executeAlignment('bottom')}
        disabled={!canAlign}
        title="Align Bottom"
        aria-label="Align bottom"
      >
        ⫵
      </button>

      <div className={styles.toolbarDivider} />

      {/* Distribute Tools */}
      <button
        className={styles.toolbarButton}
        onClick={() => executeDistribution('horizontal')}
        disabled={!canDistribute}
        title="Distribute Horizontally (3+ components)"
        aria-label="Distribute horizontally"
      >
        ⬌
      </button>
      <button
        className={styles.toolbarButton}
        onClick={() => executeDistribution('vertical')}
        disabled={!canDistribute}
        title="Distribute Vertically (3+ components)"
        aria-label="Distribute vertically"
      >
        ⬍
      </button>

      <div className={styles.toolbarDivider} />

      {/* Size Matching Tools */}
      <button
        className={styles.toolbarButton}
        onClick={() => executeMatchSize('width')}
        disabled={!canAlign}
        title="Match Width"
        aria-label="Match width"
      >
        ↔
      </button>
      <button
        className={styles.toolbarButton}
        onClick={() => executeMatchSize('height')}
        disabled={!canAlign}
        title="Match Height"
        aria-label="Match height"
      >
        ↕
      </button>
    </div>
  );
}
