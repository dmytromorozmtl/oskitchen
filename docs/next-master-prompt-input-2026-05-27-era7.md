# Next Master Prompt Input — KitchenOS Era 8

**Date:** 2026-05-27  
**Purpose:** Canonical facts for the **next** master prompt after Evolution Era 7 completion  
**Era 7 scorecard:** `docs/era7-cycle-completion-scorecard-2026-05-27.md`  
**Strategic baseline:** `docs/full-strategic-reaudit-2026-05-27-era2.md` (inventory; refresh when scale shifts)

---

## 1. Era 7 Outcomes (Facts Only)

All four Era 7 commercial-readiness cycles from era6 prompt input **completed** (cycles 1–4). Policy IDs in `lib/governance/era7-scorecard-policy.ts`.

| Theme | Outcome |
|-------|---------|
| Commercial pilot | `era7-commercial-pilot-runbooks-v1` — Tier 0–3 GO/NO-GO runbook |
| Storefront Stripe E2E | `era7-storefront-stripe-optional-v1` + `era7-storefront-stripe-secrets-accept-v1` |
| Repo hygiene | `era7-tests-node-modules-hygiene-v1` — no tracked `tests/node_modules/` |
| Marketing claims | `era7-marketing-claims-governance-v1` — `verify-claims` + governance cert |

**Overall score:** **92/100** (was 90 at Era 6 end).

**Era 4 / Era 5 / Era 6:** Complete. Do not re-run unless regression proven via `git log` + scorecard docs.

---

## 2. Era 8 Progress (Facts)

| Cycle | Outcome |
|-------|---------|
| **1** | **Claims registry cleanup** — `era8-claims-registry-v1`; zero `needs-evidence` rows; `test:ci:claims-registry:cert` |
| **2** | **KDS Realtime E2E staging scope** — `era8-kds-realtime-e2e-staging-v1`; Tier E; not in default CI |

## 3. What Remains Open (P0 for Era 8 consideration)

| ID | Item | Notes |
|----|------|-------|
| E7-1 / E8-1 | Storefront inventory hook | Only if `era5-pos-only-gtm-lock-v1` lifted by explicit era decision |
| E7-2 / E8-2 | SSO/SAML pilot implementation | Requires dedicated era — not roadmap_only delivery |

---

## 4. What Remains Open (P1)

- ~~`config/marketing/claims-registry.json` — resolve `needs-evidence` rows~~ — **Done** Cycle 1 (`era8-claims-registry-v1`).
- ~~KDS Playwright Realtime E2E (staging-only)~~ — **Scoped** Cycle 2 (`era8-kds-realtime-e2e-staging-v1`); Playwright spec not implemented yet.
- Production-calendar `movePlanTaskAction` UI wiring if not yet exposed.
- Unified rewards product/schema era (if dual-ledger lock reversed).

---

## 5. Era 8 Strategic Themes (Suggested)

Pick **one theme per cycle**; do not reopen Era 4–7 unless regression proven.

1. **Enterprise delivery** — SSO architecture spike (R1) only with explicit era budget.
2. **Operator depth** — KDS UI polish, inventory hook if unlocked.
3. **CI / DevOps** — workflow runtime, slice optimization, optional strict `MARKETING_CLAIMS_STRICT=1` in release preflight.
4. **Surface reduction** — further route/archive review without removing production crons.

**Do not prioritize without explicit era decision:** new modules, AI expansion, hardware POS, DoorDash live, new marketplace integrations, experimental crons.

---

## 6. CI / Governance Facts

- Default quality job: `npm run test:ci:governance-bundles` (25 `:cert` gates incl. `kds-realtime-e2e-staging` + unit bundles).
- Scorecard cert: `npm run test:ci:scorecard:cert` (era4 + era5 + era6 + era7 policy tests; must stay last).
- Commercial pilot: `test:ci:commercial-pilot-runbook:cert`; Tier 1 includes `verify-claims`.
- Storefront money path: pay-later always-on; Stripe browser optional — `storefront-stripe-e2e-summary` artifact.
- POS money path: tier-2b always-on; browser optional — `pos-browser-e2e-summary` artifact.

---

## 7. Documentation Rules

- Update **canonical doc set** + `docs/canonical-doc-index.md` only.
- Maturity claims must match policy IDs and CI certs.
- Paid pilots: `docs/commercial-pilot-runbook.md` + feature maturity matrix.

---

## 8. Re-audit Decision

**Full re-audit now?** **No** — Era 7 scorecard + this input sufficient until Era 8 selects a theme or repo scale changes materially.

---

## Scorecard (Evolution Era 7 end — 2026-05-27)

| Area | Era 6 end | Era 7 end | Δ |
|------|----------:|----------:|--:|
| Overall | 90 | **92** | +2 |
| Security | 81 | **81** | +0 |
| QA | 86 | **87** | +1 |
| DevOps | 91 | **92** | +1 |
| RBAC | 86 | **86** | +0 |
| Inventory | 72 | **72** | +0 |
| POS | 74 | **74** | +0 |
| Integrations | 58 | **58** | +0 |
| KDS | 67 | **67** | +0 |
| Enterprise readiness | 62 | **62** | +0 |
| Marketing/sales | 74 | **79** | +5 |
| Storefront | 80 | **83** | +3 |
