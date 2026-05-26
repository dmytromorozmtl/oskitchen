# Feedback Closure Report — 23 May 2026

**Scope:** 45+ items from Architect, Developer, QA, PM, Marketing, UX audits  
**Production:** https://os-kitchen.com

---

## Executive summary

| Category | Implemented today | Already existed | Roadmap (not in scope today) |
|----------|------------------:|----------------:|-----------------------------:|
| P1 Developer / Security | 4 | 3 | 0 |
| P2 Architecture | 5 | 2 | 3 |
| QA | 3 tests | E2E scaffolds | Full Playwright CI matrix |
| PM / Marketing | 5 pages | Onboarding, verticals | Hardware, SSO, native app |
| UX | 0 code | Command palette, empty states, business-mode nav | iPad split-view, bulk actions |

---

## P1 — Critical (Developer / Security)

### DB latency 344ms → indexes + pooler visibility

**Done:**
- Prisma migration `20260523120000_pos_performance_indexes`:
  - `orders(workspace_id, status, created_at DESC)`
  - `products(workspace_id, active)` + `(workspace_id, active, pos_visible)`
  - `pos_transactions(workspace_id, created_at DESC)`
- Health check now reports `poolerConfigured` (PgBouncer `:6543` / `pgbouncer=true`)
- `lib/db/query-batch.ts` — parallel Prisma reads helper for POS/dashboard

**Already existed:** `[workspaceId, createdAt]` on Order/Product; `[userId, createdAt]` on Order/POSTransaction

**Ops action required:** Apply migration on production (`prisma migrate deploy`). Ensure `DATABASE_URL` uses Supabase transaction pooler per `.env.example`.

**Note:** Health `latencyMs` measures Vercel→Supabase round-trip (`SELECT 1`), not indexed query p95. Target `<80ms` applies to app queries post-migration.

### Rate limiter memory → Redis

**Done:** `resolveRateLimitAdapterName()` auto-selects **Upstash** in production when `UPSTASH_REDIS_REST_*` are set (even if `RATE_LIMIT_ADAPTER` unset).

**Already existed:** `RateLimitUpstashAdapter`, `RateLimitTcpRedisAdapter`, production warnings in `/api/health`.

**Ops action:** Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` on Vercel.

### Stripe webhook signature verification

**Already implemented** — `app/api/webhooks/stripe/route.ts` uses `stripe.webhooks.constructEvent()` + idempotency via `billingEvent.stripeEventId`.

**Added:** `tests/unit/stripe-webhook-signature.test.ts` (static verification test).

### PII encryption at rest

**Done:** `lib/security/pii-field.ts` — AES-256-GCM via existing `lib/crypto.ts`, `enc:v1:` prefix, log masking.

**Already existed:** Integration credential encryption (`encryptSecret` / `decryptSecret`).

**Roadmap:** Migrate `Order.customerEmail` / address fields to encrypted columns (breaking change — phased rollout).

### Audit log for mutations

**Already existed:** `services/audit/audit-service.ts` with redaction, diff, workspace resolution.

**Added:** `lib/actions/with-audit-mutation.ts` wrapper for Server Actions.

### console.log in production

**Done:** Replaced **13** `console.warn` calls in `actions/` + `services/` with `logger.warn` from `lib/logger.ts`.

---

## P2 — Architecture

### Job queue inline → async

**Done:** `lib/jobs/job-dispatcher.ts` — enqueues `WebhookEvent` + `WebhookProcessingJob` when `WEBHOOK_ASYNC_QUEUE=true`.

**Already existed:** Cron drain `/api/cron/webhook-jobs`, Woo/Shopify enqueue pattern.

**Roadmap:** Inngest/Trigger.dev adapter (swap dispatcher backend without caller changes).

### ISR for force-dynamic pages

**Done:** `app/changelog/page.tsx` → `revalidate = 300` (was `force-dynamic`).

**Already ISR:** Storefront menu/cart/checkout (`revalidate = 60`), compare pages (`generateStaticParams`).

**Not changed:** 23 dashboard pages + ~165 cron routes — require session/auth or must stay dynamic.

### RBAC granular permissions

**Already existed:** `requireWorkspacePermission()` + `PermissionKey` set.

**Added permissions:** `orders.void`, `products.edit`, `payroll.view`.

### OpenAPI for 285 API routes

**Done (session 54):**
- `lib/api/openapi-spec.ts` — scans `app/api/**/route.ts`, emits OpenAPI 3.0
- `/api/openapi.json` — JSON spec route
- `/api/docs` — Swagger UI (`components/api/swagger-docs-client.tsx`)

### Supabase Realtime KDS

**Already implemented** (session 31) — verify in `components/kitchen/` realtime subscriptions.

---

## QA

**Added tests:**
- `tests/unit/pii-field.test.ts`
- `tests/unit/rate-limit-auto-upstash.test.ts`
- `tests/unit/stripe-webhook-signature.test.ts`
- `tests/e2e/storefront-order-flow.spec.ts` — guest pay-later checkout
- `tests/integration/stripe-checkout.integration.test.ts` — webhook contract + OpenAPI route count

**E2E scaffolds enabled (session 54):** `pos-production.spec.ts`, `signup-order.spec.ts`, `webhook-woo-async.spec.ts`, `support-reply.spec.ts`; `storefront-order.spec.ts` re-exports flow doc pointer.

**Already existed:**
- `e2e/pos-checkout-flow.spec.ts` (env-gated)
- `tests/unit/cross-tenant-denial.test.ts`
- `tests/integration/tenant-isolation.test.ts` (`RUN_DB_INTEGRATION=1`)

**Roadmap:** Enable Stripe iframe checkout E2E with `STOREFRONT_E2E_STRIPE=1`; staging credentials for full POS checkout in CI.

---

## PM / Marketing

**Added:**
- Compare pages: `/compare/toast`, `/compare/square`, `/compare/marketman`
- Blog: `/blog/how-to-choose-restaurant-pos-2026`, `/blog/ghost-kitchen-setup-complete-guide`

**Already existed:**
- 7 vertical solution pages (`/solutions/*`)
- Onboarding wizard (I1/I2 fixes)
- `/compare/restaurant-pos`, `/compare/meal-prep-software`
- 3 blog articles

**Roadmap:** Native payment hardware, SSO/SAML, franchise royalty dashboard, aggregator partnership contracts, public pricing page, case studies.

---

## UX

**Added (session 54):**
- POS keyboard shortcuts — `lib/keyboard/shortcuts.ts`, wired in `pos-terminal-client.tsx` (F1–F4, Esc)
- Orders bulk actions — `components/tables/bulk-actions.tsx` + selection/export/confirm in `orders-table.tsx`
- Service worker offline POS sync hooks — `public/sw.js` (`kitchenos-offline-pos` tag)

**Already existed:**
- Progressive disclosure via `lib/business-mode-registry.ts` + `getFilteredNavGroups()`
- `components/dashboard/command-palette.tsx` (⌘K)
- `components/dashboard/empty-state.tsx` (16+ dashboard pages)

**Roadmap:** iPad POS split-view, universal empty states, sidebar IA reduction, client-side offline POS queue registration.

---

## Files changed (this session)

| Area | Files |
|------|-------|
| Schema | `prisma/schema.prisma`, `prisma/migrations/20260523120000_pos_performance_indexes/` |
| Performance | `lib/db/health.ts`, `lib/db/query-batch.ts` |
| Security | `lib/security/pii-field.ts`, `lib/rate-limit/rate-limit-env.ts`, `lib/permissions/permissions.ts` |
| Jobs | `lib/jobs/job-dispatcher.ts` |
| Audit | `lib/actions/with-audit-mutation.ts` |
| Logging | 11 files in `actions/` + `services/` |
| ISR | `app/changelog/page.tsx` |
| Marketing | `lib/marketing/compare-content.ts`, `lib/marketing/blog-posts.ts`, 2 blog pages + content |
| Tests | 3 new unit test files |

---

## Verification URLs

| Check | URL |
|-------|-----|
| Health (pooler flag) | https://os-kitchen.com/api/health |
| Compare Toast | https://os-kitchen.com/compare/toast |
| Compare Square | https://os-kitchen.com/compare/square |
| Compare MarketMan | https://os-kitchen.com/compare/marketman |
| New blog posts | https://os-kitchen.com/blog/how-to-choose-restaurant-pos-2026 |
| OpenAPI docs | https://os-kitchen.com/api/docs |
| OpenAPI JSON | https://os-kitchen.com/api/openapi.json |

---

## Deploy checklist

1. ✅ `prisma migrate deploy` on production DB — **applied** `20260523120000_pos_performance_indexes`
2. ⚠️ Set Upstash Redis env vars on Vercel — **URL set**; **`UPSTASH_REDIS_REST_TOKEN` still required** (see below)
3. ✅ Confirm `DATABASE_URL` uses transaction pooler — **updated on Vercel** (`:6543?pgbouncer=true`)
4. Optional: `WEBHOOK_ASYNC_QUEUE=true` + cron for async jobs
5. ✅ `npm run deploy:prod` — **dpl_26YaxGZQprh4nPB3njgJtAnJbef1** (2026-05-23)

### Post-deploy verification (2026-05-23)

| Check | Result |
|-------|--------|
| Health | `ok` |
| `poolerConfigured` | `true` |
| DB `latencyMs` | ~319ms (health probe; not app query p95) |
| Rate limit adapter | `memory` (fallback — **token missing**) |
| Compare/blog pages | 5/5 HTTP 200 |
| Tests | 672 passed (session 54) |

### Remaining manual step — Upstash token

```bash
# 1. https://console.upstash.com → your Redis DB → REST API → copy token
# 2. Add to Vercel (do not commit):
printf '%s' 'YOUR_TOKEN' | vercel env add UPSTASH_REDIS_REST_TOKEN production --force --yes
# 3. Redeploy to pick up env:
npm run deploy:prod
```

Until token is set, production uses in-memory rate limits per Vercel instance (`productionMemoryWarning` in `/api/health`).

---

*Generated: 2026-05-23*
