# Next Master Prompt Input — KitchenOS Era 6

**Date:** 2026-05-27  
**Purpose:** Canonical facts for the **next** master prompt after Evolution Era 5 completion  
**Era 5 scorecard:** `docs/era5-cycle-completion-scorecard-2026-05-27.md`  
**Strategic baseline:** `docs/full-strategic-reaudit-2026-05-27-era2.md` (inventory; refresh when scale shifts)

---

## 1. Era 5 Outcomes (Facts Only)

All five Era 5 P0 items from era4 prompt input **completed** (cycles 1–5). Policy IDs in `lib/governance/era5-scorecard-policy.ts`.

| Theme | Outcome |
|-------|---------|
| Security CI | `test:ci:rbac-wave4` chained at end of `test:security` |
| DevOps | `era5-typecheck-slice-v2` — `typecheck:slice:storefront-marketing` |
| Inventory GTM | `era5-pos-only-gtm-lock-v1` — storefront hook `deferred_locked` |
| Copilot UX | `era5-copilot-form-deny-v1` — redirect + client error on deny |
| POS CI | `era5-pos-e2e-secrets-accept-v1` — explicit fork skip with artifact |

**Overall score:** **86/100** (was 82 at Era 4 end).

**Era 4:** All 11 execution-map priorities remain complete (see `docs/era4-cycle-completion-scorecard-2026-05-27.md`). Do not re-run Era 4 cycles unless regression proven.

---

## 2. What Remains Open (P0 for Era 6 consideration)

| ID | Item | Notes |
|----|------|-------|
| E6-1 | ~~Unified rewards ledger~~ | **Closed Era 6 Cycle 1** — `era6-dual-ledger-gtm-lock-v1` (permanent dual ledger; unification deferred_locked) |
| E6-2 | ~~KDS realtime smoke~~ | **Closed Era 6 Cycle 2** — `era6-kds-realtime-smoke-v1` (poll fallback 15s unit-certified + Tier D checklist; no rush-hour/Playwright) |
| E6-3 | ~~Typecheck slices in CI~~ | **Closed Era 6 Cycle 3** — `era6-typecheck-slice-ci-v1`; job `typecheck-slices` + `typecheck:ci:slices`; `quality` keeps `typecheck:full` |
| E6-4 | Storefront inventory hook | Only if GTM lock lifted by explicit era decision |
| E6-5 | ~~SSO/SOC2/SCIM delivery~~ | **Closed Era 6 Cycle 5** — `era6-enterprise-identity-roadmap-v1` (roadmap_only; annual review in procurement pack) |

---

## 3. What Remains Open (P1)

- Stripe live-card storefront E2E tier.
- `tests/node_modules/` gitignore hygiene.
- ~~Production-calendar void-form deny UX~~ — **Closed Era 6 Cycle 4** (`era6-production-calendar-form-deny-v1`).
- Commercial pilot runbooks tied to maturity matrix.

---

## 4. Era 6 Strategic Themes (Suggested — Not Started)

Pick **one theme per cycle**; do not reopen Era 4/5 unless regression proven.

1. **Customer value depth** — rewards decision, storefront depletion (if unlocked), KDS realtime.
2. **Enterprise delivery** — SSO/SCIM honest milestones.
3. **CI scale** — typecheck parallel job, slice 3+ only if memory story requires.
4. **Commercial readiness** — sales claim validator expansion, pilot runbooks.
5. **Surface reduction** — further experimental route/archive review.

**Do not prioritize without explicit era decision:** new modules, AI expansion, hardware POS, DoorDash live, new marketplace integrations, experimental crons.

---

## 5. CI / Governance Facts

- Default quality job: `npm run test:ci:governance-bundles` (18 `:cert` gates + unit bundles).
- Scorecard cert: `npm run test:ci:scorecard:cert` (era4 + era5 policy tests; must stay last in governance bundles).
- Security-db: `test:security` includes `test:ci:rbac-wave4` at end.
- Money paths: `storefront-money-path`, `pos-money-path` (includes `pos-e2e-secrets-policy-cert-live`).
- Typecheck: `typecheck:full` CI canonical; local slices `services-core`, `dashboard-services-api`, `storefront-marketing`.

---

## 6. Documentation Rules

- Update **canonical doc set** + `docs/canonical-doc-index.md` only.
- Maturity claims must match policy IDs and CI certs.
- Do not claim unified cross-channel rewards or storefront stock depletion without policy change.

---

## 7. Re-audit Decision

**Full re-audit now?** **No** — Era 5 scorecard + this input sufficient until Era 6 selects a theme or repo scale changes materially.

---

## Scorecard (Evolution Era 5 end — 2026-05-27)

| Area | Era 4 end | Era 5 end | Δ |
|------|----------:|----------:|--:|
| Overall | 82 | **86** | +4 |
| Security | 74 | **78** | +4 |
| QA | 82 | **84** | +2 |
| DevOps | 85 | **88** | +3 |
| RBAC | 80 | **83** | +3 |
| Inventory | 68 | **72** | +4 |
| POS | 70 | **74** | +4 |
| Integrations | 58 | **58** | +0 |
| KDS | 64 | **64** | +0 |
| Enterprise readiness | 55 | **55** | +0 |
| Marketing/sales | 70 | **71** | +1 |
| Storefront | 79 | **80** | +1 |
