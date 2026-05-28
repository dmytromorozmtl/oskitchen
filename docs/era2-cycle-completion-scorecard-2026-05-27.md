# Evolution Era 2 — Cycle Completion Scorecard

**Date:** 2026-05-27  
**Evidence branch:** `main` @ `919a127` (Cycle 99 — audit sensitive detail RBAC in security CI)  
**Method:** Read-only repo inspection; Era 2 ledger in `docs/canonical-doc-index.md` cross-checked against live code and CI

---

## Executive Summary

Evolution Era 2 (cycles 1–30) and the opening Era 3 governance band (cycles 42–52) **delivered all 15 planned Era 2 execution-map items** at least to **Partially completed**; **13/15 are Completed**, **2/15 Partially completed** (inventory depletion storefront path deferred by design; RBAC wave continued into Era 3 as wave 3). No item **Regressed** or remains **Not started**. The largest residual risk is **cross-channel inventory parity** (POS depletion certified; storefront submit has no depletion hook) and **optional E2E secrets** (POS browser E2E gated on `E2E_LOGIN_*`).

**Era 2 overall score (end):** 71/100 → **Era 3 governance increment:** 73/100 → **Post wave-3 RBAC (cycles 53–99, this audit):** **76/100**

---

## Git / Worktree Status (audit snapshot)

| Field | Value |
|-------|-------|
| Branch | `main` |
| HEAD | `919a127ff74817025b7794f3ad22ad04fba4c820` |
| Uncommitted | `lib/api/openapi-manifest.json`, `package-lock.json` (minor) |
| Untracked | `tests/node_modules/` — **hygiene risk; do not commit** |
| Working tree safe for audit? | **Yes** — no destructive or half-applied migrations |
| Recent themes (last 30 commits) | Era 3 RBAC wave 3: audit center, global search, platform email bypass CI, support tickets, partner ops, order creation, kitchen AI, label print, webhook replay, settings/onboarding/locations/brands/products/menus/inventory/costing/purchasing wave |
| Unfinished cycle? | **No** — Cycle 99 committed; only doc/manifest drift uncommitted |

---

## Era 2 Execution Map — Item Status

| Era 2 Item | Status | Evidence | Tests | Remaining Gap | Next Action | Priority |
|------------|--------|----------|-------|---------------|-------------|----------|
| 1. Storefront publish API RBAC | **Completed** | `app/api/storefront/theme/publish/route.ts`, `app/api/storefront/builder/publish/route.ts` use `requireStorefrontPublishActor` + `requireTenantActor` | `tests/unit/storefront-publish-api-routes.test.ts` | None on publish API | Keep in `test:security` on change | P2 |
| 2. Remove hardcoded email bypasses | **Completed** (runtime) | `lib/platform-owner.ts` bootstrap-only; `tests/unit/platform-email-bypass-closure.test.ts`; 30+ platform-bypass tests | `test:ci:platform-email-bypass:cert`, `test:security` | Bootstrap email constant still in repo (seed only) | Document bootstrap vs runtime in onboarding | P2 |
| 3. RBAC wave 2 | **Completed** | POS, storefront admin, billing, import center, kitchen daily, growth, settings-center, monetization, notification-rules, commissary | `test:pos-rbac`, domain RBAC suites | — | — | — |
| 4. Public POST fail-closed hardening | **Completed** | `lib/api/public-post-guard.ts`; IoT/NPS/ROI routes | `test:ci:public-post-fail-closed`, `tests/unit/roi-lead-route-fail-closed.test.ts` | Rate-limit tuning in prod | Monitor abuse metrics | P2 |
| 5. Storefront money-path E2E in CI | **Completed** | `.github/workflows/ci.yml` → `storefront-money-path` job | `test:ci:storefront-money-path:cert`, pay-later E2E | Stripe live-card E2E optional | Add staging Stripe E2E tier | P1 |
| 6. POS money-path E2E in CI | **Partially completed** | `pos-money-path` job; unit + integration + inventory always | `test:ci:pos-money-path:cert` | Browser E2E **only if** `E2E_LOGIN_EMAIL` secrets set | Wire CI secrets or document required fork | P1 |
| 7. Inventory depletion proof | **Partially completed** | POS: `tests/integration/pos-inventory-depletion.integration.test.ts`, `test:ci:inventory-depletion:cert` | Certified in CI | **Storefront submit has no depletion hook** (explicit deferral in cert test) | Design storefront depletion or keep “POS-only” in matrix | P1 |
| 8. Cron surface hygiene | **Completed** | 16 production crons in `vercel.json`; 137 route files gated via `runCronRoute` | `validate:production-crons`, `test:ci:cron-hygiene:cert` | 121+ experimental routes remain in tree | Archive/move to `_experimental` folder | P1 |
| 9. KDS v1 scope | **Completed** | `docs/kds-v1-scope.md` | `test:ci:kds-v1:cert` | Rush-hour / multi-station out of scope | Hide over-claims in marketing | P2 |
| 10. KDS v1 prototype | **Completed** | `components/kitchen/kds-daily-service.tsx`, bump/recall actions | `test:ci:kds-v1:integration`, `test:ci:kds-v1:prototype:cert` | Realtime E2E smoke manual only | Staging KDS smoke in tier-3 | P2 |
| 11. Nav/maturity governance | **Completed** | `lib/navigation/nav-maturity-governance.ts` | `test:ci:nav-governance:cert` | Some legacy pages bypass nav rules | Page-level maturity sweep | P2 |
| 12. Integration honesty | **Completed** | `lib/integrations/integration-honesty.ts` | `test:ci:integration-honesty:cert` | Placeholder pages still routable | Redirect or stronger preview shell | P2 |
| 13. Public API contract coverage | **Completed** | 8 routes under `app/api/public/v1/` | `test:ci:public-api-v1:cert`, resource contract tests | Enterprise gate docs | OpenAPI publish automation | P2 |
| 14. Doc canon | **Completed** | `docs/canonical-doc-index.md`, `_DEPRECATED_AUDIT_FAMILY.md` | `test:ci:doc-canon:cert` | 1,440 markdown files remain | No bulk edits; banner high-traffic stale audits | P2 |
| 15. Scorecard refresh | **Completed** | Era 2 end + Era 3 increment in canonical index | `test:ci:scorecard:cert` | Full re-audit was deferred — **this document supersedes deferral** | Adopt this scorecard + era2 reaudit | P0 |

---

## Era 3 Wave 3 Extension (cycles 53–99) — Beyond Era 2 Plan

| Band | Outcome | Evidence |
|------|---------|------------|
| 53–56 | Financial/accounting RBAC | `actions/accounting/ap.ts`, `bank-reconciliation.ts`, `packing-verification`, `forecast` |
| 57–62 | Kitchen/products/inventory RBAC | `kitchen-task`, `food-safety`, `products`, `menus`, `inventory`, categories |
| 63–79 | Nutrition, locations, brands, onboarding, implementation | Wave 3 tests in `test:ci:rbac-wave3` |
| 80–99 | Audit center, global search, support, partner, order creation CI bundles | Cycles 88–99 commits; `test:security` expanded |

**Assessment:** Era 2’s “~85 tenant-only actions” P0 is **largely closed**. Residual unguarded or weakly guarded surfaces: `actions/delivery-route.ts`, `actions/copilot.ts`, `actions/feedback.ts`, demo/beta helpers, some experiment crons — see full re-audit §5.2.

---

## Scorecard Delta (Era 2 plan → today)

| Area | Era 2 start | Era 2 end | Era 3 cert (C52) | **This audit** | Δ vs E2 end |
|------|------------:|----------:|-----------------:|---------------:|------------:|
| Overall | 64 | 71 | 73 | **76** | +5 |
| RBAC | 52 | 58 | 58 | **76** | +18 |
| Security | 58 | 66 | 67 | **72** | +6 |
| QA | 65 | 71 | 75 | **78** | +7 |
| DevOps | 70 | 75 | 78 | **80** | +5 |
| POS | 55 | 60 | 60 | **64** | +4 |
| KDS | 48 | 54 | 54 | **58** | +4 |
| Storefront | 72 | 76 | 76 | **78** | +2 |
| Inventory | 58 | 58 | 58 | **62** | +4 |
| Integrations | 45 | 50 | 51 | **52** | +2 |
| Enterprise readiness | 40 | 43 | 43 | **46** | +3 |
| Investor DD | 50 | — | — | **58** | +8 |

---

## Top Risks Still Open After Era 2

1. **Storefront inventory depletion** — certified gap; matrix must not claim unified depletion.
2. **POS E2E optional in CI** — green pipeline without browser POS proof when secrets absent.
3. **137 cron route files** — production-safe but repo noise and deploy confusion risk.
4. **Typecheck OOM** — 8GB heap; full strict `tsc` still heavy at 699 pages / 362 models.
5. **Doc sprawl** — 1,440 files; canon index helps but sales can still cite stale audits.
6. **Enterprise gaps** — no SSO/SCIM, no SOC2, placeholder marketplaces still have dashboard routes.

---

## Validation Commands

```bash
npm run validate:production-crons
npm run validate:cron-inventory
npm run test:ci:governance-bundles
npm run test:ci:rbac-wave3
npm run test:security
```

---

## Re-audit Decision

**Full strategic re-audit required now?** **Yes** — Era 2 deferral (Q3 2026) is superseded by 47 additional RBAC cycles and shifted risk profile. Canonical audit: `docs/full-strategic-reaudit-2026-05-27-era2.md`.
