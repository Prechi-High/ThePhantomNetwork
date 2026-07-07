# THE PHANTOM

A cinematic multiplayer competitive ecosystem built around sessions, squads, camps, rivalries, and real-money consequence.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Postgres, Auth, RLS)
- **Upstash Redis** (hot gameplay state, pub/sub, rate limiting)
- **Zustand** (client state)
- **Framer Motion** (spin wheel, fire boost UI)
- **Stripe** (wallet deposits)

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in credentials
2. Run Supabase migrations: `supabase/migrations/001_initial_schema.sql`
3. Run seed: `supabase/seed.sql`
4. Install and run:

```bash
npm install
npm run dev
```

## Project Structure

- `src/app/` — Routes and API handlers
- `src/components/` — UI and gameplay components
- `src/lib/gameplay/` — Pure rule engines (unit tested)
- `src/stores/` — Zustand stores
- `supabase/` — Migrations and seed data

## Real-Time Gameplay Architecture

**All gameplay data is live and real-time** — no mock data or placeholders.

### State Management

Four dedicated Zustand stores handle gameplay state:

1. **`useLiveFeedStore`** — Live feed events (max 50, auto-trimmed)
   - Stores: `FeedEvent[]`
   - Methods: `addEvent`, `removeOldestEvent`, `setEvents`, `clear`

2. **`useLeaderboardStore`** — Leaderboard rankings
   - Stores: `LeaderboardEntry[]` (individual) and `SquadLeaderboardEntry[]` (squad)
   - Methods: `updateIndividual`, `updateSquad`, `updateRank`, `updateSquadRank`

3. **`useEffectsStore`** — Active effects with expirations
   - Stores: `ActiveEffect[]`
   - Methods: `addEffect`, `removeEffect`, `setEffects`, `getTimeRemaining`, `isExpired`

4. **`useInventoryStore`** — Player skill inventory and cooldowns
   - Stores: `SkillInInventory[]` + server time for sync
   - Methods: `setSkills`, `setServerTime`, `updateSkillCooldown`, `updateSkillCharges`, `getSkillAvailability`, `getSkillCooldownRemaining`

### Real-Time Subscriptions

Five custom hooks subscribe to live data with polling fallback:

1. **`useLiveFeedUpdates`** — Subscribes to livefeed events
   - Initial: `GET /api/gameplay/livefeed?subSessionId={id}&limit=20`
   - Real-time: WebSocket `livefeed:event`
   - Fallback polling: Every 2 seconds

2. **`useLeaderboardUpdates`** — Subscribes to rank changes
   - Initial: `GET /api/gameplay/leaderboard?subSessionId={id}&type=individual|squad`
   - Real-time: WebSocket `leaderboard:updated` and `squad_leaderboard:rank_changed`
   - Fallback polling: Every 2 seconds

3. **`useEffectsUpdates`** — Subscribes to effect lifecycle
   - Initial: `GET /api/player/effects?userId={id}&subSessionId={subSessionId}`
   - Real-time: WebSocket `effect:activated` and `effect:expired`
   - Server sync: `GET /api/server-time` every 30 seconds
   - Auto-cleanup: Expired effects removed every 1 second

4. **`useInventoryUpdates`** — Subscribes to skill availability
   - Initial: `GET /api/player/inventory?userId={id}&subSessionId={subSessionId}`
   - Real-time: WebSocket `skill:available` and `skill:charged`
   - Fallback polling: Every 3 seconds

5. **`useServerTime`** — Clock synchronization
   - Fetches `GET /api/server-time` on mount
   - Calculates client-server drift
   - Re-syncs every 60 seconds
   - Exposes: `now()` and `getCountdown(expiresAt)` methods

### Components Using Live Data

All gameplay HUD components pull from Zustand stores:

- **`LiveFeed.tsx`** — Displays latest 5 events in reverse chronological order
- **`Leaderboard.tsx`** — Shows individual or squad rankings with smooth updates
- **`ActiveEffects.tsx`** — Lists active effects with live countdown timers
- **`SkillDockHUD.tsx`** — Shows owned skills with availability/cooldown status

### API Endpoints

Five endpoints power the real-time system:

1. `GET /api/gameplay/livefeed` — Fetch live feed events
2. `GET /api/gameplay/leaderboard` — Fetch leaderboard (individual or squad)
3. `GET /api/player/effects` — Fetch active effects
4. `GET /api/player/inventory` — Fetch skill inventory
5. `GET /api/server-time` — Fetch server time for clock sync

### Real-Time Event Types

Emitted via Redis pub/sub with serverless-safe polling:

| Event | Direction | Recipients | Details |
|-------|-----------|------------|---------|
| `livefeed:event` | Server → Clients | All in session | FeedEvent payload |
| `leaderboard:updated` | Server → Clients | All in session | User rank change |
| `squad_leaderboard:rank_changed` | Server → Clients | All in session | Squad rank change |
| `effect:activated` | Server → Client | Affected player | ActiveEffect payload |
| `effect:expired` | Server → Client | Affected player | Effect ID |
| `skill:available` | Server → Client | Affected player | Skill ID, availability |
| `skill:charged` | Server → Client | Affected player | Skill ID, charges |

### Error Handling & Recovery

- **Connection Health:** `useConnectionHealth` hook detects offline state within 3-5 seconds
- **Auto-Reconnect:** Exponential backoff (1s, 2s, 4s, 8s max)
- **Offline UI:** `OfflineIndicator` component shows connection status
- **Event Validation:** `validateEvent` utility checks event ordering
- **Retry Logic:** `retryWithBackoff` utility handles polling retries

See `INTEGRATION_VALIDATION_REPORT.md` for complete testing results and performance metrics.

## References

- `src/stores/` — Zustand store implementations
- `src/hooks/` — Real-time subscription hooks
- `src/lib/realtime/events.ts` — Event emission utilities
- `src/__tests__/integration/gameplay-realtime.test.ts` — Integration tests
- `INTEGRATION_VALIDATION_REPORT.md` — Validation report with all success metrics

## Key Docs

- `project-plan.md` — Living progress tracker
- `About this project/` — V5 product specifications

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm test` — Run gameplay unit tests
