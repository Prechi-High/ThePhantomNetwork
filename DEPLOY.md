# Deploy THE PHANTOM to Vercel + Telegram

## 1. Push code to GitHub

Repo: [github.com/Prechi-High/ThePhantomNetwork](https://github.com/Prechi-High/ThePhantomNetwork)

Secrets are **not** in git. `.env.local` is gitignored. You add them in Vercel.

## 2. Vercel project

1. Import `Prechi-High/ThePhantomNetwork` on [vercel.com](https://vercel.com)
2. Framework preset: **Next.js** (not "Other" — wrong preset causes `MIDDLEWARE_INVOCATION_FAILED`)
3. Root directory: project root (default)

## 3. Environment variables (Vercel → Settings → Environment Variables)

Copy each name from `.env.example` and paste real values:

| Variable | Required for MVP |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `UPSTASH_REDIS_REST_URL` | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Yes |
| `TELEGRAM_BOT_TOKEN` | Yes |
| `NEXT_PUBLIC_APP_URL` | Yes — your Vercel URL, e.g. `https://the-phantom-network.vercel.app` |
| `CRON_SECRET` | Yes — random long string |
| `STRIPE_*` | For wallet deposits |
| `RECAPTCHA_*` / `GOOGLE_*` | For web fallback login |

After first deploy, set `NEXT_PUBLIC_APP_URL` to the **production URL** and redeploy.

## 4. Supabase auth URLs

In Supabase → Authentication → URL configuration:

- **Site URL:** `https://YOUR-VERCEL-URL.vercel.app`
- **Redirect URLs:** add `https://YOUR-VERCEL-URL.vercel.app/auth/callback`

Enable **Google** provider if using web login.

## 5. Telegram Mini App (@BotFather)

1. Open [@BotFather](https://t.me/BotFather)
2. `/mybots` → **ThePhantomGame_Bot** → **Bot Settings** → **Menu Button**
3. Set URL to: `https://YOUR-VERCEL-URL.vercel.app`
4. Or use `/setmenubutton` with your production URL

Users open the bot → menu opens the Mini App → `initData` is sent → auto login.

## 6. External cron (Vercel Hobby — required)

Vercel Hobby does **not** allow minute-level crons. Session lock/start and phase advancement use an **external scheduler** that calls your API.

### What it does

`GET /api/cron/sessions` (with auth) every **1–5 minutes**:

- Locks sessions when registration closes  
- Starts sessions at `starts_at`  
- Advances gameplay phases  
- Marks sessions completed  

### Setup with [cron-job.org](https://cron-job.org) (free)

1. Create an account at [cron-job.org](https://cron-job.org)
2. **Create cronjob**
3. **URL:** `https://YOUR-VERCEL-URL.vercel.app/api/cron/sessions`
4. **Schedule:** every 1 minute (or every 5 minutes for lighter usage)
5. **Request method:** `GET`
6. **Headers** (under Advanced):
   - Name: `Authorization`
   - Value: `Bearer YOUR_CRON_SECRET`  
   (must match the `CRON_SECRET` env var in Vercel)
7. Save and enable the job

### Test manually

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://YOUR-VERCEL-URL.vercel.app/api/cron/sessions"
```

Expected: JSON like `{ "locked": 0, "started": 0, "phasesAdvanced": 0 }`

### Alternatives

- [Uptime Robot](https://uptimerobot.com) — HTTP monitor every 5 min  
- GitHub Actions `schedule` workflow calling the same URL with the header  

### Vercel Pro (optional)

If you upgrade later, you can add `vercel.json` crons back for built-in scheduling.

## 7. MVP2 setup (admin, camps, payments)

### Run migration 002

In Supabase SQL editor, run:

- `supabase/migrations/002_mvp2_admin_camp.sql`
- `supabase/migrations/003_error_monitoring.sql` (error logging for Admin → Errors)

### Admin login (separate from player Telegram auth)

Set in Vercel:

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAIL` | Admin panel login email |
| `ADMIN_PASSWORD` | Admin panel login password |
| `ADMIN_SESSION_SECRET` | Optional; signs admin cookie (falls back to `CRON_SECRET`) |

1. Open **`https://YOUR-APP.vercel.app/admin/login`**
2. Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. **Sessions** → **+ New Session** to create games

Players see open sessions under **Sessions** in the player app.

### Assign a camp owner (optional, deferred)

1. **Admin → Camps** → create camp or use existing
2. Paste the user's profile UUID as **Owner user ID**
3. User gets `camp_owner` role and access to `/camp-owner`

### Stripe deposits

Set in Vercel:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (webhook URL: `https://YOUR-APP.vercel.app/api/stripe/webhook`)

Without Stripe keys, profile deposits use dev-credit locally only.

## 8. Create a test session (API alternative)

Admin-authenticated only (log in as admin in browser, then use session cookie) — prefer the **Admin UI** above.

Or insert a row in Supabase `sessions` with `status = open`.

## 9. Why `.gitignore` does not break production

| Ignored | Why it's safe |
|---------|----------------|
| `.env.local` | Secrets go in **Vercel Environment Variables**, not git |
| `node_modules` | Vercel runs `npm install` on deploy |
| `.next` | Vercel runs `npm run build` fresh |

The app **needs** those values at **runtime** on Vercel — you provide them in the Vercel dashboard, not in the repo.

## 9. Security

- Rotate any keys that were shared in chat
- Never commit `.env.local`
- `TELEGRAM_BOT_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` are server-only (no `NEXT_PUBLIC_` prefix)
