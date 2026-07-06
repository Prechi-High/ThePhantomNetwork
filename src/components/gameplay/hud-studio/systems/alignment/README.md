# Alignment System

The Alignment System provides intelligent alignment, distribution, and size matching for multiple components in the HUD Studio.

## Architecture

The alignment system consists of:

- **AlignmentEngine**: Main coordinator for alignment operations
- **operations.ts**: Core alignment, distribution, and size matching logic
- **types.ts**: Type definitions for alignment operations
- **AlignmentCommand**: History command for undo/redo support

## Features

### 1. Alignment Operations

Align multiple components relative to each other:

- **Left**: Align all to leftmost edge
- **Right**: Align all to rightmost edge
- **Top**: Align all to topmost edge
- **Bottom**: Align all to bottommost edge
- **Center Horizontal**: Align to average horizontal center
- **Center Vertical**: Align to average vertical center
- **Center Both**: Center both horizontally and vertically

**Minimum**: 2 components

### 2. Distribution Operations

Distribute 3+ components with equal spacing:

- **Horizontal Distribution**: Equal spacing left-to-right
- **Vertical Distribution**: Equal spacing top-to-bottom

**Minimum**: 3 components

### 3. Size Matching

Match component sizes:

- **Match Width**: All components get same width as reference
- **Match Height**: All components get same height as reference
- **Match Both**: Match both dimensions

**Minimum**: 2 components (first selected is reference)

## Usage

### Via Toolbar

The alignment tools are integrated into the main toolbar with intuitive icons:

```
Left | Center-H | Right | Top | Center-V | Bottom | Dist-H | Dist-V | Width | Height
```

All buttons are automatically disabled when insufficient components are selected.

### Programmatic Usage

```typescript
import { AlignmentEngine } from '@/components/gameplay/hud-studio';
import { useStudioStore } from '@/components/gameplay/hud-studio';

// Get selected components
const components = useStudioStore(state => 
  selectedIds.map(id => state.components[id])
);

// Align left
const result = AlignmentEngine.align(components, 'left');

// Distribute horizontally
const result = AlignmentEngine.distribute(components, 'horizontal');

// Match width
const result = AlignmentEngine.matchSize(components, 'width');

// Apply results
result.results.forEach(r => {
  updateComponent(r.componentId, {
    position: r.position,
    size: r.size, // For size matching
  });
});
```

### With History Integration

```typescript
import { AlignmentCommand } from '@/components/gameplay/hud-studio/systems/history/commands/AlignmentCommand';
import { commandHistory } from '@/components/gameplay/hud-studio';

const result = AlignmentEngine.align(components, 'center-horizontal');

if (result.results.length > 0) {
  const command = new AlignmentCommand(
    result.description,
    components,
    result.results,
    (id, updates) => {
      useStudioStore.getState().updateComponent(id, updates);
    }
  );

  commandHistory.execute(command);
}
```

## Alignment Logic

### Alignment

Each alignment type calculates a target position:

- **Left/Right/Top/Bottom**: Uses min/max of all component bounds
- **Center**: Uses average of all component centers

### Distribution

Distribution calculates equal spacing:

1. Sort components by position (left/top)
2. Calculate total width/height of all components
3. Calculate available space for gaps
4. Position components with equal gaps

Formula:
```
gapSize = (lastComponent.right - firstComponent.left - totalWidth) / (count - 1)
```

### Size Matching

Size matching uses the first selected component as reference:

1. Get reference component dimensions
2. Apply dimensions to all other components
3. Keep original positions (no movement)

## History Integration

All alignment operations create undo/redo commands:

```typescript
class AlignmentCommand {
  constructor(
    description: string,
    components: ComponentInstance[],
    alignmentResults: AlignmentResult[],
    updateFn: (id: string, updates: Partial<ComponentInstance>) => void
  )
  
  execute(): void;  // Apply alignment
  undo(): void;     // Restore previous positions/sizes
}
```

The command stores:
- Previous state (position + size for each component)
- New state (from alignment results)
- Update function for applying changes

## API Reference

### AlignmentEngine

```typescript
class AlignmentEngine {
  static align(
    components: ComponentInstance[],
    alignType: AlignmentType
  ): BatchAlignmentResult;
  
  static distribute(
    components: ComponentInstance[],
    distributionType: DistributionType
  ): BatchAlignmentResult;
  
  static matchSize(
    components: ComponentInstance[],
    matchType: SizeMatchType,
    referenceComponent?: ComponentInstance
  ): BatchAlignmentResult;
  
  static getOperationDescription(
    operation: AlignmentType | DistributionType | SizeMatchType
  ): string;
}
```

### Core Operations

```typescript
function alignComponents(
  components: ComponentInstance[],
  alignType: AlignmentType
): AlignmentResult[];

function distributeComponents(
  components: ComponentInstance[],
  distributionType: DistributionType
): AlignmentResult[];

function matchSize(
  components: ComponentInstance[],
  matchType: SizeMatchType,
  referenceComponent?: ComponentInstance
): AlignmentResult[];

function calculateBounds(
  component: ComponentInstance
): ComponentBounds;

function getGroupBounds(
  components: ComponentInstance[]
): {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};
```

## Types

```typescript
type AlignmentType =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'center-horizontal'
  | 'center-vertical'
  | 'center-both';

type DistributionType =
  | 'horizontal'
  | 'vertical';

type SizeMatchType =
  | 'width'
  | 'height'
  | 'both';

interface ComponentBounds {
  id: string;
  position: NormalizedPosition;
  size: NormalizedSize;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

interface AlignmentResult {
  componentId: string;
  position: NormalizedPosition;
  size?: NormalizedSize;
}

interface BatchAlignmentResult {
  results: AlignmentResult[];
  description: string;
}
```

## Performance

- **O(n)** for alignment operations
- **O(n log n)** for distribution (requires sorting)
- All operations use normalized coordinates (0-1)
- No visual updates during calculation
- Single state update via history command

## Future Enhancements

- [ ] Multi-select support in UI (currently single component only)
- [ ] Smart alignment (align to selection bounding box center)
- [ ] Align to canvas edges/center
- [ ] Alignment guides during operation
- [ ] Keyboard shortcuts for common alignments
- [ ] Align to specific component (not just first)
- [ ] Preview before applying
- [ ] Constrain to safe areas during alignment

## Testing

To test alignment:

1. Create multiple test widgets
2. Select 2+ components (TODO: implement multi-select)
3. Use toolbar buttons to align
4. Try different alignment types
5. Test undo/redo (Cmd+Z / Cmd+Shift+Z)
6. Verify positions update correctly

## Limitations

- **Current**: Single component selection only
- **Workaround**: Modify code to use array of selected IDs
- **Planned**: Multi-select support in Phase 6

## Troubleshooting

**Alignment buttons disabled:**
- Need at least 2 components selected
- Distribution needs 3+ components
- Check that components exist in store

**Alignment not working:**
- Verify component positions are valid (0-1)
- Check console for errors
- Ensure components are not locked

**Undo not working:**
- Check that AlignmentCommand was executed
- Verify commandHistory is not full
- Check that update function is correct
