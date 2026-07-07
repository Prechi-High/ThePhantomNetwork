# Gameplay Refinement - Implementation Tasks

## Phase 1: Event Bus Architecture

### ARCH-1: Create Gameplay Event Bus Core
**File:** `src/lib/events/GameplayEventBus.ts`
**Dependencies:** None
**Time:** 1 hour

```typescript
interface GameplayEvent {
  type: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

type GameplayEventListener = (event: GameplayEvent) => void;

class GameplayEventBus {
  private listeners: Map<string, GameplayEventListener[]> = new Map();
  
  // Emit an event to all listeners
  emit(type: string, payload?: Record<string, unknown>): void
  
  // Subscribe to events
  on(type: string, listener: GameplayEventListener): () => void
  
  // Unsubscribe from events
  off(type: string, listener: GameplayEventListener): void
  
  // Clear all listeners (for cleanup/testing)
  clear(): void
}

export const gameplayEventBus = new GameplayEventBus();
```

**Acceptance Criteria:**
- [ ] Event bus class created with emit/on/off methods
- [ ] Supports multiple listeners per event type
- [ ] on() returns unsubscribe function
- [ ] off() removes specific listener
- [ ] clear() wipes all listeners
- [ ] Singleton instance exported
- [ ] TypeScript strict typing
- [ ] Event payload optional

**Reference:** Objective §10

---

### ARCH-2: Create Event Type Constants
**File:** `src/lib/events/eventTypes.ts`
**Dependencies:** None
**Time:** 30 minutes

```typescript
// Define all gameplay event types as constants

export const GAMEPLAY_EVENTS = {
  SPIN: {
    STARTED: 'spin.started',
    COMPLETED: 'spin.completed',
  },
  OUTCOME: {
    ADVANCE: 'spin.outcome.advance',
    ACQUIRE: 'spin.outcome.acquire',
    DISCOVER: 'spin.outcome.discover',
    STEAL: 'spin.outcome.steal',
    VOID: 'spin.outcome.void',
  },
  TOKENS: {
    COLLECTED: 'tokens.collected',
  },
  PHASE: {
    STARTED: 'phase.started',
    COMPLETED: 'phase.completed',
  },
  PLAYER: {
    ELIMINATED: 'player.eliminated',
  },
  SHADOW_SURGE: {
    ACTIVATED: 'shadow_surge.activated',
  },
};
```

**Acceptance Criteria:**
- [ ] All event types defined as string constants
- [ ] Organized in nested object structure
- [ ] Exported for component import
- [ ] Prevents typos in event names
- [ ] Extendable for future events

---

### ARCH-3: Create Event Hook for Components
**File:** `src/hooks/useGameplayEvents.ts`
**Dependencies:** GameplayEventBus
**Time:** 1 hour

```typescript
export function useGameplayEvents() {
  // Subscribe to event
  const on = (type: string, listener: GameplayEventListener): (() => void)
  
  // Emit event
  const emit = (type: string, payload?: Record<string, unknown>): void
}
```

**Acceptance Criteria:**
- [ ] Hook provides on() for subscribing
- [ ] Hook provides emit() for publishing
- [ ] Cleanup: unsubscribe on component unmount
- [ ] Multiple listeners don't interfere
- [ ] Handles missing listeners gracefully
- [ ] No memory leaks from subscriptions

**Reference:** Objective §10

---

## Phase 2: Live Timer Refinement

### TIMER-1: Audit Current Timer Implementation
**File:** `src/components/gameplay/hud/GameTimer.tsx` (or similar)
**Dependencies:** None
**Time:** 1 hour

**Current State Discovery:**
- [ ] Read current timer component
- [ ] Identify source of time data (store? state? API?)
- [ ] Check if using local countdown logic
- [ ] Check if reading server time
- [ ] Identify all places timer value comes from
- [ ] Check update frequency (every ms? every 100ms?)
- [ ] Check phase transition logic

**Report:**
- How is timer currently implemented?
- What is the source of truth?
- Where are phase durations read?
- How often does it sync with server?

---

### TIMER-2: Implement Server Time Sync
**File:** `src/hooks/useServerTime.ts` (refine existing)
**Dependencies:** useSessionStore
**Time:** 1.5 hours

**Verify/Enhance:**
- [ ] On component mount: fetch `/api/server-time`
- [ ] Calculate drift: `drift = Date.now() - serverTime`
- [ ] Export function: `now()` returns `Date.now() - drift`
- [ ] Export function: `getCountdown(expiresAt)` returns remaining ms
- [ ] Resync every 30 seconds
- [ ] Handle fetch failures (use last known drift)
- [ ] Clean up sync timer on unmount

**Acceptance Criteria:**
- [ ] now() always accurate to ±100ms
- [ ] Drift recalculated every 30 seconds
- [ ] Countdown reaches 0 exactly (never negative)
- [ ] No time jumps on reconnect
- [ ] Memory leak free

**Reference:** Objective §1

---

### TIMER-3: Wire Timer to Session Phase Data
**File:** `src/components/gameplay/hud/GameTimer.tsx`
**Dependencies:** useSessionStore, useServerTime
**Time:** 2 hours

**Requirements:**
- [ ] Read currentPhase from session store
- [ ] Read phaseEndTime from session store
- [ ] Use serverTime.getCountdown(phaseEndTime)
- [ ] Update every 100ms (not constantly)
- [ ] Display remaining time in format: MM:SS or 00:15
- [ ] When countdown reaches 0: wait for backend phase update
- [ ] DO NOT manually trigger phase transition
- [ ] Listen for phase.started event
- [ ] When phase changes: show phase intro animation

**Acceptance Criteria:**
- [ ] Timer always shows accurate live remaining time
- [ ] Stays synced within ±100ms
- [ ] Phase transitions triggered by backend
- [ ] All players see same countdown ±200ms
- [ ] Handles reconnects without reset
- [ ] Smooth countdown (no jumps)

**Reference:** Objective §1, §7

---

### TIMER-4: Verify Phase Transition from Backend
**File:** `src/stores/useSessionStore.ts` (verify)
**Dependencies:** Real-time events
**Time:** 1.5 hours

**Verify:**
- [ ] Session store listens for backend phase updates
- [ ] Updates currentPhase on `phase:changed` event
- [ ] Updates phaseEndTime on `phase:changed` event
- [ ] Emits gameplayEventBus.emit('phase.started', {...})
- [ ] Frontend never sets phase manually
- [ ] Phase transitions only from backend events
- [ ] No fallback phase transitions

**Acceptance Criteria:**
- [ ] Phase transitions only via backend
- [ ] All players transition simultaneously
- [ ] Event emitted for phase intro animation
- [ ] No hardcoded phase numbers

**Reference:** Objective §1, §6, §7

---

## Phase 3: Squad Panel Refinement

### SQUAD-1: Audit Current Squad Panel
**File:** `src/components/gameplay/hud/SquadPanel.tsx`
**Dependencies:** None
**Time:** 1 hour

**Current State Discovery:**
- [ ] Read component source
- [ ] Where does squad data come from?
- [ ] Where does ranking come from?
- [ ] Is it polling? Real-time? Cached?
- [ ] How often does it update?
- [ ] What fields are displayed?
- [ ] Are any hardcoded fallback values?
- [ ] How are members tracked?

**Report:**
- Current data sources?
- Update frequency?
- Any stale data issues?
- Missing fields from Objective §2?

---

### SQUAD-2: Create Squad Panel Store Selectors
**File:** `src/stores/useSquadStore.ts` (enhance)
**Dependencies:** useLeaderboardStore, useSessionStore
**Time:** 1.5 hours

**Add Methods:**
- [ ] `getMySquadRank()` - read from leaderboard store
- [ ] `getMySquadTokens()` - sum from leaderboard store
- [ ] `getMySquadMembersAlive()` - count from session store
- [ ] `getMySquadTotalMembers()` - from squad data
- [ ] `getMySquadPosition()` - from phase progress
- [ ] `getTopSquad()` - read from leaderboard store (rank 1)
- [ ] `getOnlineMembers()` - track connected members
- [ ] `getVoiceRoomStatus()` - from voice service

**Acceptance Criteria:**
- [ ] All methods read from backend data (no calculations)
- [ ] Real-time selectors (update on store changes)
- [ ] No mock data
- [ ] Null-safe (handle missing data gracefully)

**Reference:** Objective §2

---

### SQUAD-3: Wire Squad Panel to Live Data
**File:** `src/components/gameplay/hud/SquadPanel.tsx`
**Dependencies:** useSquadStore, useLeaderboardStore, useSessionStore, gameplayEventBus
**Time:** 2 hours

**My Squad Section:**
- [ ] Display squad name from store
- [ ] Display rank: `useLeaderboardStore(s => s.squad[0]?.rank ?? '-')`
- [ ] Display total tokens: `sum(squad[i].squad_tokens)`
- [ ] Display alive members: `getMySquadMembersAlive()`
- [ ] Display total members: `squad.member_count`
- [ ] Display position (progress bar)
- [ ] Display online members count
- [ ] Display voice room status

**Top Squad Section:**
- [ ] Get top squad: `leaderboard.squad[0]`
- [ ] Display squad name
- [ ] Display rank: 1
- [ ] Display tokens: `squad_tokens`
- [ ] Display alive members: `member_count` (or live count)
- [ ] Display position

**Success Criteria:**
- [ ] All data from backend stores
- [ ] No hardcoded values
- [ ] Updates real-time on leaderboard changes
- [ ] Smooth animations on rank changes
- [ ] Handles null/missing data

**Reference:** Objective §2

---

### SQUAD-4: Implement Smooth Rank Update Animation
**File:** `src/components/gameplay/hud/SquadPanel.tsx`
**Dependencies:** framer-motion
**Time:** 1.5 hours

**When Rank Changes:**
- [ ] Detect rank change (compare prev vs current)
- [ ] Animate transition: fade + slide
- [ ] Show rank change badge (+1, -2, etc) briefly
- [ ] Play sound: `gameplayEventBus.emit('squad.rankChanged', {oldRank, newRank})`
- [ ] Animation duration: 600ms

**Acceptance Criteria:**
- [ ] Rank changes animate smoothly
- [ ] Direction indicator shown (up/down)
- [ ] Sound hook emitted for audio system
- [ ] No layout shift
- [ ] 60 FPS performance

**Reference:** Objective §2, §10

---

## Phase 4: Wheel & Outcome Refinement

### WHEEL-1: Audit Current Wheel Implementation
**File:** `src/components/gameplay/hud/WheelHUD.tsx`
**Dependencies:** None
**Time:** 1 hour

**Current State Discovery:**
- [ ] How many segments? (should be 5)
- [ ] Are segments equal? (should be 20% each)
- [ ] Where does outcome come from?
- [ ] Is outcome determined on frontend?
- [ ] How is animation triggered?
- [ ] What happens after spin?
- [ ] Is there a reveal sequence?
- [ ] Are token rewards animated?

**Report:**
- Current segment count?
- Segment sizes equal?
- Where is outcome determined?
- Animation flow?

---

### WHEEL-2: Verify 5 Equal Segments & Outcomes
**File:** `src/components/gameplay/hud/WheelHUD.tsx`
**Dependencies:** None
**Time:** 1.5 hours

**Verify Segments:**
- [ ] Exactly 5 segments
- [ ] Each 20% of circumference (360° / 5 = 72° each)
- [ ] Labels: ADVANCE, ACQUIRE, DISCOVER, STEAL, VOID
- [ ] No hardcoded outcome calculation
- [ ] Segments visually equal (CSS/SVG check)

**Backend Outcome Flow:**
- [ ] Spin button click → POST `/api/gameplay/spin`
- [ ] Backend returns: `{ outcome: 'advance' | 'acquire' | ... }`
- [ ] Frontend receives outcome
- [ ] Wheel rotates to that segment
- [ ] Reveals outcome

**Acceptance Criteria:**
- [ ] Exactly 5 segments
- [ ] All equal size
- [ ] No frontend randomness
- [ ] Outcome always from backend
- [ ] Wheel lands on returned outcome

**Reference:** Objective §3

---

### WHEEL-3: Implement Outcome Reveal Animation System
**File:** `src/components/gameplay/hud/OutcomeReveal.tsx` (create)
**Dependencies:** framer-motion, gameplayEventBus
**Time:** 2.5 hours

**Create Outcome Reveal Component:**

```typescript
interface OutcomeRevealProps {
  outcome: 'advance' | 'acquire' | 'discover' | 'steal' | 'void';
  amount?: number; // tokens
  onComplete: () => void;
}
```

**Each Outcome Unique Animation:**

- **ADVANCE**
  - Icon: upward arrow / progress indicator
  - Color: gold
  - Animation: scale up from center + upward bounce
  - Duration: 1.5s
  - Sound: energetic, triumphant
  - Exit: scale out upward

- **ACQUIRE**
  - Icon: token with +
  - Color: blue/cyan
  - Animation: scale + gentle sparkle particles
  - Duration: 1.5s
  - Sound: soft chime, coin collect
  - Exit: shrink + fade

- **DISCOVER**
  - Icon: question mark / lightbulb
  - Color: purple/blue
  - Animation: scale + rotate + pulse glow
  - Duration: 1.5s
  - Sound: mysterious, discovery reveal
  - Exit: shimmer out

- **STEAL**
  - Icon: target with crosshairs / stealing hand
  - Color: red / orange
  - Animation: aggressive shake + scale
  - Duration: 1.5s
  - Sound: warning beep, impact
  - Exit: red flash fade

- **VOID**
  - Icon: X or cross
  - Color: grey
  - Animation: subtle scale + dull fade
  - Duration: 1s
  - Sound: soft miss/fail sound
  - Exit: immediate fade

**Acceptance Criteria:**
- [ ] Each outcome has unique visual identity
- [ ] Animation duration 1-1.5s
- [ ] Sound hook emitted: `spin.outcome.{type}`
- [ ] onComplete callback when animation finishes
- [ ] 60 FPS smooth animation
- [ ] Works on mobile and desktop

**Reference:** Objective §4

---

### WHEEL-4: Implement Token Collection Animation
**File:** `src/components/gameplay/hud/TokenCollection.tsx` (create)
**Dependencies:** framer-motion, gameplayEventBus
**Time:** 2 hours

**Animation Flow:**
1. Outcome reveal plays
2. Token particles spawn at wheel center
3. Particles animate to Token Counter (upper right HUD)
4. On arrival:
   - Play collection sound
   - Increment token count
   - Counter bounces/pulses
5. Token count must NOT update before animation

**Implementation:**
- [ ] Create TokenCollection component
- [ ] Particle animation: Bezier curve from center to counter
- [ ] Particle count = token amount (max 10, group larger amounts)
- [ ] Duration: 1-1.5 seconds
- [ ] Counter update ONLY on animation complete
- [ ] Sound hook: `tokens.collected`

**Acceptance Criteria:**
- [ ] Particles travel smoothly
- [ ] Counter updates only after animation
- [ ] Sound plays at impact
- [ ] No premature value changes
- [ ] Works with any token amount
- [ ] 60 FPS performance

**Reference:** Objective §5

---

## Phase 5: Phase Transitions

### PHASE-1: Read Phase Configuration from Backend
**File:** `src/stores/useSessionStore.ts` (enhance)
**Dependencies:** None
**Time:** 1.5 hours

**On Session Start:**
- [ ] Fetch session data: GET `/api/gameplay/session/{sessionId}`
- [ ] Extract `phases` array from response
- [ ] Store phase metadata:
  ```typescript
  interface Phase {
    id: string;
    number: number;
    name: string;
    description?: string;
    duration_ms: number;
    elimination_rules?: object;
    special_settings?: object;
  }
  ```
- [ ] Store `phases: Phase[]` in session store
- [ ] Store `currentPhaseIndex: number`
- [ ] Store `phaseEndTime: string` (ISO)

**Acceptance Criteria:**
- [ ] Phases read from backend on session start
- [ ] No hardcoded phases anywhere
- [ ] Support any number of phases (2, 4, 6, 10+)
- [ ] Null-safe (handle missing phase data)

**Reference:** Objective §6, §9

---

### PHASE-2: Implement Phase Intro Animation
**File:** `src/components/gameplay/hud/PhaseIntro.tsx` (create)
**Dependencies:** framer-motion, gameplayEventBus
**Time:** 1.5 hours

**Trigger:** When `phase.started` event emitted

**Animation Flow:**
1. Pause gameplay briefly (300ms)
2. Dark overlay fades in
3. Center card animates from edges:
   - Slides from top/bottom
   - Rotates slightly
   - Scales into view
4. Display:
   - Phase number: `Phase ${phase.number}`
   - Phase name: `${phase.name}` (from backend)
   - Phase description: `${phase.description}` (if provided)
5. Hold for 2-3 seconds
6. Fade and scale out
7. Resume gameplay

**Acceptance Criteria:**
- [ ] Data from backend (not hardcoded)
- [ ] Smooth cinematic animation
- [ ] Sound hook emitted: `phase.started`
- [ ] Total duration: 2-3 seconds
- [ ] Works with any phase name/description

**Reference:** Objective §7

---

### PHASE-3: Implement Phase End Animation
**File:** `src/components/gameplay/hud/PhaseEnd.tsx` (create)
**Dependencies:** framer-motion, gameplayEventBus
**Time:** 1.5 hours

**Trigger:** When phase time reaches 0 and backend confirms phase end

**Animation Flow:**
1. Celebration effect (confetti or particles)
2. Center overlay shows:
   - "PHASE COMPLETE"
   - Optional: elimination summary from backend
   - Brief animation
3. Hold for 1-2 seconds
4. Smooth transition to next phase
5. Phase intro animation begins for next phase

**Acceptance Criteria:**
- [ ] No abrupt phase switching
- [ ] Smooth transition overlay
- [ ] Optional elimination summary from backend
- [ ] Sound hook emitted: `phase.completed`
- [ ] Total duration: 1-2 seconds

**Reference:** Objective §8

---

### PHASE-4: Connect Phase Events to Animations
**File:** `src/app/(player)/play/[sessionId]/page.tsx` (integrate)
**Dependencies:** Phase intro/end components, gameplayEventBus
**Time:** 1 hour

**Integration:**
- [ ] Listen for `phase.started` event
- [ ] Show PhaseIntro component
- [ ] Wait for completion
- [ ] Listen for `phase.completed` event
- [ ] Show PhaseEnd component
- [ ] Transition to next phase

**Acceptance Criteria:**
- [ ] Phase transitions cinematic
- [ ] Animations don't block state sync
- [ ] Works with any number of phases
- [ ] Smooth flow without jarring changes

**Reference:** Objective §7, §8

---

## Phase 6: Sound System Integration

### SOUND-1: Emit All Gameplay Events
**File:** Various gameplay components
**Dependencies:** gameplayEventBus
**Time:** 2 hours

**Events to Emit:**

From Wheel/Spin System:
- [ ] `spin.started` - when spin button clicked
- [ ] `spin.completed` - when spin animation finishes
- [ ] `spin.outcome.advance` - wheel reveals ADVANCE
- [ ] `spin.outcome.acquire` - wheel reveals ACQUIRE
- [ ] `spin.outcome.discover` - wheel reveals DISCOVER
- [ ] `spin.outcome.steal` - wheel reveals STEAL
- [ ] `spin.outcome.void` - wheel reveals VOID

From Token System:
- [ ] `tokens.collected` - token animation reaches counter

From Phase System:
- [ ] `phase.started` - new phase begins
- [ ] `phase.completed` - phase ends

From Player System:
- [ ] `player.eliminated` - player is eliminated
- [ ] `shadow_surge.activated` - shadow surge begins

**Payload Structure:**
```typescript
{
  type: 'spin.outcome.advance',
  timestamp: Date.now(),
  payload: {
    outcome: 'advance',
    amount: 3,
    playerId: 'user123',
    sessionId: 'session456',
  }
}
```

**Acceptance Criteria:**
- [ ] All events emitted at correct times
- [ ] Payload includes relevant data
- [ ] Sound system can subscribe independently
- [ ] No hardcoded sound playback in gameplay code

**Reference:** Objective §10

---

### SOUND-2: Create Sound System Hook (Template)
**File:** `src/hooks/useSoundSystem.ts` (example for sound dev)
**Dependencies:** gameplayEventBus
**Time:** 1 hour

**Example Hook:**
```typescript
export function useSoundSystem() {
  useEffect(() => {
    const unsubscribe = gameplayEventBus.on('spin.outcome.advance', (event) => {
      playSound('advance-reward', { volume: 0.8 });
    });
    
    return () => unsubscribe();
  }, []);
}
```

**Acceptance Criteria:**
- [ ] Example hook demonstrates subscription
- [ ] Shows how to access payload
- [ ] Ready for dedicated sound developer
- [ ] No sound playback in gameplay code

**Reference:** Objective §10, Comment "sound system next"

---

## Phase 7: Performance & Cleanup

### PERF-1: Audit Animation Frame Rate
**File:** All animation components
**Dependencies:** Performance monitoring
**Time:** 1.5 hours

**Check:**
- [ ] Outcome reveal animations: 60 FPS
- [ ] Token collection animation: 60 FPS
- [ ] Squad panel updates: 60 FPS
- [ ] Timer countdown: smooth (no jumps)
- [ ] Phase animations: 60 FPS

**Tools:**
- Chrome DevTools Performance tab
- React Profiler
- Frame rate monitor

**Acceptance Criteria:**
- [ ] All animations maintain 60 FPS
- [ ] No dropped frames during active gameplay
- [ ] GPU acceleration used where possible

---

### PERF-2: Implement Animation Queue System
**File:** `src/lib/animation/AnimationQueue.ts`
**Dependencies:** None
**Time:** 1.5 hours

**Purpose:** Prevent animation collisions

```typescript
class AnimationQueue {
  queue: AnimationJob[] = [];
  isPlaying = false;
  
  add(job: AnimationJob): Promise<void>
  
  private play(): Promise<void>
}
```

**Usage:**
- Multiple spin results in quick succession → queue them
- Phase transition while outcome revealing → queue next phase
- Token animation while phase intro playing → queue after

**Acceptance Criteria:**
- [ ] Animations don't overlap
- [ ] Queue FIFO order
- [ ] Each animation completes fully
- [ ] Prevents UI collision chaos

---

### PERF-3: Test Memory Leaks
**File:** `src/hooks/` (all custom hooks)
**Dependencies:** Performance tools
**Time:** 1.5 hours

**Check:**
- [ ] No memory growth over 5 minute session
- [ ] Event unsubscribes cleanup properly
- [ ] Timers cleared on unmount
- [ ] DOM elements removed correctly

**Tools:**
- Chrome DevTools Memory tab
- Heap snapshots
- Allocation timeline

**Acceptance Criteria:**
- [ ] Memory stable over time
- [ ] No reference leaks
- [ ] Cleanup functions working

---

## Phase 8: Validation & Testing

### VAL-1: Create Validation Checklist
**File:** `GAMEPLAY_REFINEMENT_VALIDATION.md`
**Dependencies:** All phases complete
**Time:** 1 hour

**Checklist Sections:**

**Timer Validation:**
- [ ] Timer displays live time
- [ ] Stays synced with server
- [ ] Phase transitions from backend
- [ ] All players see same time
- [ ] Reconnect doesn't reset

**Squad Panel Validation:**
- [ ] My Squad updates real-time
- [ ] Top Squad shows current leader
- [ ] Rankings never stale
- [ ] Smooth rank change animations
- [ ] No hardcoded fallback values

**Wheel Validation:**
- [ ] Exactly 5 equal segments
- [ ] All outcomes correct (ADVANCE, ACQUIRE, DISCOVER, STEAL, VOID)
- [ ] Outcomes from backend only
- [ ] No frontend randomness
- [ ] Wheel always lands on server result

**Animation Validation:**
- [ ] Each outcome has unique reveal (different colors, animations, sounds)
- [ ] Token animation to counter
- [ ] Phase intro cinematic
- [ ] Phase end animation
- [ ] 60 FPS smooth throughout

**Backend Authority Validation:**
- [ ] No hardcoded phases
- [ ] Phase config from backend
- [ ] Works with any phase count
- [ ] Phase metadata displayed correctly
- [ ] Admin changes auto-adapt

**Event & Sound Validation:**
- [ ] All major events emitted
- [ ] Sound system can subscribe independently
- [ ] Animation system can subscribe independently
- [ ] No tight coupling
- [ ] Extensible for future systems

**Performance Validation:**
- [ ] 60 FPS animations
- [ ] Smooth state synchronization
- [ ] Memory stable
- [ ] No UI freezing
- [ ] Responsive controls

---

### VAL-2: Manual Testing Scenarios
**File:** Test scenarios (markdown)
**Dependencies:** Complete implementation
**Time:** 2 hours (testing)

**Scenario 1: Complete Spin Flow**
- [ ] Join session
- [ ] Click SPIN
- [ ] Backend processes
- [ ] Wheel animates to outcome
- [ ] Outcome reveal plays
- [ ] Token animation completes
- [ ] Token counter updates

**Scenario 2: Phase Transition**
- [ ] Watch phase countdown
- [ ] Phase ends
- [ ] Phase end animation plays
- [ ] Phase intro plays for next phase
- [ ] Gameplay resumes

**Scenario 3: Real-Time Squad Updates**
- [ ] Watch squad rank (should change dynamically)
- [ ] Watch member count update
- [ ] Watch token total change
- [ ] Animations smooth

**Scenario 4: Rapid Events**
- [ ] Spin multiple times quickly
- [ ] Animations queue properly
- [ ] No overlapping overlays
- [ ] All outcomes land correctly

**Scenario 5: Reconnection**
- [ ] Kill network connection
- [ ] Offline indicator appears
- [ ] Reconnect network
- [ ] State refreshes
- [ ] No duplicate events
- [ ] Timer resyncs

---

### VAL-3: Create Performance Report
**File:** `PERFORMANCE_REPORT.md`
**Dependencies:** Performance audits complete
**Time:** 1 hour

**Sections:**
- Frame rates by system (timer, squad panel, animations)
- Memory usage baseline and growth
- Event emission count per session minute
- Network request count per session minute
- Reconnection recovery time
- Animation frame drops (if any)

---

## Timeline & Priority

### High Priority (Week 1)
- [ ] ARCH-1: Event Bus Core
- [ ] TIMER-2 to 4: Timer Refinement
- [ ] SQUAD-1 to 3: Squad Panel Core
- [ ] WHEEL-1 to 2: Wheel Verification

### Medium Priority (Week 2)
- [ ] WHEEL-3: Outcome Reveal Animation
- [ ] WHEEL-4: Token Collection Animation
- [ ] PHASE-1 to 4: Phase System
- [ ] SOUND-1 to 2: Sound Integration

### Lower Priority (Week 3)
- [ ] PERF-1 to 3: Performance Optimization
- [ ] VAL-1 to 3: Validation & Testing

---

## Success Criteria Summary

✅ **Timer:** Live, synced, backend-driven
✅ **Squad Panel:** Real-time, no stale data
✅ **Wheel:** 5 equal segments, backend outcomes
✅ **Reveals:** Unique animations per outcome
✅ **Tokens:** Animated to counter
✅ **Phases:** Dynamic from backend config
✅ **Animations:** 60 FPS, queued, non-blocking
✅ **Events:** Emitted for all major gameplay actions
✅ **Sound:** Decoupled, event-driven, ready for dedicated system
✅ **Performance:** Memory stable, 60 FPS, responsive

---

## Notes for Implementation

1. **Do Not:**
   - Redesign the UI
   - Introduce hardcoded values
   - Calculate game logic
   - Make gameplay decisions

2. **Do:**
   - Use backend data exclusively
   - Emit events for animations/sounds
   - Keep components dumb (visualization only)
   - Verify every number comes from server

3. **Testing:**
   - Manual testing more important than unit tests
   - Focus on user experience
   - Test edge cases: rapid events, reconnects, etc

4. **Future-Proofing:**
   - Event bus makes adding haptics, analytics easy
   - Phase system supports unlimited phases
   - Sound system can plug in without changes
   - Animation system can extend easily
