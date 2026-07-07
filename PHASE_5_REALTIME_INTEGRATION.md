# Phase 5: Real-Time Event Configuration - IMPLEMENTATION GUIDE

## Summary

This phase configures WebSocket/EventSource event emission for real-time updates. Events are published via Redis to all connected clients in a session.

---

## Event Emitter Module Created

**File:** `src/lib/realtime/event-emitter.ts`

This module provides functions to emit all real-time events. All functions follow the same pattern:

```typescript
async function emit*(subSessionId: string, ...args) {
  const channel = redisKeys.realtimeChannel(subSessionId);
  await redisPushEvent(channel, {
    type: "event:type",
    payload: { /* data */ }
  });
}
```

---

## Real-Time Event Functions

### 1. emitLiveFeedEvent
Emits a live feed event (steal, revive, elimination, etc.)

```typescript
await emitLiveFeedEvent(subSessionId, {
  id: "evt-123",
  type: "steal",
  timestamp: new Date().toISOString(),
  actor: { user_id: "attacker", username: "Player", avatar: "url" },
  target: { user_id: "victim", username: "Target" },
  details: { amount: 2250 }
});
```

**When to call:** After steal, revive, elimination actions

---

### 2. emitLeaderboardRankChange
Emits individual player rank change

```typescript
await emitLeaderboardRankChange(
  subSessionId,
  userId,
  oldRank,    // 5
  newRank,    // 4
  newTokens   // 1200
);
```

**When to call:** When player tokens increase/decrease, affecting rank

---

### 3. emitSquadLeaderboardRankChange
Emits squad rank change

```typescript
await emitSquadLeaderboardRankChange(
  subSessionId,
  squadId,
  oldRank,
  newRank,
  newSquadTokens
);
```

**When to call:** When squad tokens change, affecting squad rank

---

### 4. emitEffectActivated
Emits when effect applied to player

```typescript
await emitEffectActivated(subSessionId, userId, {
  id: "eff-456",
  type: "shield",
  name: "Shield",
  duration_ms: 30000,
  started_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 30000).toISOString(),
  icon: "url"
});
```

**When to call:** When player uses Shield, Cloak, etc.

---

### 5. emitEffectExpired
Emits when effect expires/ends

```typescript
await emitEffectExpired(subSessionId, userId, effectId);
```

**When to call:** When effect duration ends

---

### 6. emitSkillAvailable
Emits when skill cooldown ends

```typescript
await emitSkillAvailable(
  subSessionId,
  userId,
  "steal_boost",
  1,    // charges
  1     // max_charges
);
```

**When to call:** When cooldown expires

---

### 7. emitSkillCharged
Emits when multi-charge skill gains charge

```typescript
await emitSkillCharged(
  subSessionId,
  userId,
  skillId,
  charges,      // 2
  maxCharges    // 3
);
```

**When to call:** When charge-based skill gets new charge

---

### 8. emitPlayerEliminated
Emits when player eliminated

```typescript
await emitPlayerEliminated(
  subSessionId,
  userId,
  eliminatedByUserId  // optional
);
```

**When to call:** When player is eliminated

---

### 9. emitPhaseChange
Emits when phase changes

```typescript
await emitPhaseChange(
  subSessionId,
  phase,        // 2
  round,        // 1
  phaseEndsAt   // timestamp in ms
);
```

**When to call:** When session moves to new phase

---

### 10. emitShadowSurge
Emits when Shadow Surge triggered

```typescript
await emitShadowSurge(subSessionId, 72); // 72% threshold
```

**When to call:** When Shadow Surge condition met

---

## Integration Points

These are the places in existing code where events should be emitted:

### 1. In `/api/gameplay/steal/execute`
After successful steal, emit:
```typescript
import { emitLiveFeedEvent } from "@/lib/realtime/event-emitter";

// After steal is resolved...
await emitLiveFeedEvent(subSessionId, {
  id: `steal-${Date.now()}`,
  type: "steal",
  timestamp: new Date().toISOString(),
  actor: {
    user_id: attacker.user_id,
    username: attacker.username,
    avatar: attacker.avatar
  },
  target: {
    user_id: victim.user_id,
    username: victim.username
  },
  details: {
    amount: stealAmount,
    newTokens: attacker.new_tokens
  }
});
```

### 2. In `/api/gameplay/revive`
After revive action:
```typescript
await emitLiveFeedEvent(subSessionId, {
  id: `revive-${Date.now()}`,
  type: "revive",
  timestamp: new Date().toISOString(),
  actor: { user_id: reviverUserId, username, avatar },
  target: { user_id: revivedUserId, username },
  details: {}
});
```

### 3. In `/api/gameplay/spin`
After spin result calculation:
```typescript
// If elimination occurs
await emitPlayerEliminated(subSessionId, eliminatedUserId);

// If rank changes
await emitLeaderboardRankChange(
  subSessionId,
  userId,
  oldRank,
  newRank,
  newTokens
);
```

### 4. In effects application logic
When effect activated:
```typescript
await emitEffectActivated(subSessionId, userId, effectData);
```

When effect expires:
```typescript
await emitEffectExpired(subSessionId, userId, effectId);
```

### 5. In skill cooldown logic
When cooldown ends:
```typescript
await emitSkillAvailable(subSessionId, userId, skillId, charges, maxCharges);
```

---

## Event Flow Example

### Scenario: Player A steals from Player B

1. **Player A calls spin** → gets steal result
2. **Player A selects target** (Player B)
3. **API calls `/api/gameplay/steal/execute`**:
   - Compute steal amount
   - Deduct from Player B
   - Add to Player A
   - Update both balances in DB
   - **Emit steal event** ← EVENT-1
   ```typescript
   await emitLiveFeedEvent(subSessionId, {
     type: "steal",
     actor: { user_id: playerA, username: "Alice", avatar: "..." },
     target: { user_id: playerB, username: "Bob", avatar: "..." },
     details: { amount: 500, newTokens: playerA_new_balance }
   });
   ```

4. **Both players' leaderboard ranks may change**:
   - If Player A now has more tokens than previous rank holder
   - **Emit rank changes** ← EVENT-2, EVENT-3
   ```typescript
   await emitLeaderboardRankChange(subSessionId, playerA_id, 5, 4, new_tokens);
   await emitLeaderboardRankChange(subSessionId, other_id, 4, 5, their_new_tokens);
   ```

5. **Clients receive events via EventSource**:
   - All players get `livefeed:event` with steal details
   - Leaderboard subscribers update ranks
   - Live feed displays: "Alice stole 500 from Bob"

---

## Event Broadcasting Mechanism

### How it works:

1. **Server emits event** → `redisPushEvent(channel, event)`
2. **Redis stores event** in list (max 100 recent, expires after 1 hour)
3. **Connected clients poll channel** every 2 seconds via `/api/realtime/[subSessionId]`
4. **Client receives events** → parses JSON → updates state
5. **State updates trigger re-renders** → UI reflects new data

### Architecture:
```
Game Action → Server Logic
              ↓
         emit*Event()
              ↓
         Redis List
              ↓
    /api/realtime polling
              ↓
         EventSource clients
              ↓
    Hook receives event
              ↓
    Store state updates
              ↓
    React re-render
```

---

## Implementation Checklist

### For Each Game Event Type:

- [ ] **Steal**: Add `emitLiveFeedEvent` in `/api/gameplay/steal/execute`
- [ ] **Revive**: Add `emitLiveFeedEvent` in `/api/gameplay/revive`
- [ ] **Elimination**: Add `emitPlayerEliminated` in spin/phase logic
- [ ] **Rank Change**: Add `emitLeaderboardRankChange` after token updates
- [ ] **Squad Rank Change**: Add `emitSquadLeaderboardRankChange`
- [ ] **Effect Active**: Add `emitEffectActivated` in effect application
- [ ] **Effect Expired**: Add `emitEffectExpired` in effect cleanup
- [ ] **Skill Available**: Add `emitSkillAvailable` in cooldown resolution
- [ ] **Skill Charged**: Add `emitSkillCharged` in charge increment
- [ ] **Phase Change**: Add `emitPhaseChange` in phase transition
- [ ] **Shadow Surge**: Add `emitShadowSurge` in surge trigger

---

## Integration Example: Complete Steal Flow

Here's a complete example of how to integrate event emission into the steal endpoint:

```typescript
// File: src/app/api/gameplay/steal/execute/route.ts

import { emitLiveFeedEvent, emitLeaderboardRankChange } from "@/lib/realtime/event-emitter";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { subSessionId, victimId, resolve } = await request.json();
  // ... existing validation code ...

  const progress = await redisGet<StealProgress>(stealKey);
  // ... existing steal logic ...

  // Calculate new balances
  const stealAmount = computeStealAmount(progress.fireBoostTaps);
  const victimNewBalance = victim.session_tokens - stealAmount;
  const attackerNewBalance = attacker.session_tokens + stealAmount;

  // Update database
  await admin.from("sub_session_players")
    .update({ session_tokens: victimNewBalance })
    .eq("user_id", victimId);
  
  await admin.from("sub_session_players")
    .update({ session_tokens: attackerNewBalance })
    .eq("user_id", user.id);

  // 🎯 EMIT STEAL EVENT
  await emitLiveFeedEvent(subSessionId, {
    id: `steal-${subSessionId}-${Date.now()}`,
    type: "steal",
    timestamp: new Date().toISOString(),
    actor: {
      user_id: user.id,
      username: attacker.profiles?.username || "Player",
      avatar: attacker.profiles?.avatar_id || ""
    },
    target: {
      user_id: victimId,
      username: victim.profiles?.username || "Player"
    },
    details: {
      amount: stealAmount,
      newTokens: attackerNewBalance,
      fireBoostTaps: progress.fireBoostTaps
    }
  });

  // Calculate new ranks
  const allPlayers = await admin
    .from("sub_session_players")
    .select("user_id, session_tokens")
    .eq("sub_session_id", subSessionId)
    .order("session_tokens", { ascending: false });

  const attackerRank = allPlayers.findIndex(p => p.user_id === user.id) + 1;
  const victimRank = allPlayers.findIndex(p => p.user_id === victimId) + 1;

  // 🎯 EMIT RANK CHANGES
  if (attackerRank !== previousAttackerRank) {
    await emitLeaderboardRankChange(
      subSessionId,
      user.id,
      previousAttackerRank,
      attackerRank,
      attackerNewBalance
    );
  }

  if (victimRank !== previousVictimRank) {
    await emitLeaderboardRankChange(
      subSessionId,
      victimId,
      previousVictimRank,
      victimRank,
      victimNewBalance
    );
  }

  return NextResponse.json({
    resolved: true,
    stealAmount,
    newBalance: attackerNewBalance
  });
}
```

---

## Files Created/Modified This Phase

**Created:**
- `src/lib/realtime/event-emitter.ts` (230 lines)

**Modified (for integration):**
- `src/app/api/gameplay/steal/execute/route.ts` - Add event emissions
- `src/app/api/gameplay/revive/route.ts` - Add event emissions
- `src/app/api/gameplay/spin/route.ts` - Add event emissions
- Any effect application logic - Add event emissions
- Any skill cooldown logic - Add event emissions

---

## Event Types Reference

| Event Type | Emitted By | Received By | UI Component |
|------------|-----------|------------|--------------|
| livefeed:event | All game actions | All players | LiveFeed |
| leaderboard:updated | Token changes | All players | Leaderboard |
| squad_leaderboard:rank_changed | Squad token changes | Squad members | Leaderboard |
| effect:activated | Effect application | Affected player | ActiveEffects |
| effect:expired | Effect duration end | Affected player | ActiveEffects |
| skill:available | Cooldown resolution | Player | SkillDock |
| skill:charged | Charge increment | Player | SkillDock |

---

## Testing Events

To test event emission:

1. **Start development server** with hooks connected
2. **Perform action** (e.g., steal another player's tokens)
3. **Check browser console** for EventSource messages
4. **Verify UI updates** (live feed, leaderboard, etc.)
5. **Monitor Redis** (if accessible) to see events queued

---

## Performance Considerations

### Event Throughput:
- Live feed: 1-2 events per second during active gameplay
- Leaderboard: 1-5 updates per minute
- Effects: Variable (on activation/expiration)
- Skills: Variable (on cooldown resolution)

### Redis Usage:
- Events stored in Redis list (max 100, expires 1 hour)
- Polling clients fetch every 2 seconds
- Memory footprint: ~1-5MB per active session

### Optimization Strategies:
- Batch rank updates (emit once per 500ms batch)
- Compress live feed events
- Throttle leaderboard updates during high-frequency changes
- Use Redis TTL to auto-cleanup old events

---

## Next Steps

After Phase 5 integration:

**Phase 6** - Implement error handling:
- Retry logic for failed emissions
- Offline detection and reconnection
- Event validation (prevent out-of-order)
- Connection health monitoring

**Phase 7** - Integration & Testing:
- End-to-end gameplay tests
- Performance benchmarks
- Network failure scenarios

---

## Notes

### Important:

1. **Event Routing**: All events go through single channel `realtime/{subSessionId}`
2. **Client Filtering**: Client hooks filter by event type and userId
3. **Serverless**: Redis-based design works with serverless functions
4. **No WebSocket**: Uses EventSource (SSE) for better serverless compatibility
5. **Fallback**: Polling provides data if events missed

### Future Enhancement:

- Add event deduplication for idempotency
- Implement event versioning for backwards compatibility
- Add event audit logging for gameplay disputes
- Consider migration to WebSocket for lower latency
