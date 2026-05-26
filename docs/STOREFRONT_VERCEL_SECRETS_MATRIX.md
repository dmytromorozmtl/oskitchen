# Storefront — Vercel production secrets matrix

**Purpose:** copy-paste checklist for Vercel → Project → **Settings** → **Environment Variables** → **Production**.

Never commit filled values. Use [`.env.storefront.production.example`](../.env.storefront.production.example) locally.

---

## P0 — required for every storefront release

| Variable | Generate / source | Vercel scope | Validate |
|----------|-------------------|--------------|----------|
| `DATABASE_URL` | Supabase → Transaction pooler `:6543` + `pgbouncer=true` | Production | `npm run check-env:storefront` |
| `DIRECT_URL` | Supabase → Session pooler `:5432` | Production | same |
| `NEXT_PUBLIC_APP_URL` | `https://app.yourdomain.com` (no `/`) | Production | Launch tab + smoke |
| `STOREFRONT_MIDDLEWARE_SECRET` | `openssl rand -base64 32` | Production | ≥32 chars |
| `CRON_SECRET` | `openssl rand -base64 32` | Production | Cron logs not 401 |
| `AUTH_SECRET` | `openssl rand -base64 32` | Production | Dashboard login |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project | Production | Dashboard auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase API | Production | Dashboard auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase API | Production | Server actions |

---

## P0 — email (if notifications enabled)

| Variable | Notes |
|----------|-------|
| `RESEND_API_KEY` | Resend dashboard |
| `RESEND_FROM_EMAIL` | Verified domain |

Set `STOREFRONT_CHECK_EMAIL=1` when validating locally.

---

## A3 Option A — pay-later only (recommended day-1)

| Variable | Action |
|----------|--------|
| Stripe keys | **Do not set** in Production |
| Ordering admin | Pay later only ✓, Online payments ✗ |

Sign: `docs/artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md`

---

## A3 Option B — Stripe online checkout

| Variable | Notes |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | Endpoint `https://<prod>/api/webhooks/stripe` → `checkout.session.completed` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
| `STOREFRONT_STRIPE_CURRENCY` | Optional ISO code |

Validate: `STOREFRONT_CHECK_STRIPE=1 npm run check-env:storefront`

---

## Week 1 — hardening (after stable prod)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | Server verify |
| `STOREFRONT_REDIRECTS_ENABLED` | `true` |

Validate: `npm run storefront:week1-verify`

---

## Weeks 2–4 — media bucket

| Provider | Variables |
|----------|-----------|
| Supabase Storage | `STOREFRONT_SUPABASE_STORAGE_BUCKET` + existing Supabase keys |
| S3-compatible | `STOREFRONT_S3_*` (see example env file) |

---

## Local validation workflow

```bash
cp .env.storefront.production.example .env.production.local
# fill from 1Password — never commit

export $(grep -v '^#' .env.production.local | xargs)  # bash only; or source manually
npm run check-env:storefront:report
npm run storefront:release-preflight
```

---

## Post-deploy (5 min)

```bash
STOREFRONT_SMOKE_BASE_URL=https://app.yourdomain.com \
STOREFRONT_SMOKE_SLUG=your-slug \
STOREFRONT_SMOKE_ENV=production \
npm run smoke:storefront-release
```
