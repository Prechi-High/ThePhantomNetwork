# THE PHANTOM — Living Project Plan

## Progress Dashboard

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 0 — Foundation | done | 100% |
| Phase 1 — Auth & Onboarding | done | 100% |
| Phase 2 — Squads & Camps | done | 100% |
| Phase 3 — Session Engine | done | 100% |
| Phase 4 — Gameplay Core | done | 100% |
| Phase 5 — Economy & Rewards | done | 100% |
| Phase 6 — Shop | done | 100% |
| Phase 7 — Production | done | 100% |
| Phase 8 — Admin Dashboard | done | 100% |
| Phase 9 — Camp Owner Dashboard | done | 100% |
| Phase 10 — Payments & Profile | done | 100% |

**Overall: 100%** (MVP1 + MVP2)

## MVP2 Delivered

- **Admin dashboard** (`/admin`) — sessions CRUD, lock/start, camps, users, analytics, platform config
- **Camp owner dashboard** (`/camp-owner`) — stats, members, squads, revenue, referral recruiting
- **Role-based API guards** — `requireAdmin`, `requireCampOwner`
- **Camp revenue share** — accrues on session join (migration 002)
- **Stripe PaymentElement** — full deposit flow on profile page
- **Profile** — edit username/avatar, transaction history, dashboard links

## Setup After Deploy

1. Run `supabase/migrations/002_mvp2_admin_camp.sql` in Supabase SQL editor
2. Promote your user to admin:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE username = 'your_username';
   ```
3. Create sessions from **Admin → Sessions → New Session**
4. Assign camp owners from **Admin → Camps** (set owner user ID)
5. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_SECRET_KEY` in Vercel for live deposits

## Schema Version

Migration count: 2
