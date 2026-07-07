# Gameplay Refinement - Design & Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GAMEPLAY FRONTEND                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  GAMEPLAY EVENT BUS (Center)                    │
│                                                                 │
│  Emits: spin.*, phase.*, tokens.*, player.*, shadow_surge.*    │
└─────────────────────────────────────────────────────────────────┘
         ↑           ↑           ↑            ↑
         │           │           │            │
    ┌────┴───┐  ┌─────┴──┐  ┌───┴─────┐  ┌──┴─────┐
    │ GAME   │  │ SOUND  │  │ANIMATION│  │HAPTICS │
    │ LOGIC  │  │ SYSTEM │  │ SYSTEM  │  │ SYSTEM │
    └────┬───┘  └─────┬──┘  └───┬─────┘  └──┬─────┘
         │           │           │            │
         └───────────┼───────────┼────────────┘
                     │           │
                 [Subscribe to Events]
```

---

## Data Flow Layers

### Layer 1: Backend Authority

```
┌─────────────────────────────────────────────────────────────────┐
│                   GAME ENGINE (Backend)                         │
│                                                                 │
│  - Calculates spin outcomes                                    │
│  - Manages phase transitions                                  │
│  - Tracks player scores/tokens                                │
│  - Determines eliminations                                    │
│  - Manages squad rankings                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
           [REST API + WebSocket Events]
```

### Layer 2: Data Stores (Zustand)

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  useSessionStore │  │useLeaderboardStore│  │useInventoryStore │
│                  │  │                  │  │                  │
│- currentPhase    │  │- individual[]    │  │- skills[]        │
│- phaseEndTime    │  │- squad[]         │  │- serverTime      │
│- players[]       │  │- rankings        │  │- cooldowns       │
│- sessionStatus   │  │- rankChanges     │  │- charges         │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ useEffectsStore  │  │ useSquadStore    │
│                  │  │                  │
│- activeEffects[] │  │- mySquadData     │
│- effectTimings   │  │- squadMembers    │
└──────────────────┘  └──────────────────┘
```

### Layer 3: Custom Hooks (Data Sync)

```
┌───────────────────────────────────────────────────────────────┐
│               CUSTOM HOOKS (Auto-Sync Stores)                 │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  useLiveFeedUpdates()      → Polls /api/gameplay/livefeed    │
│  useLeaderboardUpdates()   → Polls /api/gameplay/leaderboard │
│  useInventoryUpdates()     → Polls /api/player/inventory     │
│  useEffectsUpdates()       → Polls /api/player/effects       │
│  useServerTime()           → Syncs server time drift         │
│                                                               │
│  All hooks listen for WebSocket events and update stores    │
└───────────────────────────────────────────────────────────────┘
```

### Layer 4: Components (Pure Visualization)

```
┌────────────────────────────────────────────────────────────────┐
│                  REACT COMPONENTS                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  GameTimer   │  │  SquadPanel  │  │   WheelHUD   │        │
│  │              │  │              │  │              │        │
│  │ Reads from:  │  │ Reads from:  │  │ Reads from:  │        │
│  │ - session    │  │ - squad      │  │ - gamestate  │        │
│  │ - serverTime │  │ - leaderboard│  │ - session    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │OutcomeReveal │  │TokenCollection│  │PhaseIntro    │        │
│  │              │  │              │  │              │        │
│  │Emits:        │  │Emits:        │  │Emits:        │        │
│  │outcome.*     │  │tokens.collected│  │phase.started │        │
│  │events        │  │events        │  │events        │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Detailed Data Flows

### Spin Flow (Backend → Frontend)

```
1. SPIN INITIATED
   Player clicks SPIN button
   ↓
2. EMIT EVENT
   gameplayEventBus.emit('spin.started')
   ↓
3. REQUEST BACKEND
   POST /api/gameplay/spin { sessionId, playerId }
   ↓
4. BACKEND CALCULATES
   Determines outcome (ADVANCE/ACQUIRE/DISCOVER/STEAL/VOID)
   Returns: { outcome: 'advance', amount: 3, ... }
   ↓
5. FRONTEND RECEIVES
   WheelHUD component receives outcome
   ↓
6. EMIT OUTCOME EVENT
   gameplayEventBus.emit('spin.outcome.advance', { amount: 3 })
   ↓
7. WHEEL ANIMATES
   WheelHUD rotates wheel to ADVANCE segment
   ↓
8. OUTCOME REVEAL
   OutcomeReveal component shows +3 TOKENS with gold glow
   ↓
9. EMIT REVEAL EVENT
   gameplayEventBus.emit('outcome.revealed')
   ↓
10. TOKEN ANIMATION
    TokenCollection animates 3 tokens from wheel to counter
    ↓
11. EMIT COLLECTION EVENT
    gameplayEventBus.emit('tokens.collected', { amount: 3 })
    ↓
12. UPDATE STATE
    Session store updates playerTokens
    Leaderboard store updates player ranking
    ↓
13. UI UPDATES
    Token counter reflects new total
    Leaderboard refreshes
```

### Phase Transition Flow

```
1. PHASE COUNTDOWN
   Timer shows remaining time from phaseEndTime
   ↓
2. PHASE EXPIRES
   Backend detects phase time reached
   ↓
3. EMIT PHASE EVENT
   Backend emits via WebSocket: phase:changed
   ↓
4. SESSION STORE UPDATES
   currentPhase → nextPhase
   phaseEndTime → newEndTime
   ↓
5. EMIT BUS EVENT
   gameplayEventBus.emit('phase.completed')
   ↓
6. PHASE END ANIMATION
   PhaseEnd component shows "PHASE COMPLETE"
   Optional: elimination summary
   ↓
7. TRANSITION PAUSE
   Brief delay before next phase
   ↓
8. NEXT PHASE BEGINS
   gameplayEventBus.emit('phase.started', { phaseData })
   ↓
9. PHASE INTRO
   PhaseIntro shows next phase name/description
   ↓
10. GAMEPLAY RESUMES
    Timer begins counting down new phase
```

### Squad Ranking Update Flow

```
1. RANKING CHANGE
   Player scores tokens, ranking updates in backend
   ↓
2. LEADERBOARD UPDATED
   Backend updates squads table
   ↓
3. WEBHOOK/EVENT
   Backend emits: squad_leaderboard:rank_changed
   { squad_id, old_rank, new_rank, squad_tokens }
   ↓
4. STORE UPDATES
   useLeaderboardStore updates squad array
   Triggers re-render with new ranking
   ↓
5. COMPONENT DETECTS CHANGE
   SquadPanel.tsx detects rank prop change
   ↓
6. EMIT BUS EVENT
   gameplayEventBus.emit('squad.rankChanged', { oldRank, newRank })
   ↓
7. ANIMATION PLAYS
   Rank smoothly animates from old to new position
   ↓
8. DISPLAY UPDATES
   My Squad rank shows new value
   Top Squad may change if #1 ranked changed
```

---

## Component Communication Map

```
                        ┌─────────────────┐
                        │ GameplayEventBus│
                        └────────┬────────┘
                                 │
         ┌───────────┬───────────┼───────────┬───────────┐
         │           │           │           │           │
    ┌────▼───┐  ┌───▼────┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐
    │ SOUND  │  │ HAPTICS│ │ANALYTICS│ │ANIMATED│ │ OTHER  │
    │SYSTEM  │  │ SYSTEM │ │TRACKING │ │UI SYSTEM│ │SYSTEMS │
    └────────┘  └────────┘ └────────┘ └────────┘ └────────┘

GAMEPLAY COMPONENTS:
    │ emit events
    ▼
GameplayEventBus
    │ provides data via stores
    ▼
Zustand Stores
    │ fetch data via hooks
    ▼
Custom Hooks
    │ sync with backend
    ▼
API & WebSockets
    │ return authoritative state
    ▼
GAME ENGINE (Backend)
```

---

## Timer Synchronization Architecture

```
┌─────────────────────────────────────────────────────────┐
│              useServerTime Hook                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  On Mount:                                             │
│    clientTime1 = Date.now()                            │
│    fetch /api/server-time → serverTime                │
│    clientTime2 = Date.now()                            │
│    drift = clientTime1 - serverTime + (clientTime2/2) │
│                                                         │
│  On Timer Tick:                                        │
│    now() = Date.now() - drift  ← Always accurate       │
│                                                         │
│  Every 30 seconds:                                     │
│    Recalculate drift to prevent drift accumulation    │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│            GameTimer Component                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  remaining = phaseEndTime - serverTime.now()           │
│  display = formatTime(remaining)                       │
│                                                         │
│  Updates every 100ms (not every ms)                   │
│                                                         │
│  When remaining ≤ 0:                                   │
│    Wait for backend phase:changed event                │
│    Do NOT manually transition                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Animation Flow Architecture

```
┌──────────────────────────────────────┐
│         Animation Triggered          │
│  (e.g., spin complete, phase start)  │
└────────────────┬─────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ AnimationQueue     │
        │  .add(animation)   │
        └────────┬───────────┘
                 │
        ┌────────▼───────────┐
        │ Is Playing?        │
        │ YES → Queue        │
        │ NO → Play Now      │
        └────────┬───────────┘
                 │
        ┌────────▼──────────────────┐
        │ Framer Motion Animation   │
        │  - Scale                  │
        │  - Rotate                 │
        │  - Glow                   │
        │  - Particles              │
        └────────┬──────────────────┘
                 │
        Animation Complete
                 │
        ┌────────▼───────────────────┐
        │ Emit Completion Event      │
        │ (sound, analytics, etc)    │
        └────────┬───────────────────┘
                 │
        Process Next in Queue
```

---

## Squad Panel Architecture

```
┌─────────────────────────────────────┐
│       useLeaderboardUpdates         │
│   (Polls leaderboard every 2s)      │
└────────────────┬────────────────────┘
                 │
        ┌────────▼───────────┐
        │ /api/leaderboard   │
        │   type=squad       │
        └────────┬───────────┘
                 │
        ┌────────▼─────────────────────┐
        │ useLeaderboardStore updates   │
        │   squad: [                    │
        │     { rank: 1, name: "...", }│
        │     { rank: 2, name: "...", }│
        │   ]                           │
        └────────┬─────────────────────┘
                 │
        ┌────────▼──────────────────────┐
        │ SquadPanel Component           │
        │ Subscribes to store updates    │
        └────────┬──────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼────────┐ ┌─▼────────┐ ┌─▼──────────┐
│ My Squad   │ │Top Squad │ │Animations  │
│Section     │ │Section   │ │(rank      │
│            │ │          │ │changes)   │
│- Rank      │ │- Rank 1  │ │           │
│- Name      │ │- Name    │ │Emit:      │
│- Tokens    │ │- Tokens  │ │squad.rank │
│- Members   │ │- Members │ │Changed    │
└────────────┘ └──────────┘ └───────────┘
```

---

## Real-Time Event Types & Payloads

### Spin Events

```
spin.started
{
  timestamp: 1234567890,
  payload: {
    playerId: "user123",
    sessionId: "session456"
  }
}

spin.completed
{
  timestamp: 1234567890,
  payload: {
    outcome: "advance",
    durationMs: 5000
  }
}

spin.outcome.advance
spin.outcome.acquire
spin.outcome.discover
spin.outcome.steal
spin.outcome.void
{
  timestamp: 1234567890,
  payload: {
    outcome: "advance",
    amount: 3,
    playerId: "user123"
  }
}
```

### Token Events

```
tokens.collected
{
  timestamp: 1234567890,
  payload: {
    amount: 3,
    total: 27,
    playerId: "user123"
  }
}
```

### Phase Events

```
phase.started
{
  timestamp: 1234567890,
  payload: {
    phaseNumber: 2,
    phaseName: "Survival Round",
    phaseDescription: "...",
    durationMs: 120000,
    endTime: "2025-01-15T14:35:00Z"
  }
}

phase.completed
{
  timestamp: 1234567890,
  payload: {
    phaseNumber: 1,
    eliminationCount: 5,
    summary: "..." // optional
  }
}
```

### Player Events

```
player.eliminated
{
  timestamp: 1234567890,
  payload: {
    playerId: "user123",
    rank: 15,
    sessionId: "session456"
  }
}

shadow_surge.activated
{
  timestamp: 1234567890,
  payload: {
    intensity: 0.8,
    durationMs: 30000,
    affectedPlayers: 5
  }
}
```

---

## Performance Guidelines

### Frame Rate Targets
- Wheel animations: 60 FPS
- Outcome reveals: 60 FPS
- Token collection: 60 FPS
- Phase animations: 60 FPS
- Squad panel updates: 60 FPS
- Timer countdown: 60 FPS (update every 100ms)

### Update Frequencies
- Timer: every 100ms
- Leaderboard: poll every 2s
- Squad data: poll every 2s
- Inventory: poll every 3s
- Server time sync: every 30s

### Memory Targets
- Session memory < 50MB
- No memory growth over 5 minutes
- Event listeners properly cleaned up
- Animations don't create memory leaks

---

## Error Recovery Flows

### Network Disconnection

```
Connection Lost
    ↓
Offline Indicator shows
    ↓
Auto-reconnect every 5s
    ↓
Connection Restored
    ↓
Full state refresh from backend
    ↓
Offline Indicator hides
    ↓
Gameplay resumes
```

### Stale Data Recovery

```
Data older than expected
    ↓
Request fresh data from backend
    ↓
Compare timestamps
    ↓
Use newer data
    ↓
Discard older data
```

### Animation Collision

```
Multiple animations trigger close together
    ↓
Add to AnimationQueue
    ↓
Play first animation
    ↓
Wait for completion
    ↓
Play next in queue
    ↓
Continue until queue empty
```

---

## Implementation Checklist

### Architecture Setup
- [ ] Gameplay Event Bus created
- [ ] Event type constants defined
- [ ] useGameplayEvents hook created

### Timer System
- [ ] useServerTime enhanced
- [ ] GameTimer wired to backend
- [ ] Phase transitions from backend events
- [ ] Synchronization verified

### Squad Panel
- [ ] Store selectors added
- [ ] Real-time data flow verified
- [ ] Rank change animations added
- [ ] Sound events emitted

### Wheel System
- [ ] 5 segments verified
- [ ] Backend outcome flow verified
- [ ] Outcome reveal animations created
- [ ] Token collection animation created

### Phase System
- [ ] Phase config read from backend
- [ ] Phase intro animation created
- [ ] Phase end animation created
- [ ] Event flow verified

### Sound Integration
- [ ] All gameplay events emitted
- [ ] Sound system hook example created
- [ ] No hardcoded sound playback

### Performance
- [ ] Frame rates measured
- [ ] Memory leaks checked
- [ ] Animation queue implemented
- [ ] 60 FPS validated

---

## Next Steps (Sound System Integration)

The Gameplay Event Bus is ready for the dedicated sound system developer:

```typescript
// Sound developer subscribes to events:
gameplayEventBus.on('spin.outcome.advance', (event) => {
  soundEngine.play('advance-reward', {
    volume: 0.8,
    pitch: 1.0
  });
});

// Works with no changes to gameplay code
// Easy to add new sounds
// Easy to test sounds independently
```

---

## Testing Approach

### Manual Testing (Primary)
- Join session, spin wheel, verify flow
- Watch phase transitions
- Check real-time squad updates
- Test network reconnection
- Verify animations are smooth
- Confirm 60 FPS performance

### Automated Testing (Secondary)
- Event emission tests
- Store update tests
- Hook synchronization tests
- Animation timing tests

### User Acceptance Testing
- Play full gameplay session
- Verify experience is cinematic
- Confirm no mock data visible
- Check responsiveness
- Validate on mobile & desktop
