---
name: legacy-system-architecture
description: Enforces Legacy's four-engine architecture (Gameplay, Animation, UI, Network) with mandatory feature classification, one-way data flow, and spin-flow rules. Use when building features, mechanics, animations, UI components, or gameplay systems for Legacy (formerly THE PHANTOM), or when reviewing/refactoring code that mixes gameplay logic, animations, UI, or network concerns.
---

# Legacy System Architecture (Mandatory)

## Purpose

You are developing Legacy (formerly THE PHANTOM), a real-time multiplayer competitive ecosystem.

The highest priority is smoothness, responsiveness, and cinematic quality.

From this point onward, every feature, mechanic, animation, UI component, or gameplay system MUST first be classified into the correct engine before implementation.

This is a non-negotiable engineering rule.

## Rule 1 — Never Build Everything Inside the UI

The UI must NEVER contain gameplay logic.

The UI must NEVER perform calculations.

The UI must NEVER wait for network requests.

The UI only displays current state.

If you detect business logic inside widgets/components, refactor it immediately.

## Rule 2 — Every Feature Must Be Classified First

Before writing any code, identify which system(s) are responsible.

Every task belongs to one or more of these systems.

### System 1 — Gameplay Engine

**Responsibility**

Owns ALL gameplay rules.

This is the brain of Legacy.

**Examples:**

- Spins
- Outcomes
- Token calculations
- Steals
- Shields
- Cloaks
- Revives
- Timers
- Phase progression
- Eliminations
- Rewards
- Rankings
- Session state
- Match logic

Gameplay Engine NEVER knows about UI.

It only updates game state.

**Example:**

```
Spin requested
  ↓
Gameplay Engine
  ↓
Result Generated
  ↓
State Updated
  ↓
Other systems react
```

### System 2 — Animation Engine

**Responsibility**

Owns ALL visual movement.

**Examples**

- Wheel spinning
- Reveal animations
- Golden light
- Particle systems
- Coin bursts
- Number rolling
- Progress bar animations
- Confetti
- Shields
- Steal effects
- Camera shakes
- Glow effects
- Transitions
- Micro interactions
- Sound synchronization

Animation Engine NEVER performs gameplay calculations.

It only reacts to state changes.

Animations should never block gameplay.

Gameplay should never wait for animations.

### System 3 — UI Layer

**Responsibility**

Displays information only.

**Examples**

- Buttons
- Cards
- Counters
- Leaderboards
- Player list
- Session list
- Shop
- Profile
- Feed
- Rank
- Badges
- Text
- Icons

The UI observes state.

It does not create state.

The UI must remain lightweight.

### System 4 — Network Engine

**Responsibility**

Communicates with backend.

**Examples**

- Supabase
- Realtime
- Authentication
- Saving sessions
- Receiving updates
- Leaderboards
- Rewards
- Economy
- Chat
- Notifications
- Sync
- Reconnect
- Retry
- Caching

Network requests must NEVER freeze gameplay.

Gameplay must continue while requests happen in background.

## Rule 3 — Data Flow

All systems communicate in one direction.

```
Gameplay Engine
  ↓
State Store
  ↓
Animation Engine
  ↓
UI Layer

Network Layer
  ↓
Gameplay Engine
```

Never allow:

```
UI
  ↓
Gameplay
  ↓
UI
```

This creates unstable code.

## Rule 4 — Spin Flow (Mandatory Implementation)

Whenever a player taps SPIN:

**Step 1**

Immediately start wheel animation.

NO waiting.

**Step 2**

Immediately play spin sound.

**Step 3**

Gameplay Engine requests spin result.

**Step 4**

Network sends request in background if required.

**Step 5**

Wheel continues spinning smoothly.

Never freeze.

**Step 6**

Gameplay Engine receives result.

**Step 7**

Store result.

Do NOT reveal immediately.

**Step 8**

Animation Engine waits until reveal timing.

**Step 9**

Play cinematic reveal.

- Golden light
- Glow
- Impact
- Particles
- Sound
- Camera pulse

**Step 10**

Animate token counter.

```
Old Value
  ↓
Rolling animation
  ↓
New Value
```

Never instantly change numbers.

Player should FEEL the reward.

**Step 11**

Gameplay Engine unlocks next spin.

## Rule 5 — UI Responsiveness

The player must NEVER feel the system is waiting.

Every tap produces immediate feedback.

**Examples**

- Button scales instantly.
- Wheel starts instantly.
- Sound starts instantly.
- Glow starts instantly.
- Server can finish later.

Visual feedback always comes first.

## Rule 6 — Animation Philosophy

Animations should never be tied directly to network latency.

Animations are deterministic.

Network timing should not affect cinematic quality.

If network is slower than expected:

- Continue animation.
- Delay reveal.
- Never freeze.

## Rule 7 — State Management

Every engine communicates using centralized state.

Never pass gameplay logic through UI widgets.

**Recommended architecture:**

```
Gameplay Engine
  ↓
Global Store
  ↓
Animation Engine reacts
  ↓
UI reacts
  ↓
Network syncs independently
```

## Rule 8 — Performance Targets

Legacy should feel comparable to premium mobile games.

**Target:**

- 60 FPS minimum
- 120 FPS where supported
- No dropped frames
- No UI stutter
- No blocking renders
- No unnecessary rebuilds
- No heavy calculations inside widgets

## Rule 9 — When Building Any New Feature

Before writing code, answer these questions.

**Gameplay**

Does this affect rules?

If yes → Gameplay Engine

**Animation**

Does something move?

Does something reveal?

Does something glow?

Does something explode?

If yes → Animation Engine

**UI**

Does it only display information?

If yes → UI Layer

**Network**

Does it save?

Does it fetch?

Does it synchronize?

If yes → Network Layer

If a feature belongs to multiple systems, split responsibilities instead of combining them.

## Rule 10 — Engineering Checklist (Run Before Every Implementation)

Before writing any code, verify:

- [ ] Which engine owns this feature?
- [ ] Does gameplay logic exist outside the Gameplay Engine?
- [ ] Is any animation performing calculations?
- [ ] Is the UI performing business logic?
- [ ] Will any network request block the UI?
- [ ] Can the player interact immediately?
- [ ] Are counters animated instead of jumping?
- [ ] Are animations independent from server response time?
- [ ] Can the feature maintain 60 FPS?
- [ ] Is the implementation following the one-way data flow architecture?

If any answer violates these rules, redesign the implementation before coding.

## Final Principle

Legacy must feel like a premium mobile game, not a CRUD application with animations.

Every interaction should feel immediate.

Every animation should be cinematic.

Every system should have a single responsibility.

The player should never perceive network latency, heavy computation, or UI rebuilding. The world should feel alive, responsive, and effortless—even when complex gameplay calculations are happening behind the scenes.
