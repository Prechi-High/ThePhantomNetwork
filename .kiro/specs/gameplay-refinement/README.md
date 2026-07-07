# Gameplay Refinement Spec

## Overview

This spec defines a comprehensive refinement of the gameplay frontend to make it a **pure visualization layer for backend-determined game state**. Every element will reflect the authoritative live game state, eliminating hardcoded values, mock data, and frontend game logic.

## Quick Links

- **[OBJECTIVE.md](./OBJECTIVE.md)** - 11 major refinement areas with detailed requirements
- **[design.md](./design.md)** - Architecture diagrams, data flows, component communication
- **[tasks.md](./tasks.md)** - 40+ actionable implementation tasks with acceptance criteria

## Key Principles

### 🎯 Frontend Never Calculates Game Logic
- No outcome randomization
- No phase transitions without backend signal
- No scoring calculations
- No elimination decisions

### 📡 All State from Backend
- Timer reads from server
- Rankings from leaderboard API
- Wheel outcomes from POST /api/gameplay/spin
- Phase configuration from backend
- Squad data real-time synced

### 🎬 Event-Driven Architecture
- Gameplay emits events via Event Bus
- Sound system subscribes independently
- Animation system subscribes independently
- Future systems (haptics, analytics) plug in easily
- No tight coupling between systems

### ⚡ High Performance
- 60 FPS animations
- Smooth state synchronization
- Memory stable over sessions
- Animation queueing prevents collision
- Responsive UI at all times

## The 11 Refinement Areas

### 1. ⏱️ Live Game Timer
- Displays live remaining time for current phase
- Reads from backend, never calculated locally
- Stays synchronized with server
- Phase transitions from backend events only

### 2. 👥 Dynamic Squad Panel
- **My Squad:** Live name, rank, tokens, alive members, online status
- **Top Squad:** Current leader with live data
- Never caches outdated rankings
- Smooth animations on rank changes

### 3. ⚙️ Spinning Wheel
- Exactly 5 equal segments (20% each)
- Outcomes: ADVANCE(+3), ACQUIRE(+1), DISCOVER(+0.5), STEAL, VOID
- Backend controls all outcomes (no frontend randomness)
- Wheel always lands on server result

### 4. 🎬 Outcome Reveal Sequence
- Each outcome has unique cinematic reveal
- ADVANCE: gold glow, upward motion, energetic sound
- ACQUIRE: token sparkle, soft chime, gentle animation
- DISCOVER: purple glow, mysterious reveal, discovery sound
- STEAL: red flash, aggressive animation, target indicator
- VOID: grey tone, muted animation, miss sound

### 5. 💎 Token Collection Animation
- Particles travel from wheel to token counter
- Counter only updates after animation completes
- Sound plays on collection
- Smooth, professional feel

### 6. 🔄 Phase Transition System
- Backend defines phase count (2, 4, 6, 10+)
- No hardcoded phase numbers or names
- Phase configuration fully admin-driven
- Frontend auto-adapts to any configuration

### 7. 🎭 Phase Intro Animation
- Cinematic overlay on phase start
- Displays phase name/number/description (from backend)
- 2-3 second duration
- Sound hook emitted for audio system

### 8. 🏁 Phase End Animation
- "PHASE COMPLETE" overlay
- Optional elimination summary
- Smooth transition to next phase
- No abrupt switching

### 9. ⚙️ Admin-Driven Phases
- All phase metadata from backend
- Zero hardcoded phase information
- Admin reconfig auto-adapts frontend
- Extensible to any number of phases

### 10. 🔊 Sound System Hooks
- Emit events instead of playing sounds directly
- All major gameplay moments emit events
- Sound system subscribes independently
- Tight decoupling enables future systems

### 11. ⚡ Animation Performance
- 60 FPS maintained during active gameplay
- Multiple animations queued smoothly
- Backend state always accessible
- No UI blocking or freezing

## Architecture

### Gameplay Event Bus (Center)
All components emit events to centralized bus:
```typescript
gameplayEventBus.emit('spin.outcome.advance', { amount: 3 });
gameplayEventBus.emit('phase.started', { phaseData });
gameplayEventBus.emit('tokens.collected', { amount: 3 });
```

Sound system, animation system, and future systems subscribe:
```typescript
gameplayEventBus.on('spin.outcome.advance', (event) => {
  // Sound system plays sound
});
```

### Data Flow
```
Backend Engine
    ↓
API & WebSockets
    ↓
Custom Hooks (useServerTime, useLeaderboardUpdates, etc)
    ↓
Zustand Stores (useSessionStore, useLeaderboardStore, etc)
    ↓
React Components (pure visualization)
    ↓
Emit to Event Bus
    ↓
Sound/Animation/Haptics Systems Subscribe
```

## Implementation Phases

### Phase 1: Event Bus Architecture (1 day)
- [ ] Create Gameplay Event Bus
- [ ] Define event type constants
- [ ] Create useGameplayEvents hook

### Phase 2: Live Timer Refinement (1-2 days)
- [ ] Verify server time sync
- [ ] Wire timer to backend phase data
- [ ] Verify phase transitions from backend
- [ ] Test synchronization across players

### Phase 3: Squad Panel Refinement (1-2 days)
- [ ] Create store selectors for squad data
- [ ] Wire to real-time leaderboard updates
- [ ] Implement smooth rank animations
- [ ] Remove any hardcoded fallback values

### Phase 4: Wheel & Outcomes (2-3 days)
- [ ] Verify 5 equal segments
- [ ] Implement outcome reveal animations (5 unique)
- [ ] Implement token collection animation
- [ ] Verify backend outcome flow

### Phase 5: Phase System (1-2 days)
- [ ] Read phase config from backend
- [ ] Create phase intro animation
- [ ] Create phase end animation
- [ ] Wire phase transitions to backend events

### Phase 6: Sound Integration (1 day)
- [ ] Emit all gameplay events
- [ ] Create sound system hook example
- [ ] Remove hardcoded sound playback
- [ ] Document for sound developer

### Phase 7: Performance & Polish (1-2 days)
- [ ] Validate 60 FPS animations
- [ ] Implement animation queue system
- [ ] Check for memory leaks
- [ ] Test reconnection scenarios

**Total Estimated: 8-12 days for one developer**

## Constraints

### Do NOT
- ❌ Redesign the gameplay UI
- ❌ Introduce mock values or test data
- ❌ Hardcode gameplay rules
- ❌ Calculate game logic in frontend
- ❌ Make gameplay decisions
- ❌ Generate random outcomes

### DO
- ✅ Use backend data exclusively
- ✅ Emit events for animations/sounds
- ✅ Keep components dumb (visualization only)
- ✅ Verify every number from server
- ✅ Focus on user experience
- ✅ Make it cinematic and polished

## Success Criteria

Before marking spec complete, verify:

✅ **Timer:**
- Displays live time
- Stays synced with server
- Phase transitions from backend
- All players see same time ±200ms

✅ **Squad Panel:**
- My Squad updates real-time
- Top Squad shows current leader
- Rankings never stale
- Smooth animations

✅ **Wheel:**
- Exactly 5 equal segments
- Outcomes from backend only
- No frontend randomness
- Lands on server result always

✅ **Reveals & Animations:**
- Each outcome has unique reveal
- Token animation smooth
- Phase transitions cinematic
- 60 FPS throughout

✅ **Backend Authority:**
- No hardcoded phases
- Phase config from backend
- Works with any phase count
- Admin changes auto-adapt

✅ **Events & Sound:**
- All major events emitted
- Sound system can subscribe
- No hardcoded sound playback
- Extensible architecture

✅ **Performance:**
- 60 FPS animations
- Memory stable
- No UI freezing
- Responsive controls

## Files to Read

Start here:
1. **OBJECTIVE.md** - Understand what needs to be refined and why
2. **design.md** - Understand the architecture and how systems interact
3. **tasks.md** - Execute the specific implementation tasks

## Questions to Answer During Implementation

### Is this data from the backend?
- ✅ Yes → Use it (could be from API, store, real-time event)
- ❌ No → Find the backend source, wire it up

### Am I calculating game logic?
- ✅ No → Good, keep visualizing
- ❌ Yes → Stop, move that to backend or use backend result

### Is this a hardcoded value?
- ✅ No → It's configurable from backend
- ❌ Yes → Remove it, read from backend config instead

### Can the sound system do this without modifying my code?
- ✅ Yes → Good, you emitted an event
- ❌ No → Add an event emission

## Related Systems

### Existing (Already Built)
- 🟢 Zustand stores for state management
- 🟢 Custom hooks for data sync (useLiveFeedUpdates, useLeaderboardUpdates, etc)
- 🟢 Real-time event infrastructure
- 🟢 API endpoints for gameplay data
- 🟢 Server time synchronization

### In This Spec
- 🔵 Gameplay Event Bus
- 🔵 Event-driven architecture
- 🔵 Animation choreography
- 🔵 Reveal sequences
- 🔵 Sound system hooks

### After This Spec
- 🟡 Dedicated Sound System (separate developer)
- 🟡 Haptics Integration
- 🟡 Advanced Analytics

## For Sound Developer (When They Join)

The Gameplay Event Bus is ready for you to subscribe to:

```typescript
// In your sound system module:
import { gameplayEventBus } from '@/lib/events/GameplayEventBus';

// Subscribe to events
gameplayEventBus.on('spin.outcome.advance', (event) => {
  playSound('advance-reward', { volume: 0.8 });
});

gameplayEventBus.on('phase.started', (event) => {
  playSound('phase-intro', { volume: 1.0 });
});

// All events available:
// - spin.started, spin.completed
// - spin.outcome.advance, .acquire, .discover, .steal, .void
// - tokens.collected
// - phase.started, phase.completed
// - player.eliminated
// - shadow_surge.activated
```

No changes to gameplay code needed. Just subscribe and play sounds.

## References

- **Objective Requirements** → OBJECTIVE.md
- **System Architecture** → design.md
- **Implementation Tasks** → tasks.md
- **Acceptance Criteria** → Each task in tasks.md
- **Performance Guidelines** → design.md Performance section
- **Testing Approach** → design.md Testing section

## Author Notes

This refinement completes the frontend's transformation from a game engine to a pure visualization layer. With the event bus in place, the system becomes extensible for future systems (haptics, advanced analytics, AI coaching, etc.) without modifying core gameplay code.

The key insight: **Separate concerns. Gameplay visualizes backend state. Sound system subscribes to events. Animation system subscribes to events. Each system does one thing well.**

This makes the codebase maintainable, testable, and future-proof.

---

**Status:** 🟡 Spec Complete - Ready for Implementation

**Next Steps:**
1. Review OBJECTIVE.md (30 min)
2. Review design.md (45 min)
3. Execute tasks.md in priority order (8-12 days)
4. Manual testing & validation (2-3 days)
5. Hand off to sound developer (ready to go)
