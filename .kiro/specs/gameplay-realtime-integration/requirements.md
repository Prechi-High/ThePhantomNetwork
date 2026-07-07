# Gameplay Real-Time Integration - Requirements

## Executive Summary

The gameplay UI has a working foundation with live data connections for core mechanics (spin, steal, phase management). However, secondary features use mock data (live feed, leaderboard, active effects, skill inventory). This spec completes the integration by:

1. Replacing all mock data with real backend sources
2. Creating missing API endpoints for secondary features
3. Establishing real-time subscriptions for all player-visible data
4. Implementing proper error recovery and reconnection logic
5. Ensuring zero hardcoded gameplay state across the entire UI

**Success Criterion:** Every visible element on screen is driven by live backend data with full reconnection resilience.

---

## 1. Mock Data to Remove

### 1.1 LiveFeed Mock Events
**Location:** `src/components/gameplay/hud/LiveFeed.tsx`

**Current State:**
```typescript
const EVENT_POOL: FeedEvent[] = [
  { id: 1, type: "steal", text: "NovaQueen stole 2,250", time: "10s" },
  { id: 2, type: "revive", text: "Ghost revived PhantomX", time: "20s" },
  // ... 4 more hardcoded events
];
// Randomly shuffles and cycles every 4 seconds
```

**Required Change:**
- Remove EVENT_POOL constant entirely
- Subscribe to live feed event stream instead
- Display real events in reverse chronological order
- Auto-scroll oldest off-screen

### 1.2 Leaderboard Mock Data
**Location:** `src/components/gameplay/GameplayArena.tsx`

**Current State:**
```typescript
const mockLeaderboard = [
  { rank: 1, name: "ShadowKing 👑", tokens: 182 },
  // ... 4 more hardcoded players
];
const [topSquads, setTopSquads] = useState<Squad[]>([
  { id: "1", name: "ShadowKings", squad_tokens: 1500 },
  // ... more squads
]);
```

**Required Change:**
- Replace with real data from `/api/gameplay/leaderboard`
- Poll every 2 seconds during active gameplay
- Display both individual and squad leaderboards

### 1.3 Active Effects Mock
**Location:** `src/components/gameplay/hud/ActiveEffects.tsx`

**Current State:**
```typescript
const [effects, setEffects] = useState<Effect[]>(INITIAL_EFFECTS);
```

**Required Change:**
- Subscribe to active effects from store/backend
- Update duration every second
- Remove auto-generate default effects

### 1.4 Skill Inventory Hardcoding
**Location:** `src/components/gameplay/hud/SkillDockHUD.tsx`

**Current State:**
```typescript
const SKILLS: Skill[] = [
  // 6 hardcoded skills always showing READY
];
```

**Required Change:**
- Fetch player inventory from `/api/player/inventory`
- Show only owned skills
- Update availability based on backend cooldowns
- Poll inventory every 3 seconds

### 1.5 Default/Fallback Values
**Location:** `src/app/(player)/play/[sessionId]/page.tsx`

**Current State:**
```typescript
prizePoolCents={totalPoolCents ?? 1250000}  // Fallback: $12,500
tokens={tokens || 24.5}  // Fallback value
playerRank={playerRank || 7}  // Fallback value
alivePlayers={totalPlayers || 28}  // Fallback count
surgePercent={72}  // Hardcoded percentage
```

**Required Change:**
- Remove all fallback values once data is loaded
- Show loading state if data unavailable
- Never display placeholder numbers

---

## 2. Required Backend Endpoints (New)

All endpoints return real-time data synchronized with game state.

### 2.1 Live Feed Endpoint
**Endpoint:** `GET /api/gameplay/livefeed?subSessionId={id}&limit=50`

**Response:**
```json
{
  "events": [
    {
      "id": "evt-uuid-1",
      "type": "steal|revive|elimination|phase|effect|lead|surge",
      "timestamp": "2025-01-15T10:30:45Z",
      "actor": { "user_id": "...", "username": "...", "avatar": "..." },
      "target": { "user_id": "...", "username": "..." },
      "details": {
        "amount": 2250,
        "effect": "shield",
        "newRank": 1
      }
    }
  ]
}
```

**Real-Time Updates:** Subscribe to WebSocket events:
- `livefeed:event` - New event published
- Payload contains full event object
- Frontend appends to live feed

### 2.2 Leaderboard Endpoint
**Endpoint:** `GET /api/gameplay/leaderboard?subSessionId={id}&type=individual|squad`

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "uuid",
      "username": "ShadowKing",
      "session_tokens": 2450,
      "squad_id": "squad-uuid",
      "squad_name": "ShadowKings",
      "alive": true,
      "position": { "x": 0.5, "y": 0.3 }
    }
  ],
  "squad_leaderboard": [
    {
      "rank": 1,
      "squad_id": "squad-uuid",
      "squad_name": "ShadowKings",
      "squad_tokens": 15000,
      "member_count": 3,
      "leader_name": "ShadowKing"
    }
  ]
}
```

**Update Frequency:** Poll every 2 seconds during active phase

### 2.3 Active Effects Endpoint
**Endpoint:** `GET /api/player/effects?userId={id}&subSessionId={subSessionId}`

**Response:**
```json
{
  "effects": [
    {
      "id": "effect-uuid",
      "type": "shield|cloak|multiplier|insurance",
      "name": "Shield",
      "duration_ms": 15000,
      "started_at": "2025-01-15T10:30:30Z",
      "expires_at": "2025-01-15T10:30:45Z",
      "icon": "url"
    }
  ],
  "server_time": "2025-01-15T10:30:35Z"
}
```

**Real-Time Updates:** WebSocket events:
- `effect:activated` - New effect added
- `effect:expired` - Effect removed
- Payload contains full effect object

### 2.4 Player Inventory Endpoint
**Endpoint:** `GET /api/player/inventory?userId={id}&subSessionId={subSessionId}`

**Response:**
```json
{
  "skills": [
    {
      "id": "skill-id",
      "name": "Steal Boost",
      "owned": true,
      "available": true,
      "cooldown_ms": 0,
      "cooldown_until": null,
      "charges": 1,
      "max_charges": 1,
      "icon": "url"
    }
  ],
  "server_time": "2025-01-15T10:30:35Z"
}
```

**Update Frequency:** Poll every 3 seconds, or subscribe to:
- `inventory:skill_available` - Skill cooldown expires
- `inventory:skill_used` - Skill activated elsewhere

---

## 3. Real-Time Event Enhancements

### 3.1 Live Feed Events
**WebSocket Event:** `livefeed:event`

Publish whenever:
- Player steals tokens
- Player revives teammate
- Player eliminated
- Phase changes
- Effect activated
- Rank changes
- Squad takes lead
- Shadow Surge triggers
- Player joins/leaves

### 3.2 Active Effects Events
**WebSocket Events:**
- `effect:activated` - New effect applied
- `effect:expired` - Effect duration end
- Payload includes full effect object and server time

### 3.3 Skill Availability Events
**WebSocket Events:**
- `skill:available` - Cooldown expires, skill usable again
- `skill:charged` - New charge gained
- Payload: `{ skillId, available, charges, cooldownMs }`

### 3.4 Leaderboard Updates
**WebSocket Event:** `leaderboard:updated`

Publish on:
- Token balance change
- Rank change
- Squad member elimination
- Squad token totals change
- Every 3 seconds (reduced granularity)

---

## 4. Frontend Data Integration

### 4.1 Live Feed Component
**Source:** WebSocket `livefeed:event` + HTTP GET polling

**Behavior:**
- Subscribe to `livefeed:event` on mount
- Initial fetch: `/api/gameplay/livefeed?limit=20`
- Append new events to top of list
- Keep last 50 events
- Scroll oldest off-screen

### 4.2 Leaderboard Component
**Source:** HTTP polling + WebSocket updates

**Behavior:**
- Fetch `/api/gameplay/leaderboard` every 2 seconds
- Listen to `leaderboard:updated` event
- Update relevant rows
- No full re-fetch on event, just update changed rows

### 4.3 Active Effects Component
**Source:** Store + WebSocket events

**Behavior:**
- Initialize from `/api/player/effects` on phase start
- Listen to `effect:activated` and `effect:expired`
- Update store on event
- Component displays store state
- Countdown displays `(expiresAt - serverTime)`

### 4.4 Skill Dock Component
**Source:** Store + HTTP polling + WebSocket events

**Behavior:**
- Fetch `/api/player/inventory` on page load
- Poll every 3 seconds
- Listen to `skill:available` and `skill:charged`
- Update store on event
- Component displays store state
- Show cooldown timer where applicable

---

## 5. Server Time Synchronization

Every API response includes `server_time` timestamp.

**Frontend Logic:**
1. On each response, calculate drift: `clientTime - serverTime`
2. Store drift in context/store
3. For any countdown: `expiresAt - (Date.now() - drift)`
4. Re-sync with server every 30 seconds

**Benefits:**
- Countdown accurate across all players
- No local timer divergence
- Handles client clock skew

---

## 6. Error Recovery

### 6.1 Polling Failure
- Retry with exponential backoff (1s, 2s, 4s, 8s max)
- Show offline indicator after 3 failures
- Auto-resume on network recovery

### 6.2 WebSocket Disconnection
- Auto-reconnect with exponential backoff
- Fetch full state on reconnect (poll endpoint)
- Clear stale real-time events while disconnected

### 6.3 Out-of-Order Events
- Validate event timestamp > current state timestamp
- Discard if older than current state
- Request full state refresh if gap detected

### 6.4 Session Timeout
- Detect if phase ends without new phase event
- Show "Session ended" message
- Disable all actions
- Allow navigation away

---

## 7. Acceptance Criteria

### 7.1 Mock Data Removal
- [ ] No hardcoded EVENT_POOL in LiveFeed
- [ ] No mockLeaderboard in GameplayArena
- [ ] No INITIAL_EFFECTS in ActiveEffects
- [ ] No hardcoded SKILLS in SkillDockHUD
- [ ] No fallback numeric values in PlayPage

### 7.2 Backend Integration
- [ ] All 4 new endpoints implemented and tested
- [ ] LiveFeed consumes real events
- [ ] Leaderboard shows real data
- [ ] Active Effects synchronized with store
- [ ] Skill Dock shows real inventory

### 7.3 Real-Time Updates
- [ ] WebSocket events drive UI updates
- [ ] No polling when real-time available
- [ ] Polling fallback works
- [ ] Server time sync implemented
- [ ] Countdown accurate within 100ms

### 7.4 Error Handling
- [ ] Reconnection automatic and transparent
- [ ] Network offline detected and shown
- [ ] Out-of-order events handled gracefully
- [ ] Session timeouts detected

### 7.5 Performance
- [ ] No unnecessary re-renders
- [ ] Live feed scrolls smoothly with 50+ events
- [ ] Leaderboard updates without janky jumps
- [ ] Skill dock responds instantly to availability changes

---

## 8. Testing Scenarios

### Scenario 1: Complete Session Live Feed
1. Join session
2. Perform spin → see event
3. Another player steals → see event
4. Phase changes → see event
5. Shadow Surge triggers → see event
6. Elimination → see event
7. Revive → see event
8. Winner → see event

✅ All events appear in live feed in real-time

### Scenario 2: Leaderboard Accuracy
1. Start with 50 players
2. Player A gains tokens → rank updates
3. Player B eliminated → rank updates
4. Compare frontend ranking with backend truth
✅ Matches exactly

### Scenario 3: Network Disconnection
1. In active phase, disconnect WiFi
2. Frontend shows offline indicator
3. Re-enable WiFi
4. Frontend reconnects and fetches latest state
5. Gameplay resumes with correct state
✅ No state corruption or duplicate events

### Scenario 4: Skill Cooldown
1. Join with Steal Boost available
2. Use steal boost → disappears, cooldown shows
3. 5 seconds pass → becomes available again
4. Display refreshes immediately
✅ Cooldown accurate and responsive

### Scenario 5: Effect Duration
1. Activate Shield effect
2. Timer starts at 30 seconds
3. After 15 seconds, timer shows 15s remaining
4. After 30 seconds, effect disappears
✅ Timer accurate, synchronized across players

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Mock data removed | 100% | Grep codebase, 0 results |
| Backend integration | 100% | All 4 endpoints working |
| Real-time events | 100% | All event types firing |
| Polling fallback | 100% | Works when WebSocket down |
| Data accuracy | 100% | Backend = Frontend at all times |
| Reconnection time | < 3s | From disconnect to full state refresh |
| Countdown accuracy | ±100ms | vs server time |
| Performance | 60 FPS | Live feed scroll, leaderboard updates |

---

## 10. Definition of Done

- [ ] All mock data removed from codebase
- [ ] All 4 new API endpoints implemented and integrated
- [ ] Real-time WebSocket events configured
- [ ] Server time synchronization implemented
- [ ] Error recovery and reconnection tested
- [ ] End-to-end session test passed
- [ ] Performance metrics met
- [ ] Integration validation report generated
