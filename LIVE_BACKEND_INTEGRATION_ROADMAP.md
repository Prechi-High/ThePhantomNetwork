# THE PHANTOM — Live Backend Integration Roadmap

**Status:** Implementation Planning Document  
**Version:** 1.0  
**Created:** 2025-01-15  
**Target Completion:** 5-6 Development Days

---

## Executive Summary

This document provides a detailed implementation roadmap for integrating live backend data into THE PHANTOM gameplay components. Currently, components display mock/placeholder data. This roadmap specifies exact changes needed to consume live data from backend APIs and real-time WebSocket events, ensuring 100% of gameplay data comes from the server with no fallback values.

**Key Objectives:**
- Replace all mock data with live backend data
- Ensure real-time synchronization of gameplay state
- Implement proper error handling and offline resilience
- Verify animations trigger at correct moments with live data
- Document exact component-to-API mappings

---

## 1. COMPONENT FIXES NEEDED

### 1.1 WheelHUD Component

**File:** `src/components/gameplay/hud/WheelHUD.tsx`

**Current State:** Displays spinning wheel animation with mock outcome results

**Live Data Requirements:**

| Data | Source | API/Event | Update Frequency |
|------|--------|-----------|------------------|
| Wheel segments | Backend config | `GET /api/gameplay/wheel-config` | On session start |
| Current spin state | Gameplay engine | `spin_result` WebSocket event | Immediate |
| Spin outcome | Gameplay server | Real-time event emission | Per spin |
| Animation duration | Configuration | Backend constant | Per session |
| Next spin availability | Backend | `spin_ready` event | Per outcome reveal |

**Current Issues:**
- Outcome hardcoded to fixed results (ADVANCE, ACQUIRE, DISCOVER, STEAL, VOID)
- Animation duration not tied to backend spin duration (8 seconds)
- No validation that displayed outcome matches backend result
- Missing animation trigger for outcome reveal

**Required Changes:**
1. Remove mock outcome generation
2. Subscribe to `spin_result` WebSocket event with full outcome data
3. Validate outcome against backend before animating
4. Trigger OutcomeReveal animation only after backend confirms result
5. Track spin state: `spinning` → `awaiting_outcome` → `outcome_reveal` → `ready`

**Dependencies:**
- `useRealtimeSession` hook (already exists, needs enhancement)
- `useGameplayStore` (update to accept full outcome objects)
- Real-time WebSocket service

---

### 1.2 TopHUD Component

**File:** `src/components/gameplay/hud/TopHUD.tsx`

**Current State:** Displays timer, tokens, rank, player info with fallback values

**Live Data Requirements:**

| Data | Source | API/Event | Update Frequency |
|------|--------|-----------|------------------|
| Phase timer | Backend | `phase_change` event + polling | Every second |
| Current tokens | Backend | `tokens_updated` event | Real-time |
| Player rank | Leaderboard service | Polling `/api/gameplay/leaderboard` | Every 2 seconds |
| Total players | Session data | `GET /api/session/{id}` | On load |
| Player alive status | Backend | `elimination` event | On elimination |
| Surge percent | Dynamic calculation | Backend broadcast | Per 10 seconds |

**Current Issues:**
```typescript
// Current bad patterns:
tokens || 24.5  // Fallback value
playerRank || 7  // Fallback value
totalPlayers || 28  // Fallback value
surgePercent = hardcoded 45  // No live data
```

**Required Changes:**
1. Remove all `||` and `??` fallback values for numbers
2. Replace timer with server-synced countdown from `phaseEndsAt`
3. Connect tokens display to `useGameplayStore` (tokens field must come from backend)
4. Connect rank display to `useLeaderboardStore` (fetch from leaderboard API)
5. Show loading skeleton until all data arrives
6. Display "Live" badge when all data is synced

**Dependencies:**
- `useLeaderboardStore` (must fetch from API)
- `useServerTime` hook (for phase timer sync)
- `useRealtimeSession` (for token updates)

---

### 1.3 LiveFeedPeek Component

**File:** `src/components/gameplay/LiveFeedPeek.tsx`

**Current State:** Displays recent events with mock EVENT_POOL constant

**Live Data Requirements:**

| Data | Source | API/Event | Update Frequency |
|------|--------|-----------|------------------|
| Event list | Backend | `GET /api/gameplay/livefeed` | Initial + polling |
| Real-time events | WebSocket | `livefeed:event` broadcast | Immediate |
| Event details | Backend | Included in event payload | Per event |
| Timestamps | Backend | Event.created_at | Real-time |

**Current Issues:**
```typescript
// Current bad pattern:
const EVENT_POOL = [
  { id: 'event-1', type: 'steal', actor: 'Player_A', ... },
  // hardcoded mock events
];
```

**Required Changes:**
1. Delete `EVENT_POOL` constant completely
2. Call `useLiveFeedUpdates(subSessionId)` hook on mount
3. Subscribe to `useLiveFeedStore`: `events = store(s => s.events)`
4. Display max 5 most recent events (reverse chronological)
5. Show event: `actor.username` → `event.type` → `target.username` (if applicable)
6. Show relative timestamps (e.g., "2s ago")
7. Remove any random shuffling or filtering logic

**Dependencies:**
- `useLiveFeedStore` (must be populated by backend)
- `useLiveFeedUpdates` hook (creates subscription)

---

### 1.4 SkillDock Component

**File:** `src/components/gameplay/SkillDock.tsx`

**Current State:** Displays 5 hardcoded skills with mock availability

**Live Data Requirements:**

| Data | Source | API/Event | Update Frequency |
|------|--------|-----------|------------------|
| Player skills | Backend | `GET /api/player/inventory` | On session start + polling |
| Skill availability | Backend | `skill:available` event | Per cooldown expiry |
| Skill cooldown | Backend | Included in inventory | Every 100ms (calculated) |
| Skill charges | Backend | `skill:charged` event | Per charge gain |

**Current Issues:**
```typescript
// Current bad pattern:
const SKILLS = [
  { id: 'shield', name: 'Shield', owned: true, cooldown: 0 },
  // hardcoded skill definitions
];
```

**Required Changes:**
1. Delete hardcoded `SKILLS` array
2. Call `useInventoryUpdates(currentUserId, subSessionId)` hook
3. Subscribe to `useInventoryStore`: `skills = store(s => s.skills)`
4. Filter to display only: `skill.owned === true`
5. For each skill calculate state:
   - `'locked'` if not owned
   - `'ready'` if available and not on cooldown
   - `'cooldown'` if on cooldown
6. Show countdown timer updating every 100ms during cooldown
7. Display charge count if `max_charges > 1`
8. Subscribe to `skill:available` and `skill:charged` events to update store

**Dependencies:**
- `useInventoryStore` (live server time sync required)
- `useInventoryUpdates` hook
- `useServerTime` hook (for cooldown countdown calculation)

---

### 1.5 ActiveEffectsBar Component

**File:** `src/components/gameplay/ActiveEffectsBar.tsx`

**Current State:** Shows 3 hardcoded active effects with mock durations

**Live Data Requirements:**

| Data | Source | API/Event | Update Frequency |
|------|--------|-----------|------------------|
| Active effects | Backend | `GET /api/player/effects` | On session start |
| Effect activation | Backend | `effect:activated` event | Real-time |
| Effect expiration | Backend | `effect:expired` event | Real-time |
| Effect duration | Backend | Calculated from started_at + duration_ms | Per 100ms |

**Current Issues:**
```typescript
// Current bad pattern:
const INITIAL_EFFECTS = [
  { id: 'shield-1', name: 'Shield', duration: 45000, icon: '🛡️' },
  // hardcoded initial effects
];
```

**Required Changes:**
1. Delete `INITIAL_EFFECTS` constant
2. Call `useEffectsUpdates(currentUserId, subSessionId)` hook
3. Subscribe to `useEffectsStore`: `effects = store(s => s.effects)`
4. Call `useServerTime()` to get synced server time
5. For each effect, calculate remaining: `effect.getTimeRemaining()`
6. Update countdown every 100ms for smooth animation
7. Auto-remove effects when remaining < 0
8. Subscribe to `effect:activated` to add new effects to store
9. Subscribe to `effect:expired` to remove effects from store

**Dependencies:**
- `useEffectsStore`
- `useEffectsUpdates` hook
- `useServerTime` hook

---

### 1.6 Leaderboard Component

**File:** `src/components/gameplay/hud/Leaderboard.tsx` (create if doesn't exist)

**Current State:** Does not exist or not connected to live data

**Live Data Requirements:**

| Data | Source | API/Event | Update Frequency |
|------|--------|-----------|------------------|
| Individual rankings | Backend | `GET /api/gameplay/leaderboard?type=individual` | Every 2 seconds |
| Squad rankings | Backend | `GET /api/gameplay/leaderboard?type=squad` | Every 2 seconds |
| Rank changes | WebSocket | `leaderboard:updated` event | Real-time |
| Player status | Backend | `alive` field | Per 2 seconds |

**Required Changes:**
1. Create component if missing
2. Call `useLeaderboardUpdates(subSessionId)` hook
3. Subscribe to store: `individual = store(s => s.individual)`, `squad = store(s => s.squad)`
4. Accept prop: `view: 'individual' | 'squad'`
5. Render appropriate array based on view
6. Display: rank, username, tokens, alive status
7. For squad view: show member count, leader name
8. Highlight current player row
9. Animate rank changes (slide effect when moving up/down)

**Dependencies:**
- `useLeaderboardStore` (live polling required)
- `useLeaderboardUpdates` hook

---

### 1.7 SquadPanel Component

**File:** `src/components/gameplay/SquadPanel.tsx` (create if doesn't exist)

**Current State:** Does not exist or not properly connected

**Live Data Requirements:**

| Data | Source | API/Event | Update Frequency |
|------|--------|-----------|------------------|
| Squad members | Backend | `GET /api/squad/members?subSessionId={id}` | On load |
| Member status | Backend | `member_status` event | Real-time |
| Member tokens | Backend | Included in member object | Per 2 seconds |
| Member alive status | Backend | `elimination` event | On elimination |
| Squad pool | Backend | Session data | Per 2 seconds |

**Required Changes:**
1. Create component if missing
2. Fetch squad member list on session start
3. Display each member: name, tokens, status (alive/eliminated/reviving)
4. Show squad token pool
5. Subscribe to member status updates via WebSocket
6. Show revive UI if member is revivable (40-59 token range in Phase 1)
7. Connect revive contribution buttons to backend API

**Dependencies:**
- `useSquadStore` (live member updates)
- `useRealtimeSession` (member status events)

---

### 1.8 RevivePanel Component

**File:** `src/components/gameplay/RevivePanel.tsx`

**Current State:** Shows mock revive flow without backend integration

**Live Data Requirements:**

| Data | Source | API/Event | Update Frequency |
|------|--------|-----------|------------------|
| Revivable teammates | Backend | Phase end calculation | Per phase end |
| Required tokens | Backend | Config (always 3) | Static |
| Contributed tokens | Backend | Real-time updates | Immediate |
| Revive status | Backend | `revive:completed` event | Immediate |

**Required Changes:**
1. Connect to backend revive status
2. Display revivable teammates (40-59 token range after Phase 1/2/3)
3. Show: required = 3, contributed = X, remaining = Y
4. Allow player to contribute 1, 2, or 3 tokens via buttons
5. POST to `/api/gameplay/revive/contribute` when contributing
6. Subscribe to `revive:status_updated` event
7. Show contribution from each squad member in real-time
8. Disable contribute button when personal tokens insufficient
9. Show success toast when revive completes

**Dependencies:**
- Backend `/api/gameplay/revive/` endpoints
- `useRealtimeSession` (revive events)
- `useGameplayStore` (player tokens)

---

### 1.9 OutcomeReveal Component

**File:** `src/components/gameplay/OutcomeReveal.tsx`

**Current State:** Static animation without outcome data binding

**Live Data Requirements:**

| Data | Source | API/Event | Update Frequency |
|------|--------|-----------|------------------|
| Outcome type | Backend | `spin_result` event | Per spin |
| Outcome amount | Backend | `spin_result.value` | Per spin |
| Animation trigger | Frontend | After `spin_result` received | Per spin |

**Required Changes:**
1. Remove hardcoded outcome data
2. Accept outcome as prop from parent (GameplayArena)
3. Animate based on outcome type:
   - `ADVANCE`: Green glow, +3 token animation
   - `ACQUIRE`: Blue pulse, +1 token animation
   - `DISCOVER`: Purple sparkle, +0.5 token animation
   - `STEAL`: Red attack, token loss animation
   - `VOID`: Gray fade, no change animation
4. Trigger animation only after backend confirms
5. Duration: 2-3 seconds per animation
6. Play audio cue matching outcome type
7. Wait for animation complete before enabling next spin

**Dependencies:**
- Real-time outcome event
- Animation library (Framer Motion or Three.js)

---

### 1.10 PhaseTransition Components

**File:** `src/components/gameplay/PhaseTransition.tsx`

**Current State:** Shows phase change without syncing to backend

**Live Data Requirements:**

| Data | Source | API/Event | Update Frequency |
|------|--------|-----------|------------------|
| Phase number | Backend | `phase_change` event | Per phase change |
| Phase name | Backend | Config + phase number | Static per session |
| Phase duration | Backend | Config | Static per session |
| Player status | Backend | Elimination calculation | Per phase end |
| Next phase delay | Backend | Config | Static |

**Required Changes:**
1. Trigger animation only on `phase_change` WebSocket event
2. Show current phase: `Phase {phase} - {phaseName}`
3. Show duration: e.g., "6 Minutes"
4. Show elimination breakdown:
   - Players eliminated
   - Players advancing
   - Revivable players (if applicable)
5. Auto-advance after delay (backend-specified)
6. If player is eliminated: show "You've been Eliminated" with revive option

**Dependencies:**
- `phase_change` event from backend
- `useGameplayStore` (phase data)



---

## 2. DATA FLOW DIAGRAM

### Complete Real-Time Event Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND GAMEPLAY ENGINE                                         │
│                                                                   │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Session State Machine                                      │   │
│ │  - Current Phase (1-4)                                     │   │
│ │  - Round number                                            │   │
│ │  - Time remaining                                          │   │
│ │  - Player elimination status                               │   │
│ │  - Token accumulation                                      │   │
│ └──────────────────────────────────────────────────────────┘   │
│                          ↓                                        │
│         ┌─────────────────┴──────────────────┐                   │
│         │                                     │                   │
│    ┌────▼────┐                        ┌──────▼──────┐            │
│    │ Spin     │                        │ Effects     │            │
│    │ Outcome  │                        │ Manager     │            │
│    └────┬────┘                        └──────┬──────┘            │
│         │                                     │                   │
│    ┌────▼──────────────┐          ┌─────────▼──────┐            │
│    │ Steal Resolution  │          │ Revive Logic   │            │
│    │ - Target select   │          │ - Phase check  │            │
│    │ - Amount calc     │          │ - Cost deduct  │            │
│    │ - Shield resolve  │          │ - Status upd   │            │
│    └────┬──────────────┘          └─────────┬──────┘            │
│         │                                     │                   │
└─────────┼─────────────────────────────────────┼───────────────────┘
          │                                     │
          │ WebSocket Events                    │ WebSocket Events
          │ (Real-time)                         │ (Real-time)
          │                                     │
┌─────────▼─────────────────────────────────────▼───────────────────┐
│ REAL-TIME SERVICE (WebSocket/EventSource)                          │
│                                                                      │
│ Channel: spin_result                                                │
│   { outcome, value, timestamp }                                    │
│                                                                      │
│ Channel: tokens_updated                                            │
│   { userId, newTokens, change }                                    │
│                                                                      │
│ Channel: livefeed:event                                            │
│   { id, type, actor, target, details, timestamp }                 │
│                                                                      │
│ Channel: phase_change                                              │
│   { phase, round, phaseEndsAt, eliminated, revivable }            │
│                                                                      │
│ Channel: effect:activated / effect:expired                         │
│   { effectId, type, expiresAt }                                    │
│                                                                      │
│ Channel: leaderboard:updated                                       │
│   { userId, rank, tokens }                                         │
│                                                                      │
│ Channel: skill:available / skill:charged                           │
│   { skillId, charges, cooldownUntil }                             │
│                                                                      │
└─────────┬───────────────────────────────────────────────────────────┘
          │
          │ Browser receives events
          │
┌─────────▼───────────────────────────────────────────────────────────┐
│ ZUSTAND STORES (React Client State)                                  │
│                                                                        │
│ ┌────────────────────────┐  ┌────────────────────────┐             │
│ │ useGameplayStore       │  │ useLiveFeedStore       │             │
│ │ - tokens               │  │ - events (array)       │             │
│ │ - phase                │  │ - addEvent()           │             │
│ │ - phaseEndsAt          │  │ - removeOldestEvent()  │             │
│ │ - eliminated           │  └────────────────────────┘             │
│ │ - lastOutcome          │                                         │
│ └────────────────────────┘  ┌────────────────────────┐             │
│                             │ useLeaderboardStore    │             │
│ ┌────────────────────────┐  │ - individual[]         │             │
│ │ useStealStore          │  │ - squad[]              │             │
│ │ - stealInProgress      │  │ - updateIndividual()   │             │
│ │ - targetPlayer         │  │ - updateSquad()        │             │
│ │ - fireBoostCount       │  └────────────────────────┘             │
│ └────────────────────────┘                                         │
│                             ┌────────────────────────┐             │
│ ┌────────────────────────┐  │ useEffectsStore        │             │
│ │ useInventoryStore      │  │ - effects[]            │             │
│ │ - skills[]             │  │ - addEffect()          │             │
│ │ - serverTime           │  │ - removeEffect()       │             │
│ │ - updateSkill()        │  │ - getTimeRemaining()   │             │
│ └────────────────────────┘  └────────────────────────┘             │
│                                                                        │
└─────────┬───────────────────────────────────────────────────────────┘
          │
          │ Selectors trigger re-renders
          │
┌─────────▼───────────────────────────────────────────────────────────┐
│ REACT COMPONENTS (UI Layer)                                          │
│                                                                        │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│ │ SpinWheel        │  │ LiveFeedPeek     │  │ TopHUD           │  │
│ │ - outcome prop   │  │ - events from    │  │ - tokens from    │  │
│ │ - trigger on     │  │   store selector │  │   store selector │  │
│ │   spin_result    │  │ - display max 5  │  │ - phase timer    │  │
│ │ - animate        │  │   events reverse │  │ - rank display   │  │
│ └──────────────────┘  │   chronological  │  └──────────────────┘  │
│                       └──────────────────┘                          │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│ │ SkillDock        │  │ ActiveEffects    │  │ Leaderboard      │  │
│ │ - skills from    │  │ - effects from   │  │ - entries from   │  │
│ │   store selector │  │   store selector │  │   store selector │  │
│ │ - cooldown timer │  │ - countdown per  │  │ - sorted by rank │  │
│ │   calc per 100ms │  │   100ms          │  │ - highlight self │  │
│ └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Timeline (Single Spin Cycle)

```
T0: User initiates spin
    ↓
T1-T8: Wheel animates (8 second spin)
    ↓
T8: spin_result event from backend arrives
    { outcome: 'ADVANCE', value: 3, timestamp }
    ↓
T8.2: useGameplayStore receives event
    - setLastOutcome(outcome)
    ↓
T8.4: OutcomeReveal component mounts
    - Receives outcome prop
    - Starts animation sequence (2-3 seconds)
    ↓
T8.6: tokens_updated event arrives
    { newTokens: 27, change: +3 }
    ↓
T8.8: useGameplayStore updates
    - setTokens(27)
    ↓
T8.9: TopHUD re-renders (selector: tokens)
    - Shows 27 instead of 24
    ↓
T9.0: leaderboard:updated event arrives
    { userId, newRank: 6, newTokens: 27 }
    ↓
T9.2: useLeaderboardStore updates
    - Updates player entry
    ↓
T9.3: Leaderboard component re-renders
    - Shows new rank
    - Animates rank change (if different)
    ↓
T10.5: OutcomeReveal animation completes
    - User can spin again
    ↓
T10.6: spin_ready event (optional confirmation)
    - Next spin enabled
```



---

## 3. WHEEL REDESIGN SPECIFICATION

### 3.1 Wheel Structure (5 Segments)

The gameplay wheel contains exactly 5 outcomes, each representing a different reward or action:

```
                    ▲
                    │ ADVANCE
              ┌─────┴─────┐
            ╱               ╲
          ╱    (+3 Tokens)    ╲
        ╱                       ╲
       │                         │
       │  STEAL ◄──────────►     │
       │  (Token Theft)   VOID   │
       │                  (0)    │
        ╲                       ╱
          ╲    (+0.5 Tokens)   ╱
            ╲  (DISCOVER)  ╱
              └─────┬─────┘
          ACQUIRE (+1 Token)
                    │
                    ▼
```

### 3.2 Segment Specifications

#### Segment 1: ADVANCE
- **Position:** Top of wheel (0°)
- **Arc:** 72° (60-144°)
- **Color:** Bright green (#22C55E)
- **Icon:** ⬆️ or arrow pointing up
- **Reward:** +3 Session Tokens
- **Effect:** Guaranteed phase advancement at end of phase
- **Animation:** Pulse green glow on reveal
- **Audio:** Ascending chime (Do-Mi-Sol)

#### Segment 2: ACQUIRE
- **Position:** Bottom-left (288°)
- **Arc:** 72° (252-324°)
- **Color:** Bright blue (#3B82F6)
- **Icon:** ⭐ or star
- **Reward:** +1 Session Token
- **Effect:** Standard accumulation
- **Animation:** Blue sparkle burst on reveal
- **Audio:** Soft chime

#### Segment 3: DISCOVER
- **Position:** Bottom-right (216°)
- **Arc:** 72° (180-252°)
- **Color:** Purple (#A855F7)
- **Icon:** 🔮 or crystal
- **Reward:** +0.5 Session Tokens
- **Effect:** Partial accumulation
- **Animation:** Purple shimmer on reveal
- **Audio:** Descending chime

#### Segment 4: STEAL
- **Position:** Left (144°)
- **Arc:** 72° (108-180°)
- **Color:** Dark red (#DC2626)
- **Icon:** 💥 or explosion
- **Outcome:** Attempt token theft from opponent
- **Effect:** Opens target picker UI (if not eliminated)
- **Animation:** Red flash with shake effect
- **Audio:** Attack sound effect

#### Segment 5: VOID
- **Position:** Right (72°)
- **Arc:** 72° (36-108°)
- **Color:** Gray (#6B7280)
- **Icon:** Ø or null symbol
- **Reward:** 0 tokens
- **Effect:** No change, spin again available immediately
- **Animation:** Fade out / gray dimming
- **Audio:** Sad descending note

### 3.3 Visual Design Details

#### Wheel Base
- **Type:** 3D perspective wheel using Three.js or CSS 3D transforms
- **Size:** 380px diameter on mobile (normalized to viewport)
- **Border:** Glowing ring (2px, semi-transparent gold)
- **Background:** Dark with gradient radiance

#### Segment Styling
- **Text:** Bold white, centered in segment
- **Token amount:** Positioned at outer edge of segment
- **Font:** "Chakra Petch" or similar futuristic font
- **Shadow:** Inner shadow on each segment for depth

#### Interactive States
- **Idle:** Wheel at rest, subtle rotation (360° over 8 seconds)
- **Hovering:** Segment highlights with intensity +20%
- **Spinning:** Fast rotation (720° per 4 seconds during 8s spin)
- **Revealing:** Segment zooms in (scale 1.0 → 1.2 over 800ms)

### 3.4 Animation Timing

#### Spin Animation
- **Duration:** 8 seconds (backend-defined, not hardcoded)
- **Easing:** EaseOut cubic
- **Rotation:** 720° + random offset (540°-900°)
- **Formula:** `rotation = baseRotation + (8 * Math.random() * 360)`

#### Outcome Reveal Animation
- **Phase 1:** Wheel stops (100ms)
- **Phase 2:** Segment zooms to center (400ms, easeOut)
- **Phase 3:** Outcome banner slides in from bottom (300ms, easeOut)
- **Phase 4:** Token amount animates upward (600ms, easeOut)
- **Total:** ~1400ms before next spin available

#### Outcome Animations (Per Segment Type)
- **ADVANCE:** Green glow intensifies, particle burst upward
- **ACQUIRE:** Blue sparkles radiate outward
- **DISCOVER:** Purple shimmer with rotation effect
- **STEAL:** Red shake effect, target picker slides in
- **VOID:** Fade to gray, brief pause

### 3.5 Data Binding

#### Backend Provides:
```javascript
{
  // Per session start
  wheelConfig: {
    segments: [
      { id: 1, name: 'ADVANCE', value: 3, probability: 0.22 },
      { id: 2, name: 'ACQUIRE', value: 1, probability: 0.35 },
      { id: 3, name: 'DISCOVER', value: 0.5, probability: 0.15 },
      { id: 4, name: 'STEAL', value: 0, probability: 0.18 },
      { id: 5, name: 'VOID', value: 0, probability: 0.10 },
    ],
    spinDurationMs: 8000,
    animationDurationMs: 1400,
  },
  
  // Per spin result (real-time event)
  spinResult: {
    spinId: 'spin_12345',
    subSessionId: 'sub_sess_001',
    userId: 'user_123',
    segmentId: 1, // Index into segments array
    outcome: 'ADVANCE',
    value: 3,
    timestamp: '2025-01-15T10:30:45.123Z',
    seed: 'random_seed_for_verification',
  }
}
```

### 3.6 Where Outcome Data Comes From

**Before Spin Starts:**
- User calls `/api/gameplay/spin` (POST)
- Backend validates: tokens available, phase active, not eliminated, session active
- Returns: `spinId` and locks next spin

**During Spin Animation:**
- Frontend displays 8-second wheel animation
- No outcome data shown yet (suspense)
- Countdown timer shows remaining spin time

**After Spin Duration:**
- Backend processes spin result (off-client)
- Calculates outcome based on seed/RNG
- Broadcasts `spin_result` WebSocket event to user
- **Frontend receives:** `spinResult` object with outcome, value, timestamp
- **Frontend validates:** outcome is one of 5 segments, value matches segment definition
- **Frontend renders:** OutcomeReveal animation with confirmed data

**Important:** No outcome is determined on client. Client always receives confirmed result from backend.



---

## 4. ANIMATION IMPLEMENTATION CHECKLIST

### 4.1 OutcomeReveal.tsx

**Component Behavior:**

- [ ] **Accepts Props:**
  - `outcome: 'ADVANCE' | 'ACQUIRE' | 'DISCOVER' | 'STEAL' | 'VOID'` (required)
  - `value: number` (required for non-STEAL outcomes)
  - `onAnimationComplete: () => void` (callback)
  - `onStealTriggered?: () => void` (callback for STEAL)

- [ ] **Animation Sequence:**
  - [ ] Render outcome banner with icon and label
  - [ ] Trigger based on outcome type:
    - `ADVANCE`: Green glow + upward particle burst (600ms) → +3 token fly-in (400ms)
    - `ACQUIRE`: Blue sparkle burst (500ms) → +1 token fly-in (300ms)
    - `DISCOVER`: Purple shimmer with 360° rotation (600ms) → +0.5 token fly-in (400ms)
    - `STEAL`: Red shake effect (400ms) → Show "Stealing..." text → Open target picker (500ms)
    - `VOID`: Gray fade-out (300ms) → Show "No tokens gained" (400ms)

- [ ] **Token Animation:** (for non-STEAL outcomes)
  - [ ] Token counter flies from wheel center to TopHUD token display
  - [ ] Duration: 400ms with easeOut
  - [ ] Token amount increments visually (counter animation)
  - [ ] Sound: Ding or coin drop sound

- [ ] **Cleanup:**
  - [ ] Call `onAnimationComplete()` callback after all animations finish
  - [ ] Remove component from DOM
  - [ ] Duration calculation: Sum of all animation phases + 200ms padding

**Code Pattern:**
```typescript
function OutcomeReveal({ outcome, value, onAnimationComplete, onStealTriggered }) {
  useEffect(() => {
    const totalDuration = getAnimationDuration(outcome);
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, totalDuration);
    return () => clearTimeout(timer);
  }, [outcome, onAnimationComplete]);

  return (
    <div className="outcome-reveal">
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Render outcome-specific animation */}
        {outcome === 'ADVANCE' && <AdvanceReveal value={value} />}
        {outcome === 'STEAL' && <StealReveal onTriggered={onStealTriggered} />}
        {/* ... */}
      </motion.div>
    </div>
  );
}
```

---

### 4.2 PhaseIntro & PhaseEnd Components

**PhaseIntro Animation (Plays at Phase Start):**

- [ ] **Trigger:** Subscribe to `phase_change` event with `phase: 1 | 2 | 3 | 4`
- [ ] **Animation Sequence:**
  - [ ] Fade in dark overlay (200ms, easeOut)
  - [ ] Slide in phase title from left (300ms, easeOut)
  - [ ] Show phase name: e.g., "Phase 1 — Active Spin"
  - [ ] Show duration: "6 Minutes"
  - [ ] Show phase rules (if new player)
  - [ ] Slide in countdown timer (300ms)
  - [ ] Wait 3 seconds
  - [ ] Fade out (300ms, easeOut)
  - [ ] **Total Duration:** 4-5 seconds

- [ ] **Timing Triggers:**
  - Must not interfere with active gameplay
  - Should appear AFTER all players settled from previous phase
  - Backend should specify phase transition delay

**PhaseEnd Animation (Plays at Phase Conclusion):**

- [ ] **Trigger:** Subscribe to elimination event when `eliminatedCount > 0`
- [ ] **Animation Sequence:**
  - [ ] Show "Phase Complete" title
  - [ ] Display breakdown:
    - [ ] "🟢 Advanced: X players"
    - [ ] "🟡 Revivable: Y players" (if phase allows revives)
    - [ ] "🔴 Eliminated: Z players"
  - [ ] Each stat animates in sequentially (200ms apart)
  - [ ] Show current player status:
    - [ ] If passed: "✅ You Advanced!"
    - [ ] If revivable: "⚠️ You're Revivable!" + show cost
    - [ ] If eliminated: "❌ You've Been Eliminated" + show revive option
  - [ ] Total duration: 2-3 seconds
  - [ ] Auto-dismiss or require acknowledgment

**Timing Pattern:**
```
T=0s: Phase ends (backend sends elimination event)
T=0.2s: PhaseEnd animation starts
T=0.5s: Stats appear
T=1.5s: Player status shows
T=2.0s: Auto-advance or wait for user input
```

---

### 4.3 TokenCollection Animation

**Particle System Requirements:**

- [ ] **Trigger:** When `tokens_updated` event arrives with `change > 0`
- [ ] **Effect:** Multi-particle burst from screen center toward TopHUD token counter
- [ ] **Particle Properties:**
  - [ ] Particle count: 8-12 tokens per collection
  - [ ] Initial position: Wheel center (or outcome reveal center)
  - [ ] Final position: TopHUD token counter
  - [ ] Duration: 400-600ms per particle
  - [ ] Easing: easeOut
  - [ ] Physics: Slight upward trajectory before falling to target

- [ ] **Animation Code Pattern:**
```typescript
function animateTokenCollection(fromPos, toPos, tokenCount) {
  const particles = Array.from({ length: tokenCount }, (_, i) => (
    <motion.div
      key={i}
      initial={{ x: fromPos.x, y: fromPos.y, opacity: 1 }}
      animate={{ x: toPos.x, y: toPos.y, opacity: 0 }}
      transition={{
        duration: 0.5,
        delay: i * 0.05,
        ease: 'easeOut',
      }}
    >
      <span className="token-particle">🔹</span>
    </motion.div>
  ));
  return particles;
}
```

- [ ] **Audio:** Coin collect sound plays (single sound, 200ms duration)

---

### 4.4 Wheel Spin Animation

**Spin Mechanics:**

- [ ] **Duration:** Fetch from backend config on session start (typically 8 seconds)
- [ ] **Starting Point:** Random segment (weighted by probability)
- [ ] **Rotation:** 720° + random offset (540°-900° range)
- [ ] **Formula:** `finalAngle = (spinIndex * 72°) + randomOffset`

- [ ] **Easing Profile:** EaseOutCubic
  - [ ] Slow start (first 2 seconds: 200°)
  - [ ] Fast middle (seconds 2-6: 400°)
  - [ ] Gradual deceleration (seconds 6-8: 120°)

- [ ] **Visual Feedback During Spin:**
  - [ ] Wheel rotates smoothly at 90 RPM equivalent
  - [ ] Segments blur slightly (motion blur effect)
  - [ ] Glow intensifies as wheel spins
  - [ ] UI disabled (no skip, no double-spin)
  - [ ] Countdown timer visible (8s → 0s)

- [ ] **Animation Code Pattern:**
```typescript
<motion.div
  animate={{ rotate: finalRotation }}
  transition={{
    duration: 8, // from backend config
    ease: 'easeOutCubic',
  }}
>
  {/* Wheel SVG/3D model */}
</motion.div>
```

- [ ] **After Spin Completes:**
  - [ ] Wheel stops instantly
  - [ ] Winning segment highlights briefly (100ms)
  - [ ] `onSpinComplete()` callback fires
  - [ ] Frontend waits for `spin_result` WebSocket event

---

### 4.5 Skill Cooldown Timer Animation

**Requirements:**

- [ ] **Update Frequency:** Every 100ms (smooth visual countdown)
- [ ] **Display Format:** "45s" → "44s" → ... → "1s" → "Ready"
- [ ] **Color Change:**
  - [ ] Red (0-5s remaining)
  - [ ] Yellow (5-15s remaining)
  - [ ] Gray (15s+ remaining)

- [ ] **Animation on Ready:**
  - [ ] Text flashes green (3 blinks at 200ms each)
  - [ ] Pulse scale effect (1.0 → 1.2 → 1.0, 400ms)
  - [ ] Play ready chime sound

- [ ] **Code Pattern:**
```typescript
function SkillCooldownDisplay({ skillId, cooldownUntil }) {
  const { now } = useServerTime();
  const remaining = Math.max(0, cooldownUntil - now());
  const isReady = remaining === 0;

  return (
    <motion.div
      animate={{
        color: isReady ? '#22C55E' : remaining < 5000 ? '#EF4444' : '#6B7280',
        scale: isReady ? 1.2 : 1,
      }}
      transition={{ duration: 0.1 }}
    >
      {remaining > 0 ? `${Math.ceil(remaining / 1000)}s` : 'Ready'}
    </motion.div>
  );
}
```

- [ ] **Re-render Optimization:** Use `useCallback` to memoize calculations



---

## 5. SPECIFIC FILE MODIFICATIONS

### 5.1 src/components/gameplay/hud/WheelHUD.tsx

**Changes Required:**

```typescript
// BEFORE: Mock outcome generation
// ❌ const outcome = Math.random() > 0.5 ? 'ADVANCE' : 'STEAL';

// AFTER: Live backend outcome
import { useGameplayStore } from '@/stores/useGameplayStore';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';

export function WheelHUD({ subSessionId }: { subSessionId: string }) {
  const { lastOutcome, lastSpinId } = useGameplayStore(s => ({
    lastOutcome: s.lastOutcome,
    lastSpinId: s.lastSpinId,
  }));
  
  const { connected } = useRealtimeSession(subSessionId);
  
  const [isSpinning, setIsSpinning] = useState(false);
  
  const handleSpinClick = async () => {
    // POST to backend to initiate spin (don't generate outcome client-side)
    const response = await fetch('/api/gameplay/spin', {
      method: 'POST',
      body: JSON.stringify({ subSessionId }),
    });
    
    const { spinId } = await response.json();
    setIsSpinning(true);
    
    // Store spin ID for validation when result arrives
    // Don't set outcome here - wait for backend event
  };
  
  // Subscribe to real-time outcome
  useEffect(() => {
    if (lastOutcome && isSpinning) {
      // Only animate when we have confirmed outcome from backend
      setIsSpinning(false);
      // Trigger OutcomeReveal component
    }
  }, [lastOutcome]);
  
  if (!connected) {
    return <OfflineIndicator />;
  }
  
  return (
    <div className="wheel-hud">
      {isSpinning && <SpinningWheel />}
      {lastOutcome && !isSpinning && (
        <OutcomeReveal 
          outcome={lastOutcome.type}
          value={lastOutcome.value}
          onComplete={() => {
            // Reset for next spin
          }}
        />
      )}
      <SpinButton onClick={handleSpinClick} disabled={isSpinning} />
    </div>
  );
}
```

**Checklist:**
- [ ] Remove any hardcoded outcome arrays
- [ ] Connect to `useGameplayStore` for `lastOutcome`
- [ ] Connect to real-time session for `spin_result` events
- [ ] POST to `/api/gameplay/spin` before showing wheel
- [ ] Wait for `spin_result` event before showing outcome
- [ ] Pass live outcome data to OutcomeReveal component
- [ ] Disable spin button during spin and reveal

---

### 5.2 src/components/gameplay/hud/TopHUD.tsx

**Changes Required:**

```typescript
// BEFORE: Fallback values
// ❌ const tokens = userTokens || 24.5;
// ❌ const rank = playerRank || 7;
// ❌ const totalPlayers = sessionPlayers || 28;

// AFTER: Live backend data with loading states
import { useGameplayStore } from '@/stores/useGameplayStore';
import { useLeaderboardStore } from '@/stores/useLeaderboardStore';
import { useServerTime } from '@/hooks/useServerTime';

export function TopHUD({ subSessionId }: { subSessionId: string }) {
  const tokens = useGameplayStore(s => s.tokens); // null until loaded
  const { now } = useServerTime();
  
  const leaderboard = useLeaderboardStore(s => s.individual);
  const currentPlayerRank = leaderboard?.find(e => e.user_id === userId)?.rank ?? null;
  
  const phaseEndsAt = useGameplayStore(s => s.phaseEndsAt);
  const phaseRemaining = phaseEndsAt ? Math.max(0, phaseEndsAt - now()) : 0;
  const phaseSeconds = Math.ceil(phaseRemaining / 1000);
  
  // Show loading states
  if (tokens === null || currentPlayerRank === null) {
    return <TopHUDSkeleton />;
  }
  
  return (
    <div className="top-hud">
      {/* Show "Live" indicator when data synced */}
      <LiveIndicator />
      
      {/* Timer: phase-time remaining */}
      <Timer seconds={phaseSeconds} />
      
      {/* Tokens display - NO FALLBACK */}
      <TokenDisplay value={tokens} />
      
      {/* Rank display - NO FALLBACK */}
      <RankDisplay rank={currentPlayerRank} />
      
      {/* Total players from leaderboard length */}
      <TotalPlayersDisplay count={leaderboard.length} />
    </div>
  );
}
```

**Checklist:**
- [ ] Replace all `||` and `??` fallback values with null checks
- [ ] Import from `useGameplayStore` for tokens
- [ ] Import from `useLeaderboardStore` for rank
- [ ] Use `useServerTime` for phase timer
- [ ] Show loading skeleton until all data available
- [ ] Never display placeholder numbers
- [ ] Display "Live" badge when synced
- [ ] Update phase timer every 1 second

---

### 5.3 src/components/gameplay/GameplayArena.tsx

**Changes Required:**

```typescript
// Main arena component that orchestrates all live data connections

import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { useLiveFeedUpdates } from '@/hooks/useLiveFeedUpdates';
import { useLeaderboardUpdates } from '@/hooks/useLeaderboardUpdates';
import { useEffectsUpdates } from '@/hooks/useEffectsUpdates';
import { useInventoryUpdates } from '@/hooks/useInventoryUpdates';

export function GameplayArena({ subSessionId, userId }: Props) {
  // Call all hooks at top level (not conditionally)
  const { connected: realtimeConnected } = useRealtimeSession(subSessionId);
  useLiveFeedUpdates(subSessionId);
  useLeaderboardUpdates(subSessionId);
  useEffectsUpdates(userId, subSessionId);
  useInventoryUpdates(userId, subSessionId);
  
  const isAllConnected = realtimeConnected; // add other connection checks
  
  if (!isAllConnected) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="gameplay-arena">
      <TopHUD subSessionId={subSessionId} />
      <WheelHUD subSessionId={subSessionId} />
      <SkillDock subSessionId={subSessionId} />
      <ActiveEffectsBar subSessionId={subSessionId} />
      <LiveFeedPeek subSessionId={subSessionId} />
      <SquadPanel subSessionId={subSessionId} />
    </div>
  );
}
```

**Checklist:**
- [ ] Call all data-fetching hooks at top level
- [ ] No conditional hook calls (violates React rules)
- [ ] Pass subSessionId and userId to child components
- [ ] Show loading screen until all connections ready
- [ ] Handle offline state with OfflineIndicator
- [ ] No fallback data displayed

---

### 5.4 src/components/gameplay/SquadPanel.tsx

**File Creation (if doesn't exist):**

```typescript
import { useSquadStore } from '@/stores/useSquadStore';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';

export function SquadPanel({ subSessionId, userId }: Props) {
  const members = useSquadStore(s => s.members);
  const { connected } = useRealtimeSession(subSessionId);
  
  if (!connected || !members) {
    return <SquadPanelSkeleton />;
  }
  
  return (
    <div className="squad-panel">
      <h3>Squad ({members.length})</h3>
      
      <div className="squad-members">
        {members.map(member => (
          <SquadMemberCard key={member.id} member={member} />
        ))}
      </div>
      
      {/* Show revive UI if member is revivable */}
      <ReviveUI members={members} userId={userId} subSessionId={subSessionId} />
    </div>
  );
}
```

**Checklist:**
- [ ] Fetch squad members from backend on mount
- [ ] Subscribe to member status updates via WebSocket
- [ ] Display member: name, tokens, status (alive/eliminated/reviving)
- [ ] Show squad token pool
- [ ] Connect revive buttons to backend API
- [ ] Update member list when elimination events arrive
- [ ] Show loading state

---

### 5.5 src/hooks/useRealtimeSession.ts

**Improvements Needed:**

```typescript
// Current implementation: only handles individual updates
// Needed: Better structure, error handling, reconnection

export function useRealtimeSession(
  subSessionId: string | null,
  onPhaseChange?: (payload: PhaseChangePayload) => void,
  onTokensUpdated?: () => void
) {
  const {
    setTokens,
    setPhase,
    setRound,
    setPhaseEndsAt,
    setLastOutcome,
    setEliminated,
    setLastSpinId,
  } = useGameplayStore();
  
  const { setStealInProgress, incrementFireBoost, resetFireBoost } = useStealStore();
  
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 10;
  
  useEffect(() => {
    if (!subSessionId) return;
    
    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout;
    
    const connect = () => {
      try {
        eventSource = new EventSource(`/api/realtime/${subSessionId}`);
        
        eventSource.onopen = () => {
          setConnected(true);
          setReconnectAttempts(0); // Reset on successful connection
        };
        
        eventSource.onerror = () => {
          setConnected(false);
          eventSource?.close();
          
          // Exponential backoff reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            const backoffMs = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            reconnectTimer = setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              connect();
            }, backoffMs);
          }
        };
        
        eventSource.onmessage = (e) => {
          try {
            const event = JSON.parse(e.data);
            handleEvent(event);
          } catch (error) {
            console.error('Failed to parse event:', error);
          }
        };
        
      } catch (error) {
        console.error('Failed to connect to realtime:', error);
        setConnected(false);
      }
    };
    
    const handleEvent = (event: any) => {
      switch (event.type) {
        case 'spin_result':
          // IMPORTANT: Include full outcome object
          setLastSpinId(event.spinId);
          setLastOutcome({
            type: event.outcome,
            value: event.value,
            timestamp: event.timestamp,
          });
          break;
          
        case 'tokens_updated':
          setTokens(event.newTokens);
          onTokensUpdated?.();
          break;
          
        case 'phase_change':
          setPhase(event.phase);
          setRound(event.round);
          setPhaseEndsAt(event.phaseEndsAt);
          onPhaseChange?.(event);
          break;
          
        case 'elimination':
          setEliminated(event.eliminated);
          break;
          
        // ... handle other events
      }
    };
    
    connect();
    
    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimer);
    };
  }, [subSessionId, /* dependencies */]);
  
  return { connected, reconnectAttempts, maxReconnectAttempts };
}
```

**Checklist:**
- [ ] Add exponential backoff reconnection logic
- [ ] Store full outcome object (not just type)
- [ ] Add error handling and logging
- [ ] Limit reconnection attempts
- [ ] Parse full event payloads from backend
- [ ] Validate event structure before processing
- [ ] Return connection status for UI



---

## 6. TESTING CHECKLIST

### 6.1 Live Timer Synchronization

- [ ] **Test:** Phase timer syncs with backend
  - [ ] Join session with 6:00 minutes remaining in phase
  - [ ] Verify TopHUD shows 6:00
  - [ ] Wait 10 seconds
  - [ ] Verify TopHUD shows 5:50
  - [ ] Check: no drift, no jumps
  - [ ] Drift tolerance: ±100ms

- [ ] **Test:** Server time drift correction
  - [ ] Fetch `/api/server-time` on mount
  - [ ] Compare with `Date.now()`
  - [ ] Store drift offset
  - [ ] Use offset in countdown calculations
  - [ ] Verify: countdown reaches exactly 0 (±500ms)

- [ ] **Test:** Cooldown countdown accuracy
  - [ ] Skill enters cooldown state (e.g., 45s)
  - [ ] Verify countdown: 45s → 44s → ... → 1s → Ready
  - [ ] Accuracy: each second tick within 50ms
  - [ ] Check: no skipping (45 → 43)

---

### 6.2 Squad Member Real-Time Updates

- [ ] **Test:** Squad member tokens update immediately
  - [ ] Squad member A spins and gains +3 tokens
  - [ ] Backend emits `tokens_updated` event
  - [ ] SquadPanel displays new token count instantly
  - [ ] No 2-second delay

- [ ] **Test:** Squad member elimination updates
  - [ ] Squad member B eliminated
  - [ ] Backend emits `elimination` event
  - [ ] SquadPanel shows member as "Eliminated"
  - [ ] Revive UI appears (if applicable)
  - [ ] Check: visible within 500ms

- [ ] **Test:** Leaderboard rank updates
  - [ ] Player moves from rank 10 to rank 8
  - [ ] Leaderboard component updates
  - [ ] Animation smoothly slides member position
  - [ ] No flickering or jumping

---

### 6.3 Wheel Outcomes Match Backend

- [ ] **Test:** Displayed outcome matches backend event
  - [ ] Spin wheel
  - [ ] Note the segment it lands on (visually)
  - [ ] Verify: `spin_result` event outcome matches
  - [ ] Check: 100 consecutive spins for consistency

- [ ] **Test:** Token accumulation matches outcome
  - [ ] Check starting tokens (e.g., 50)
  - [ ] Spin and get ADVANCE (+3)
  - [ ] Verify: tokens updated to 53 (not 50.5, not 51)
  - [ ] Check: matches server-side calculation

- [ ] **Test:** Steal outcomes work correctly
  - [ ] Spin and get STEAL
  - [ ] Target picker appears
  - [ ] Select target
  - [ ] Verify: attacker gains tokens, victim loses tokens
  - [ ] Check: steal value matches backend

---

### 6.4 Animations Trigger at Correct Moments

- [ ] **Test:** Outcome reveal animation
  - [ ] Wheel stops
  - [ ] OutcomeReveal component appears
  - [ ] Animation plays (not static)
  - [ ] Duration: 1.5-2 seconds
  - [ ] Token counter increments during animation

- [ ] **Test:** Phase transition animation
  - [ ] Reach phase end
  - [ ] Phase transition overlay appears
  - [ ] Shows: "Phase Complete", stats, player status
  - [ ] Auto-dismisses after 3 seconds
  - [ ] Check: no animation stuttering

- [ ] **Test:** Token collection particle effect
  - [ ] Outcome reveals tokens gained
  - [ ] Particles fly from wheel to TopHUD
  - [ ] Particles count matches token amount
  - [ ] Duration: 400-600ms
  - [ ] Sound plays (coin collect)

- [ ] **Test:** Skill cooldown ready animation
  - [ ] Skill cooldown expires
  - [ ] Text flashes green
  - [ ] Pulse scale animation plays
  - [ ] Ready sound plays
  - [ ] No animation delay (should trigger instantly)

---

### 6.5 No Mock Data Appears

- [ ] **Code Search:** No hardcoded mock values remain
  - [ ] Search for: `EVENT_POOL` → Expected: 0 results
  - [ ] Search for: `INITIAL_EFFECTS` → Expected: 0 results
  - [ ] Search for: `SKILLS = [` → Expected: 0 results
  - [ ] Search for: `\|\| \d` (fallback patterns) → Expected: 0 results
  - [ ] Search for: `\?\? \d` (nullish coalesce) → Expected: 0 results

- [ ] **Runtime Check:** No placeholder values displayed
  - [ ] Join session
  - [ ] Verify TopHUD shows REAL tokens (not 24.5, not 100)
  - [ ] Verify rank is REAL (not 7, not 15)
  - [ ] Verify total players matches session (not 28, not 100)
  - [ ] All numbers come from backend

- [ ] **Loading States:** Proper feedback when data missing
  - [ ] On mount: loading skeleton appears
  - [ ] Data arrives: skeleton replaced with live data
  - [ ] On disconnect: data doesn't stale (remove old data)
  - [ ] Never show stale mock data as fallback

---

### 6.6 Integration Tests

**Test Scenario 1: Complete Spin Cycle**

```
1. User clicks SPIN
2. POST /api/gameplay/spin called
3. Wheel animates for 8 seconds
4. spin_result event arrives
5. OutcomeReveal animation plays
6. Tokens updated
7. TopHUD counter increments
8. Next spin enabled
```

- [ ] All steps complete successfully
- [ ] No console errors
- [ ] No network errors
- [ ] Total time: ~10-11 seconds

**Test Scenario 2: Multi-Player Synchronization**

```
1. Player A spins and gets ADVANCE (+3)
2. Player B sees A gain tokens in LiveFeed
3. Player B spins and gets STEAL from A
4. Player A's tokens decrease
5. Player A sees steal in notifications
6. Leaderboard updates both positions
```

- [ ] All updates synchronized within 500ms
- [ ] No duplicate events
- [ ] Correct token values for both players

**Test Scenario 3: Network Disconnection**

```
1. Start gameplay
2. Disable WiFi
3. UI shows "Connection Lost"
4. Re-enable WiFi
5. Auto-reconnect within 5 seconds
6. Data refreshes
7. No data loss or duplication
```

- [ ] Offline indicator appears
- [ ] Auto-reconnect triggers
- [ ] State consistent after reconnect
- [ ] No duplicate tokens gained

**Test Scenario 4: Rapid User Actions**

```
1. User rapidly clicks spin button (spam)
2. System prevents double-spin
3. Only one spin processed
4. Lock UI until outcome received
```

- [ ] Second click ignored
- [ ] No duplicate spins sent to backend
- [ ] UI locked during spin/reveal

---

### 6.7 Performance Verification

- [ ] **60 FPS Requirement:**
  - [ ] Open DevTools Performance tab
  - [ ] Record during 8-second spin
  - [ ] Check: frame rate stays ≥ 55 FPS
  - [ ] No dropped frames (jank)

- [ ] **Memory Stability:**
  - [ ] Join session
  - [ ] Play for 5 minutes
  - [ ] Check: memory doesn't increase >50MB
  - [ ] Verify: no memory leaks (DevTools Heap Snapshots)

- [ ] **Network Efficiency:**
  - [ ] Check: polling intervals (should be 2-3s, not continuous)
  - [ ] Check: WebSocket messages (should be event-driven, not flooded)
  - [ ] Verify: no duplicate requests
  - [ ] Monitor: network tab for payload sizes

---

## 7. VERIFICATION METHODOLOGY

### Before Deployment

1. **Code Review:**
   - [ ] All hardcoded mock data removed
   - [ ] All components receive live props
   - [ ] No `any` types in critical files
   - [ ] Error handling present

2. **Unit Tests:**
   - [ ] Store tests: state updates correctly
   - [ ] Hook tests: data fetching works
   - [ ] Component tests: render with live data

3. **Integration Tests:**
   - [ ] Full spin cycle works
   - [ ] Real-time events propagate
   - [ ] Offline/online transitions work

4. **E2E Tests:**
   - [ ] User flow: join → spin → collect tokens → phase end
   - [ ] Multi-user: verify synchronization
   - [ ] Network: disconnection and reconnection

5. **Manual Testing:**
   - [ ] 20+ spins per player (multiple players)
   - [ ] Phase transitions
   - [ ] Steal mechanics
   - [ ] Revive flow (if applicable)
   - [ ] Multiple device types (mobile, tablet, desktop)

---

## 8. ROLLBACK STRATEGY

If issues discovered post-deployment:

1. **Identify:** Which component/API is failing
2. **Fallback:** Restore previous working version
3. **Isolate:** Create test environment with issue
4. **Fix:** Apply fix and re-test locally
5. **Deploy:** Roll back data only first (before code changes)



---

## 9. IMPLEMENTATION TIMELINE

### Phase 1: Foundation (Day 1)

**Duration:** 8 hours

**Tasks:**
- [ ] Set up store testing infrastructure
- [ ] Enhance `useRealtimeSession` hook with error handling
- [ ] Create `useLeaderboardUpdates` hook
- [ ] Create `useEffectsUpdates` hook
- [ ] Create `useInventoryUpdates` hook
- [ ] Create `useServerTime` hook

**Dependencies:** None  
**Blockers:** None

---

### Phase 2: Component Refactoring (Day 2)

**Duration:** 8 hours

**Tasks:**
- [ ] Refactor TopHUD (remove fallback values)
- [ ] Refactor WheelHUD (remove mock outcomes)
- [ ] Refactor LiveFeedPeek (remove EVENT_POOL)
- [ ] Refactor SkillDock (remove SKILLS constant)
- [ ] Refactor ActiveEffectsBar (remove INITIAL_EFFECTS)
- [ ] Create Leaderboard component
- [ ] Create SquadPanel component

**Dependencies:** Phase 1 hooks  
**Blockers:** None

---

### Phase 3: Animation Implementation (Day 3)

**Duration:** 8 hours

**Tasks:**
- [ ] Create OutcomeReveal component with per-segment animations
- [ ] Create PhaseTransition components (intro & end)
- [ ] Implement token collection particle effect
- [ ] Implement wheel spin animation with backend timing
- [ ] Implement skill cooldown timer animation
- [ ] Test animation timing with mock data

**Dependencies:** Phase 2 components  
**Blockers:** None

---

### Phase 4: Integration (Day 4)

**Duration:** 8 hours

**Tasks:**
- [ ] Connect all components to GameplayArena
- [ ] Verify data flow end-to-end
- [ ] Implement RevivePanel backend integration
- [ ] Test with real backend (staging)
- [ ] Implement offline indicator
- [ ] Test reconnection logic

**Dependencies:** Phases 1-3  
**Blockers:** Staging backend must be functional

---

### Phase 5: Testing & QA (Day 5)

**Duration:** 8 hours

**Tasks:**
- [ ] Run manual test scenarios (Scenario 1-4)
- [ ] Performance testing (FPS, memory, network)
- [ ] Device testing (mobile, tablet, desktop)
- [ ] Network condition testing (slow 3G, offline)
- [ ] Rapid action testing (spam clicks, etc.)
- [ ] Documentation and deployment prep

**Dependencies:** Phase 4 integration  
**Blockers:** Backend API contracts must be finalized

---

### Phase 6: Deployment & Monitoring (Day 6)

**Duration:** 4 hours

**Tasks:**
- [ ] Production deployment (staged rollout)
- [ ] Monitor for errors in production
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Bug fix for critical issues
- [ ] Post-launch documentation

**Dependencies:** Phase 5 testing  
**Blockers:** Production environment readiness

---

## 10. DEPENDENCIES & BLOCKERS

### External Dependencies

| Dependency | Status | Impact | Mitigation |
|------------|--------|--------|-----------|
| Backend `/api/gameplay/spin` endpoint | Required | Spin initiation | Mock endpoint in development |
| Backend `/api/gameplay/leaderboard` endpoint | Required | Rankings display | Mock data service |
| WebSocket `spin_result` event | Required | Outcome display | EventSource polling fallback |
| WebSocket `tokens_updated` event | Required | Token updates | Polling `/api/player/status` |
| `/api/server-time` endpoint | Required | Timer sync | Client-side time tracking |
| Backend `/api/player/effects` endpoint | Required | Active effects | Empty array fallback |
| Backend `/api/player/inventory` endpoint | Required | Skills display | Empty array fallback |

### Known Blockers

1. **Backend API Contracts Not Finalized**
   - Impact: Cannot validate event payloads
   - Solution: Create mock backend that matches expected formats
   - Timeline: Must be resolved by Phase 4

2. **Database Schema Missing**
   - Impact: Cannot persist live data
   - Solution: Create migration and seed data
   - Timeline: Must be resolved by Day 1

3. **WebSocket Service Not Implemented**
   - Impact: Cannot receive real-time events
   - Solution: Implement EventSource polling as fallback
   - Timeline: Must be resolved by Phase 1

---

## 11. API CONTRACT SPECIFICATIONS

### Request/Response Formats

#### GET /api/gameplay/leaderboard

**Request:**
```json
{
  "subSessionId": "sub_sess_001",
  "type": "individual" | "squad"
}
```

**Response (type=individual):**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "user_123",
      "username": "Player_A",
      "session_tokens": 150,
      "squad_id": "squad_001",
      "squad_name": "Shadow Squad",
      "alive": true,
      "position": 1
    }
  ],
  "server_time": "2025-01-15T10:30:45.123Z"
}
```

#### WebSocket Event: spin_result

**Payload:**
```json
{
  "type": "spin_result",
  "spinId": "spin_12345",
  "subSessionId": "sub_sess_001",
  "userId": "user_123",
  "outcome": "ADVANCE" | "ACQUIRE" | "DISCOVER" | "STEAL" | "VOID",
  "value": 3 | 1 | 0.5 | 0 | 0,
  "timestamp": "2025-01-15T10:30:45.123Z",
  "seed": "seed_for_verification"
}
```

#### WebSocket Event: tokens_updated

**Payload:**
```json
{
  "type": "tokens_updated",
  "userId": "user_123",
  "newTokens": 153,
  "change": 3,
  "reason": "spin_outcome",
  "timestamp": "2025-01-15T10:30:45.123Z"
}
```

#### GET /api/player/inventory

**Request:**
```json
{
  "userId": "user_123",
  "subSessionId": "sub_sess_001"
}
```

**Response:**
```json
{
  "skills": [
    {
      "id": "skill_shield",
      "name": "Shield",
      "owned": true,
      "available": true,
      "cooldown_ms": 30000,
      "cooldown_until": "2025-01-15T10:30:45.123Z",
      "charges": 3,
      "max_charges": 3,
      "icon": "🛡️"
    }
  ],
  "server_time": "2025-01-15T10:30:45.123Z"
}
```

#### GET /api/player/effects

**Response:**
```json
{
  "effects": [
    {
      "id": "effect_shield_1",
      "type": "shield",
      "name": "Shield Protection",
      "duration_ms": 45000,
      "started_at": "2025-01-15T10:30:00.000Z",
      "expires_at": "2025-01-15T10:30:45.000Z",
      "icon": "🛡️"
    }
  ],
  "server_time": "2025-01-15T10:30:45.123Z"
}
```

---

## 12. DELIVERABLES CHECKLIST

### Code Deliverables

- [ ] `src/hooks/useLiveFeedUpdates.ts` - Live feed subscription hook
- [ ] `src/hooks/useLeaderboardUpdates.ts` - Leaderboard polling hook
- [ ] `src/hooks/useEffectsUpdates.ts` - Active effects subscription hook
- [ ] `src/hooks/useInventoryUpdates.ts` - Inventory polling hook
- [ ] `src/hooks/useServerTime.ts` - Server time sync hook
- [ ] `src/components/gameplay/hud/WheelHUD.tsx` - Refactored (live data)
- [ ] `src/components/gameplay/hud/TopHUD.tsx` - Refactored (live data)
- [ ] `src/components/gameplay/hud/Leaderboard.tsx` - New component
- [ ] `src/components/gameplay/SquadPanel.tsx` - New component
- [ ] `src/components/gameplay/OutcomeReveal.tsx` - New with per-segment animations
- [ ] `src/components/gameplay/PhaseTransition.tsx` - Enhanced with animations
- [ ] Enhanced `src/hooks/useRealtimeSession.ts` - Error handling, reconnection

### Documentation Deliverables

- [ ] `LIVE_BACKEND_INTEGRATION_ROADMAP.md` - This document
- [ ] `API_CONTRACTS.md` - Finalized backend API specifications
- [ ] `COMPONENT_MAPPING.md` - Components to API/Store mapping
- [ ] `TESTING_SCENARIOS.md` - Detailed test cases
- [ ] `DEPLOYMENT_GUIDE.md` - Production deployment steps

### Test Deliverables

- [ ] Unit tests for all hooks
- [ ] Unit tests for all new components
- [ ] Integration test suite
- [ ] E2E test scripts
- [ ] Performance benchmark report
- [ ] Network condition test report

---

## 13. SUCCESS CRITERIA

### Must-Have (Release Blocking)

- [x] **Zero Hardcoded Mock Data**
  - No `EVENT_POOL`, `INITIAL_EFFECTS`, `SKILLS` constants
  - No `|| <value>` fallback patterns for gameplay data
  - Every number displayed comes from backend

- [x] **Real-Time Event Propagation**
  - Events received < 500ms after backend emission
  - Leaderboard updates within 2 seconds of change
  - Tokens update within 500ms of spin completion

- [x] **Phase Timer Accuracy**
  - Timer counts down correctly
  - Reaches 0 within ±500ms of actual phase end
  - No time drifts > 1 second over 6-minute phase

- [x] **Outcome Accuracy**
  - Displayed outcome matches backend event 100%
  - Token values match backend calculations
  - No client-side outcome generation

- [x] **Animation Performance**
  - All animations run at 60 FPS
  - No janky transitions
  - Animations complete at correct times

### Should-Have (Nice to Have)

- [ ] Smooth rank transitions with animation
- [ ] Offline caching (show last known state)
- [ ] Network quality indicator
- [ ] Developer debug panel for live data inspection

### Won't-Have (Out of Scope)

- [ ] Analytics tracking (separate feature)
- [ ] Accessibility improvements (separate audit)
- [ ] Mobile-specific optimizations (phase 2)
- [ ] Server-side rendering (not applicable)

---

## 14. KNOWN LIMITATIONS & FUTURE IMPROVEMENTS

### Current Phase Limitations

1. **Polling-Based Leaderboard**
   - Every 2 seconds, not truly real-time
   - Future: Replace with WebSocket broadcast

2. **No Offline State Persistence**
   - Data lost on disconnect
   - Future: IndexedDB caching

3. **No Optimistic Updates**
   - UI waits for server confirmation
   - Future: Client-side prediction for spin results

4. **Basic Error Messages**
   - Generic "Connection Lost" message
   - Future: Detailed error codes and recovery suggestions

### Future Enhancement Opportunities

- [ ] Client-side data validation against backend schema
- [ ] Automatic state reconciliation on reconnect
- [ ] Compressed event payloads for low-bandwidth scenarios
- [ ] WebSocket multiplexing for scalability
- [ ] Historical data retention (past 10 spins, etc.)
- [ ] Performance analytics dashboard

---

## 15. CONTACT & SUPPORT

**Implementation Lead:** [Your Name]  
**Backend API Owner:** [Backend Lead]  
**QA Lead:** [QA Lead]  
**Documentation:** This Roadmap

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-15  
**Next Review:** After Phase 1 completion (Day 1 EOD)

