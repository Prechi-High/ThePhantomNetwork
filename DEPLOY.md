# Deploy THE PHANTOM to Vercel + Telegram

## 1. Push code to GitHub

Repo: [github.com/Prechi-High/ThePhantomNetwork](https://github.com/Prechi-High/ThePhantomNetwork)

Secrets are **not** in git. `.env.local` is gitignored. You add them in Vercel.

## 2. Vercel project

1. Import `Prechi-High/ThePhantomNetwork` on [vercel.com](https://vercel.com)
2. Framework: **Next.js** (auto-detected)
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

## 6. Vercel Cron

`vercel.json` runs `/api/cron/sessions` every minute to lock/start sessions and advance phases.

Ensure `CRON_SECRET` is set. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` on Pro; on Hobby you may need an external cron hitting the endpoint with that header.

## 7. Create a test session

After deploy, create an open session (replace URL and use your `CRON_SECRET` only from a secure terminal):

```bash
curl -X PUT "https://YOUR-VERCEL-URL.vercel.app/api/admin/sessions" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Phantom Night\",\"starts_at\":\"2026-06-28T22:00:00.000Z\",\"entry_fee_cents\":500}"
```

Or insert a row in Supabase `sessions` with `status = open`.

## 8. Why `.gitignore` does not break production

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
