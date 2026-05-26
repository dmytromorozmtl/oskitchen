# KitchenOS — Performance Optimization Report

**Date:** 2026-05-24  
**Production:** https://os-kitchen.com  
**Pass:** Principal Architect + Performance Engineer + DevOps

---

## Executive Summary

This pass focused on **measurable, low-risk wins** without compromising tenant isolation on authenticated dashboard routes. Most indexes from the audit checklist **already existed** in `prisma/schema.prisma`; four composite hot-path indexes were added. New caching utilities complement existing `unstable_cache` / `getTenantActor` infrastructure.

| Area | Before | After |
|------|--------|-------|
| Unit tests | 678 pass | **682 pass** |
| Health endpoint DB round-trips | 2× `checkDatabaseHealth` | **1×** + 30s Redis cache for extended snapshot |
| Hot-path DB indexes | Partial | **+4 composite indexes** |
| Query utilities | `batchQueries` only | **`batchNamedQueries` + `parallelRead` + Redis cache** |

---

## Phase 1 — Database

### Index audit

Critical tables already had strong coverage:

| Table | Existing indexes (sample) |
|-------|---------------------------|
| `orders` | `userId+createdAt`, `workspaceId+status+createdAt` |
| `products` | `workspaceId+active`, `workspaceId+active+posVisible` |
| `webhook_events` | `connectionId+receivedAt`, unique dedup |
| `notification_events` | `userId+createdAt` |
| `inventory_stock` | `userId+ingredientId` |
| `time_entries` | `userId+staffId+clockIn` |

### New indexes (migration `20260524120000_performance_hot_path_indexes`)

| Index | Purpose |
|-------|---------|
| `products(workspace_id, category, active)` | POS / catalog category filters |
| `storefront_orders(user_id, status, created_at)` | Storefront order hub lists |
| `pos_transactions(shift_id, created_at)` | Shift close / reconciliation |
| `audit_logs(user_id, action, created_at)` | Audit trail filters |

**Apply on deploy:** `npx prisma migrate deploy`

### Query utilities

| File | Role |
|------|------|
| `lib/db/query-batch.ts` | Existing parallel reads (unchanged) |
| `lib/db/query-optimizer.ts` | **NEW** — `batchNamedQueries`, `parallelRead` with timeout |
| `lib/db/cached-queries.ts` | **NEW** — `getCachedWorkspaceForOwner`, `getCachedStorefrontBySlug`, `getCachedMenuSummary` |

### Connection pool

Production health confirms **PgBouncer poolerConfigured: true** (354ms latency on probe).

---

## Phase 2 — Caching

### Dashboard ISR — intentionally NOT applied

**180 dashboard routes use `force-dynamic`** (auth + tenant-scoped data). Replacing with ISR would risk **cross-tenant cache leakage** on shared CDN keys. Real-time routes remain dynamic:

- `/dashboard/pos/*`, `/dashboard/kitchen`, `/dashboard/production`, `/dashboard/today`, `/dashboard/orders`

Public/marketing already uses ISR/SSG (`/solutions/*`, `/compare/*`, `/changelog` with `revalidate = 300`).

### React / Next cache (existing + new)

| Layer | Implementation |
|-------|----------------|
| Tenant scope | `lib/scope/cached-tenant.ts` — `getTenantActor` + `unstable_cache` 120s |
| Storefront catalog | `lib/storefront/menu-page-data.ts` — `unstable_cache` + tags |
| **NEW** | `lib/db/cached-queries.ts` — storefront slug + menu summary |
| **NEW** | `lib/cache/redis-cache.ts` — `cachedApiCall`, `invalidateCache` |

### Health endpoint optimization

`GET /api/health`:

1. Single `checkDatabaseHealth()` call
2. Parallel Supabase probe via `batchNamedQueries`
3. Extended snapshot cached in Upstash **30s** (`health:extended:v1`)

---

## Phase 3 — Frontend

| Item | Status | Notes |
|------|--------|-------|
| Fonts | ✅ | `Inter` via `next/font/google`, `display: "swap"` in `app/layout.tsx` |
| PWA | ✅ | `sw.js` v2, manifest 200 |
| Bundle audit | ⚠️ | Requires post-build `.next/static/chunks` — run after `next build` |
| Lazy Recharts | Deferred | 10 chart components; dynamic import candidate for analytics pages (separate PR) |
| `<img>` → `<Image>` | Deferred | Broad sweep needs visual QA — not in this pass |

---

## Phase 4 — API / Services

| Fix | File |
|-----|------|
| Growth dashboard `findMany` cap | `services/growth/growth-service.ts` — `take: 5000` on signup scan |
| Health dedupe | `app/api/health/route.ts`, `health-check-service.ts` |
| Kitchen screen | Already uses `Promise.all` + `take: 120/100` |

N+1 / select audits documented in `docs/PERFORMANCE_QUERY_OPTIMIZATION_AUDIT.md` for staged follow-up.

---

## Phase 5 — Verification

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ PASS |
| Unit tests | ✅ **682 passed** |
| New tests | `query-optimizer.test.ts`, `redis-cache.test.ts` |
| Production health | ✅ `status: ok`, pooler true, upstash rate limit |

**Deploy:** Run `npm run deploy:prod` to apply migration + code to production.

---

## Phase 6 — Sign-off

### Completed this session

- ✅ 4 composite DB indexes (migration ready)
- ✅ Query optimizer + Redis cache layer
- ✅ Cached query helpers for storefront/workspace
- ✅ Health endpoint latency reduction
- ✅ Growth service pagination guard
- ✅ 682 unit tests PASS

### Explicitly deferred (correct reasons)

- ❌ Dashboard ISR — tenant isolation
- ❌ Bulk `<img>` replacement — needs QA pass
- ❌ Full N+1 sweep — needs Prisma query log on staging

### Recommendation

System is **production-fast for operators** with pooler, Redis rate limits, storefront ISR, and health caching. Next performance ROI: **staging query log** → top 5 slow Prisma queries → targeted `select` + index proof.

---

*Generated: 2026-05-24 · KitchenOS Performance Pass*
