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

## Key Docs

- `project-plan.md` — Living progress tracker
- `About this project/` — V5 product specifications

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm test` — Run gameplay unit tests
