/**
 * SnapGuides - Visual snap guide overlays
 * 
 * Renders snap lines and grid during dragging.
 */

'use client';

import { useStudioStore } from '../systems/state/store';
import { GridSnap } from '../systems/snap/GridSnap';
import styles from '../styles/overlays.module.css';
import type { SnapLine } from '../systems/snap/types';

interface SnapGuidesProps {
  snapLines: SnapLine[];
}

/**
 * SnapGuides component renders visual snap feedback
 * 
 * Features:
 * - Grid overlay (configurable size)
 * - Center guides (canvas center)
 * - Snap lines (edge/component snapping)
 * - Color-coded by snap type
 */
export function SnapGuides({ snapLines }: SnapGuidesProps) {
  const viewport = useStudioStore(state => state.viewport);
  const editorSettings = useStudioStore(state => state.editorSettings);

  // Calculate grid lines if grid is shown
  const gridLines = editorSettings.showGrid
    ? GridSnap.getGridLines(
        editorSettings.gridSize,
        viewport.width,
        viewport.height
      )
    : null;

  return (
    <div className={styles.snapGuidesContainer}>
      {/* Grid lines */}
      {gridLines && (
        <>
          {gridLines.x.map((x, i) => (
            <div
              key={`grid-x-${i}`}
              className={styles.gridLine}
              style={{
                left: `${x * 100}%`,
                top: 0,
                width: '1px',
                height: '100%',
                backgroundColor: '#00ff0020',
              }}
            />
          ))}
          {gridLines.y.map((y, i) => (
            <div
              key={`grid-y-${i}`}
              className={styles.gridLine}
              style={{
                top: `${y * 100}%`,
                left: 0,
                width: '100%',
                height: '1px',
                backgroundColor: '#00ff0020',
              }}
            />
          ))}
        </>
      )}

      {/* Center guides */}
      {editorSettings.showSafeAreas && (
        <>
          <div
            className={styles.centerGuide}
            style={{
              left: '50%',
              top: 0,
              width: '1px',
              height: '100%',
              backgroundColor: '#ff00ff40',
            }}
          />
          <div
            className={styles.centerGuide}
            style={{
              top: '50%',
              left: 0,
              width: '100%',
              height: '1px',
              backgroundColor: '#ff00ff40',
            }}
          />
        </>
      )}

      {/* Active snap lines (during drag) */}
      {snapLines.map((line, i) => (
        <div
          key={`snap-${line.type}-${i}`}
          className={styles.snapLine}
          style={
            line.type === 'vertical'
              ? {
                  left: `${line.position * 100}%`,
                  top: 0,
                  width: '2px',
                  height: '100%',
                  backgroundColor: line.color,
                  boxShadow: `0 0 4px ${line.color}`,
                }
              : {
                  top: `${line.position * 100}%`,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  backgroundColor: line.color,
                  boxShadow: `0 0 4px ${line.color}`,
                }
          }
        >
          {line.label && (
            <span className={styles.snapLabel}>{line.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
