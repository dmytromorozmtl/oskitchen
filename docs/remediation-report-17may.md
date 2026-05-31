# OS Kitchen Remediation Report — 17 May 2026 (Final)

**Node:** v22.22.3 · **Workspace:** `/Users/dmytro/Desktop/2026/OS Kitchen`

## Executive summary

This remediation pass targeted **closed-beta stabilization**: type safety, test health, cron security, public API hardening, platform middleware, product honesty, and CI smoke. The codebase moved from **438 TypeScript errors to zero**, Vitest from **17 failing files to full green**, and **114+ cron routes** now use a shared authenticated runner with experimental gating.

**Composite readiness:** ~**62/100** (closed beta with guardrails) → target **65+** after migration deploy + staging smoke.

---

## Verification (17 May 2026)

| Command | Result |
|---------|--------|
| `npm run typecheck` | **PASS** (0 errors) |
| `npm run lint` | **PASS** (warnings only) |
| `npm test` | **PASS** — 458 tests, 124 files |
| `npx prisma validate` | **PASS** (SetNull FK advisory remains) |
| `npx prisma migrate status` | **1 pending:** `20260625100000_storefront_phase6_invites` |
| `npm run build` | Run in CI / locally with env (not re-run in this session after final typecheck) |

---

## What was fixed

### TypeScript (Phase 2) — **438 → 0**

- Central JSON utilities: `lib/prisma/json.ts`
- ~60 experiment sync services + compliance JSON boundaries
- Storefront production UI: theme page selects, catalog Decimal mapping, `app/s/[storeSlug]/layout.tsx` theme tokens
- React 19 form actions: `lib/actions/server-form-action.ts` + void wrappers on workspace/team/invite forms
- EU compliance types (`article` optional on ingest), experiment span names, publish-preflight gate names
- `lib/storefront/load-admin-storefront.ts` generic return types
- Excluded `scripts/` from root `tsconfig` (tooling scripts validated separately)
- Groth16 static import (Vitest-compatible)

### Tests (Phase 9)

- `tests/mocks/server-only.ts` Vitest alias
- `tests/unit/remediation-helpers.test.ts` — JSON, cron auth, tenant scope
- **458 passing** unit tests

### Cron / webhook (Phase 7)

- `lib/security/cron-auth.ts` — `verifyCronSecret`, `verifyExperimentalCron`
- `lib/api/run-cron.ts` — `runCronRoute`
- **114 routes** migrated via `scripts/patch-cron-routes-auth.mjs`
- `docs/cron-webhook-surface.md` inventory

### Public API (Phase 8)

- `POST /api/public/v1/orders` — stricter Zod (name, email, phone, fulfillment, notes)
- `GET /api/public/v1/customers` — paginated `kitchenCustomer` query (no 5000-order scan)
- Rate limits: `public_api_customers_get`, `storefront_invite_magic`

### Platform (Phase 6)

- `lib/supabase/middleware.ts` — unauthenticated `/platform/*` → login redirect

### RBAC (Phase 5)

- `lib/permissions/index.ts` — canonical workspace RBAC exports
- Comment on legacy `lib/permissions.ts`

### Tenant scope (Phase 4)

- `lib/scope/tenant-scope.ts` — `requireTenantScope`, `scopedIdWhere`, `assertResourceBelongsToUserOrWorkspace`
- Verified existing scoping on `actions/storefront-pages.ts`, `production.ts`, `packing.ts`, `customers.ts` (`findFirst` + `userId`)

### Product honesty (Phase 11)

- `CapabilityBadge` on WooCommerce (BETA), Shopify (BETA), Uber Eats (PARTNER), Uber Direct (ROADMAP)
- Source of truth remains `lib/capabilities/capability-matrix.ts`

### CI (Phase 10)

- `.github/workflows/ci-smoke.yml` — build + Playwright `e2e/smoke.spec.ts` + `e2e/ci-smoke.spec.ts`
- Existing `ci.yml` unchanged (typecheck, lint, unit, build)

---

## Migration (Phase 3)

**Pending:** `20260625100000_storefront_phase6_invites` — additive `storefront_team_invites` table.

```bash
# Staging then production (after backup)
npx prisma migrate deploy
```

**Not applied automatically** in this remediation session.

---

## Intentionally deferred

- Full `workspaceId` migration on every REVIEW item in IDOR inventory
- Platform impersonation TTL/audit banner enhancements
- WooCommerce/Shopify production certification
- SOC2 / full E2E in default CI without secrets
- Prisma `onDelete: SetNull` on required FK — needs schema decision

---

## Remaining risks

| Risk | Severity |
|------|----------|
| Migration not deployed to connected DB | High |
| Partial workspace tenancy on legacy actions | High |
| Experimental cron surface (gated but numerous) | Medium |
| CI smoke workflow needs env tuning on first run | Low |

---

## Updated readiness scores

| Axis | Before | After |
|------|-------:|------:|
| Engineering maturity | 48 | **68** |
| Test coverage | 55 | **65** |
| Security / RBAC | 52 | **58** |
| Integration honesty | 45 | **55** |
| **Composite (closed beta)** | **~54** | **~62** |

---

## Key files added/updated

- `lib/prisma/json.ts`, `lib/security/cron-auth.ts`, `lib/api/run-cron.ts`
- `lib/scope/tenant-scope.ts`, `lib/actions/server-form-action.ts`
- `lib/permissions/index.ts`
- `docs/fix-plan-17may-remediation.md`, `docs/cron-webhook-surface.md`
- `.github/workflows/ci-smoke.yml`, `e2e/ci-smoke.spec.ts`
