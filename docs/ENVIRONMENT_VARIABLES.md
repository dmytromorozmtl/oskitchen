# Environment variables

OS Kitchen validates configuration in **`lib/env.ts`** (Zod).

- **PUBLIC** variables are safe for browser bundles (`NEXT_PUBLIC_*`).
- **SECRET** variables must exist only on the server (Vercel: never expose to client).

Client Components **must not** import `getServerEnv()` or read secret keys.

---

## Local setup

1. Copy **`.env.example`** → **`.env.local`**.
2. Use Supabase **dev** project or local Postgres URLs for `DATABASE_URL` / `DIRECT_URL`.
3. `NEXT_PUBLIC_APP_URL=http://localhost:3000`
4. Optional: omit Stripe/Resend — app degrades gracefully.

## Vercel setup

1. **Project → Settings → Environment Variables**
2. Add variables per environment (**Production**, **Preview**, **Development**).
3. Never toggle “Expose to Browser” for secrets.
4. After rotating secrets → **Redeploy** production.

## Production setup checklist

- [ ] `NEXT_PUBLIC_APP_URL` is canonical HTTPS domain
- [ ] `DATABASE_URL` uses Supabase **pooler**
- [ ] `DIRECT_URL` uses **direct** Postgres for migrations
- [ ] `ENCRYPTION_KEY` set before storing real integration tokens
- [ ] `CRON_SECRET` set if `vercel.json` cron enabled
- [ ] `RATE_LIMIT_ADAPTER` + (`UPSTASH_REDIS_REST_*` or `REDIS_URL`) set for multi-instance preview/production rate limits
- [ ] `SENTRY_DSN` set if server error monitoring is desired; optional `NEXT_PUBLIC_SENTRY_DSN` for browser errors
- [ ] Stripe **live** keys only in Production (not Preview)
- [ ] `LEGAL_POLICIES_PUBLISHED=true` only after counsel-approved `/legal/*` copy is deployed (otherwise leave unset for `noindex` drafts)

---

## APP

| Variable | Public? | Required prod | Description |
|----------|---------|---------------|-------------|
| `NEXT_PUBLIC_APP_URL` | PUBLIC | **Yes** | Canonical site URL for redirects, Stripe return URLs, metadata. |
| `NEXT_PUBLIC_APP_ENV` | PUBLIC | No | Optional label: `development` \| `staging` \| `production` (UI/diagnostics). |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | PUBLIC | No | Mailto target for dashboard feedback/bug links. |
| `NODE_ENV` | — | Yes | `development` / `production` / `test` (usually automatic). |

---

## SUPABASE + DATABASE

| Variable | Public? | Required prod | Description |
|----------|---------|---------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | PUBLIC | **Yes** | Supabase API URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | PUBLIC | **Yes** | Browser-safe anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | SECRET | Recommended | Server-only admin operations. |
| `DATABASE_URL` | SECRET | **Yes** | **Pooled** Postgres URL for Prisma runtime (often `:6543` + `pgbouncer=true`). |
| `DIRECT_URL` | SECRET | **Yes** | **Direct** Postgres for `prisma migrate` (often `:5432`). |

---

## SECURITY

| Variable | Public? | Required prod | Description |
|----------|---------|---------------|-------------|
| `ENCRYPTION_KEY` | SECRET | **Yes** (real data) | AES secret for stored integration tokens (`openssl rand -base64 32`). |
| `CRON_SECRET` | SECRET | Recommended | Vercel Cron sends `Authorization: Bearer` automatically when set. Required for `/api/cron/reminders` and `/api/cron/webhook-jobs`. |
| `WEBHOOK_ASYNC_QUEUE` | SECRET | Optional | When `true`, WooCommerce + Shopify webhooks enqueue `webhook_processing_jobs` and return fast — **must** schedule cron hitting `/api/cron/webhook-jobs` with the same bearer secret. |
| `WEBHOOK_JOB_BATCH_SIZE` | SECRET | Optional | Max jobs attempted per cron invocation (default `40`, hard-capped in code). |
| `WEBHOOK_JOB_MAX_ATTEMPTS` | SECRET | Optional | Max processing attempts per job before `FAILED` (default `5`). |
| `NEXT_PUBLIC_NAV_RELEASE_PROFILE` | PUBLIC | Optional | `pilot` hides deep sidebar modules (forecast, copilot, …); default `full`. |
| `SENTRY_DSN` | SECRET | Optional | Initializes `@sentry/nextjs` on the server (`instrumentation.ts`) and enables `captureErrorSafe` when the SDK client is live. |
| `SENTRY_TRACES_SAMPLE_RATE` | SECRET | Optional | Server trace sampling `0`–`1` (default `0.05` in `sentry.server.config.ts`). |
| `NEXT_PUBLIC_SENTRY_DSN` | PUBLIC | Optional | Browser Sentry DSN only — never put secret keys in `NEXT_PUBLIC_*`. |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | PUBLIC | Optional | Client trace sampling (default `0` in `sentry.client.config.ts`). |
| `RATE_LIMIT_ADAPTER` | SECRET | Optional | `memory` (default) \| `upstash` \| `redis`. Use distributed adapters in preview/production multi-instance hosts. |
| `UPSTASH_REDIS_REST_URL` | SECRET | With Upstash | REST API URL from Upstash console. |
| `UPSTASH_REDIS_REST_TOKEN` | SECRET | With Upstash | REST token — pair with URL. |
| `REDIS_URL` | SECRET | With `redis` adapter | Standard Redis connection string for TCP rate limiting (`redis://…`). |
| `AUDIT_REASON_RETENTION_MODE` | SECRET | Optional | `PREVIEW_ONLY` (default) \| `FULL_INTERNAL` \| `REDACTED` \| `HASHED` — controls how replay/destructive action reasons are stored in audit metadata. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | SECRET | Optional | Reserved for OpenTelemetry export when adopted. |
| `OBJECT_STORAGE_BUCKET` | SECRET | Optional | Reserved for large import/export artifacts — see background jobs doc. |
| `WEBHOOK_SIGNING_SECRET` | SECRET | Optional | Shared secret for custom signing schemes. |

---

## LEGAL PAGES

| Variable | Public? | Required prod | Description |
|----------|---------|---------------|-------------|
| `LEGAL_POLICIES_PUBLISHED` | SECRET | Optional | When `true` / `1` / `yes`, `/legal/privacy` and `/legal/terms` allow indexing and show a “published” banner. Default (unset): **draft** — `noindex` robots metadata and draft UI. |

---

## E2E (Playwright only)

| Variable | Public? | Required prod | Description |
|----------|---------|---------------|-------------|
| `E2E_LOGIN_EMAIL` | SECRET | No | Dashboard auth smoke (`npm run test:e2e:dashboard`). Playwright loads `.env` / `.env.local` before reading the config (shell-defined vars still win). |
| `E2E_LOGIN_PASSWORD` | SECRET | No | Password for that user — never commit. |
| `E2E_SEED_USER_ID` | SECRET | No | Supabase user UUID for `npm run db:seed:e2e-pos` (same id as the Playwright login user). |
| `E2E_DATABASE_URL` | SECRET | No | Staging-only: transaction pooler URL for optional `prisma migrate deploy` in `e2e-remote-smoke` dashboard job. |
| `E2E_DIRECT_URL` | SECRET | No | Staging-only: session pooler URL paired with `E2E_DATABASE_URL` for migrations. |
| `PLAYWRIGHT_BASE_URL` | SECRET | No | Base URL for Playwright (defaults to `http://127.0.0.1:3000` in `playwright.config.ts`). |
| `RUN_DB_INTEGRATION` | SECRET | No | Set to `1` in CI/local to enable `tests/integration/*` Vitest specs that hit `DATABASE_URL`. |

**GitHub Actions (optional):** the manual workflow `e2e-remote-smoke.yml` uses **`PLAYWRIGHT_INCLUDE_DASHBOARD`** and secrets **`E2E_LOGIN_EMAIL`** / **`E2E_LOGIN_PASSWORD`** for Playwright (see `docs/TESTING.md`). **`PLAYWRIGHT_INCLUDE_STOREFRONT`** + secret **`E2E_STOREFRONT_SLUG`** runs `e2e/storefront.spec.ts`. When **`PLAYWRIGHT_RUN_E2E_DB_SEED`** is **`true`**, the dashboard job runs migrate + **`npm run db:seed:e2e-pos`** using **`E2E_DATABASE_URL`**, **`E2E_DIRECT_URL`**, **`E2E_SEED_USER_ID`**. When **`PLAYWRIGHT_PRUNE_AFTER_E2E`** is **`true`**, the dashboard job runs **`db:prune:e2e-pos-orders --execute`** using **`E2E_DATABASE_URL`** and **`E2E_SEED_USER_ID`**. Repository variables **`PLAYWRIGHT_*`** are not secrets — **never** point database URLs at production.

---

## STRIPE

| Variable | Public? | Required prod | Description |
|----------|---------|---------------|-------------|
| `STRIPE_SECRET_KEY` | SECRET | For billing | `sk_test_*` or `sk_live_*`. |
| `STRIPE_WEBHOOK_SECRET` | SECRET | For billing | Signing secret from webhook endpoint. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | PUBLIC | Optional | `pk_*` for embedded checkout patterns. |
| `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID` | PUBLIC | For checkout | Recurring price ID. |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | PUBLIC | For checkout | Recurring price ID. |
| `NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID` | PUBLIC | For checkout | Recurring price ID. |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | PUBLIC | Optional | If enterprise checkout exists. |

---

## EMAIL (RESEND)

| Variable | Public? | Required prod | Description |
|----------|---------|---------------|-------------|
| `RESEND_API_KEY` | SECRET | For send | API key — omit locally to skip sends. |
| `RESEND_FROM_EMAIL` | SECRET | For send | Verified sender, e.g. `Name <mail@domain.com>`. |

---

## SHOPIFY

| Variable | Public? | Required prod | Description |
|----------|---------|---------------|-------------|
| `SHOPIFY_APP_SECRET` | SECRET | When Shopify live | Verifies webhooks. |
| `SHOPIFY_API_VERSION` | SECRET | Optional | API version string, e.g. `2024-10`. |

---

## WOOCOMMERCE

| Variable | Public? | Required prod | Description |
|----------|---------|---------------|-------------|
| `WOOCOMMERCE_WEBHOOK_SECRET` | SECRET | When Woo live | Verifies delivery HMAC. |

---

## UBER

| Variable | Public? | Required prod | Description |
|----------|---------|---------------|-------------|
| `UBER_EATS_CLIENT_ID` | SECRET | Partner program | OAuth/client credentials. |
| `UBER_EATS_CLIENT_SECRET` | SECRET | Partner program | |
| `UBER_DIRECT_CLIENT_ID` | SECRET | Uber Direct | |
| `UBER_DIRECT_CLIENT_SECRET` | SECRET | Uber Direct | |
| `UBER_DIRECT_WEBHOOK_SECRET` | SECRET | Uber Direct placeholder ingress | Authenticates `/api/webhooks/uber-direct` until live provider signature verification ships. |

---

## DEMO

| Variable | Public? | Required prod | Description |
|----------|---------|---------------|-------------|
| `DEMO_MODE_ENABLED` | SECRET-ish | Optional | When truthy, allows demo import/reset on production hosts. |
| `DEMO_SEED_SECRET` | SECRET | Optional | Protects automated demo seed endpoints if used. |

---

## Developer diagnostics

- **Owner → Developer** shows presence-only rows via `getEnvHealth()` — values never displayed.
- **`getEnvSuspicionWarnings()`** flags placeholder patterns — still **no values** logged in UI.

See also: `.env.example`, `docs/SECRET_ROTATION_PLAN.md`, `docs/PRODUCTION_SAFETY_GUARDS.md`.
