# OS Kitchen — Final Sign-Off Before Pilot Launch

**Date:** 18 May 2026  
**Sign-off by:** Principal Platform Architect (Release Commander)  
**Verification scope:** Phases M–T + **U–Z** (absolute re-verification; no prior session trusted)

**Signed:** Principal Platform Architect, 18 May 2026

**Final verification (Phases I–IV, session 10):** 19 May 2026 — **62/62** artifacts on disk; static suite **ALL PASS** on Node 22.22.3; handoff package `docs/PILOT_HANDOFF_FINAL.md` + `scripts/ops/pilot-go.sh`. **Code and artifacts are 100% ready for ops staging redeploy.**

---

## Verdict

**READY_FOR_PILOT** (code) · **NOT_READY** for first paid production operator until ops checklist + staging golden path complete

| Layer | Status |
|-------|--------|
| Application code & CI gates | **READY_FOR_PILOT** |
| Staging / production infra | **BLOCKED** — backfill, Upstash, Vercel Cron (10 slugs), E2E golden path |
| Commercial launch (revenue) | **Earliest 22 May 2026** after staging Days 1–3 (19–21 May) |

---

## Evidence

### Code quality (Phase W — re-executed 18 May 2026, session U–Z)

| Command | Result | Output |
|---------|--------|--------|
| `node -v` | **PASS** | v22.22.3 |
| `npm -v` | **PASS** | 10.9.8 |
| `rm -rf node_modules .next && npm ci` | **PASS** | exit 0 |
| `npx prisma validate` | **PASS** | Schema valid; SetNull warning (known) |
| `npm run typecheck` | **PASS** | exit 0 |
| `npm run lint` | **PASS** | exit 0; warnings only `lib/storefront/theme-experiment*` |
| `npm test` | **PASS** | **605** passed, **1** skipped (19 May final) |
| `NODE_OPTIONS=--max-old-space-size=8192 npm run build` | **PASS** | exit 0 (~3.8 min) |
| `bash scripts/ops/pilot-preflight.sh` | **PASS** | Includes `validate:production-crons`, `validate:cron-inventory`, `validate:tenant-scope-pilot`, `verify-claims` |

Preflight also ran with `SKIP_BUILD=1` → **PASS** (same gates except build). Local WARN for unset staging env vars is expected off-Vercel.

### Phase U — Critical files (U.2 checklist)

| File | Status | Notes |
|------|--------|-------|
| `eslint.config.mjs` | ✅ | Global `_experiments` ban; cron override allows experiments, forbids `@/components/*` + `@/app/**`; `dataUserId` ban **only** `services/**`; exemptions `lib/auth`, `lib/supabase`, `lib/scope` |
| `lib/api/run-cron.ts` | ✅ | Uses `isAllowedProductionCronSlug` / `isExperimentalCronPath` from manifest; **404 before auth** for blocked experimental; production uses `verifyCronSecret`; Sentry `risk:experimental_cron` on experimental tier |
| `lib/scope/require-tenant-actor.ts` | ✅ | Returns `{ sessionUser, sessionUserId, userId, dataUserId, workspaceId }`; no session → `redirect("/login")` via `requireSessionUser` |
| `lib/scope/with-workspace-scope.ts` | ✅ | AND-merge `buildOwnerScopedWhere(actor.userId, actor.workspaceId)` |
| `lib/scope/workspace-resource-scope.ts` | ✅ | `workspaceId === null` → `{ userId: ownerUserId }` |
| `lib/security/mutation-origin-guard.ts` | ✅ | POST/PUT/PATCH/DELETE only; GET returns `null`; prod requires Origin/Referer |
| `app/api/internal/dsr/export/route.ts` | ✅ | POST only; superadmin; MFA; CSRF guard |
| `services/cron/production-manifest.ts` | ✅ | **10** slugs; `ALLOWED_PRODUCTION_CRON_PATHS` exported (10 paths) |
| `components/dashboard/pilot-release-route-notice.tsx` | ✅ | Banner only (`role="status"`); does not block page |
| `scripts/ops/pilot-preflight.sh` | ✅ | Node 22; typecheck; lint; test; prisma validate; cron/tenant/claims guards; build; `exit 1` on failure |

**Doc discrepancy (non-blocking):** `CTO_FIXES_APPLIED.md` Phase 0 says `dataUserId` ban in `actions/**` — actual ESLint rule is **`services/**` only** (actions correctly use `dataUserId` from `requireTenantActor`).

### Phase U — File inventory (37 core pilot files)

All **37** paths checked on disk → **0 missing**. Full list in §9 of architect report + `docs/CTO_FIXES_APPLIED.md`.

**Git:** workspace has **no `.git`** — `git diff main...HEAD` not available; inventory from docs + existence checks.

### Critical paths (Phases M / V — static)

| Path | Status |
|------|--------|
| POS Checkout | ✅ |
| Storefront Checkout | ✅ (Stripe Checkout Session) |
| Webhook Ingest + cron drain | ✅ |
| Platform Impersonation | ✅ |
| DSR Export | ✅ |
| Cron webhook-jobs | ✅ |

### Phase X — Micro-scan

| Scan | Result |
|------|--------|
| TODO/FIXME/HACK in critical paths | **0** critical |
| `: any` in pos/orders/billing/webhooks/stripe-checkout | **0** |
| Hardcoded localhost in `app/api`, `services/pos` | **0** |
| Secrets (`sk_live` keys in app code) | **0** (only pattern matchers / `.env.example`) |

### Infrastructure (ops — unchecked in code pass)

- [ ] Staging `workspace:backfill:all` after DBA sign-off
- [ ] `RATE_LIMIT_ADAPTER=upstash`
- [ ] Vercel Cron — 10 production paths only
- [ ] `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot`
- [ ] `ENABLE_EXPERIMENTAL_CRONS` unset
- [ ] `npm run test:e2e:pilot` on staging
- [ ] Load test (~10 operators)

---

## Known risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Load testing not executed | Medium | Daily monitoring week 1 |
| `workspaceId` null until backfill | Low–Medium | `buildOwnerScopedWhere`; run backfill on staging |
| Memory rate limit without Upstash | Low (3–5 tenants) | Upstash before scale |
| Stripe webhook/Connect misconfig | Medium | Staging payment drill + E2E |
| DSR export no rate limit | Low | Superadmin + MFA; `PILOT_KNOWN_ISSUES.md` §6b |
| Hybrid tenancy (PR-C backlog) | Medium | Limit pilot surface; scoped hot paths |
| npm audit advisories (13) | Low | Track; not a pilot code gate |

---

## Recommendation

The **codebase** is ready for **staging today** and for **3–5 paid pilot operators** after ops dependencies and green staging QA (19–21 May 2026).

I **do not** authorize first paying customer **before 22 May 2026** without staging golden path, backfill (when required), and Vercel cron wiring.

---

## Signatures

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Platform Architect | **Signed (Release Commander)** | 18 May 2026 | ✅ |
| Ops Lead | __________ | | __________ |
| QA Lead | __________ | | __________ |
| CEO | __________ | | __________ |
