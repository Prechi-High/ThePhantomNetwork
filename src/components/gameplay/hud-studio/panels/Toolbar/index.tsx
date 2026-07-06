/**
 * Toolbar - Main editor toolbar
 * 
 * Provides quick access to tools and controls.
 */

'use client';

import { useCallback } from 'react';
import { useStudioStore } from '../../systems/state/store';
import { commandHistory } from '../../systems/history/CommandHistory';
import { AlignmentTools } from './AlignmentTools';
import styles from '../../styles/panels.module.css';

/**
 * Toolbar provides quick access to editing tools.
 * 
 * Features:
 * - Undo/Redo buttons
 * - Panel toggles
 * - Snap toggle
 * - Grid toggle
 * - Viewport selector (TODO)
 */
export function Toolbar() {
  const isEditMode = useStudioStore(state => state.isEditMode);
  const panels = useStudioStore(state => state.panels);
  const togglePanel = useStudioStore(state => state.togglePanel);
  const editorSettings = useStudioStore(state => state.editorSettings);
  const updateSettings = useStudioStore(state => state.updateSettings);

  const handleUndo = useCallback(() => {
    commandHistory.undo();
  }, []);

  const handleRedo = useCallback(() => {
    commandHistory.redo();
  }, []);

  const handleToggleSnap = useCallback(() => {
    updateSettings({ snapEnabled: !editorSettings.snapEnabled });
  }, [editorSettings.snapEnabled, updateSettings]);

  const handleToggleGrid = useCallback(() => {
    updateSettings({ showGrid: !editorSettings.showGrid });
  }, [editorSettings.showGrid, updateSettings]);

  if (!isEditMode) return null;

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarSection}>
        <span className={styles.toolbarLabel}>HUD Studio</span>
      </div>

      <div className={styles.toolbarSection}>
        <button
          className={styles.toolbarButton}
          onClick={handleUndo}
          disabled={!commandHistory.canUndo()}
          title="Undo (Cmd+Z)"
          aria-label="Undo"
        >
          ↶
        </button>
        <button
          className={styles.toolbarButton}
          onClick={handleRedo}
          disabled={!commandHistory.canRedo()}
          title="Redo (Cmd+Shift+Z)"
          aria-label="Redo"
        >
          ↷
        </button>
      </div>

      {/* Alignment Tools */}
      <AlignmentTools />

      <div className={styles.toolbarSection}>
        <button
          className={`${styles.toolbarButton} ${editorSettings.snapEnabled ? styles.toolbarButtonActive : ''}`}
          onClick={handleToggleSnap}
          title="Toggle Snap (S)"
          aria-label="Toggle snapping"
        >
          🧲
        </button>
        <button
          className={`${styles.toolbarButton} ${editorSettings.showGrid ? styles.toolbarButtonActive : ''}`}
          onClick={handleToggleGrid}
          title="Toggle Grid (G)"
          aria-label="Toggle grid"
        >
          ⊞
        </button>
      </div>

      <div className={styles.toolbarSection}>
        <button
          className={`${styles.toolbarButton} ${panels.inspector ? styles.toolbarButtonActive : ''}`}
          onClick={() => togglePanel('inspector')}
          title="Toggle Properties Panel"
          aria-label="Toggle properties panel"
        >
          ⚙
        </button>
        <button
          className={`${styles.toolbarButton} ${panels.layers ? styles.toolbarButtonActive : ''}`}
          onClick={() => togglePanel('layers')}
          title="Toggle Layers Panel"
          aria-label="Toggle layers panel"
        >
          ☰
        </button>
        <button
          className={`${styles.toolbarButton} ${panels.library ? styles.toolbarButtonActive : ''}`}
          onClick={() => togglePanel('library')}
          title="Toggle Component Library"
          aria-label="Toggle component library"
        >
          📦
        </button>
      </div>

      <div className={styles.toolbarSection}>
        <select className={styles.toolbarSelect} title="Device Preset">
          <option>iPhone 16</option>
          <option>Pixel</option>
          <option>iPad</option>
        </select>
      </div>
    </div>
  );
}
