# HUD Studio - Requirements Document

## Executive Summary

The HUD Studio is an internal visual editor that allows designers and developers to manipulate, configure, and export gameplay HUD layouts without writing code. It transforms the gameplay canvas into a live editing surface with drag-and-drop, real-time preview, and production-ready export capabilities.

---

## 1. User Stories

### 1.1 Designer Stories

**US-1.1.1: Visual HUD Editing**
- **As a** UI/UX designer
- **I want to** visually drag, resize, and position HUD components on the gameplay canvas
- **So that** I can iterate on layouts quickly without modifying code

**US-1.1.2: Component Property Editing**
- **As a** designer
- **I want to** adjust visual properties (opacity, blur, shadows, colors) through a property inspector
- **So that** I can fine-tune the visual appearance of each component

**US-1.1.3: Layout Presets**
- **As a** designer
- **I want to** save, load, and compare multiple layout configurations
- **So that** I can experiment with different designs and quickly switch between them

**US-1.1.4: Responsive Preview**
- **As a** designer
- **I want to** preview layouts across different device sizes instantly
- **So that** I can ensure the HUD works on all target devices

**US-1.1.5: Live Data Preview**
- **As a** designer
- **I want to** see real gameplay data in the HUD while editing
- **So that** I can design with realistic content

### 1.2 Developer Stories

**US-1.2.1: Export Configuration**
- **As a** developer
- **I want to** export the visual layout as JSON/TypeScript configuration
- **So that** I can integrate it into the production codebase

**US-1.2.2: Component Registration**
- **As a** developer
- **I want to** register new HUD components with minimal code
- **So that** they automatically appear in the editor with full editing capabilities

**US-1.2.3: Validation System**
- **As a** developer
- **I want to** receive warnings about layout issues (overlaps, safe areas, accessibility)
- **So that** I can fix problems before production deployment

**US-1.2.4: History/Undo System**
- **As a** designer/developer
- **I want to** undo/redo any editing action
- **So that** I can experiment freely without fear of breaking the layout

### 1.3 Product Manager Stories

**US-1.3.1: Rapid Iteration**
- **As a** product manager
- **I want** designers to iterate on HUD layouts without developer intervention
- **So that** we can reduce iteration time from days to minutes

**US-1.3.2: A/B Testing Layouts**
- **As a** product manager
- **I want to** save and compare multiple layout variants
- **So that** we can test different designs with users

---

## 2. Functional Requirements

### 2.1 Edit Mode System

**FR-2.1.1: Mode Toggle**
- System MUST support two distinct modes: Normal Mode and Edit Mode
- Toggle MUST be accessible via keyboard shortcut (e.g., Cmd/Ctrl + E)
- Toggle MUST be accessible via UI button in development builds
- Mode state MUST persist in localStorage for the current session

**FR-2.1.2: Normal Mode Behavior**
- All HUD components MUST render exactly as in production
- No editing controls MUST be visible
- Performance MUST be identical to production
- All gameplay interactions MUST function normally

**FR-2.1.3: Edit Mode Behavior**
- Every registered HUD component MUST become editable
- Selection outlines MUST appear on hover
- Drag handles MUST appear on selected components
- Resize handles MUST appear on selected components
- Component name tooltip MUST appear on hover
- Edit mode MUST NOT interfere with normal gameplay logic

### 2.2 Component Selection System

**FR-2.2.1: Single Selection**
- Clicking a component MUST select it
- Selected component MUST show:
  - Glowing outline (2px solid with glow effect)
  - 8 resize handles (corners + midpoints)
  - Component name label
- Previously selected component MUST be deselected

**FR-2.2.2: Selection Feedback**
- Selection outline color MUST be distinct (#a855f7 purple with glow)
- Selected component MUST be highlighted in Layers Panel
- Property Inspector MUST open/update with selected component's properties
- Selection MUST show component dimensions (width × height)

**FR-2.2.3: Deselection**
- Clicking canvas background MUST deselect current component
- Pressing Escape key MUST deselect current component
- Selecting a different component MUST deselect previous

### 2.3 Drag & Drop System

**FR-2.3.1: Component Dragging**
- Selected component MUST be draggable via mouse
- Selected component MUST be draggable via touch
- Dragging MUST use GPU-accelerated transforms (translate3d)
- Drag MUST show real-time position updates
- Drag MUST respect canvas boundaries

**FR-2.3.2: Drag Performance**
- Dragging MUST maintain 60 FPS
- Position updates MUST be throttled during drag
- Final position MUST be committed on drag end
- Cursor MUST change to 'grab' on hover, 'grabbing' while dragging

**FR-2.3.3: Drag Constraints**
- Components MUST NOT be draggable outside canvas bounds
- Locked components MUST NOT be draggable
- Hidden components MUST NOT be draggable

### 2.4 Resize System

**FR-2.4.1: Resize Handles**
- Selected component MUST show 8 resize handles:
  - 4 corners (NW, NE, SE, SW)
  - 4 midpoints (N, E, S, W)
- Handles MUST be 12px × 12px clickable areas
- Handles MUST show on component edges
- Cursor MUST change to indicate resize direction

**FR-2.4.2: Resize Behavior**
- Corner handles MUST resize both width and height
- Midpoint handles MUST resize single dimension
- Shift key MUST maintain aspect ratio
- Alt/Option key MUST resize from center
- Minimum size constraints MUST be enforced

**FR-2.4.3: Resize Feedback**
- Live dimension display MUST show during resize
- Component content MUST update in real-time
- Final size MUST be committed on resize end

### 2.5 Property Inspector

**FR-2.5.1: Inspector Layout**
- Inspector MUST be a floating panel (default: right side)
- Inspector MUST be collapsible
- Inspector MUST be resizable
- Inspector MUST show only when component is selected

**FR-2.5.2: Editable Properties**
Inspector MUST expose:
- **Position**: X, Y (number inputs with ± buttons)
- **Size**: Width, Height (number inputs with aspect ratio lock)
- **Layer**: Z-index (visual up/down buttons + input)
- **Visibility**: Visible/Hidden toggle
- **Lock**: Locked/Unlocked toggle
- **Opacity**: 0-100% slider
- **Border Radius**: 0-50px slider
- **Background Blur**: 0-50px slider
- **Border Width**: 0-10px slider
- **Border Color**: Color picker
- **Shadow**: None/Small/Medium/Large dropdown
- **Padding**: Horizontal, Vertical (number inputs)
- **Margin**: Horizontal, Vertical (number inputs)
- **Scale**: 0.5x-2x slider

**FR-2.5.3: Property Updates**
- All property changes MUST update component in real-time
- Changes MUST be added to history system
- Invalid values MUST show error state
- Reset button MUST restore default values

### 2.6 Layers Panel

**FR-2.6.1: Layer Display**
- Panel MUST show all registered components as layers
- Layers MUST be displayed in z-index order (top = highest z-index)
- Selected layer MUST be highlighted
- Layer name MUST be editable (double-click to rename)

**FR-2.6.2: Layer Actions**
Each layer MUST support:
- **Drag to reorder**: Changes z-index
- **Visibility toggle**: Eye icon to show/hide
- **Lock toggle**: Lock icon to prevent editing
- **Duplicate**: Creates copy with offset position
- **Delete**: Removes from layout (not from registry)
- **Rename**: Double-click to edit name

**FR-2.6.3: Layer Indicators**
- Locked layers MUST show lock icon
- Hidden layers MUST be dimmed
- Selected layer MUST have highlight background

### 2.7 Alignment & Snapping System

**FR-2.7.1: Alignment Tools**
Toolbar MUST provide:
- Align Left (all selected components)
- Align Right
- Align Top
- Align Bottom
- Center Horizontal
- Center Vertical
- Distribute Horizontally
- Distribute Vertically
- Match Width
- Match Height

**FR-2.7.2: Snap System**
- Snapping MUST be toggleable (keyboard shortcut: S)
- Snap targets:
  - Grid (4px, 8px, 12px, 16px, 24px - selectable)
  - Canvas edges
  - Safe area boundaries
  - Other components (edges and centers)
  - Center guides (horizontal and vertical)
- Snap threshold MUST be 8px
- Visual guides MUST appear during snap

**FR-2.7.3: Safe Area Guides**
Optional overlay guides for:
- Phone notch area
- Dynamic Island area
- Status bar area
- Navigation bar area
- Bottom safe area
- Thumb zone (reachable area)
- Gesture area
- Guides MUST be toggleable
- Guides MUST NOT be exported

### 2.8 Component Library

**FR-2.8.1: Library Panel**
- Panel MUST display all registered components
- Components MUST be categorized:
  - Core HUD
  - Gameplay
  - Combat
  - Social
  - Voice/Recording
  - Economy
  - Progression
  - Effects
  - Developer
- Categories MUST be collapsible
- Search/filter MUST be supported

**FR-2.8.2: Adding Components**
- Drag component from library to canvas MUST create instance
- Click component MUST add to canvas center
- New instance MUST be auto-selected
- Component MUST receive default position and size

### 2.9 Responsive Preview System

**FR-2.9.1: Device Presets**
System MUST support:
- iPhone SE (375×667)
- iPhone 13 Mini (375×812)
- iPhone 16 (393×852)
- Pixel (412×915)
- Galaxy (360×800)
- Small Android (360×640)
- Large Android (430×932)
- Tablet Portrait (768×1024)
- Tablet Landscape (1024×768)
- Desktop Debug (1920×1080)

**FR-2.9.2: Preview Behavior**
- Selecting device MUST re-render canvas instantly
- Layout MUST scale using normalized positions
- Components MUST maintain relative positioning
- Text sizes MUST scale appropriately
- Safe areas MUST adjust per device

**FR-2.9.3: Custom Viewport**
- User MUST be able to enter custom dimensions
- Custom viewport MUST be saveable
- Rotation toggle MUST swap width/height

### 2.10 Normalized Layout System

**FR-2.10.1: Position Storage**
- All positions MUST be stored as percentages (0.0-1.0)
- Format: `{ x: 0.08, y: 0.32, width: 0.24, height: 0.18 }`
- Pixel positions MUST be converted on save
- Normalized positions MUST be converted on load

**FR-2.10.2: Conversion Functions**
- `pixelsToNormalized(px, canvasSize)` MUST return 0.0-1.0
- `normalizedToPixels(norm, canvasSize)` MUST return pixels
- Conversions MUST handle both X/Y and width/height

**FR-2.10.3: Responsiveness Guarantee**
- Same normalized layout MUST render correctly on all device sizes
- Component relative positions MUST be preserved
- Minimum/maximum size constraints MUST scale proportionally

### 2.11 Live Data Preview

**FR-2.11.1: Data Modes**
System MUST support two modes:
- **Mock Data Mode**: Predefined realistic data
- **Live Backend Mode**: Real-time data from backend/WebSocket

**FR-2.11.2: Mock Data**
Mock data MUST include:
- Prize pool: $12,500
- Tokens: 24.5
- Rank: 7
- Alive players: 28
- Phase: 2/6
- Shadow Surge: 72%
- Squad members with varying HP
- Live feed events (cycling)
- Active effects with countdowns
- Skills inventory

**FR-2.11.3: Live Backend**
- Connect to live session endpoint
- Subscribe to WebSocket for real-time updates
- Display actual game state
- Handle disconnection gracefully

**FR-2.11.4: Data Toggle**
- Toggle MUST be in toolbar
- Switching MUST be instant
- Current mode MUST be clearly indicated

### 2.12 Component State Preview

**FR-2.12.1: State Switcher**
- Selected component MUST show available states
- States dropdown in Property Inspector
- One-click state switching

**FR-2.12.2: Component States**
Example states per component:
- **Voice Widget**: Idle, Speaking, Muted, Disconnected, Full Room, Empty Room
- **Recording Widget**: Recording, Paused, Stopped, Uploading, Processing
- **Live Feed**: Idle, Busy, Exploding, Hidden, Collapsed, Expanded
- **Spin Button**: Idle, Spinning, Locked, Glowing
- **Wheel**: Static, Spinning, Landing, Celebration

**FR-2.12.3: State Persistence**
- Current state MUST persist during editing
- State MUST reset when layout is loaded
- State changes MUST NOT be saved to layout

### 2.13 History System

**FR-2.13.1: Undo/Redo**
- Unlimited undo history
- Unlimited redo stack
- Keyboard shortcuts: Cmd/Ctrl+Z (undo), Cmd/Ctrl+Shift+Z (redo)
- Toolbar buttons for undo/redo

**FR-2.13.2: History Entry**
Each action creates history entry:
- Move component
- Resize component
- Change property
- Add component
- Delete component
- Duplicate component
- Reorder layers
- Batch operations (multi-select actions)

**FR-2.13.3: History UI**
- Show current position in history
- Optional history panel showing recent actions
- Ability to jump to specific history point

### 2.14 Layout Management

**FR-2.14.1: Save Layout**
- Save current layout with name
- Layouts stored in browser localStorage
- Layouts exportable as JSON file
- Auto-save on changes (debounced 2s)

**FR-2.14.2: Layout Presets**
System MUST include presets:
- **Gameplay Default**: Current production layout
- **Tournament**: Compact for competitive play
- **Streamer Mode**: Chat-friendly layout
- **Compact**: Minimal HUD
- **Testing**: Developer layout with all components

**FR-2.14.3: Layout Actions**
- Duplicate layout (with new name)
- Rename layout
- Delete layout (with confirmation)
- Mark layout as favorite
- Set layout as default

**FR-2.14.4: Compare Layouts**
- Side-by-side comparison view
- Diff visualization (what changed)
- Quick switch between layouts

### 2.15 Import/Export System

**FR-2.15.1: Export Format**
JSON structure:
```json
{
  "version": "1.0.0",
  "name": "Gameplay Default",
  "timestamp": "2025-01-15T10:30:00Z",
  "viewport": { "width": 390, "height": 844 },
  "components": {
    "wheel": {
      "id": "wheel",
      "type": "WheelHUD",
      "x": 0.50,
      "y": 0.41,
      "width": 0.62,
      "height": 0.42,
      "z": 2,
      "opacity": 1.0,
      "visible": true,
      "locked": false,
      "props": {}
    }
  }
}
```

**FR-2.15.2: Import**
- Import JSON file
- Validate JSON structure
- Show preview before applying
- Merge option (add to current) or Replace option

**FR-2.15.3: Generate Implementation**
Export MUST generate:
- JSON configuration file
- CSS variables file (optional)
- TypeScript interface (optional)
- React positioning object (optional)
- Component mapping documentation

### 2.16 Design Validation

**FR-2.16.1: Validation Checks**
Before save, automatically check:
- **Component Overlaps**: Warn if components overlap significantly
- **Safe Area Violations**: Error if components outside safe areas
- **Off-screen Positioning**: Error if component partially/fully off-canvas
- **Tiny Touch Targets**: Warn if interactive component < 44×44px
- **Overflow**: Warn if content exceeds component bounds
- **Z-index Conflicts**: Warn if multiple components share z-index
- **Accessibility Spacing**: Warn if components too close (< 8px)
- **Minimum Tap Sizes**: Error if tap target < 44×44px

**FR-2.16.2: Validation UI**
- Validation panel showing all issues
- Severity levels: Error (red), Warning (yellow), Info (blue)
- Click issue to select affected component
- Auto-fix button for fixable issues
- Export allowed with warnings, blocked by errors

---

## 3. Non-Functional Requirements

### 3.1 Performance

**NFR-3.1.1: Frame Rate**
- All interactions MUST maintain 60 FPS
- Dragging MUST use GPU-accelerated transforms
- Property updates MUST be throttled (16ms)

**NFR-3.1.2: Rendering**
- Only visible components MUST render
- Property panels MUST lazy-load
- Large panels MUST virtualize lists

**NFR-3.1.3: Memory**
- History system MUST limit to 100 entries
- Unused layout data MUST be garbage collected

### 3.2 Usability

**NFR-3.2.1: Keyboard Shortcuts**
- Cmd/Ctrl + E: Toggle edit mode
- Cmd/Ctrl + Z: Undo
- Cmd/Ctrl + Shift + Z: Redo
- Cmd/Ctrl + D: Duplicate selected
- Delete/Backspace: Delete selected
- Escape: Deselect
- Arrow keys: Nudge selected (1px, Shift = 10px)
- S: Toggle snapping
- G: Toggle grid
- R: Toggle rulers

**NFR-3.2.2: Tooltips**
- All tools MUST have tooltips
- Tooltips MUST show keyboard shortcut
- Tooltips MUST appear within 500ms

**NFR-3.2.3: Error Messages**
- Errors MUST be clear and actionable
- Errors MUST point to affected component
- Errors MUST suggest solutions

### 3.3 Extensibility

**NFR-3.3.1: Component Registration**
- New components MUST register with single function call
- Registration MUST define: name, category, default props, editable props
- No editor code modification required

**NFR-3.3.2: Plugin System**
- Future support for custom tools/panels
- Event hooks for external integrations

### 3.4 Browser Support

**NFR-3.4.1: Compatibility**
- Chrome/Edge 100+
- Firefox 100+
- Safari 15+
- Mobile browsers (view-only)

### 3.5 Accessibility

**NFR-3.5.1: Keyboard Navigation**
- All actions MUST be keyboard accessible
- Tab order MUST be logical
- Focus indicators MUST be visible

**NFR-3.5.2: Screen Reader**
- Major actions MUST announce to screen reader
- Component names MUST be announced
- Property changes MUST be announced

---

## 4. Constraints

### 4.1 Technical Constraints

**C-4.1.1: Development Only**
- HUD Studio MUST NOT be included in production builds
- Access MUST be restricted to development environment
- Environment variable gating required

**C-4.1.2: Data Storage**
- Layouts stored in browser localStorage (primary)
- Export to file system for sharing
- No server-side storage required (initially)

**C-4.1.3: Framework**
- Must integrate with existing Next.js/React codebase
- Must use existing component library
- Must use existing type definitions

### 4.2 Design Constraints

**C-4.2.1: Visual Consistency**
- Editor UI MUST match app design system
- Editor MUST NOT interfere with gameplay visuals
- Editor overlay MUST be clearly distinguished

**C-4.2.2: Mobile Constraints**
- Full editor only on desktop (1024px+ width)
- Mobile shows read-only preview
- Touch gestures reserved for gameplay

---

## 5. Acceptance Criteria

### 5.1 Core Functionality

**AC-5.1.1: Edit Mode Toggle**
- [ ] User can toggle edit mode with keyboard shortcut
- [ ] User can toggle edit mode with UI button
- [ ] Normal mode shows no editing controls
- [ ] Edit mode shows selection outlines and handles

**AC-5.1.2: Component Manipulation**
- [ ] User can select any HUD component by clicking
- [ ] User can drag selected component with mouse
- [ ] User can resize component using handles
- [ ] User can adjust properties via inspector
- [ ] Changes update in real-time at 60 FPS

**AC-5.1.3: Layout Management**
- [ ] User can save current layout with name
- [ ] User can load previously saved layout
- [ ] User can export layout as JSON
- [ ] User can import layout from JSON
- [ ] System provides default presets

**AC-5.1.4: Responsive Preview**
- [ ] User can select device preset
- [ ] Layout re-renders instantly for new device
- [ ] Components maintain relative positions
- [ ] Custom viewport sizes work correctly

**AC-5.1.5: Validation**
- [ ] System detects component overlaps
- [ ] System detects safe area violations
- [ ] System warns about small touch targets
- [ ] Validation report is clear and actionable

### 5.2 User Experience

**AC-5.2.1: Performance**
- [ ] Dragging maintains 60 FPS
- [ ] Property updates don't cause lag
- [ ] Panel rendering is smooth
- [ ] Large layouts load within 1 second

**AC-5.2.2: Visual Feedback**
- [ ] Selected component shows clear outline
- [ ] Resize handles are easily clickable
- [ ] Cursor changes indicate draggable areas
- [ ] Tooltips appear for all tools

**AC-5.2.3: Error Handling**
- [ ] Invalid property values show error state
- [ ] Export fails gracefully with clear message
- [ ] Undo/redo handles edge cases
- [ ] Missing data shows helpful placeholder

---

## 6. Glossary

- **Canvas**: The gameplay viewport where HUD components are rendered
- **Component**: A single HUD element (e.g., Prize Pool, Wheel, Spin Button)
- **Normalized Position**: Position stored as percentage (0.0-1.0) relative to canvas
- **Layer**: Visual representation of component in z-index hierarchy
- **Preset**: Pre-configured layout (e.g., "Gameplay Default")
- **Safe Area**: Device-specific region where content is fully visible
- **Snap**: Automatic alignment to grid/guides/components
- **Handle**: Interactive UI element for resizing components
- **Inspector**: Panel showing editable properties for selected component
- **Registry**: System tracking all available HUD components

---

## 7. Dependencies

### 7.1 External Dependencies
- React 18+ (already available)
- Framer Motion (already available)
- TypeScript (already available)
- Next.js 14+ (already available)

### 7.2 Internal Dependencies
- Existing HUD component library
- Type definitions for gameplay state
- Responsive CSS system

### 7.3 Future Dependencies
- WebSocket connection for live data (optional)
- Backend API for layout storage (future enhancement)

---

## 8. Open Questions

1. **Q**: Should layouts be shareable between team members via cloud storage?
   **Decision Needed**: Phase 1 = localStorage only, Phase 2 = cloud storage

2. **Q**: Should there be role-based access (designer vs developer features)?
   **Decision Needed**: Phase 1 = no roles, Phase 2 = role system

3. **Q**: Should we support component-level animations in the editor?
   **Decision Needed**: Phase 1 = static preview, Phase 2 = animation timeline

4. **Q**: Should we support custom component properties beyond standard ones?
   **Decision Needed**: Yes, via component-specific property panels

5. **Q**: Should we generate code or just configuration?
   **Decision Needed**: Phase 1 = JSON config only, Phase 2 = code generation

---

## 9. Success Metrics

- **Iteration Speed**: Reduce HUD layout iteration time from days to < 30 minutes
- **Adoption**: 100% of HUD changes use Studio within 1 month of launch
- **Quality**: Zero safe-area violations in production after Studio validation
- **Usability**: Designers can create new layout without developer help
- **Performance**: Studio maintains 60 FPS with 20+ HUD components

---

*Document Version: 1.0*  
*Last Updated: 2025-01-15*  
*Status: Ready for Design Phase*
