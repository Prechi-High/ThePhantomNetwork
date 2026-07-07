# Gameplay Real-Time Integration - Design Document

## 1. Architecture Overview

### 1.1 Data Flow

```
Backend (Source of Truth)
    ↓
REST Endpoints (Initial State)
    ↓
Zustand Stores (Frontend State)
    ↓
WebSocket (Real-Time Updates)
    ↓
React Components (Visual Representation)
```

### 1.2 State Management Layers

**Layer 1: Server Truth**
- Database holds all gameplay state
- API endpoints serve authoritative data
- Real-time events published immediately

**Layer 2: Store (Zustand)**
- `useGameplayStore` - Phase, tokens, round, timing
- `useStealStore` - Steal targets, fire boost
- `useSessionStore` - Session metadata
- `useLiveFeedStore` - Live feed events (NEW)
- `useLeaderboardStore` - Leaderboard data (NEW)
- `useEffectsStore` - Active effects (NEW)
- `useInventoryStore` - Player skills (NEW)

**Layer 3: Component Props**
- Components receive only what they display
- No derived calculations
- No local state for game truth

---

## 2. New Stores

### 2.1 Live Feed Store
**Path:** `src/stores/useLiveFeedStore.ts`

```typescript
interface FeedEvent {
  id: string;
  type: 'steal' | 'revive' | 'elimination' | 'phase' | 'effect' | 'lead' | 'surge';
  timestamp: string;
  actor: { user_id: string; username: string; avatar: string };
  target?: { user_id: string; username: string };
  details: Record<string, unknown>;
}

interface LiveFeedStore {
  events: FeedEvent[];
  addEvent: (event: FeedEvent) => void;
  removeOldestEvent: () => void;
  setEvents: (events: FeedEvent[]) => void;
  clear: () => void;
}

// Keep max 50 events
// Newest first
// Auto-remove oldest when limit exceeded
```

### 2.2 Leaderboard Store
**Path:** `src/stores/useLeaderboardStore.ts`

```typescript
interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  session_tokens: number;
  squad_id: string;
  squad_name: string;
  alive: boolean;
  position: { x: number; y: number };
}

interface SquadLeaderboardEntry {
  rank: number;
  squad_id: string;
  squad_name: string;
  squad_tokens: number;
  member_count: number;
  leader_name: string;
}

interface LeaderboardStore {
  individual: LeaderboardEntry[];
  squad: SquadLeaderboardEntry[];
  updateIndividual: (entries: LeaderboardEntry[]) => void;
  updateSquad: (entries: SquadLeaderboardEntry[]) => void;
  updateRank: (userId: string, newRank: number) => void;
  updateSquadRank: (squadId: string, newRank: number) => void;
}
```

### 2.3 Active Effects Store
**Path:** `src/stores/useEffectsStore.ts`

```typescript
interface ActiveEffect {
  id: string;
  type: 'shield' | 'cloak' | 'multiplier' | 'insurance';
  name: string;
  duration_ms: number;
  started_at: string;
  expires_at: string;
  icon: string;
}

interface EffectsStore {
  effects: ActiveEffect[];
  addEffect: (effect: ActiveEffect) => void;
  removeEffect: (effectId: string) => void;
  setEffects: (effects: ActiveEffect[]) => void;
  getTimeRemaining: (effectId: string) => number; // ms
  isExpired: (effectId: string) => boolean;
}
```

### 2.4 Inventory Store
**Path:** `src/stores/useInventoryStore.ts`

```typescript
interface SkillInInventory {
  id: string;
  name: string;
  owned: boolean;
  available: boolean;
  cooldown_ms: number;
  cooldown_until: string | null;
  charges: number;
  max_charges: number;
  icon: string;
}

interface InventoryStore {
  skills: SkillInInventory[];
  serverTime: string;
  setSkills: (skills: SkillInInventory[]) => void;
  setServerTime: (time: string) => void;
  updateSkillCooldown: (skillId: string, cooldownMs: number) => void;
  updateSkillCharges: (skillId: string, charges: number) => void;
  getSkillAvailability: (skillId: string) => boolean;
  getSkillCooldownRemaining: (skillId: string) => number; // ms
}
```

---

## 3. New Hooks

### 3.1 useLiveFeedUpdates
**Path:** `src/hooks/useLiveFeedUpdates.ts`

Subscribes to real-time live feed events and polling fallback.

```typescript
export function useLiveFeedUpdates(subSessionId: string | null) {
  const { addEvent, setEvents } = useLiveFeedStore();
  
  // Initial fetch
  useEffect(() => {
    if (!subSessionId) return;
    
    fetch(`/api/gameplay/livefeed?subSessionId=${subSessionId}&limit=20`)
      .then(r => r.json())
      .then(data => setEvents(data.events));
  }, [subSessionId]);
  
  // Real-time subscription
  useEffect(() => {
    if (!subSessionId) return;
    
    // WebSocket connection
    const handler = (event) => {
      if (event.type === 'livefeed:event') {
        addEvent(event.payload);
      }
    };
    
    realTimeService.subscribe('livefeed:event', handler);
    
    // Polling fallback (every 2 seconds)
    const poll = setInterval(() => {
      fetch(`/api/gameplay/livefeed?subSessionId=${subSessionId}&limit=50`)
        .then(r => r.json())
        .then(data => setEvents(data.events));
    }, 2000);
    
    return () => {
      realTimeService.unsubscribe('livefeed:event', handler);
      clearInterval(poll);
    };
  }, [subSessionId, addEvent, setEvents]);
}
```

### 3.2 useLeaderboardUpdates
**Path:** `src/hooks/useLeaderboardUpdates.ts`

Polls leaderboard with WebSocket updates.

```typescript
export function useLeaderboardUpdates(subSessionId: string | null) {
  const store = useLeaderboardStore();
  
  // Poll every 2 seconds
  useEffect(() => {
    if (!subSessionId) return;
    
    const poll = setInterval(async () => {
      const [ind, squad] = await Promise.all([
        fetch(`/api/gameplay/leaderboard?subSessionId=${subSessionId}&type=individual`)
          .then(r => r.json()),
        fetch(`/api/gameplay/leaderboard?subSessionId=${subSessionId}&type=squad`)
          .then(r => r.json())
      ]);
      
      store.updateIndividual(ind.leaderboard);
      store.updateSquad(squad.squad_leaderboard);
    }, 2000);
    
    // Real-time updates
    const handler = (event) => {
      if (event.type === 'leaderboard:rank_changed') {
        store.updateRank(event.user_id, event.new_rank);
      }
      if (event.type === 'squad_leaderboard:rank_changed') {
        store.updateSquadRank(event.squad_id, event.new_rank);
      }
    };
    
    realTimeService.subscribe('leaderboard:updated', handler);
    
    return () => {
      clearInterval(poll);
      realTimeService.unsubscribe('leaderboard:updated', handler);
    };
  }, [subSessionId, store]);
}
```

### 3.3 useEffectsUpdates
**Path:** `src/hooks/useEffectsUpdates.ts`

Manages active effects with real-time sync.

```typescript
export function useEffectsUpdates(userId: string | null, subSessionId: string | null) {
  const store = useEffectsStore();
  
  // Initial fetch
  useEffect(() => {
    if (!userId || !subSessionId) return;
    
    fetch(`/api/player/effects?userId=${userId}&subSessionId=${subSessionId}`)
      .then(r => r.json())
      .then(data => {
        store.setEffects(data.effects);
        store.setServerTime(data.server_time);
      });
  }, [userId, subSessionId]);
  
  // Real-time updates
  useEffect(() => {
    if (!userId) return;
    
    const handlers = {
      'effect:activated': (event) => {
        store.addEffect(event.effect);
      },
      'effect:expired': (event) => {
        store.removeEffect(event.effectId);
      }
    };
    
    Object.entries(handlers).forEach(([event, handler]) => {
      realTimeService.subscribe(event, handler);
    });
    
    // Sync server time every 30 seconds
    const syncTimer = setInterval(async () => {
      const response = await fetch('/api/server-time');
      const { server_time } = await response.json();
      store.setServerTime(server_time);
    }, 30000);
    
    return () => {
      Object.entries(handlers).forEach(([event]) => {
        realTimeService.unsubscribe(event, handlers[event]);
      });
      clearInterval(syncTimer);
    };
  }, [userId, store]);
  
  // Clean up expired effects every second
  useEffect(() => {
    const cleanTimer = setInterval(() => {
      const expiredIds = store.effects
        .filter(e => store.isExpired(e.id))
        .map(e => e.id);
      
      expiredIds.forEach(id => store.removeEffect(id));
    }, 1000);
    
    return () => clearInterval(cleanTimer);
  }, [store]);
}
```

### 3.4 useInventoryUpdates
**Path:** `src/hooks/useInventoryUpdates.ts`

Tracks player skill inventory and cooldowns.

```typescript
export function useInventoryUpdates(userId: string | null, subSessionId: string | null) {
  const store = useInventoryStore();
  
  // Initial fetch
  useEffect(() => {
    if (!userId || !subSessionId) return;
    
    fetch(`/api/player/inventory?userId=${userId}&subSessionId=${subSessionId}`)
      .then(r => r.json())
      .then(data => {
        store.setSkills(data.skills);
        store.setServerTime(data.server_time);
      });
  }, [userId, subSessionId]);
  
  // Poll every 3 seconds
  useEffect(() => {
    if (!userId || !subSessionId) return;
    
    const poll = setInterval(() => {
      fetch(`/api/player/inventory?userId=${userId}&subSessionId=${subSessionId}`)
        .then(r => r.json())
        .then(data => {
          store.setSkills(data.skills);
          store.setServerTime(data.server_time);
        });
    }, 3000);
    
    // Real-time updates for instant feedback
    const handlers = {
      'skill:available': (event) => {
        store.updateSkillCooldown(event.skillId, 0);
      },
      'skill:charged': (event) => {
        store.updateSkillCharges(event.skillId, event.charges);
      }
    };
    
    Object.entries(handlers).forEach(([event, handler]) => {
      realTimeService.subscribe(event, handler);
    });
    
    return () => {
      clearInterval(poll);
      Object.entries(handlers).forEach(([event]) => {
        realTimeService.unsubscribe(event, handlers[event]);
      });
    };
  }, [userId, subSessionId, store]);
}
```

### 3.5 useServerTime
**Path:** `src/hooks/useServerTime.ts`

Provides synchronized server time for countdowns.

```typescript
export function useServerTime() {
  const { serverTime, setServerTime } = useInventoryStore(); // or dedicated store
  const [drift, setDrift] = useState(0);
  
  useEffect(() => {
    // Sync on mount
    fetch('/api/server-time')
      .then(r => r.json())
      .then(data => {
        const calculated_drift = Date.now() - new Date(data.server_time).getTime();
        setDrift(calculated_drift);
        setServerTime(data.server_time);
      });
    
    // Re-sync every 60 seconds
    const timer = setInterval(() => {
      fetch('/api/server-time')
        .then(r => r.json())
        .then(data => {
          const calculated_drift = Date.now() - new Date(data.server_time).getTime();
          setDrift(calculated_drift);
          setServerTime(data.server_time);
        });
    }, 60000);
    
    return () => clearInterval(timer);
  }, [setServerTime]);
  
  return {
    now: () => Date.now() - drift,
    getCountdown: (expiresAt: string) => {
      const expires = new Date(expiresAt).getTime();
      return Math.max(0, expires - (Date.now() - drift));
    }
  };
}
```

---

## 4. Component Updates

### 4.1 LiveFeed Component
**File:** `src/components/gameplay/hud/LiveFeed.tsx`

```typescript
export function LiveFeed() {
  const { sessionId, subSessionId } = useSessionStore();
  const events = useLiveFeedStore(s => s.events);
  
  // Removed: EVENT_POOL constant
  // Removed: random shuffling logic
  // Added: useLiveFeedUpdates hook
  
  useLiveFeedUpdates(subSessionId);
  
  return (
    <div className="live-feed">
      {events.slice(0, 5).map(event => (
        <FeedEventRow key={event.id} event={event} />
      ))}
    </div>
  );
}
```

**Changes:**
- Remove EVENT_POOL constant
- Use store data directly
- Subscribe with useLiveFeedUpdates
- Display newest events first
- Auto-scroll oldest off-screen

### 4.2 Leaderboard Component
**File:** `src/components/gameplay/hud/Leaderboard.tsx` (NEW)

```typescript
export function Leaderboard({ view = 'individual' }: { view?: 'individual' | 'squad' }) {
  const { sessionId, subSessionId } = useSessionStore();
  const individual = useLeaderboardStore(s => s.individual);
  const squad = useLeaderboardStore(s => s.squad);
  
  useLeaderboardUpdates(subSessionId);
  
  const data = view === 'individual' ? individual : squad;
  
  return (
    <div className="leaderboard">
      {data.map((entry, idx) => (
        <LeaderboardRow key={entry.user_id || entry.squad_id} entry={entry} rank={idx + 1} />
      ))}
    </div>
  );
}
```

**Changes:**
- Replace mockLeaderboard with real data
- Display both individual and squad views
- Real-time rank updates

### 4.3 Active Effects Component
**File:** `src/components/gameplay/hud/ActiveEffects.tsx`

```typescript
export function ActiveEffects() {
  const { currentUserId, subSessionId } = useSessionStore();
  const effects = useEffectsStore(s => s.effects);
  const serverTime = useServerTime();
  
  // Removed: INITIAL_EFFECTS constant
  // Added: useEffectsUpdates hook
  
  useEffectsUpdates(currentUserId, subSessionId);
  
  return (
    <div className="active-effects">
      {effects.map(effect => (
        <EffectBadge
          key={effect.id}
          effect={effect}
          remaining={serverTime.getCountdown(effect.expires_at)}
        />
      ))}
    </div>
  );
}
```

**Changes:**
- Remove INITIAL_EFFECTS constant
- Use effects store
- Sync with real backend data
- Accurate countdown using server time

### 4.4 Skill Dock Component
**File:** `src/components/gameplay/hud/SkillDockHUD.tsx`

```typescript
export function SkillDockHUD() {
  const { currentUserId, subSessionId } = useSessionStore();
  const skills = useInventoryStore(s => s.skills);
  const serverTime = useServerTime();
  
  // Removed: hardcoded SKILLS array
  // Added: useInventoryUpdates hook
  
  useInventoryUpdates(currentUserId, subSessionId);
  
  const getSkillState = (skill: SkillInInventory) => {
    if (!skill.owned) return 'locked';
    if (!skill.available) {
      const cooldownRemaining = new Date(skill.cooldown_until!).getTime() - serverTime.now();
      return cooldownRemaining > 0 ? 'cooldown' : 'ready';
    }
    return 'ready';
  };
  
  return (
    <div className="skill-dock">
      {skills.map(skill => (
        <SkillSlot
          key={skill.id}
          skill={skill}
          state={getSkillState(skill)}
          cooldownRemaining={
            skill.cooldown_until 
              ? Math.max(0, new Date(skill.cooldown_until).getTime() - serverTime.now())
              : 0
          }
        />
      ))}
    </div>
  );
}
```

**Changes:**
- Remove hardcoded SKILLS array
- Subscribe to real inventory
- Show actual availability
- Display real cooldowns
- Show only owned skills

### 4.5 PlayPage
**File:** `src/app/(player)/play/[sessionId]/page.tsx`

Remove all fallback values:

```typescript
// REMOVE ALL THESE:
prizePoolCents={totalPoolCents ?? 1250000}  // ❌ Remove fallback
tokens={tokens || 24.5}                      // ❌ Remove fallback
playerRank={playerRank || 7}                 // ❌ Remove fallback
alivePlayers={totalPlayers || 28}            // ❌ Remove fallback
surgePercent={72}                            // ❌ Remove hardcode

// KEEP ONLY THIS:
prizePoolCents={totalPoolCents}
tokens={tokens}
playerRank={playerRank}
alivePlayers={totalPlayers}
surgePercent={shadowSurgePercent}  // From store
```

**Changes:**
- Remove all ?? and || fallback values
- Show loading state instead
- Never display placeholder data

---

## 5. Real-Time Event Schema

### 5.1 Live Feed Event
```json
{
  "type": "livefeed:event",
  "payload": {
    "id": "evt-123",
    "type": "steal",
    "timestamp": "2025-01-15T10:30:45.123Z",
    "actor": {
      "user_id": "user-1",
      "username": "ShadowKing",
      "avatar": "url"
    },
    "target": {
      "user_id": "user-2",
      "username": "Ghost"
    },
    "details": {
      "amount": 2250,
      "newTokens": 8450
    }
  }
}
```

### 5.2 Leaderboard Update Event
```json
{
  "type": "leaderboard:updated",
  "payload": {
    "event": "rank_changed",
    "user_id": "user-1",
    "old_rank": 2,
    "new_rank": 1,
    "new_tokens": 9500
  }
}
```

### 5.3 Effect Event
```json
{
  "type": "effect:activated",
  "payload": {
    "id": "eff-456",
    "type": "shield",
    "name": "Shield",
    "duration_ms": 30000,
    "started_at": "2025-01-15T10:30:45.123Z",
    "expires_at": "2025-01-15T10:31:15.123Z",
    "icon": "url"
  }
}
```

### 5.4 Skill Event
```json
{
  "type": "skill:available",
  "payload": {
    "user_id": "user-1",
    "skill_id": "steal_boost",
    "available": true,
    "charges": 1
  }
}
```

---

## 6. Error Recovery Strategy

### 6.1 Polling Retry Logic
```typescript
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      const delay = Math.min(1000 * Math.pow(2, i), 8000);
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
};
```

### 6.2 Reconnection Detection
```typescript
const handleWebSocketError = () => {
  setOfflineIndicator(true);
  // Auto-attempt reconnection
  const reconnectTimer = setInterval(() => {
    testConnection()
      .then(() => {
        setOfflineIndicator(false);
        clearInterval(reconnectTimer);
        fetchFullState(); // Refresh all state
      })
      .catch(() => {
        // Keep trying
      });
  }, 5000);
};
```

### 6.3 Event Validation
```typescript
const validateEvent = (event, lastState) => {
  if (!event.timestamp) return false;
  if (new Date(event.timestamp) < new Date(lastState.timestamp)) {
    return false; // Out of order
  }
  return true;
};
```

---

## 7. Testing Approach

### 7.1 Mock Service
Create mock implementations for testing:

```typescript
// src/__mocks__/livefeedService.ts
export const mockLiveFeedService = {
  subscribe: (event, handler) => { /* ... */ },
  unsubscribe: (event, handler) => { /* ... */ },
  emit: (event, payload) => { /* triggers handlers */ }
};
```

### 7.2 Test Scenarios
1. **Live Feed:** Add 50 events, verify oldest removed
2. **Leaderboard:** Update rank, verify rank change
3. **Effects:** Add effect, countdown, auto-expire
4. **Skills:** Cooldown applied, then resolved
5. **Disconnection:** Reconnect and full state refresh
6. **Out-of-order:** Discard old events

---

## 8. Performance Considerations

### 8.1 Re-render Optimization
- Use selectors in Zustand: `store(s => s.specificField)`
- Memoize components that receive effect arrays
- debounce leaderboard updates to 500ms batches

### 8.2 Memory Management
- Keep live feed at max 50 events
- Remove effects when expired
- Cleanup subscriptions on unmount

### 8.3 Network Optimization
- Batch leaderboard updates
- Use WebSocket for real-time, HTTP for initial state
- Compress live feed payload

---

## 9. Deployment Checklist

- [ ] All 4 API endpoints deployed and tested
- [ ] WebSocket real-time service configured
- [ ] All stores created and integrated
- [ ] All hooks implemented and integrated
- [ ] All mock data removed from components
- [ ] All fallback values removed
- [ ] Error handling tested
- [ ] Reconnection tested
- [ ] Performance benchmarks met
- [ ] End-to-end test passed
