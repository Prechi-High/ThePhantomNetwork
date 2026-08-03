# Master Navigation Map

Per V5 Master Screen Architecture — no isolated screens.

## Launch flow

```
/ (Splash) → /login | /onboarding | /welcome | /tutorial | /home
/onboarding → /welcome → /tutorial → /home
```

## Bottom navigation

| Tab | Route | Internal sections |
|-----|-------|-------------------|
| Home | `/home` | Countdown hero, ENTER BATTLE |
| Sessions | `/sessions` | Official list, AI Practice, `/[id]`, `/prepare`, `/lobby`, `/play`, `/results` |
| World | `/world` | Leaderboard, rivals, `/world/search` |
| Creator | `/creator` | Record, analytics sheet |
| Legacy | `/legacy` | Kata, milestones; deep links to `/squads`, `/camps` |

## Account (header / deep link)

- `/profile` — identity, wallet deposit/withdraw sheets
- `/profile/settings` — preferences
- `/profile/sessions` — history
- `/notifications` — 9 categories with deep links

## Redirects (orphans)

| From | To |
|------|-----|
| `/social`, `/community` | `/creator` |
| `/armory` | `/sessions/prepare` |
| `/shop` | `/legacy` |
| `/rivals` | `/world` |

Gameplay layout editor (`/profile/gameplay-layout/*`) is not in player nav; APIs remain for studio tools.

## Session lifecycle

```
/sessions → /sessions/[id] → /sessions/prepare → /sessions/[id]/lobby → /play/[id] → /sessions/[id]/results → /legacy
```

## Bottom sheets (wired hosts)

| ID | Host |
|----|------|
| deposit, withdraw, edit-profile | `/profile` |
| join-session | `/sessions` |
| filters | `/world/search` |
| create-squad | `/squads` |
| create-camp | `/camps` |
| share-replay | `/sessions/[id]/results` |
| creator-analytics | `/creator` |

Also see `src/components/overlays/registry.ts` (`SHEET_HOSTS`).

## Modals / overlays / popups

IDs in registry; gameplay owns countdown/recording overlays. Economy confirm modals (insufficient balance/tokens) surface from join/purchase flows as needed.

## Deep links

Notifications → target screen per category (Session→/sessions, Squad→/squads, War→/world, etc.)
