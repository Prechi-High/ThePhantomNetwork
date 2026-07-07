# Gameplay Refinement - Implementation Status & Readiness

**Current Date:** January 15, 2025  
**Spec Status:** ✅ Complete and Ready  
**Implementation Status:** 🔵 Ready to Begin  

---

## What's Already Built

### ✅ Data Infrastructure (100% Complete)
The previous phase successfully built all data stores and hooks:

**Zustand Stores:**
- ✅ `useSessionStore` - Current session/phase data
- ✅ `useLeaderboardStore` - Rankings data
- ✅ `useInventoryStore` - Skill inventory & cooldowns
- ✅ `useEffectsStore` - Active effects tracking
- ✅ `useLiveFeedStore` - Live feed events
- ✅ `useSquadStore` - Squad data

**Custom Hooks:**
- ✅ `useServerTime` - Server drift calculation
- ✅ `useLiveFeedUpdates` - Real-time event polling
- ✅ `useLeaderboardUpdates` - Ranking polling
- ✅ `useInventoryUpdates` - Skill polling
- ✅ `useEffectsUpdates` - Effects polling

**API Endpoints:**
- ✅ `GET /api/server-time` - Server time sync
- ✅ `GET /api/gameplay/livefeed` - Live feed events
- ✅ `GET /api/gameplay/leaderboard` - Rankings
- ✅ `GET /api/player/effects` - Active effects
- ✅ `GET /api/player/inventory` - Skill inventory

**Real-Time Infrastructure:**
- ✅ WebSocket event subscriptions
- ✅ Event emission system
- ✅ Error recovery & reconnection

### ✅ Existing Components (Functional but Needs Refinement)
The gameplay UI exists but needs refinement per this spec:

**Components Present:**
- `GameTimer.tsx` - Timer exists but needs sync verification
- `SquadPanel.tsx` - Panel exists but may have hardcoded data
- `WheelHUD.tsx` - Wheel exists but outcome flow needs verification
- `OutcomeReveal` - May not exist or needs enhancement
- `TokenCollection` - May not exist, needs implementation
- `PhaseIntro.tsx` - May not exist, needs implementation
- `PhaseEnd.tsx` - May not exist, needs implementation
- `LiveFeed.tsx` - Exists but data flow verification needed

---

## What Needs to Be Built (This Spec)

### 🔵 Phase 1: Event Bus Architecture (High Priority)
**Status:** Not started  
**Estimated:** 1 day  
**Files to Create:**

1. **`src/lib/events/GameplayEventBus.ts`** (NEW)
   - Core event bus implementation
   - Emit/on/off methods
   - Singleton instance

2. **`src/lib/events/eventTypes.ts`** (NEW)
   - Event type constants
   - Prevents typos in event names
   - Organized structure

3. **`src/hooks/useGameplayEvents.ts`** (NEW)
   - Hook for components to use bus
   - Automatic cleanup on unmount

**Why First?**
- Foundation for all other work
- Enables sound system later
- Required by all animation components

---

### 🔵 Phase 2: Timer Refinement (High Priority)
**Status:** Partially done  
**Estimated:** 1-2 days  
**Changes Needed:**

1. **Audit `src/components/gameplay/hud/GameTimer.tsx`**
   - Where does timer data come from?
   - Is it using phaseEndTime correctly?
   - Is it calling useServerTime?
   - Any hardcoded fallback values?

2. **Verify `src/hooks/useServerTime.ts`**
   - Does it sync drift every 30 seconds?
   - Does getCountdown() work correctly?
   - Is now() accurate within ±100ms?

3. **Verify Backend Phase Updates**
   - Does session store listen for `phase:changed` events?
   - Does it update phaseEndTime?
   - Does timer transition automatically?

**Success Criteria:**
- Timer shows accurate remaining time
- Stays synced across players
- Phase transitions automatic (from backend)
- No manual timer logic in components

---

### 🔵 Phase 3: Squad Panel Refinement (Medium Priority)
**Status:** Component exists, data flow needs verification  
**Estimated:** 1-2 days  
**Changes Needed:**

1. **Audit `src/components/gameplay/hud/SquadPanel.tsx`**
   - Where does squad rank come from?
   - Any hardcoded fallback values?
   - How often does it update?
   - Is it reading from leaderboard store?

2. **Enhance Store Selectors**
   - Add methods to useSquadStore for:
     - getMySquadRank()
     - getMySquadTokens()
     - getTopSquad()

3. **Wire to Real-Time Updates**
   - Call useLeaderboardUpdates hook
   - Subscribe to leaderboard store updates
   - Emit rank change events

**Success Criteria:**
- My Squad section shows live data
- Top Squad shows current leader
- Rankings update smoothly
- No stale data ever shown

---

### 🟠 Phase 4: Wheel & Outcomes (Medium Priority)
**Status:** Wheel exists, reveal sequences need building  
**Estimated:** 2-3 days  
**Changes Needed:**

1. **Verify Current Wheel**
   - Confirm 5 equal segments
   - Confirm segment labels (ADVANCE, ACQUIRE, DISCOVER, STEAL, VOID)
   - Verify outcome flow from backend

2. **Create `src/components/gameplay/hud/OutcomeReveal.tsx`** (NEW)
   - Unique animation for each outcome
   - ADVANCE: gold, upward, energetic
   - ACQUIRE: blue, sparkle, chime
   - DISCOVER: purple, mysterious reveal
   - STEAL: red, aggressive, target indicator
   - VOID: grey, muted animation

3. **Create `src/components/gameplay/hud/TokenCollection.tsx`** (NEW)
   - Particle animation from wheel to counter
   - Counter only updates after animation
   - Sound hook emission

**Success Criteria:**
- 5 equal wheel segments
- Unique reveal per outcome
- Token animation smooth
- Backend controls all outcomes

---

### 🟠 Phase 5: Phase Transitions (Medium Priority)
**Status:** Needs building  
**Estimated:** 1-2 days  
**Changes Needed:**

1. **Create `src/components/gameplay/hud/PhaseIntro.tsx`** (NEW)
   - Cinematic phase intro animation
   - Display phase data from backend
   - Sound hook emission

2. **Create `src/components/gameplay/hud/PhaseEnd.tsx`** (NEW)
   - Phase completion animation
   - Optional elimination summary
   - Smooth transition to next phase

3. **Verify Phase Configuration**
   - Does session store read phase metadata?
   - Is it flexible for any phase count?
   - Any hardcoded phase names/numbers?

**Success Criteria:**
- No hardcoded phases anywhere
- Phase config from backend
- Works with any number of phases
- Cinematic transitions

---

### 🟢 Phase 6: Sound Integration (Lower Priority)
**Status:** Ready to emit events  
**Estimated:** 1 day  
**Changes Needed:**

1. **Emit All Gameplay Events**
   - From wheel component
   - From outcome reveal component
   - From token collection component
   - From phase animations
   - From player elimination
   - From shadow surge events

2. **Create Example Sound Hook** (Template for sound dev)
   - Show how to subscribe to events
   - Document payload structure

3. **Remove Hardcoded Sounds**
   - Find any direct sound playback
   - Replace with event emissions

**Success Criteria:**
- All major events emitted
- Sound system can subscribe independently
- No hardcoded sound code in gameplay

---

### 🟢 Phase 7: Performance & Polish (Lower Priority)
**Status:** Ready to optimize  
**Estimated:** 1-2 days  
**Changes Needed:**

1. **Create `src/lib/animation/AnimationQueue.ts`** (NEW)
   - Queue system for animations
   - Prevents overlapping overlays
   - FIFO execution

2. **Verify Performance**
   - 60 FPS animations
   - Memory stability
   - No UI blocking

3. **Test Edge Cases**
   - Rapid spin requests
   - Phase changes during animations
   - Network reconnection

**Success Criteria:**
- 60 FPS maintained
- Smooth animations
- Memory stable
- No UI freezing

---

## Current Code Status

### Files Already Working
```
src/stores/
  ✅ useSessionStore.ts
  ✅ useLeaderboardStore.ts
  ✅ useInventoryStore.ts
  ✅ useEffectsStore.ts
  ✅ useLiveFeedStore.ts
  ✅ useSquadStore.ts

src/hooks/
  ✅ useServerTime.ts
  ✅ useLiveFeedUpdates.ts
  ✅ useLeaderboardUpdates.ts
  ✅ useInventoryUpdates.ts
  ✅ useEffectsUpdates.ts

src/components/gameplay/hud/
  ✅ GameTimer.tsx (exists, needs verification)
  ✅ SquadPanel.tsx (exists, needs verification)
  ✅ WheelHUD.tsx (exists, needs verification)
  ✅ LiveFeed.tsx (exists, needs verification)
  ✅ ActiveEffects.tsx (exists)
  ✅ SkillDockHUD.tsx (exists)
```

### Files NOT YET EXISTING
```
src/lib/events/
  🔴 GameplayEventBus.ts (CREATE)
  🔴 eventTypes.ts (CREATE)

src/hooks/
  🔴 useGameplayEvents.ts (CREATE)

src/components/gameplay/hud/
  🔴 OutcomeReveal.tsx (CREATE)
  🔴 TokenCollection.tsx (CREATE)
  🔴 PhaseIntro.tsx (CREATE)
  🔴 PhaseEnd.tsx (CREATE)

src/lib/animation/
  🔴 AnimationQueue.ts (CREATE)
```

---

## Recommended Implementation Order

### Week 1
1. ✅ Review spec docs (OBJECTIVE.md, design.md, tasks.md) - 2 hours
2. 🔵 Build Event Bus (tasks ARCH-1, ARCH-2, ARCH-3) - 3 hours
3. 🔵 Audit & refine Timer (tasks TIMER-1 to TIMER-4) - 6 hours
4. 🔵 Start Squad Panel (tasks SQUAD-1 to SQUAD-3) - 6 hours

### Week 2
5. 🔵 Complete Squad Panel (task SQUAD-4) - 2 hours
6. 🟠 Wheel Refinement (tasks WHEEL-1, WHEEL-2) - 4 hours
7. 🟠 Outcome Reveals (task WHEEL-3) - 6 hours
8. 🟠 Token Collection (task WHEEL-4) - 4 hours

### Week 3
9. 🟠 Phase System (tasks PHASE-1 to PHASE-4) - 6 hours
10. 🟢 Sound Integration (tasks SOUND-1, SOUND-2) - 3 hours
11. 🟢 Performance (tasks PERF-1 to PERF-3) - 5 hours

### Week 4
12. 🟢 Validation (tasks VAL-1, VAL-2, VAL-3) - 8 hours
13. 📋 Manual testing & fixes - 8 hours

**Total Estimated Time:** 60-70 hours (about 2 weeks for one developer working full-time)

---

## What You DON'T Need to Do

❌ **Redesign the UI**
- Keep the same layout
- Keep the same styling
- Just refine the data flow and animations

❌ **Create new gameplay rules**
- Rules exist in backend
- Frontend visualizes them

❌ **Add more components**
- Most exist already
- Just wire them up to data

❌ **Change the database**
- It already stores everything needed
- Just read and sync from it

---

## Deployment Strategy

### Before Pushing to Production

1. ✅ Verify all data from backend (no hardcoded values)
2. ✅ Test phase transitions from backend events
3. ✅ Test 60 FPS performance on target devices
4. ✅ Test network reconnection scenarios
5. ✅ Test with admin-configured phase variations
6. ✅ Run through all 5 wheel outcomes
7. ✅ Verify sound events emitted (don't need sound system working yet)

### Rollout Plan

1. **Phase 1 - Event Bus + Timer** (Low risk, foundation only)
2. **Phase 2 - Squad Panel** (Medium risk, display only)
3. **Phase 3 - Wheel & Outcomes** (Medium risk, animations only)
4. **Phase 4 - Phase System** (Low risk, UI only)
5. **Phase 5 - Event Emission** (No risk, just events)

---

## Handoff to Sound Developer

Once event emission is complete, the sound developer can:

1. Import `gameplayEventBus`
2. Subscribe to events
3. Play sounds without modifying gameplay code
4. Add/remove/update sounds without breaking anything

**Events they'll have:**
- spin.started, spin.completed
- spin.outcome.advance, .acquire, .discover, .steal, .void
- tokens.collected
- phase.started, phase.completed
- player.eliminated
- shadow_surge.activated
- Plus custom events as needed

---

## Quality Checklist (Before "Done")

### Timer ⏱️
- [ ] Displays live time from backend
- [ ] Syncs within ±100ms of server
- [ ] Phase transitions automatic
- [ ] No manual countdown logic
- [ ] Handles reconnects correctly

### Squad Panel 👥
- [ ] My Squad section live
- [ ] Top Squad section live
- [ ] Rankings never stale
- [ ] Animations smooth on changes
- [ ] No hardcoded fallback values

### Wheel ⚙️
- [ ] 5 equal segments
- [ ] Outcomes from backend only
- [ ] Wheel lands on server result
- [ ] No frontend randomness

### Animations 🎬
- [ ] Outcome reveals unique
- [ ] Token animation smooth
- [ ] Phase intro cinematic
- [ ] Phase end smooth
- [ ] All 60 FPS

### Backend Authority 🔗
- [ ] Zero hardcoded phases
- [ ] Phase config from backend
- [ ] Works with any phase count
- [ ] Admin changes work automatically

### Events 🔊
- [ ] All major events emitted
- [ ] Correct payloads
- [ ] Sound system can subscribe
- [ ] No tight coupling

### Performance ⚡
- [ ] 60 FPS animations
- [ ] Memory stable
- [ ] No UI freezing
- [ ] Responsive controls

---

## Quick Start Guide

### For the Developer Starting This Work

1. **Read the spec** (1-2 hours)
   - Start: README.md
   - Then: OBJECTIVE.md
   - Then: design.md
   - Finally: tasks.md

2. **Build the Event Bus** (3 hours)
   - Follow ARCH-1, ARCH-2, ARCH-3 tasks
   - Test that events emit/subscribe correctly

3. **Audit current systems** (4 hours)
   - Run TIMER-1, SQUAD-1, WHEEL-1
   - Identify what's already working
   - Identify what needs changes

4. **Start refinement** (follow task order)
   - TIMER-2 to TIMER-4
   - SQUAD-2 to SQUAD-4
   - WHEEL-2 to WHEEL-4
   - Etc.

5. **Test as you go**
   - Don't wait until end to test
   - Manual testing after each phase
   - Fix issues immediately

---

## Git Workflow

### Commit Strategy
- Commit after each task (or logical grouping)
- Use PR titles: "feat: add Event Bus", "refactor: wire timer to backend", etc
- Keep commits focused and small

### Branch Strategy
- Feature branch: `feat/gameplay-refinement`
- Commit when task complete
- Test locally before pushing

### Deploy Strategy
- Phase by phase (not all at once)
- Each phase should be deployable independently
- Feature flags if needed to hide incomplete work

---

## Success Definition

You're done when you can say:

> "Every number on screen comes from the backend. Every animation is cinematic and smooth. The sound system can subscribe to events without touching gameplay code. Phase configuration is fully dynamic from the admin panel. 60 FPS animations run smoothly even on mobile. The frontend is a pure visualization layer."

---

**Next Steps:**
1. ✅ Spec is complete
2. 🔵 Read OBJECTIVE.md thoroughly
3. 🔵 Create Event Bus (ARCH-1 to ARCH-3)
4. 🔵 Start timer refinement
5. 📅 Schedule: 2-3 weeks for one developer

**Status:** 🟢 **READY TO BUILD**

---

*Spec prepared on January 15, 2025*  
*All previous phases (data infrastructure) complete and tested*  
*Ready for refinement phase to begin immediately*
