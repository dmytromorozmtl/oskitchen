# Vercel Environment Variables

Canonical reference: **`docs/ENVIRONMENT_VARIABLES.md`** and **`.env.example`**.

Deploy domain: **https://os-kitchen.com**

> **Deploy note:** Remote `next build` on Vercel OOMs on this repo. Use **prebuilt deploy**: `npm run deploy:prod` (see `README.md`).

## Production (os-kitchen.com)

| Variable | Value | Source |
|----------|-------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://os-kitchen.com` | hardcoded |
| `NEXT_PUBLIC_APP_ENV` | `production` | hardcoded |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key | Supabase dashboard (server only) |
| `DATABASE_URL` | pooled Postgres (`:6543`, `pgbouncer=true`) | Supabase pooler |
| `DIRECT_URL` | session/direct Postgres (`:5432` or session pooler) | Supabase |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` | generate |
| `CRON_SECRET` | random string | generate — required for `vercel.json` crons |
| `RATE_LIMIT_ADAPTER` | `upstash` | Vercel multi-instance |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL | Upstash console |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash token | Upstash console |
| `STRIPE_SECRET_KEY` | `sk_live_*` | Stripe live mode |
| `STRIPE_WEBHOOK_SECRET` | `whsec_*` | Stripe webhook endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_*` | Stripe |
| `NEXT_PUBLIC_STRIPE_*_PRICE_ID` | live price IDs | Stripe products |
| `RESEND_API_KEY` | API key | Resend |
| `RESEND_FROM_EMAIL` | verified sender | Resend domain |
| `SENTRY_DSN` | server DSN | Sentry (optional) |
| `NEXT_PUBLIC_SENTRY_DSN` | browser DSN | Sentry (optional) |
| `STOREFRONT_MIDDLEWARE_SECRET` | random string | generate — vanity host resolution |
| `NODE_OPTIONS` | `--max-old-space-size=14336` | Vercel build settings (see `scripts/vercel-build.sh`) |

## Preview / Staging

| Variable | Value | Source |
|----------|-------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://<preview>.vercel.app` | Vercel preview URL |
| `DATABASE_URL` | staging pooler URL | Supabase staging project |
| `DIRECT_URL` | staging direct URL | Supabase staging |
| `STRIPE_SECRET_KEY` | `sk_test_*` | Stripe test mode only |
| `STRIPE_WEBHOOK_SECRET` | test webhook secret | Stripe test endpoint |
| All other keys | mirror production structure | use staging credentials |

## Vercel project settings

- **Node.js:** 22.x (`package.json` engines)
- **Install:** `npm ci && npx prisma generate` (see `vercel.json`)
- **Build:** `bash scripts/vercel-build.sh` — or prebuilt via `npm run deploy:prod`
- **Region:** `iad1` (`vercel.json`)
