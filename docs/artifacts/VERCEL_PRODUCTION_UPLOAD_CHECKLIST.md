# Vercel Production — upload checklist

**Generated:** 2026-05-17 (local manifest — no secret values)
**Source:** `.env.production.local` vs `.env.storefront.production.example`

## Summary

| Metric | Value |
|--------|-------|
| P0 required ready | 9/9 |
| `NEXT_PUBLIC_APP_URL` | ready (`https://xn---production-xijza32a.vercel.app`) |
| Stripe Option A | Do **not** upload Stripe keys |

Copy each **SET** row into **Vercel → Project → Settings → Environment Variables → Production**, then redeploy.

## Vercel UI — step by step

1. Open [Vercel Dashboard](https://vercel.com) → your KitchenOS project.
2. **Settings → Environment Variables**.
3. For each row below with **✓ SET** locally: **Add** → name = variable → value from 1Password / `.env.production.local` → Environment = **Production** only (unless noted).
4. **Deployments → … → Redeploy** Production (required after any env change).
5. Run post-deploy smoke (see bottom).

### Staging / Preview (separate scope)

Use **Preview** environment for staging smoke and crons:

- `STAGING_BASE_URL` = `https://xn---preview--staging-r4nxb5ja9d6q.vercel.app` (or your preview host)
- Same DB/Supabase keys as production if sharing pilot data
- `CRON_SECRET` must match Vercel cron Authorization header

### Production canonical URL

- `NEXT_PUBLIC_APP_URL` should be `https://xn---production-xijza32a.vercel.app` (matches local file)

## P0 — production release

| Variable | Local | Upload to Vercel | Notes |
|----------|-------|------------------|-------|
| `DATABASE_URL` | ✓ SET | ☐ | |
| `DIRECT_URL` | ✓ SET | ☐ | |
| `NEXT_PUBLIC_APP_URL` | ✓ SET | ☐ | |
| `STOREFRONT_MIDDLEWARE_SECRET` | ✓ SET | ☐ | |
| `CRON_SECRET` | ✓ SET | ☐ | |
| `AUTH_SECRET` | ✓ SET | ☐ | |
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ SET | ☐ | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ SET | ☐ | |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ SET | ☐ | |

## P0 — email (optional)

| Variable | Local | Upload |
|----------|-------|--------|
| `RESEND_API_KEY` | — | ☐ |
| `RESEND_FROM_EMAIL` | — | ☐ |

## Week 1 (after stable prod)

| Variable | Local | Upload |
|----------|-------|--------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | — | ☐ |
| `TURNSTILE_SECRET_KEY` | — | ☐ |
| `STOREFRONT_REDIRECTS_ENABLED` | — | ☐ |

## Phase C — media pilot

| Variable | Local | Upload |
|----------|-------|--------|
| `STOREFRONT_SUPABASE_STORAGE_BUCKET` | ✓ | ☐ |
| `STOREFRONT_S3_BUCKET` | — | ☐ |
| `STOREFRONT_S3_REGION` | — | ☐ |
| `STOREFRONT_S3_ACCESS_KEY_ID` | — | ☐ |
| `STOREFRONT_S3_SECRET_ACCESS_KEY` | — | ☐ |
| `STOREFRONT_S3_PUBLIC_BASE_URL` | — | ☐ |

## Option B — skip for this release

Do not set: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Verification column (manual)

After pasting into Vercel, mark **Verified** in your copy or PR description:

| Variable | Verified in Vercel Production |
|----------|------------------------------|
| `DATABASE_URL` | ☐ |
| `DIRECT_URL` | ☐ |
| `NEXT_PUBLIC_APP_URL` | ☐ |
| `STOREFRONT_MIDDLEWARE_SECRET` | ☐ |
| `CRON_SECRET` | ☐ |
| `AUTH_SECRET` | ☐ |
| `NEXT_PUBLIC_SUPABASE_URL` | ☐ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ☐ |
| `SUPABASE_SERVICE_ROLE_KEY` | ☐ |

## After upload

```bash
npm run storefront:apply-deploy-urls
npm run storefront:vercel-manifest
npm run storefront:release-status

export STOREFRONT_SMOKE_BASE_URL="https://xn---production-xijza32a.vercel.app"
export STOREFRONT_SMOKE_SLUG=hello
export STOREFRONT_SMOKE_ENV=production
npm run storefront:post-deploy
```

Regenerate: `npm run storefront:vercel-manifest`
