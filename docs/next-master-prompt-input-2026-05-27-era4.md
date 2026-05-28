# Next Master Prompt Input — KitchenOS Era 5

**Status:** **Superseded** by [`next-master-prompt-input-2026-05-27-era5.md`](./next-master-prompt-input-2026-05-27-era5.md) for recurring execution prompts.

**Date:** 2026-05-27  
**Purpose:** Canonical facts for the **next** master prompt after Evolution Era 4 completion  
**Era 4 scorecard:** `docs/era4-cycle-completion-scorecard-2026-05-27.md`  
**Strategic baseline:** `docs/full-strategic-reaudit-2026-05-27-era2.md` (inventory; refresh when scale shifts)

---

## 1. Era 4 Outcomes (Facts Only)

All 11 Era 4 execution-map priorities **completed** (cycles 1–12). Policy IDs and CI certs are listed in `lib/governance/era4-scorecard-policy.ts`.

| Theme | Outcome |
|-------|---------|
| Inventory truth | POS-only depletion certified (`era4-pos-only-v1`); storefront not depleting |
| POS CI honesty | Browser E2E optional with explicit PASSED/SKIPPED/FAILED artifact |
| RBAC | Wave 4 batches 1–2; domain mutation registry |
| Cron | 121 experimental routes archived; 16 production |
| Integrations | Woo/Shopify golden path to externalOrder staging (not full live ops) |
| DevOps | Typecheck slice 1; governance bundle expanded |
| Enterprise | Procurement pack without false SOC2/SSO claims |
| Rewards | Dual ledger honesty (POS kitchen vs storefront) |
| KDS | Staging smoke path (not rush-hour certified) |
| UX honesty | In-page preview/placeholder banners on dashboard |

**Overall score:** **82/100** (was 73 at Era 3 increment).

---

## 2. What Remains Open (P0 for Era 5 consideration)

| ID | Item | Notes |
|----|------|-------|
| E5-1 | ~~Storefront inventory depletion~~ | **Closed Era 5 Cycle 3** — permanent POS-only GTM lock (`era5-pos-only-gtm-lock-v1`); hook deferred until explicit era |
| E5-2 | ~~`test:ci:rbac-wave4` in `test:security`~~ | **Closed Era 5 Cycle 1** — chained at end of `test:security` |
| E5-3 | ~~Typecheck slice 2+~~ | **Closed Era 5 Cycle 2** — `typecheck:slice:storefront-marketing`; optional CI parallel job remains |
| E5-4 | ~~Copilot void-form deny UX~~ | **Closed Era 5 Cycle 4** — `era5-copilot-form-deny-v1` redirect + client error for refresh |
| E5-5 | ~~POS E2E secrets in CI~~ | **Closed Era 5 Cycle 5** — `era5-pos-e2e-secrets-accept-v1`; explicit SKIPPED artifact for forks without secrets |

---

## 3. What Remains Open (P1)

- Unified rewards ledger (product decision required).
- KDS realtime Playwright smoke.
- Stripe live-card storefront E2E tier.
- SSO/SOC2/SCIM implementation (roadmap exists in procurement pack).
- Table service / floor plan — remain preview; no sell.
- `tests/node_modules/` hygiene (gitignore).

---

## 4. Era 5 Strategic Themes (Suggested — Not Started)

Pick **one theme per cycle**; do not reopen Era 4 unless regression proven.

1. **Operational depth** — storefront depletion, rewards unification decision, KDS realtime smoke.
2. **Enterprise delivery** — SSO/SCIM phases with honest milestones (no certification theater).
3. **CI/security consolidation** — rbac-wave4 in security-db, typecheck slices in CI.
4. **Commercial readiness** — pilot runbooks, sales claim validator tied to matrix + policies.
5. **Surface reduction** — further archive or gate experimental dashboard routes.

**Do not prioritize without explicit era decision:** new modules, AI expansion, hardware POS, DoorDash live, new marketplace integrations, experimental crons.

---

## 5. CI / Governance Facts

- Default quality job: `npm run test:ci:governance-bundles` (18 `:cert` gates + unit bundles).
- Scorecard cert: `npm run test:ci:scorecard:cert` (must stay last in governance bundles).
- Money paths: `storefront-money-path`, `pos-money-path` jobs.
- KDS: `kds-v1-prototype` job + `test:ci:kds-staging-smoke`.
- RBAC wave 4: `test:ci:rbac-wave4` at end of `test:security` (security-db); not in governance bundles.

---

## 6. Documentation Rules

- Update **canonical 14-doc set** + this index only (`docs/canonical-doc-index.md`).
- Do not bulk-edit 1,400 historical audits.
- Maturity claims must match policy IDs and CI certs.

---

## 7. Re-audit Decision

**Full re-audit now?** **No** — Era 4 scorecard + this input sufficient until Era 5 selects a new theme or repo scale changes materially (e.g. major new module, acquisition integration).

---

## Scorecard (Evolution Era 4 end — 2026-05-27)

| Area | Era 3 end | Era 4 end | Δ |
|------|----------:|----------:|--:|
| Overall | 73 | **82** | +9 |
| Security | 67 | **74** | +7 |
| QA | 75 | **82** | +7 |
| DevOps | 78 | **85** | +7 |
| RBAC | 76 | **80** | +4 |
| Inventory | 62 | **68** | +6 |
| Integrations | 51 | **58** | +7 |
| POS | 64 | **70** | +6 |
| KDS | 58 | **64** | +6 |
| Enterprise readiness | 46 | **55** | +9 |
| Marketing/sales | 63 | **70** | +7 |
| Storefront | 78 | **79** | +1 |
