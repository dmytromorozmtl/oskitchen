# Next Master Prompt Input — OS Kitchen Era 16

**Date:** 2026-05-27  
**Purpose:** Canonical facts for the **next** master prompt after Evolution Era 15 completion  
**Era 15 scorecard:** `docs/era15-cycle-completion-scorecard-2026-05-27.md`  
**Strategic baseline:** `docs/full-strategic-reaudit-2026-05-27-era2.md` (inventory; refresh when scale shifts)

---

## 1. Era 15 Outcomes (Facts Only)

All five Era 15 ops / certification recert cycles from era14 handoff **completed** (cycles 1–5). Policy IDs in `lib/governance/era15-scorecard-policy.ts`.

| Theme | Outcome |
|-------|---------|
| KDS staging smoke | `era15-kds-staging-smoke-recert-v1`; bump/recall; no rush-hour claim |
| Enterprise procurement | `era15-enterprise-procurement-recert-v1`; buyer FAQ; SSO still `not_started` |
| Staging workflows | `era15-staging-workflows-first-run-recert-v1`; `JOB_OMITTED_SECRETS_MISSING` honesty |
| Typecheck slices | `era15-typecheck-slice-recert-v1`; four slices; `typecheck:full` canonical |
| Production calendar | `era15-production-calendar-operator-recert-v1`; manual pilot checklist |

**Overall score:** **100/100** sustained (Era 14 end 100; sub-areas +1 in QA, DevOps, KDS, Enterprise readiness).

**Era 4–14:** Complete. **Era 15:** Complete. **Do not re-run Era 4 Cycle 2 (POS browser E2E)** — certified `era4-tier2b-optional-v1` + `era5-pos-e2e-secrets-accept-v1`. Reopen only on proven regression via `git log` + scorecard docs.

---

## 2. What Remains Open (P0 for Era 16 consideration)

| ID | Item | Notes |
|----|------|-------|
| E8-1 | Storefront inventory hook | Only if `era5-pos-only-gtm-lock-v1` lifted by explicit era decision |
| E8-2 | SSO/SAML pilot implementation (R2+) | R1 spike + Era 13/15 recert done; production IdP requires dedicated era budget |

---

## 3. What Remains Open (P1)

- SSO/SAML R2 **implementation** — explicit era budget only (`not_started`).
- First green staging workflow runs on GitHub — ops (`era15-staging-workflows-first-run-recert-v1` certified wiring only).
- Production calendar pilot **manual** sign-off on staging — `docs/production-calendar-operator-checklist.md`.
- Live Woo/Shopify test shop smoke — `npm run smoke:woo-shopify` when credentials available.
- Unified cross-channel rewards — `deferred_locked` (Era 14 recertified honesty only).
- Full typecheck OOM profiling — if `quality` job fails in CI.

---

## 4. Era 16 Strategic Themes (Suggested)

Pick **one theme per cycle**; do not reopen Era 4–15 unless regression proven.

1. **SSO/SAML pilot (R2)** — implementation with explicit budget; no fake SOC2/SSO claims.
2. **Live channel golden path** — `npm run smoke:woo-shopify` + staging proof when credentials exist.
3. **Cross-channel rewards depth** — only if unification lock lifted by explicit era decision.
4. **RBAC wave 4 residuals** — only if audit finds uncovered sensitive mutations.
5. **Full strategic re-audit** — only if commercial scale or architecture shifts materially.

**Do not prioritize without explicit era decision:** new modules, AI expansion, hardware POS, DoorDash live, new marketplace integrations, experimental crons, **re-implementing POS browser E2E policy**, **re-running Era 15 recert cycles**.

---

## 5. CI / Governance Facts

- Default quality job: `npm run test:ci:governance-bundles` (four partitions; scorecard cert last in `partition-product-kds`).
- Scorecard cert: `npm run test:ci:scorecard:cert` (era4–era15 policy tests).
- Era 15 smoke scripts: `smoke:kds-staging`, `smoke:enterprise-procurement`, `smoke:staging-workflows`, `smoke:typecheck-slices`, `smoke:production-calendar`.
- POS money path: tier-2b always-on; browser optional — `pos-browser-e2e-summary` (**already certified — do not redo**).

---

## 6. Documentation Rules

- Update **canonical doc set** + `docs/canonical-doc-index.md` only.
- Maturity claims must match policy IDs and CI certs.
- Paid pilots: `docs/commercial-pilot-runbook.md` + feature maturity matrix.

---

## 7. Re-audit Decision

**Full re-audit now?** **No** — Era 15 scorecard + this input sufficient until Era 16 selects a delivery theme or repo scale changes materially.

---

## Scorecard (Evolution Era 15 end — 2026-05-27)

| Area | Era 14 end | Era 15 end | Δ |
|------|----------:|-----------:|--:|
| Overall | 100 | **100** | +0 |
| Security | 82 | **82** | +0 |
| QA | 93 | **94** | +1 |
| DevOps | 99 | **100** | +1 |
| RBAC | 90 | **90** | +0 |
| Inventory | 72 | **72** | +0 |
| POS | 74 | **74** | +0 |
| Integrations | 60 | **60** | +0 |
| KDS | 73 | **74** | +1 |
| Enterprise readiness | 66 | **67** | +1 |
| Marketing/sales | 83 | **83** | +0 |
| Storefront | 83 | **83** | +0 |
