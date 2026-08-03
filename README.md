# LEGACIES

Build your Legacy through strategy, rivalry, and triumph.

A cinematic multiplayer competitive ecosystem built around sessions, squads, camps, rivalries, and real-money consequence.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Postgres, Auth, RLS)
- **Upstash Redis** (hot gameplay state, pub/sub, rate limiting)
- **Zustand** (client state)
- **Framer Motion** (spin wheel, fire boost UI)
- **Stripe** (wallet deposits)

## Design system

V5 tokens live in `src/lib/design/tokens.ts` and `src/app/globals.css`. Navigation: Home, Sessions, World, Creator, Legacy.

Spec docs: `About this project/specs/` (extracted from V5 docx).

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
- `src/components/design-system/` — V5 UI primitives
- `src/lib/gameplay/` — Pure rule engines (unit tested)
- `src/lib/network/` — Network layer (four-engine architecture)
- `src/lib/economy/` — Session pool & Legacy War helpers
- `src/lib/legacy/` — Milestone progression
- `src/stores/` — Zustand stores

## Guardrails

```bash
node scripts/check-no-fetch-in-components.mjs
```
