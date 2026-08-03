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
| Home | `/home` | Next session CTA, live stats |
| Sessions | `/sessions` | List, `/sessions/[id]`, `/prepare`, `/lobby`, `/play`, `/results` |
| World | `/world` | Leaderboard, rivals, `/world/search` |
| Creator | `/creator` | Record, `/community`, `/social` |
| Legacy | `/legacy` | Kata, `/squads`, `/camps`, `/shop`, `/armory` |

## Account (header / deep link)

- `/profile` — avatar, badges, wallet
- `/profile/settings` — preferences
- `/notifications` — 9 categories
- `/profile/gameplay-layout/*` — layout editor

## Session lifecycle

```
/sessions → /sessions/[id] → /sessions/prepare → /sessions/[id]/lobby → /play/[id] → /sessions/[id]/results → /legacy
```

## Bottom sheets (IDs)

deposit, withdraw, join-session, purchase-item, promotion, camp-funding, squad-invite, create-squad, create-camp, share-replay, creator-analytics, notifications, filters, edit-profile, treasury

## Modals (IDs)

insufficient-balance, insufficient-tokens, promotion, leave-squad, leave-camp, season-end, legacy-war, session-cancelled, reward-ready, camp-takeover

## Deep links

Notifications → target screen per category (Session→/sessions, Squad→/squads, War→/world, etc.)
