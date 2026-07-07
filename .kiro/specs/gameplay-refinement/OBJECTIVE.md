# Gameplay Refinement - Refactor for Real-Time Backend Authority

## Objective

Refine the gameplay experience so that every gameplay element reflects the authoritative live game state. The frontend must become a pure visualization layer for backend-determined gameplay logic.

## Constraints

- Do NOT redesign the gameplay UI
- Do NOT introduce mock values or test data
- Do NOT hardcode gameplay rules
- Do NOT calculate gameplay state in frontend
- The gameplay engine and admin configuration already exist

## Core Principle

**The frontend visualizes what the backend determines.**

All gameplay state flows from:
1. Backend API responses
2. Database queries
3. Real-time subscriptions

The frontend NEVER:
- Calculates gameplay outcomes
- Stores authoritative state
- Makes decisions about game logic
- Generates random results

---

## 11 Major Refinement Areas

### 1. LIVE GAME TIMER ⏱️

**Current Problem:** Timer not updating correctly with live server state

**Required Behavior:**
- Display live remaining time for current phase
- Read from backend (not calculated locally)
- Stay synchronized with server time
- Never use local countdown as source of truth
- Auto-transition when backend changes phase
- Handle reconnects without resetting

**Success Criteria:**
- Timer reads from `/api/gameplay/session/{id}` or real-time updates
- Drift calculation syncs with server every 30 seconds
- Phase transitions come from backend events
- All players see same remaining time ±100ms

---

### 2. DYNAMIC SQUAD PANEL 👥

**Current Problem:** Displays placeholder or stale data

**My Squad Section - Live Information:**
- Squad name
- Squad rank (from leaderboard)
- Total squad tokens
- Members currently alive
- Total members
- Squad position
- Squad progress
- Online members count
- Voice room status

**Top Squad Section - Current Leader:**
- Squad name
- Current rank
- Total tokens
- Alive members
- Position/progress

**Success Criteria:**
- Updates via `/api/gameplay/leaderboard?type=squad` polling every 2s
- Never caches outdated rankings
- Real-time updates via `squad_leaderboard:rank_changed` events
- Smooth animations on rank changes

---

### 3. SPINNING WHEEL ⚙️

**Official Specification (Immutable):**

The wheel contains EXACTLY 5 equal segments, each 20% of circumference:

1. **ADVANCE** - +3 Tokens
2. **ACQUIRE** - +1 Token
3. **DISCOVER** - +0.5 Tokens
4. **STEAL** - Attempt Token Theft
5. **VOID** - No Reward

**Flow (Backend-Authoritative):**
1. Player taps SPIN button
2. Request sent to backend: `POST /api/gameplay/spin`
3. Backend calculates/determines outcome
4. Backend returns official result
5. Frontend receives result
6. Wheel animates to that outcome
7. Outcome reveal sequence begins
8. Reward animations
9. Gameplay state updates

**Success Criteria:**
- Wheel has exactly 5 segments, equal size
- No random determination on frontend
- Backend controls all outcomes
- Wheel always lands on server result
- Cannot "rig" outcome by frontend code

---

### 4. OUTCOME REVEAL SEQUENCE 🎬

**After wheel stops, present cinematic reveal:**

1. Wheel stops
2. Short anticipation pause (300-500ms)
3. Large center overlay appears with:
   - Outcome name (ADVANCE, ACQUIRE, etc)
   - Token amount (if applicable)
   - Unique animation per outcome

**Overlay Requirements:**
- Scale into view
- Glow according to outcome type
- Play outcome-specific sound
- Trigger unique animation
- Remain visible 1-2 seconds
- Fade out smoothly

**Outcome-Specific Identity:**

- **ADVANCE** - Upward motion, gold glow, energetic sound
- **ACQUIRE** - Soft collection effect, token sparkle, chime
- **DISCOVER** - Mysterious reveal, blue/purple pulse, discovery sound
- **STEAL** - Aggressive animation, red warning flash, impact sound, target indicator
- **VOID** - Muted animation, grey tone, "miss" sound

**Success Criteria:**
- Each outcome has visually distinct reveal
- Reveals last 1-2 seconds
- Smooth transitions
- Sound hooks emitted for audio system

---

### 5. TOKEN COLLECTION ANIMATION 💎

**Flow:**

1. Outcome reveal plays (e.g., "+3 Tokens")
2. After reveal, animation begins:
   - Token particles spawn at wheel/center
   - Particles travel to Token Counter in HUD
   - When reaching counter:
     - Play collection sound
     - Increase displayed count
     - Animate counter (bounce/pulse/scale)
3. Counter only updates AFTER animation completes

**Critical:** Do NOT instantly change the number before the animation plays.

**Success Criteria:**
- Particles travel smoothly to counter (0.5-1.5s)
- Counter only updates when animation completes
- Collection sound plays at impact
- Token count matches backend value after animation

---

### 6. PHASE TRANSITION SYSTEM 🔄

**Problem:** Frontend assumes fixed number of phases (typically 4)

**Solution:** Read phase configuration from backend

**Requirements:**
- Backend defines number of phases (could be 2, 4, 6, 10, etc)
- Frontend reads phase metadata from:
  - Session initialization
  - Admin configuration endpoint
  - Real-time phase update events
- Frontend never assumes phase count
- Frontend never hardcodes phase names
- Support unlimited phases without code changes

**Success Criteria:**
- Phase count read from backend config
- Phase names from backend metadata
- Phase durations from backend config
- Works with any number of phases

---

### 7. PHASE INTRO ANIMATION 🎭

**When new phase begins:**

1. Gameplay pauses briefly (200-500ms)
2. Cinematic transition plays:
   - Overlay animates in from edges
   - Displays:
     - Phase number/name (from backend)
     - Phase description (if provided)
     - Dramatic transition effect
     - Phase intro sound
   - Overlay remains 2-3 seconds
   - Fades away
3. Gameplay resumes

**Success Criteria:**
- Phase data from backend (not hardcoded)
- Smooth cinematic transition
- Sound hook emitted
- Timing: 2-3 seconds total

---

### 8. PHASE END ANIMATION 🏁

**When phase completes:**

1. Display overlay with:
   - "PHASE COMPLETE" message
   - Optional: elimination summary from backend
   - Brief celebration effect
2. Smooth transition to next phase
3. No abrupt switching

**Success Criteria:**
- End message from backend if available
- Optional elimination summary
- Smooth transition
- No UI "pop" or jarring changes

---

### 9. ADMIN-DRIVEN PHASES ⚙️

**Frontend must be fully configuration-driven:**

Read from backend:
- ✅ Number of phases
- ✅ Phase names
- ✅ Phase duration
- ✅ Elimination rules (if exposed)
- ✅ Phase order
- ✅ Special phase settings
- ✅ Phase-specific rules or mechanics

**If admin adds/removes phases:**
- Frontend adapts automatically
- No code changes required
- Works immediately on next session

**Success Criteria:**
- All phase data from backend config
- No hardcoded phase list anywhere
- Auto-adapt to config changes

---

### 10. SOUND SYSTEM HOOKS 🔊

**Do NOT embed sound logic in gameplay components**

Instead, emit standardized events for:
- `spin.started` - Spin button clicked
- `spin.completed` - Spin animation finished
- `spin.outcome.advance` - Wheel landed on ADVANCE
- `spin.outcome.acquire` - Wheel landed on ACQUIRE
- `spin.outcome.discover` - Wheel landed on DISCOVER
- `spin.outcome.steal` - Wheel landed on STEAL
- `spin.outcome.void` - Wheel landed on VOID
- `tokens.collected` - Token animation completed
- `phase.started` - New phase begins
- `phase.completed` - Phase ended
- `player.eliminated` - Player eliminated
- `shadow_surge.activated` - Shadow Surge begins

**Architecture:**
- Gameplay Event Bus (central event emitter)
- Sound system subscribes to events
- Animation system subscribes to events
- Haptics system subscribes to events
- Future systems can subscribe without modifying gameplay code

**Success Criteria:**
- All events emitted with proper payloads
- Sound system can subscribe independently
- No tight coupling between systems

---

### 11. ANIMATION PERFORMANCE ⚡

**Animations must never block state synchronization**

**Requirements:**
- Smooth 60 FPS animations
- Queue animations if multiple events close together
- Avoid overlapping reveal overlays
- Token counts remain synchronized with backend
- No UI freezing during animations

**Success Criteria:**
- 60 FPS maintained during active animations
- Queue system prevents animation collisions
- Backend state always accessible
- Animations run in separate layer

---

## Gameplay Event Bus Architecture (Recommended)

Create a centralized event system:

```typescript
interface GameplayEvent {
  type: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

type GameplayEventListener = (event: GameplayEvent) => void;

class GameplayEventBus {
  private listeners: Map<string, GameplayEventListener[]>;
  
  emit(type: string, payload?: Record<string, unknown>): void
  on(type: string, listener: GameplayEventListener): () => void
  off(type: string, listener: GameplayEventListener): void
}

export const gameplayEventBus = new GameplayEventBus();
```

**Benefits:**
- Decoupled animation, sound, and gameplay logic
- Easy to add new systems (haptics, analytics, etc)
- Test-friendly (mock event bus)
- Extensible without modifying core gameplay

---

## Implementation Priority

### Phase 1: Event Bus & Architecture
- [ ] Create Gameplay Event Bus
- [ ] Update components to emit events
- [ ] Remove hardcoded sound/animation calls

### Phase 2: Real-Time State
- [ ] Verify live timer synchronization
- [ ] Verify squad panel live updates
- [ ] Verify leaderboard accuracy

### Phase 3: Animation Refinement
- [ ] Outcome reveal sequences
- [ ] Token collection animation
- [ ] Phase transitions
- [ ] Animation queueing

### Phase 4: Backend Integration
- [ ] Verify all data from backend (no hardcoding)
- [ ] Verify phase config is dynamic
- [ ] Verify wheel outcomes from server
- [ ] Verify sound hooks emitted

### Phase 5: Polish & Performance
- [ ] 60 FPS validation
- [ ] Memory leak checks
- [ ] Reconnection scenarios
- [ ] Edge cases (rapid spins, phase changes, etc)

---

## Validation Checklist

Before marking complete:

### Timer ⏱️
- [ ] Timer displays live remaining time
- [ ] Stays synchronized with server
- [ ] Phase transitions automatic
- [ ] Handles reconnects correctly
- [ ] All players see same time

### Squad Panel 👥
- [ ] My Squad section updates in real-time
- [ ] Top Squad section updates automatically
- [ ] Rankings never stale
- [ ] Smooth animations on changes
- [ ] Voice status shown

### Wheel ⚙️
- [ ] Exactly 5 equal segments
- [ ] No frontend randomness
- [ ] Outcomes from backend only
- [ ] Lands on server result always
- [ ] Cannot be "rigged"

### Reveals & Animations 🎬
- [ ] Each outcome has unique reveal
- [ ] Token animation to counter
- [ ] Phase intro cinematic
- [ ] Phase end animation
- [ ] 60 FPS smooth

### Backend Authority 🔗
- [ ] No hardcoded phases
- [ ] Phase config from backend
- [ ] Phase durations from backend
- [ ] Works with any phase count
- [ ] Supports admin reconfig

### Events & Sound 🔊
- [ ] All major events emitted
- [ ] Sound system can subscribe
- [ ] Animation system can subscribe
- [ ] No tight coupling
- [ ] Extensible design

### Performance ⚡
- [ ] Animations at 60 FPS
- [ ] No state sync blocking
- [ ] Animation queue system
- [ ] Memory stable
- [ ] No UI freezing

---

## Success Statement

Upon completion, the gameplay will be a **perfect real-time visualization** of the backend game state. Every number, every animation, every transition will come from or respond to authoritative backend data. The frontend will make zero gameplay decisions and calculate zero game logic.

Players will see:
- Live updated leaderboards
- Real-time squad status
- Backend-controlled spin outcomes
- Smooth, cinematic feedback
- Complete phase customization support
- Professional animation choreography

The system will be:
- Fully backend-authoritative
- Animation-rich and polished
- Event-driven and extensible
- High-performance
- Ready for sound system integration
