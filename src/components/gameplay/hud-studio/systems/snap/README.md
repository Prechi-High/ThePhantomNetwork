# Snap System

The Snap System provides intelligent snapping for component positioning during drag operations. It includes grid snapping, edge snapping, and center guide snapping.

## Architecture

The snap system consists of several coordinated modules:

- **SnapEngine**: Main coordinator that applies all snap systems
- **GridSnap**: Snaps to a configurable grid
- **EdgeSnap**: Snaps to edges and centers of other components
- **CenterGuides**: Snaps to canvas horizontal/vertical centers
- **SnapGuides**: Visual feedback component that renders snap lines

## Features

### 1. Grid Snapping
- Configurable grid size (default: 8px)
- Snaps position to nearest grid intersection
- Threshold-based (won't snap if too far away)
- Toggle with `G` key

### 2. Edge Snapping
- Snaps to left/right/top/bottom edges of other components
- Snaps to centers of other components
- Side-by-side and stacked positioning support
- Color-coded visual guides (cyan)

### 3. Center Guide Snapping
- Snaps to canvas center (horizontal and vertical)
- Perfect for centering components
- Color-coded visual guides (magenta)

### 4. Visual Feedback
- Real-time snap lines during drag
- Color-coded by snap type:
  - Green: Grid snapping
  - Magenta: Center guides
  - Cyan: Component edges
- Animated appearance
- Labels showing snap type

## Usage

### Enable/Disable Snapping

```typescript
import { useStudioStore } from '@/components/gameplay/hud-studio';

const { editorSettings, updateSettings } = useStudioStore();

// Toggle all snapping
updateSettings({ snapEnabled: !editorSettings.snapEnabled });

// Toggle specific snap types
updateSettings({ snapToGrid: false });
updateSettings({ snapToComponents: true });
updateSettings({ snapToSafeArea: true });
```

### Keyboard Shortcuts

- **S**: Toggle snap on/off
- **G**: Toggle grid visibility
- **R**: Toggle rulers (future)

### Configure Grid Size

```typescript
// Change grid size (in pixels)
updateSettings({ gridSize: 16 }); // 16px grid
```

### Configure Snap Threshold

The snap threshold is currently hardcoded to 8px but can be adjusted in the `SnapEngine.applySnapping()` call:

```typescript
const snapResult = SnapEngine.applySnapping(
  position,
  componentId,
  components,
  {
    enabled: true,
    snapToGrid: true,
    snapToComponents: true,
    snapToSafeArea: false,
    gridSize: 8,
    threshold: 8, // Change this value
  },
  canvasWidth,
  canvasHeight
);
```

## Integration

The snap system is automatically integrated into the drag hook (`useDragDrop`):

```typescript
// In useDragDrop.ts
if (editorSettings.snapEnabled) {
  const snapResult = SnapEngine.applySnapping(
    { x: newX, y: newY },
    componentId,
    components,
    {
      enabled: editorSettings.snapEnabled,
      snapToGrid: editorSettings.snapToGrid,
      snapToComponents: editorSettings.snapToComponents,
      snapToSafeArea: editorSettings.snapToSafeArea,
      gridSize: editorSettings.gridSize,
      threshold: 8,
    },
    viewport.width,
    viewport.height
  );
  
  newX = snapResult.position.x;
  newY = snapResult.position.y;
  setActiveSnapLines(snapResult.snapLines);
}
```

Visual guides are rendered globally via `SnapGuidesOverlay` in `EditModeWrapper`.

## Performance

- Snap calculations use normalized coordinates (0-1) for device independence
- Grid snapping is O(1) - calculates nearest grid line directly
- Edge snapping is O(n) where n = number of visible components
- RAF throttling prevents excessive calculations during drag
- Snap lines are managed via Zustand store for efficient updates

## API Reference

### SnapEngine

```typescript
class SnapEngine {
  static applySnapping(
    position: NormalizedPosition,
    componentId: string,
    components: Record<string, ComponentInstance>,
    config: SnapConfig,
    canvasWidth: number,
    canvasHeight: number
  ): SnapResult;
}
```

### GridSnap

```typescript
class GridSnap {
  static snapToGrid(
    position: NormalizedPosition,
    gridSize: number,
    canvasWidth: number,
    canvasHeight: number,
    threshold?: number
  ): NormalizedPosition;
  
  static getGridLines(
    gridSize: number,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number[]; y: number[] };
}
```

### EdgeSnap

```typescript
class EdgeSnap {
  static getSnapCandidates(
    components: Record<string, ComponentInstance>,
    excludeId: string
  ): SnapCandidate[];
  
  static snapToEdges(
    position: NormalizedPosition,
    size: { width: number; height: number },
    candidates: SnapCandidate[],
    threshold: number
  ): NormalizedPosition;
}
```

### CenterGuides

```typescript
class CenterGuides {
  static snapToCenter(
    position: NormalizedPosition,
    size: { width: number; height: number },
    threshold: number
  ): NormalizedPosition;
  
  static getCenterLines(): { x: number; y: number };
}
```

## Types

```typescript
interface SnapResult {
  position: NormalizedPosition;
  snapped: boolean;
  snapLines: SnapLine[];
}

interface SnapLine {
  type: 'horizontal' | 'vertical';
  position: number; // Normalized (0-1)
  color: string;
  label?: string;
}

interface SnapConfig {
  enabled: boolean;
  snapToGrid: boolean;
  snapToComponents: boolean;
  snapToSafeArea: boolean;
  gridSize: number;
  threshold: number;
}
```

## Future Enhancements

- [ ] Safe area snapping (for device notches, status bars)
- [ ] Smart spacing distribution (equal spacing between components)
- [ ] Alignment guides (maintain alignment while dragging)
- [ ] Magnetic snapping with haptic feedback
- [ ] Custom snap targets
- [ ] Configurable threshold per snap type
- [ ] Snap history (remember frequently used positions)

## Testing

To test the snap system:

1. Enable edit mode (`Cmd/Ctrl+E`)
2. Press `S` to toggle snap on/off
3. Press `G` to show/hide grid
4. Drag a component and watch for snap lines
5. Try dragging near:
   - Grid intersections (green lines)
   - Canvas center (magenta lines)
   - Other component edges (cyan lines)

## Troubleshooting

**Snapping not working:**
- Check that `snapEnabled` is true in settings
- Verify threshold is appropriate for viewport size
- Check that specific snap types are enabled

**Snap lines not showing:**
- Verify `activeSnapLines` state is updated
- Check that `SnapGuidesOverlay` is rendered
- Inspect CSS for visibility issues

**Performance issues:**
- Reduce number of visible components
- Increase snap threshold to reduce calculations
- Check for memory leaks in snap line cleanup
