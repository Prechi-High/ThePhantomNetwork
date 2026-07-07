# Gameplay Real-Time Integration - Implementation Tasks

## Overview

This document contains 35+ actionable implementation tasks organized by category. Each task is scoped, references design/requirement sections, and includes acceptance criteria. Tasks should be completed in the order specified to ensure dependencies are satisfied.

**Estimated Timeline:** 4-5 development days (30-40 hours)

---

## PHASE 1: Data Stores (Days 1-1.5)

### STORE-1: Create useLiveFeedStore
**File:** `src/stores/useLiveFeedStore.ts`
**Dependencies:** None
**Acceptance Criteria:**
- [ ] Store initialized as Zustand store
- [ ] FeedEvent interface with: id, type, timestamp, actor, target, details
- [ ] Type includes: 'steal' | 'revive' | 'elimination' | 'phase' | 'effect' | 'lead' | 'surge'
- [ ] Methods: addEvent, removeOldestEvent, setEvents, clear
- [ ] Max 50 events enforced (auto-remove oldest when exceeded)
- [ ] Store exports hook for React components
- [ ] TypeScript: no `any` types

**Reference:** Design §2.1

---

### STORE-2: Create useLeaderboardStore
**File:** `src/stores/useLeaderboardStore.ts`
**Dependencies:** None
**Acceptance Criteria:**
- [ ] Store initialized as Zustand store
- [ ] LeaderboardEntry interface: rank, user_id, username, session_tokens, squad_id, squad_name, alive, position
- [ ] SquadLeaderboardEntry interface: rank, squad_id, squad_name, squad_tokens, member_count, leader_name
- [ ] Methods: updateIndividual, updateSquad, updateRank, updateSquadRank
- [ ] Maintains separate individual and squad arrays
- [ ] TypeScript: no `any` types

**Reference:** Design §2.2

---

### STORE-3: Create useEffectsStore
**File:** `src/stores/useEffectsStore.ts`
**Dependencies:** None
**Acceptance Criteria:**
- [ ] Store initialized as Zustand store
- [ ] ActiveEffect interface: id, type, name, duration_ms, started_at, expires_at, icon
- [ ] Type includes: 'shield' | 'cloak' | 'multiplier' | 'insurance'
- [ ] Methods: addEffect, removeEffect, setEffects, getTimeRemaining, isExpired
- [ ] getTimeRemaining returns milliseconds until expiration
- [ ] isExpired compares expires_at with current time
- [ ] TypeScript: no `any` types

**Reference:** Design §2.3

---

### STORE-4: Create useInventoryStore
**File:** `src/stores/useInventoryStore.ts`
**Dependencies:** None
**Acceptance Criteria:**
- [ ] Store initialized as Zustand store
- [ ] SkillInInventory interface: id, name, owned, available, cooldown_ms, cooldown_until, charges, max_charges, icon
- [ ] Methods: setSkills, setServerTime, updateSkillCooldown, updateSkillCharges, getSkillAvailability, getSkillCooldownRemaining
- [ ] Stores server time for synchronized countdowns
- [ ] getSkillAvailability returns boolean (owned AND not on cooldown)
- [ ] getSkillCooldownRemaining returns milliseconds or 0
- [ ] TypeScript: no `any` types

**Reference:** Design §2.4

---

## PHASE 2: Custom Hooks (Days 1.5-2.5)

### HOOK-1: Create useLiveFeedUpdates
**File:** `src/hooks/useLiveFeedUpdates.ts`
**Dependencies:** useLiveFeedStore
**Acceptance Criteria:**
- [ ] Hook accepts `subSessionId: string | null` parameter
- [ ] Returns nothing (void hook)
- [ ] Initial fetch: GET `/api/gameplay/livefeed?subSessionId={id}&limit=20`
- [ ] Real-time subscription: `realTimeService.subscribe('livefeed:event')`
- [ ] Polling fallback every 2 seconds
- [ ] Calls store.setEvents with response data
- [ ] Cleanup: unsubscribe on unmount, clear polling interval
- [ ] No-op if subSessionId is null

**Reference:** Design §3.1, Requirements §4.1

---

### HOOK-2: Create useLeaderboardUpdates
**File:** `src/hooks/useLeaderboardUpdates.ts`
**Dependencies:** useLeaderboardStore
**Acceptance Criteria:**
- [ ] Hook accepts `subSessionId: string | null` parameter
- [ ] Returns nothing (void hook)
- [ ] Polls both endpoints every 2 seconds:
  - GET `/api/gameplay/leaderboard?subSessionId={id}&type=individual`
  - GET `/api/gameplay/leaderboard?subSessionId={id}&type=squad`
- [ ] Calls store.updateIndividual and store.updateSquad with responses
- [ ] Real-time subscriptions: 'leaderboard:updated'
- [ ] On 'leaderboard:rank_changed' event: call store.updateRank
- [ ] On 'squad_leaderboard:rank_changed' event: call store.updateSquadRank
- [ ] Cleanup: clear interval, unsubscribe events
- [ ] No-op if subSessionId is null

**Reference:** Design §3.2, Requirements §4.2

---

### HOOK-3: Create useEffectsUpdates
**File:** `src/hooks/useEffectsUpdates.ts`
**Dependencies:** useEffectsStore, useServerTime
**Acceptance Criteria:**
- [ ] Hook accepts `userId: string | null, subSessionId: string | null` parameters
- [ ] Returns nothing (void hook)
- [ ] Initial fetch: GET `/api/player/effects?userId={id}&subSessionId={subSessionId}`
- [ ] Calls store.setEffects and store.setServerTime with response
- [ ] Real-time subscriptions:
  - 'effect:activated' → store.addEffect
  - 'effect:expired' → store.removeEffect
- [ ] Server time sync every 30 seconds: GET `/api/server-time`
- [ ] Cleanup timer: Every 1 second, remove expired effects from store
- [ ] Cleanup: unsubscribe, clear timers
- [ ] No-op if userId or subSessionId is null

**Reference:** Design §3.3, Requirements §4.3

---

### HOOK-4: Create useInventoryUpdates
**File:** `src/hooks/useInventoryUpdates.ts`
**Dependencies:** useInventoryStore, useServerTime
**Acceptance Criteria:**
- [ ] Hook accepts `userId: string | null, subSessionId: string | null` parameters
- [ ] Returns nothing (void hook)
- [ ] Initial fetch: GET `/api/player/inventory?userId={id}&subSessionId={subSessionId}`
- [ ] Calls store.setSkills and store.setServerTime with response
- [ ] Polling every 3 seconds: same endpoint, updates store
- [ ] Real-time subscriptions:
  - 'skill:available' → store.updateSkillCooldown(skillId, 0)
  - 'skill:charged' → store.updateSkillCharges(skillId, charges)
- [ ] Cleanup: clear interval, unsubscribe
- [ ] No-op if userId or subSessionId is null

**Reference:** Design §3.4, Requirements §4.4

---

### HOOK-5: Create useServerTime
**File:** `src/hooks/useServerTime.ts`
**Dependencies:** useInventoryStore (for serverTime storage)
**Acceptance Criteria:**
- [ ] Hook returns object with methods: now(), getCountdown(expiresAt)
- [ ] On mount: fetch `/api/server-time`, calculate drift
- [ ] Drift = Date.now() - new Date(server_time).getTime()
- [ ] now() returns: Date.now() - drift
- [ ] getCountdown(expiresAt) returns: Math.max(0, new Date(expiresAt).getTime() - now())
- [ ] Re-sync with server every 60 seconds
- [ ] Cleanup: clear sync timer on unmount

**Reference:** Design §3.5, Requirements §5

---

## PHASE 3: Component Refactoring (Days 2.5-3.5)

### COMP-1: Refactor LiveFeed Component
**File:** `src/components/gameplay/hud/LiveFeed.tsx`
**Dependencies:** useLiveFeedUpdates, useLiveFeedStore
**Acceptance Criteria:**
- [ ] Remove EVENT_POOL constant completely
- [ ] Remove any random shuffling logic
- [ ] Call useLiveFeedUpdates(subSessionId) hook
- [ ] Subscribe to useLiveFeedStore: events = store(s => s.events)
- [ ] Display events in reverse chronological order (newest first)
- [ ] Display max 5 events on screen
- [ ] Show: actor.username, event.type, event.details, relative timestamp
- [ ] No fallback event data
- [ ] Loading state while data loads

**Reference:** Design §4.1, Requirements §1.1, §3.1

---

### COMP-2: Create/Refactor Leaderboard Component
**File:** `src/components/gameplay/hud/Leaderboard.tsx` (create if doesn't exist)
**Dependencies:** useLeaderboardUpdates, useLeaderboardStore
**Acceptance Criteria:**
- [ ] Component accepts prop: `view: 'individual' | 'squad'` (default: 'individual')
- [ ] Call useLeaderboardUpdates(subSessionId) hook
- [ ] Subscribe to store:
  - individual = store(s => s.individual)
  - squad = store(s => s.squad)
- [ ] Render appropriate array based on view prop
- [ ] Display: rank, username (or squad_name), tokens, alive status
- [ ] For squad view: show member count, leader name
- [ ] Highlight current player row
- [ ] Update smoothly when rank changes
- [ ] No mock data

**Reference:** Design §4.2, Requirements §1.2, §3.2

---

### COMP-3: Refactor ActiveEffects Component
**File:** `src/components/gameplay/hud/ActiveEffects.tsx`
**Dependencies:** useEffectsUpdates, useEffectsStore, useServerTime
**Acceptance Criteria:**
- [ ] Remove INITIAL_EFFECTS constant
- [ ] Call useEffectsUpdates(currentUserId, subSessionId) hook
- [ ] Call useServerTime hook
- [ ] Subscribe to store: effects = store(s => s.effects)
- [ ] For each effect, calculate remaining ms: serverTime.getCountdown(effect.expires_at)
- [ ] Display effect icon, name, duration countdown
- [ ] Countdown updates every 100ms for smooth animation
- [ ] Effects disappear when remaining < 0
- [ ] No default/initial effects shown

**Reference:** Design §4.3, Requirements §1.3, §3.3

---

### COMP-4: Refactor SkillDockHUD Component
**File:** `src/components/gameplay/hud/SkillDockHUD.tsx`
**Dependencies:** useInventoryUpdates, useInventoryStore, useServerTime
**Acceptance Criteria:**
- [ ] Remove hardcoded SKILLS array
- [ ] Call useInventoryUpdates(currentUserId, subSessionId) hook
- [ ] Call useServerTime hook
- [ ] Subscribe to store: skills = store(s => s.skills)
- [ ] Filter to show only: skill.owned === true
- [ ] For each skill, determine state:
  - 'locked': not owned
  - 'ready': owned && available
  - 'cooldown': owned && not available && cooldown_until exists
- [ ] Display skill icon, name, state badge
- [ ] For cooldown state: show countdown in seconds
- [ ] Update every 100ms for smooth animation
- [ ] Show charge count if max_charges > 1

**Reference:** Design §4.4, Requirements §1.4, §3.4

---

### COMP-5: Remove Fallback Values from PlayPage
**File:** `src/app/(player)/play/[sessionId]/page.tsx`
**Dependencies:** All component refactors
**Acceptance Criteria:**
- [ ] Find all instances of `?? <number>` fallback values
- [ ] Find all instances of `|| <string>` fallback values
- [ ] Remove: prizePoolCents ?? 1250000
- [ ] Remove: tokens || 24.5
- [ ] Remove: playerRank || 7
- [ ] Remove: totalPlayers || 28
- [ ] Remove: surgePercent hardcoded value (use from store)
- [ ] Show loading skeleton while data loads
- [ ] Never display placeholder numbers to user
- [ ] Page only renders when data available

**Reference:** Design §4.5, Requirements §1.5

---

## PHASE 4: API Endpoints (Days 3-4)

### API-1: Implement GET /api/gameplay/livefeed
**Location:** `src/pages/api/gameplay/livefeed.ts` (or `src/app/api/gameplay/livefeed/route.ts`)
**Dependencies:** Database with livefeed_events table
**Acceptance Criteria:**
- [ ] Accepts query params: `subSessionId` (required), `limit` (default: 50, max: 100)
- [ ] Validates subSessionId exists in active sessions
- [ ] Returns recent events from database ordered by timestamp DESC
- [ ] Response format per Design §5.1
- [ ] Include server_time in response
- [ ] Each event includes: id, type, timestamp, actor, target, details
- [ ] Types: steal | revive | elimination | phase | effect | lead | surge
- [ ] No data older than session start time
- [ ] Status 404 if session not found

**Reference:** Design §5.1, Requirements §2.1

---

### API-2: Implement GET /api/gameplay/leaderboard
**Location:** `src/pages/api/gameplay/leaderboard.ts` (or `src/app/api/gameplay/leaderboard/route.ts`)
**Dependencies:** Database with player sessions, squads tables
**Acceptance Criteria:**
- [ ] Accepts query params: `subSessionId` (required), `type` (individual | squad)
- [ ] Validates subSessionId exists
- [ ] For type=individual:
  - [ ] Return sorted by session_tokens DESC
  - [ ] Include: rank, user_id, username, session_tokens, squad_id, squad_name, alive, position
  - [ ] Include only non-eliminated players if status check implemented, else all
- [ ] For type=squad:
  - [ ] Return sorted by squad_tokens DESC
  - [ ] Include: rank, squad_id, squad_name, squad_tokens, member_count, leader_name
- [ ] Include server_time in response
- [ ] Status 404 if session not found

**Reference:** Design §5.2, Requirements §2.2

---

### API-3: Implement GET /api/player/effects
**Location:** `src/pages/api/player/effects.ts` (or `src/app/api/player/effects/route.ts`)
**Dependencies:** Database with player_effects table
**Acceptance Criteria:**
- [ ] Accepts query params: `userId` (required), `subSessionId` (required)
- [ ] Validates user participation in session
- [ ] Returns active effects from database
- [ ] Response format per Design §5.3
- [ ] Include: id, type, name, duration_ms, started_at, expires_at, icon
- [ ] Filter: only effects with expires_at > current time
- [ ] Include server_time in response
- [ ] Status 404 if user or session not found
- [ ] Status 403 if user not in session

**Reference:** Design §5.3, Requirements §2.3

---

### API-4: Implement GET /api/player/inventory
**Location:** `src/pages/api/player/inventory.ts` (or `src/app/api/player/inventory/route.ts`)
**Dependencies:** Database with player_skills, skill_cooldowns tables
**Acceptance Criteria:**
- [ ] Accepts query params: `userId` (required), `subSessionId` (required)
- [ ] Validates user participation in session
- [ ] Returns player's skill inventory
- [ ] Response format per Design §5.4
- [ ] For each skill: id, name, owned, available, cooldown_ms, cooldown_until, charges, max_charges, icon
- [ ] available = (cooldown_until is null OR cooldown_until < now)
- [ ] cooldown_until = null if no cooldown active
- [ ] charges = current charges (default max if unlimited)
- [ ] Include server_time in response
- [ ] Status 404 if user or session not found
- [ ] Status 403 if user not in session

**Reference:** Design §5.4, Requirements §2.4

---

### API-5: Implement GET /api/server-time
**Location:** `src/pages/api/server-time.ts` (or `src/app/api/server-time/route.ts`)
**Dependencies:** None
**Acceptance Criteria:**
- [ ] Returns current server time as ISO string
- [ ] Response: `{ "server_time": "2025-01-15T10:30:45.123Z" }`
- [ ] No auth required
- [ ] Minimal processing (cached for 1 second max)
- [ ] Status 200 always

**Reference:** Requirements §5

---

## PHASE 5: Real-Time Events Setup (Days 4-4.5)

### REALTIME-1: Configure LiveFeed Event Emission
**Location:** Backend real-time event handler
**Dependencies:** EventSource/WebSocket service, livefeed events database
**Acceptance Criteria:**
- [ ] On any livefeed_event created in database:
  - [ ] Emit WebSocket event: `livefeed:event`
  - [ ] Payload includes full FeedEvent object (Design §5.1)
  - [ ] Send to all users in same session only
- [ ] Events triggered: steal, revive, elimination, phase, effect, lead, surge
- [ ] Timestamp = database created_at
- [ ] No duplicates (single event = single broadcast)

**Reference:** Design §5.1, Requirements §3.1

---

### REALTIME-2: Configure Leaderboard Update Events
**Location:** Backend real-time event handler
**Dependencies:** EventSource/WebSocket service, leaderboard updates
**Acceptance Criteria:**
- [ ] On player rank change in session:
  - [ ] Emit `leaderboard:updated`
  - [ ] Payload: event='rank_changed', user_id, old_rank, new_rank, new_tokens
  - [ ] Send to all users in session
- [ ] On squad rank change:
  - [ ] Emit `squad_leaderboard:rank_changed`
  - [ ] Payload: squad_id, old_rank, new_rank, squad_tokens
- [ ] Emit every 3 seconds max (batch updates)

**Reference:** Design §5.2, Requirements §3.4

---

### REALTIME-3: Configure Active Effects Events
**Location:** Backend real-time event handler
**Dependencies:** EventSource/WebSocket service, player_effects database
**Acceptance Criteria:**
- [ ] On effect activation:
  - [ ] Emit `effect:activated`
  - [ ] Payload includes full ActiveEffect object (Design §5.3)
  - [ ] Send to: the affected player only
- [ ] On effect expiration:
  - [ ] Emit `effect:expired`
  - [ ] Payload: effectId
  - [ ] Send to: the affected player only
- [ ] On effect removed (manually):
  - [ ] Emit `effect:expired` as well

**Reference:** Design §5.3, Requirements §3.2

---

### REALTIME-4: Configure Skill Availability Events
**Location:** Backend real-time event handler
**Dependencies:** EventSource/WebSocket service, skill_cooldowns table
**Acceptance Criteria:**
- [ ] On skill cooldown expires:
  - [ ] Emit `skill:available`
  - [ ] Payload: skillId, available=true, charges, cooldownMs=0
  - [ ] Send to: affected player only
- [ ] On skill charged (for multi-charge skills):
  - [ ] Emit `skill:charged`
  - [ ] Payload: skillId, charges, max_charges
  - [ ] Send to: affected player only
- [ ] Events fire immediately when condition met

**Reference:** Design §5.4, Requirements §3.3

---

## PHASE 6: Error Handling & Recovery (Days 4.5-5)

### ERROR-1: Implement Polling Retry Logic
**Location:** `src/utils/retryWithBackoff.ts`
**Dependencies:** None
**Acceptance Criteria:**
- [ ] Export function: `retryWithBackoff(fn, maxRetries = 3)`
- [ ] Exponential backoff: 1s, 2s, 4s, 8s (max)
- [ ] Throws error if all retries fail
- [ ] Used in all polling endpoints
- [ ] Log retry attempts (dev mode)

**Reference:** Design §6.1

---

### ERROR-2: Implement WebSocket Error Handling
**Location:** Real-time service (existing or new)
**Dependencies:** WebSocket implementation
**Acceptance Criteria:**
- [ ] On WebSocket disconnect: set offline indicator
- [ ] Auto-reconnect every 5 seconds
- [ ] On reconnect success: clear offline indicator, fetch full state
- [ ] Max 10 reconnect attempts, then show manual reconnect button
- [ ] No infinite retry loops

**Reference:** Design §6.2

---

### ERROR-3: Implement Event Validation
**Location:** `src/utils/validateEvent.ts`
**Dependencies:** None
**Acceptance Criteria:**
- [ ] Export function: `validateEvent(event, lastState)`
- [ ] Check: event.timestamp exists
- [ ] Check: event.timestamp >= lastState.timestamp
- [ ] Discard if out of order
- [ ] Log validation failures (dev mode)
- [ ] Used before adding events to store

**Reference:** Design §6.3

---

### ERROR-4: Add Offline Indicator UI
**File:** `src/components/gameplay/OfflineIndicator.tsx`
**Dependencies:** Real-time service connection status
**Acceptance Criteria:**
- [ ] Component displays when offline
- [ ] Shows: "Connection Lost - Attempting to reconnect..."
- [ ] Auto-hide when reconnected
- [ ] Manual "Reconnect" button if stuck
- [ ] Toast notification style
- [ ] Positioned top-right corner

**Reference:** Design §6.2

---

## PHASE 7: Integration & Testing (Day 5)

### INT-1: Wire Up All Hooks to PlayPage
**File:** `src/app/(player)/play/[sessionId]/page.tsx`
**Dependencies:** All hooks created
**Acceptance Criteria:**
- [ ] Call useLiveFeedUpdates(subSessionId)
- [ ] Call useLeaderboardUpdates(subSessionId)
- [ ] Call useEffectsUpdates(currentUserId, subSessionId)
- [ ] Call useInventoryUpdates(currentUserId, subSessionId)
- [ ] All hooks called at top level (no conditionals breaking rules)
- [ ] No console errors

**Reference:** All component specs

---

### INT-2: Run Full Page Gameplay Flow Test
**Location:** Manual testing
**Acceptance Criteria:**
- [ ] Join session successfully
- [ ] See live feed populate in real-time
- [ ] Leaderboard shows accurate data
- [ ] Active effects display and countdown
- [ ] Skill dock shows correct availability
- [ ] No mock data visible anywhere
- [ ] All numbers are from backend

**Reference:** Requirements §8, Scenarios 1-5

---

### INT-3: Test Network Disconnection
**Location:** Manual testing + DevTools
**Acceptance Criteria:**
- [ ] Disable WiFi during gameplay
- [ ] Offline indicator appears
- [ ] Enable WiFi
- [ ] Auto-reconnect within 3 seconds
- [ ] State refreshes correctly
- [ ] No duplicate events
- [ ] No data corruption

**Reference:** Design §6.2, Requirements §8.3

---

### INT-4: Verify No Fallback Values
**Location:** Code review
**Acceptance Criteria:**
- [ ] Grep for: `?? \d` (no results expected)
- [ ] Grep for: `|| \d` (no results expected)
- [ ] Grep for: `INITIAL_\w` (no results expected)
- [ ] Grep for: `mock` case-insensitive (should only be in tests)
- [ ] Grep for: `EVENT_POOL` (0 results)
- [ ] Grep for: `SKILLS =` hardcoded (0 results)

**Reference:** Requirements §1.5, §7.1

---

### TEST-1: Create Unit Tests for useLiveFeedStore
**File:** `src/stores/__tests__/useLiveFeedStore.test.ts`
**Dependencies:** useLiveFeedStore
**Acceptance Criteria:**
- [ ] Test: addEvent adds event and keeps max 50
- [ ] Test: removeOldestEvent removes first event
- [ ] Test: setEvents replaces all events
- [ ] Test: clear removes all events
- [ ] Test: Adding 51st event removes oldest

**Reference:** Design §7.1

---

### TEST-2: Create Unit Tests for useServerTime Hook
**File:** `src/hooks/__tests__/useServerTime.test.ts`
**Dependencies:** useServerTime
**Acceptance Criteria:**
- [ ] Mock fetch for /api/server-time
- [ ] Test: now() returns drift-adjusted time
- [ ] Test: getCountdown returns correct ms
- [ ] Test: Countdown reaches 0 for expired time
- [ ] Test: Re-sync every 60 seconds

**Reference:** Design §7.1

---

### TEST-3: Create Integration Test: Complete Gameplay Flow
**File:** `src/__tests__/integration/gameplay-realtime.test.ts`
**Dependencies:** All components, APIs, real-time setup
**Acceptance Criteria:**
- [ ] Setup: Create test session, create test player
- [ ] Action: Emit live feed event via WebSocket
- [ ] Verify: Event appears in LiveFeed component
- [ ] Action: Update leaderboard via API
- [ ] Verify: Leaderboard re-renders with new data
- [ ] Action: Activate effect on player
- [ ] Verify: Effect appears in ActiveEffects with countdown
- [ ] Action: Use skill (trigger cooldown)
- [ ] Verify: Skill shows cooldown state

**Reference:** Requirements §8

---

### TEST-4: Create End-to-End Test Script
**File:** `scripts/test-gameplay-realtime.ts`
**Dependencies:** Test utilities, seed data
**Acceptance Criteria:**
- [ ] Script creates test session
- [ ] Simulates: steal, revive, elimination events
- [ ] Verifies: Live feed receives all events
- [ ] Verifies: Leaderboard updates
- [ ] Verifies: No mock data visible
- [ ] Generates: Integration validation report
- [ ] Exit code: 0 = all pass, 1 = any fail

**Reference:** Requirements §10

---

## PHASE 8: Validation & Documentation (Day 5)

### VAL-1: Generate Integration Validation Report
**File:** `INTEGRATION_VALIDATION_REPORT.md`
**Dependencies:** All testing complete
**Acceptance Criteria:**
- [ ] Section: Connected Components (UI → Backend mapping)
  - LiveFeed → livefeed:event WebSocket
  - Leaderboard → /api/gameplay/leaderboard polling
  - ActiveEffects → /api/player/effects + effect:* events
  - SkillDock → /api/player/inventory polling
- [ ] Section: Removed Mock Data (checklist of removals)
- [ ] Section: Remaining Gaps (any unimplemented features)
- [ ] Section: End-to-End Test Results (pass/fail per scenario)
- [ ] Section: Performance Metrics (60 FPS verification)
- [ ] Section: Production Readiness Statement

**Reference:** Requirements §10, User Requirements

---

### VAL-2: Verify Performance Metrics
**Location:** Manual testing + Profiler
**Acceptance Criteria:**
- [ ] Live feed scrolls at 60 FPS with 50+ events
- [ ] Leaderboard updates without janky jumps
- [ ] Skill dock responds in < 100ms to availability changes
- [ ] Memory stable (no leaks during 5-min session)
- [ ] CPU < 30% during idle, < 60% during active events

**Reference:** Requirements §9

---

### DOC-1: Update README with Real-Time Architecture
**File:** `README.md` (add section)
**Dependencies:** All implementation complete
**Acceptance Criteria:**
- [ ] Add section: "Real-Time Gameplay Architecture"
- [ ] Describe: Zustand stores, hooks, WebSocket events
- [ ] Link to: `/src/stores/`, `/src/hooks/`
- [ ] Note: All gameplay data is live, no mock data
- [ ] Reference: design.md and requirements.md

**Reference:** All design docs

---

## Task Execution Summary

| Phase | Tasks | Est. Hours | Status |
|-------|-------|-----------|--------|
| 1. Data Stores | STORE-1 to 4 | 6 | Ready |
| 2. Custom Hooks | HOOK-1 to 5 | 8 | Blocked by Phase 1 |
| 3. Components | COMP-1 to 5 | 8 | Blocked by Phases 1-2 |
| 4. API Endpoints | API-1 to 5 | 6 | Can start anytime |
| 5. Real-Time Events | REALTIME-1 to 4 | 4 | Blocked by APIs |
| 6. Error Handling | ERROR-1 to 4 | 3 | Can start after Phase 2 |
| 7. Integration & Testing | INT-1 to 4, TEST-1 to 4 | 8 | Blocked by Phases 1-5 |
| 8. Validation & Docs | VAL-1 to 2, DOC-1 | 2 | Last phase |

**Total Estimated: 45 hours (5-6 development days)**

---

## Running Tasks in Parallel

**Day 1-2 Parallel Execution:**
- Team A: STORE-1 to 4 (Phase 1)
- Team B: API-1 to 5 (Phase 4)

**Day 2-3 Parallel Execution:**
- Team A: HOOK-1 to 5 (Phase 2)
- Team B: ERROR-1 to 4 (Phase 6)

**Day 3-4 Execution:**
- Full team: COMP-1 to 5 (Phase 3)

**Day 4-5 Execution:**
- Full team: REALTIME-1 to 4 (Phase 5)

**Day 5 Execution:**
- Full team: INT-1 to 4, TEST-1 to 4 (Phase 7)

**Day 5 Finalization:**
- Full team: VAL-1 to 2, DOC-1 (Phase 8)

---

## Success Criteria Checklist

Before marking spec as complete, verify:

- [ ] All 35 tasks completed and tested
- [ ] Zero mock data in gameplay components
- [ ] All 5 API endpoints functional
- [ ] Real-time events firing correctly
- [ ] Error recovery tested and working
- [ ] Integration validation report generated
- [ ] All performance metrics met
- [ ] Production readiness statement approved
- [ ] README updated with architecture
- [ ] All TypeScript types strict (no `any`)

