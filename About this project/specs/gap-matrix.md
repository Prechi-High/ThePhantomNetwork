# V5 Spec vs Codebase — Gap Matrix

Generated from `About this project/f/` specs vs current implementation.

## Navigation

| Spec | Status | Notes |
|------|--------|-------|
| 5 tabs: Home, Sessions, World, Creator, Legacy | Done | [BottomNav.tsx](src/components/ui/BottomNav.tsx) |
| Profile via header deep link | Done | [PlayerPageHeader.tsx](src/components/layout/PlayerPageHeader.tsx) |
| Armory under Sessions prepare | Partial | `/sessions/prepare` exists; `/armory` still direct |
| Shop under Legacy | Partial | Linked from `/legacy` |

## Journey screens (22)

| Screen | Route | Status |
|--------|-------|--------|
| Splash | `/` | Done — SplashScreen |
| Onboarding | `/onboarding` | Exists — V5 reskin partial |
| Account Creation | `/login` | Exists |
| First-Time Welcome | `/welcome` | Done |
| First Session Tutorial | `/tutorial` | Done |
| Home Dashboard | `/home` | Redesigned — focal session CTA |
| Session Arena | `/sessions` | Exists — pool breakdown partial |
| Gameplay | `/play/[id]` | Done — ambient removed |
| Results | `/sessions/[id]/results` | Exists — influence popup partial |
| Legacy | `/legacy` | Done |
| Squad | `/squads` | Exists — emblem picker pending |
| Camp | `/camps` | Exists — treasury UI partial |
| Creator Hub | `/creator` | Done |
| Wallet | Profile sheet | Partial — Stripe on profile |
| Notifications | `/notifications` | Done — shell |
| Search | `/world/search` | Done |
| Profile | `/profile` | Exists |
| Settings | `/profile/settings` | Done |
| Component system | `src/components/design-system/` | Done — core set |
| Motion system | InteractionController | Exists |
| High-fidelity UI | — | Ongoing |
| Navigation map | [navigation-map.md](./navigation-map.md) | Done |

## Economies

| Spec | Status | Module |
|------|--------|--------|
| Session prize pool splits | Done | [session-pool.ts](src/lib/economy/session-pool.ts) |
| Legacy War reserve (5%) | Done | [legacy-war.ts](src/lib/economy/legacy-war.ts) |
| Camp/Squad treasury 80/20 | Done | session-pool.ts |
| Milestone progression | Done | [milestones.ts](src/lib/legacy/milestones.ts) |
| Creator CIP / recording | Partial | Creator hub shell |
| Rewarded ads | Not started | — |

## Overlays (Master Screen Architecture)

| System | Status |
|--------|--------|
| Bottom sheets registry | Done — [registry.ts](src/components/overlays/registry.ts) |
| BottomSheet component | Done |
| Modal (Dialog alias) | Done |
| PopupToast | Done |
| ScreenState | Done |
| Per-sheet wiring | Partial |

## Architecture

| Rule | Status |
|------|--------|
| Four-engine separation | Partial — network layer done |
| No fetch in components | Guardrail — [check-no-fetch-in-components.mjs](scripts/check-no-fetch-in-components.mjs) |
| Spin non-blocking | Done |
