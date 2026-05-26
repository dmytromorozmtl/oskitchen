# KitchenOS Remediation Status — 17 May 2026

Crosswalk of **Master Remediation Prompt** blocks vs repository state. Source audit: `docs/audit17may.md`.

**Baseline (17 May 2026):** `npm run typecheck` PASS · `npm test` 495/496 pass · `npx prisma validate` PASS (SetNull FK warning remains).

---

## Block 0 — Diagnostics

| Item | Status |
|------|--------|
| Typecheck / test baseline | Done — record in `/tmp/kos_*_baseline.txt` when re-running locally |
| IDOR grep inventory | Many actions use `dataUserId` via `requireTenantActor`; see `docs/IDOR_MUTATION_INVENTORY.md` |
| Rate limit | **Implemented** — `services/security/rate-limit-adapter.ts` (memory / Upstash / TCP Redis) |
| Dual RBAC grep | Legacy: `@/lib/permissions` (POS, permission-gate); workspace: `@/lib/permissions/index` |
| Experiment sync services | ~80+ files under `services/storefront/*-sync-service.ts` |
| Cron routes | **131** under `app/api/cron/` |

---

## Block 1 — P0 Security

| Task | Status | Notes |
|------|--------|-------|
| 1.1 RBAC unification | **Done (Phase A)** | `lib/permissions/legacy.ts`, ESLint, tests — see `docs/RBAC_MIGRATION_PLAN.md` Phase B+ |
| 1.2 IDOR REVIEW domains | **Done** | API §3 checkout/analytics/delivery → **FIXED** May 2026 remediation |
| 1.3 Distributed rate limits | **Done** | Upstash + Redis adapters; prod warning via `rateLimitProductionWarning()` |
| 1.4 Platform middleware | **Done** | `lib/supabase/middleware.ts` redirects unauthenticated `/platform` → `/login` |
| 1.5 Impersonation hardening | **Done** | Audit via `recordPlatformAudit`, 1h cookie TTL, `endPlatformImpersonation` — see `docs/IMPERSONATION_RUNBOOK.md` |

---

## Block 2 — Workspace tenant (C3)

| Task | Status |
|------|--------|
| Migration plan | **New** — `docs/WORKSPACE_MIGRATION_PLAN.md` |
| Phase 1 Prisma migration | **Ready** — SQL in `prisma/migrations/20260517120000_workspace_phase1_order_menu_product/`; apply + `npm run backfill:workspace-id` |

---

## Block 3 — API / webhooks / crons

| Task | Status |
|------|--------|
| 3.1 Public API order schema | **Done** — `orderCustomerFieldsSchema` + `publicApiOrderCreateSchema` |
| 3.2 Customers pagination | **Done** — page/pageSize in `app/api/public/v1/customers/route.ts` |
| 3.3 Cron inventory | **New** — `docs/CRON_INVENTORY.md`; experimental crons gated by `ENABLE_EXPERIMENTAL_CRONS` via `runCronRoute` |
| 3.4 Uber Eats router | **Review** — placeholder ingestion; ensure events not stuck PENDING |

---

## Block 4 — Experiment services quarantine

| Task | Status |
|------|--------|
| Move to `_experiments/` | **Done** — 60 services + cron import paths updated |

---

## Block 5 — Prisma hardening

| Task | Status |
|------|--------|
| SetNull on optional FKs | **Review** — warning on `brandId`/`locationId` (nullable); validate before changing |
| Performance indexes | **Partial** — many composites exist; add via migration when profiling |

---

## Blocks 6–10 — UX, performance, CI, docs, marketing

| Task | Status |
|------|--------|
| Placeholder banners | **In progress** — `components/ui/placeholder-banner.tsx` |
| Demo banner | **Done** — `DemoBanner` in dashboard layout |
| Nav owner-only internal | **Done** — `ownerOnly` on growth/developer/beta in `final-navigation-groups.ts` |
| `verify-marketing-claims` script | **New** — `scripts/verify-marketing-claims.ts` |
| Engineering onboarding doc | **New** — `docs/ENGINEERING_ONBOARDING.md` |
| E2E platform auth | **Done** — `tests/e2e/platform-access-denial.spec.ts` + CI job |

---

## Recommended execution order (this week)

1. Read `docs/IDOR_MUTATION_INVENTORY.md` — close remaining **REVIEW** API routes (`/api/checkout`, storefront analytics, delivery).
2. Run `npm run verify-claims` in CI (non-blocking).
3. Wire Upstash in staging; confirm `RATE_LIMIT_ADAPTER=upstash`.
4. Approve Workspace Phase 1 migration scope before any `prisma migrate dev`.
5. Defer experiment-service quarantine to 30-day sprint.
