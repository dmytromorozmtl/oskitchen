# Staging environment checklist

**Policy:** `staging-environment-checklist-v1`  
**Status:** ops + engineering gate before P0 smokes and pilot kickoff  
**Updated:** 2026-06-02  
**Parent:** [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) · [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md) · [`STAGING_PILOT_OPS_RUNBOOK.md`](./STAGING_PILOT_OPS_RUNBOOK.md)

Complete this checklist before claiming staging-ready for paid pilots. **SKIPPED WITH REASON** is honest when vault vars are missing — not a substitute for configuration.

**Current snapshot (2026-06-02):** P0 aggregate `p0ProofStatus: awaiting_ops_credentials` · vault matrix reports 11/11 keys present locally but smokes still **SKIPPED** in CI until credentialed runs PASS ([`artifacts/vault-readiness-report.json`](../artifacts/vault-readiness-report.json)).

---

## Quick pass criteria

| Section | PASS when |
|---------|-----------|
| Domain + SSL | Staging URL resolves, HTTPS valid, `NEXT_PUBLIC_APP_URL` matches |
| Vault secrets | Vercel staging + GitHub Actions secrets set; `npm run verify:staging-env` PASS |
| Database | `prisma migrate deploy` on staging DB; health check DB OK |
| Cron jobs | All `vercel.json` crons authorized with `CRON_SECRET`; pilot-daily-health runs |
| Webhook endpoints | Partner-facing routes reachable; signature verification configured |

---

## 1 — Domain

| # | Check | Owner | Verify | Done |
|---|-------|-------|--------|:----:|
| 1.1 | Staging hostname chosen (e.g. `staging.os-kitchen.com` or Vercel preview alias) | Ops | DNS record exists | ☐ |
| 1.2 | Domain assigned in Vercel → Project → Settings → Domains | Ops | Green check in dashboard | ☐ |
| 1.3 | `NEXT_PUBLIC_APP_URL` = canonical staging URL (no trailing slash) | Ops | Matches browser address bar | ☐ |
| 1.4 | `NEXT_PUBLIC_APP_ENV=staging` set in Vercel staging env | Ops | UI shows staging badge if enabled | ☐ |
| 1.5 | Redirects: apex → staging or separate staging-only project | Ops | `curl -I` returns expected host | ☐ |
| 1.6 | Storefront custom domains (if pilot scope) documented separately | CS | Not required for core pilot gate | ☐ |

**Commands:**

```bash
curl -sf "$E2E_STAGING_BASE_URL/api/health" | jq '.status, .checks.database'
```

---

## 2 — SSL / TLS

| # | Check | Owner | Verify | Done |
|---|-------|-------|--------|:----:|
| 2.1 | Vercel-managed certificate issued for staging domain | Ops | Dashboard → Domains → Valid | ☐ |
| 2.2 | HTTPS enforced (no mixed-content on dashboard login) | Ops | Browser padlock; no http:// assets | ☐ |
| 2.3 | TLS 1.2+ on staging Postgres (Supabase) | Ops | Connection string uses `sslmode=require` if required | ☐ |
| 2.4 | Webhook URLs registered with partners use **https://** only | Integration | Woo/Shopify/Stripe dashboards | ☐ |
| 2.5 | Certificate expiry monitoring | Ops | Vercel auto-renew OR calendar reminder | ☐ |

**Commands:**

```bash
curl -vI "$E2E_STAGING_BASE_URL" 2>&1 | grep -E 'HTTP/|subject:|expire'
openssl s_client -connect staging.example.com:443 -servername staging.example.com </dev/null 2>/dev/null | openssl x509 -noout -dates
```

---

## 3 — Vault secrets

### 3A — Core Vercel staging (required)

Set in Vercel → Environment → **Staging** (never commit values). Template: [`.env.staging.example`](../.env.staging.example).

| # | Variable | Owner | Required | Done |
|---|----------|-------|:--------:|:----:|
| 3.1 | `DATABASE_URL` | Ops | **Y** | ☐ |
| 3.2 | `DIRECT_URL` | Ops | **Y** | ☐ |
| 3.3 | `NEXT_PUBLIC_SUPABASE_URL` | Ops | **Y** | ☐ |
| 3.4 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ops | **Y** | ☐ |
| 3.5 | `SUPABASE_SERVICE_ROLE_KEY` | Ops | **Y** | ☐ |
| 3.6 | `ENCRYPTION_KEY` | Ops | **Y** | ☐ |
| 3.7 | `CRON_SECRET` | Ops | **Y** | ☐ |
| 3.8 | `RATE_LIMIT_ADAPTER=upstash` | Ops | **Y** | ☐ |
| 3.9 | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Ops | **Y** | ☐ |
| 3.10 | `STRIPE_SECRET_KEY` (test mode) | Ops | **Y** | ☐ |
| 3.11 | `STRIPE_WEBHOOK_SECRET` | Ops | **Y** | ☐ |
| 3.12 | `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | Ops | Recommended | ☐ |
| 3.13 | `SENTRY_DSN` | Ops | Recommended ([`sentry-setup.md`](./sentry-setup.md)) | ☐ |

**Validate:**

```bash
npm run verify:staging-env
npm run vercel:staging-checklist
npm run staging:secrets:generate   # generate missing crypto only
```

### 3B — P0 smoke vault (11 vars — GitHub Actions + ops shell)

Required for [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md):

| # | Variable | Phase | Done |
|---|----------|-------|:----:|
| 3.14 | `E2E_STAGING_BASE_URL` | Staging login | ☐ |
| 3.15 | `E2E_LOGIN_EMAIL` | Staging login | ☐ |
| 3.16 | `E2E_LOGIN_PASSWORD` | Staging login | ☐ |
| 3.17 | `SSO_STAGING_WORKSPACE_ID` | SSO IdP | ☐ |
| 3.18 | `SSO_STAGING_IDP_VENDOR` | SSO IdP | ☐ |
| 3.19 | `SSO_STAGING_ALLOWED_DOMAIN` | SSO IdP | ☐ |
| 3.20 | `SSO_STAGING_TEST_EMAIL` | SSO IdP | ☐ |
| 3.21 | `SSO_STAGING_SUPABASE_PROVIDER_REF` | SSO IdP | ☐ |
| 3.22 | `CHANNEL_SMOKE_OWNER_EMAIL` | Channel live | ☐ |

*Note:* `DATABASE_URL` and `ENCRYPTION_KEY` (3.1, 3.6) also satisfy channel-live child smoke.

**Aggregate verify:**

```bash
npm run smoke:p0-staging-proof-unblock -- --checklist-only
npm run smoke:p0-staging-proof-unblock
```

**PASS:** `artifacts/p0-staging-proof-unblock-summary.json` → `p0ProofStatus: proof_passed`

Deep dive: [`docs/ops-vault-matrix.md`](./ops-vault-matrix.md) · [`p0-ops-vault-execution-playbook-2026-05-28.md`](./p0-ops-vault-execution-playbook-2026-05-28.md)

---

## 4 — Database

| # | Check | Owner | Verify | Done |
|---|-------|-------|--------|:----:|
| 4.1 | Staging Supabase project separate from production | Ops | Different project ref | ☐ |
| 4.2 | `DATABASE_URL` uses pooler; `DIRECT_URL` for migrations | Ops | [`STAGING_PILOT_OPS_RUNBOOK.md`](./STAGING_PILOT_OPS_RUNBOOK.md) Phase 2 | ☐ |
| 4.3 | `prisma migrate deploy` succeeds on staging | Engineering | No pending migrations | ☐ |
| 4.4 | Marketplace migration applied if pilot includes B2B (`20260602133000_marketplace_core`) | Engineering | No `MarketplaceDataUnavailable` from missing migration | ☐ |
| 4.5 | Orphan workspace provision + backfill complete | Engineering | `npm run workspace:backfill:status` exit 0 | ☐ |
| 4.6 | Pilot workspace + owner seeded | CS | Login works for `E2E_LOGIN_EMAIL` | ☐ |
| 4.7 | Backup snapshot before pilot traffic | Ops | Supabase backup or PITR enabled | ☐ |

**One-shot bootstrap:**

```bash
npm run staging:pilot:complete -- --dry-run
npm run staging:pilot:complete
```

Report: `docs/generated/STAGING_PILOT_RUN_REPORT.md`

---

## 5 — Cron jobs

All schedules defined in [`vercel.json`](../vercel.json). Each route requires `Authorization: Bearer $CRON_SECRET`.

| # | Path | Schedule | Owner | Verify | Done |
|---|------|----------|-------|--------|:----:|
| 5.1 | `/api/cron/webhook-jobs` | */5 min | Engineering | Jobs drain webhook queue | ☐ |
| 5.2 | `/api/cron/outbound-webhook-deliveries` | */5 min | Engineering | Outbound retries run | ☐ |
| 5.3 | `/api/cron/pilot-daily-health` | 08:00 UTC daily | Ops | Pilot health artifact or log | ☐ |
| 5.4 | `/api/cron/reminders` | 14:00 UTC daily | Ops | Reminder emails/logs | ☐ |
| 5.5 | `/api/cron/kds-overdue-alerts` | */10 min | Engineering | KDS alerts when overdue | ☐ |
| 5.6 | `/api/cron/doordash-sync` | */5 min | Integration | BETA — runs without 401 | ☐ |
| 5.7 | Remaining storefront / meal-plan crons | per vercel.json | Engineering | No sustained 401 in Vercel logs | ☐ |
| 5.8 | Vercel Cron enabled on staging deployment | Ops | Project → Cron tab shows jobs | ☐ |

**Manual probe:**

```bash
curl -sf -H "Authorization: Bearer $CRON_SECRET" \
  "$E2E_STAGING_BASE_URL/api/cron/pilot-daily-health"
```

**FAIL signals:** 401 (wrong `CRON_SECRET`), 500 (DB/env), missing cron invocations in Vercel dashboard.

---

## 6 — Webhook endpoints

Base URL: `https://<staging-domain>/api/webhooks/...`

### 6A — Production-pilot critical (configure first)

| Partner | Endpoint | Secret env | Owner | Done |
|---------|----------|--------------|-------|:----:|
| Stripe (test) | `/api/webhooks/stripe` | `STRIPE_WEBHOOK_SECRET` | Ops | ☐ |
| WooCommerce | `/api/webhooks/woocommerce` | per-connection secret | Integration | ☐ |
| Shopify orders | `/api/webhooks/shopify/orders-create` | Shopify HMAC | Integration | ☐ |
| Shopify orders | `/api/webhooks/shopify/orders-updated` | Shopify HMAC | Integration | ☐ |
| Shopify products | `/api/webhooks/shopify/products-update` | Shopify HMAC | Integration | ☐ |
| Resend (email) | `/api/webhooks/resend` | Resend signing | Ops | ☐ |
| DoorDash (BETA) | `/api/webhooks/doordash/orders` | `DOORDASH_WEBHOOK_SECRET` | Integration | ☐ |
| Grubhub (BETA) | `/api/webhooks/grubhub/orders` | `GRUBHUB_WEBHOOK_SECRET` | Integration | ☐ |
| Uber Eats (BETA) | `/api/webhooks/uber-eats/orders` | `UBER_EATS_WEBHOOK_SECRET` | Integration | ☐ |

### 6B — Verification checklist (each endpoint)

| # | Check | Done |
|---|-------|:----:|
| 6.1 | URL registered in partner console points to **staging** domain | ☐ |
| 6.2 | HTTPS only; returns 2xx on valid signed test payload | ☐ |
| 6.3 | Invalid signature returns 401 (not 500) | ☐ |
| 6.4 | Event persisted in `webhookEvent` table with `signatureValid: true` | ☐ |
| 6.5 | Idempotency: duplicate delivery does not double-process | ☐ |

**Route inventory:** 52 routes under `app/api/webhooks/**` — full matrix in Task 30 (`artifacts/webhook-signature-matrix.md`).

**Smoke:**

```bash
npm run smoke:woo-shopify-live
npm run smoke:channel-live-woo      # when wired
npm run smoke:channel-live-shopify  # when wired
```

---

## Master sign-off

| Section | Owner | Date | PASS |
|---------|-------|------|:----:|
| 1 Domain | | | ☐ |
| 2 SSL | | | ☐ |
| 3 Vault secrets | | | ☐ |
| 4 Database | | | ☐ |
| 5 Cron jobs | | | ☐ |
| 6 Webhook endpoints | | | ☐ |

**Staging ready for pilot step 3** ([`pilot-execution-checklist.md`](./pilot-execution-checklist.md)): all six sections PASS **and** P0 smoke aggregate `proof_passed`.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Health DB fail | Wrong `DATABASE_URL` or migration pending | Phase 4 database steps |
| Cron 401 | `CRON_SECRET` mismatch | Re-sync Vercel env + redeploy |
| Webhook 401 always | Secret not set on connection row | Re-save integration credentials |
| P0 SKIPPED | Missing 11 vars | Section 3B |
| Marketplace empty state | Migration not deployed | Step 4.4 |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md) | P0 11-var detail |
| [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md) | GitHub Actions secrets |
| [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) | LIVE promotion after staging proof |
| [`sentry-setup.md`](./sentry-setup.md) | Observability on staging |
