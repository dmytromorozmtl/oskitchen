# Vercel Environment Variables — Production (os-kitchen.com)

Canonical reference: [`docs/ENVIRONMENT_VARIABLES.md`](./ENVIRONMENT_VARIABLES.md), [`.env.example`](../.env.example), [`docs/vercel-env-vars.md`](./vercel-env-vars.md).

Deploy domain: **https://os-kitchen.com**

> **Deploy method:** Use prebuilt deploy — `npm run deploy:prod` — remote `next build` on Vercel OOMs on this repo.

---

## Required (deploy / runtime will fail without these)

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `DATABASE_URL` | `postgresql://...` (pooler, `:6543`, `?pgbouncer=true`) | Supabase Dashboard → Settings → Database → Connection string (pooler) |
| `DIRECT_URL` | `postgresql://...` (direct `:5432` or session pooler) | Supabase Dashboard → Settings → Database → Connection string (direct) |
| `NEXTAUTH_SECRET` | random 32-byte hex | Generate: `openssl rand -hex 32` |
| `NEXTAUTH_URL` | `https://os-kitchen.com` | Hardcoded |
| `NEXT_PUBLIC_APP_URL` | `https://os-kitchen.com` | Hardcoded |
| `NEXT_PUBLIC_APP_ENV` | `production` | Hardcoded |
| `ENCRYPTION_KEY` | random 32-byte base64 | Generate: `openssl rand -base64 32` |
| `CRON_SECRET` | random string | Generate: `openssl rand -hex 32` — required for `vercel.json` crons |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase Dashboard → Settings → API (server only) |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard → Developers → Webhooks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe Dashboard → Developers → API keys |
| `RATE_LIMIT_ADAPTER` | `upstash` | Required on multi-instance Vercel |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL | Upstash console |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash token | Upstash console |

---

## Strongly recommended (core product features)

| Variable | Feature |
|----------|---------|
| `RESEND_API_KEY` | Transactional email |
| `RESEND_FROM_EMAIL` | Verified sender domain |
| `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID` | Billing checkout |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | Billing checkout |
| `NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID` | Billing checkout |
| `STOREFRONT_MIDDLEWARE_SECRET` | Vanity storefront host resolution |
| `NODE_OPTIONS` | `--max-old-space-size=14336` (Vercel build settings if using remote build) |

---

## Optional (integrations / staging-only tooling)

| Variable | Feature |
|----------|---------|
| `WOOCOMMERCE_CONSUMER_KEY` | WooCommerce integration |
| `WOOCOMMERCE_CONSUMER_SECRET` | WooCommerce integration |
| `WOOCOMMERCE_STORE_URL` | WooCommerce integration |
| `SHOPIFY_API_KEY` | Shopify custom app |
| `SHOPIFY_API_SECRET` | Shopify webhook signing |
| `SHOPIFY_STORE_DOMAIN` | Shopify Admin API |
| `SSO_STAGING_WORKSPACE_ID` | Enterprise SSO (staging proof) |
| `SSO_STAGING_IDP_VENDOR` | Enterprise SSO |
| `SSO_STAGING_ALLOWED_DOMAIN` | Enterprise SSO |
| `SSO_STAGING_TEST_EMAIL` | Enterprise SSO |
| `SSO_STAGING_SUPABASE_PROVIDER_REF` | Enterprise SSO |
| `E2E_STAGING_BASE_URL` | Staging E2E tests |
| `E2E_LOGIN_EMAIL` | Staging E2E tests |
| `E2E_LOGIN_PASSWORD` | Staging E2E tests |
| `DOORDASH_E2E_CONNECTION_ID` | DoorDash integration smoke |
| `CHANNEL_SMOKE_OWNER_EMAIL` | Live channel smoke tests |
| `SENTRY_DSN` | Server error reporting |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser error reporting |

---

## Vercel project settings

| Setting | Value |
|---------|-------|
| Node.js | 22.x (`package.json` engines) |
| Install | `npm ci && node ./node_modules/prisma/build/index.js generate` (`vercel.json`) |
| Build | `bash scripts/vercel-build.sh` — or prebuilt via `npm run deploy:prod` |
| Region | `iad1` |
| Production domain | `os-kitchen.com` |

---

## Verify env on Vercel

```bash
npx vercel env ls production
npx vercel whoami
```

Do **not** paste live secrets into git. Use Vercel dashboard or CLI only.
