/**
 * SafeAreaGuides - Visual safe area overlays
 * 
 * Renders device-specific safe areas (notch, status bar, home indicator, thumb zones).
 */

'use client';

import { useStudioStore } from '../systems/state/store';
import { getSafeAreasForDevice } from '../utils/safe-areas';
import styles from '../styles/overlays.module.css';

/**
 * SafeAreaGuides component
 * 
 * Features:
 * - Device-specific safe areas
 * - Notch/Dynamic Island overlay
 * - Status bar overlay
 * - Home indicator overlay
 * - Thumb zone overlay
 * - Toggle visibility
 * - Never exported to production
 */
export function SafeAreaGuides() {
  const viewport = useStudioStore(state => state.viewport);
  const editorSettings = useStudioStore(state => state.editorSettings);

  // Only show if enabled
  if (!editorSettings.showSafeAreas) return null;

  const safeAreas = getSafeAreasForDevice(viewport.deviceName);

  return (
    <div className={styles.safeAreaGuidesContainer}>
      {/* Top Safe Area (Status Bar / Notch / Dynamic Island) */}
      <div
        className={styles.safeAreaTop}
        style={{
          height: `${safeAreas.top * 100}%`,
        }}
        title="Top Safe Area (Status Bar / Notch / Dynamic Island)"
      >
        <span className={styles.safeAreaLabel}>Status Bar / Notch</span>
      </div>

      {/* Dynamic Island */}
      {safeAreas.dynamicIsland && (
        <div
          className={styles.dynamicIsland}
          style={{
            width: `${safeAreas.dynamicIsland.width * 100}%`,
            height: `${safeAreas.dynamicIsland.height * 100}%`,
            left: `${(safeAreas.dynamicIsland.centerX - safeAreas.dynamicIsland.width / 2) * 100}%`,
            top: '8px',
          }}
          title="Dynamic Island"
        >
          <span className={styles.safeAreaLabel}>Dynamic Island</span>
        </div>
      )}

      {/* Notch */}
      {safeAreas.notch && (
        <div
          className={styles.notch}
          style={{
            width: `${safeAreas.notch.width * 100}%`,
            height: `${safeAreas.notch.height * 100}%`,
            left: `${(safeAreas.notch.centerX - safeAreas.notch.width / 2) * 100}%`,
            top: 0,
          }}
          title="Notch"
        >
          <span className={styles.safeAreaLabel}>Notch</span>
        </div>
      )}

      {/* Bottom Safe Area (Home Indicator) */}
      <div
        className={styles.safeAreaBottom}
        style={{
          height: `${safeAreas.bottom * 100}%`,
        }}
        title="Bottom Safe Area (Home Indicator)"
      >
        <span className={styles.safeAreaLabel}>Home Indicator</span>
      </div>

      {/* Left Safe Area */}
      {safeAreas.left > 0 && (
        <div
          className={styles.safeAreaLeft}
          style={{
            width: `${safeAreas.left * 100}%`,
          }}
          title="Left Safe Area"
        />
      )}

      {/* Right Safe Area */}
      {safeAreas.right > 0 && (
        <div
          className={styles.safeAreaRight}
          style={{
            width: `${safeAreas.right * 100}%`,
          }}
          title="Right Safe Area"
        />
      )}

      {/* Thumb Zone Guides (Bottom corners) */}
      {safeAreas.thumbZone && (
        <>
          <div
            className={styles.thumbZoneLeft}
            style={{
              width: `${safeAreas.thumbZone.horizontal * 100}%`,
              height: `${safeAreas.thumbZone.bottom * 100}%`,
            }}
            title="Left Thumb Zone"
          >
            <span className={styles.thumbZoneLabel}>👍 Thumb Zone</span>
          </div>
          <div
            className={styles.thumbZoneRight}
            style={{
              width: `${safeAreas.thumbZone.horizontal * 100}%`,
              height: `${safeAreas.thumbZone.bottom * 100}%`,
            }}
            title="Right Thumb Zone"
          >
            <span className={styles.thumbZoneLabel}>Thumb Zone 👍</span>
          </div>
        </>
      )}
    </div>
  );
}
