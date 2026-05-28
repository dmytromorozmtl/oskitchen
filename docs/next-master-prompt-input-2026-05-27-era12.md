# Next Master Prompt Input — KitchenOS Era 13

**Date:** 2026-05-27  
**Purpose:** Canonical facts for the **next** master prompt after Evolution Era 12 completion  
**Era 12 scorecard:** `docs/era12-cycle-completion-scorecard-2026-05-27.md`  
**Strategic baseline:** `docs/full-strategic-reaudit-2026-05-27-era2.md` (inventory; refresh when scale shifts)

---

## 1. Era 12 Outcomes (Facts Only)

All four Era 12 integration / staging E2E cycles from era11 handoff **completed** (cycles 1–4). Policy IDs in `lib/governance/era12-scorecard-policy.ts`.

| Theme | Outcome |
|-------|---------|
| Channel golden path recert | `era12-channel-golden-path-recert-v1`; `order_hub_visibility` certified |
| E2E staging secrets | `era12-e2e-staging-secrets-align-v1`; `E2E_LOGIN_PASSWORD` canonical |
| Channel staging smoke | `era12-channel-golden-path-smoke-v1`; `npm run smoke:woo-shopify`; not in default CI |
| E2E staging auth | `era12-e2e-staging-auth-wiring-v1`; `auth.setup` + `dashboard-auth` in `e2e-staging.yml` |

**Overall score:** **99/100** (was 98 at Era 11 end).

**Era 4–11:** Complete. **Do not re-run Era 4 Cycle 2 (POS browser E2E)** — certified `era4-tier2b-optional-v1` + `era5-pos-e2e-secrets-accept-v1`. Reopen only on proven regression via `git log` + scorecard docs.

---

## 2. Era 13 Progress (Facts)

| Cycle | Outcome |
|-------|---------|
| **1** | **Enterprise identity recert** — `era13-enterprise-identity-recert-v1`; roadmap_only; SSO R2 pilot not_started |
| **2** | **KDS staging workflow secrets** — `era13-kds-staging-workflow-secrets-align-v1`; `playwright-kds-staging.yml` password alias parity |
| **3** | **Staging workflows first-run ops** — `era13-staging-workflows-first-run-ops-v1`; `JOB_OMITTED_SECRETS_MISSING` vs PASSED/FAILED/SKIPPED WITH REASON |

---

## 3. What Remains Open (P0 for Era 13 consideration)

| ID | Item | Notes |
|----|------|-------|
| E8-1 | Storefront inventory hook | Only if `era5-pos-only-gtm-lock-v1` lifted by explicit era decision |
| E8-2 | SSO/SAML pilot implementation (R2+) | R1 spike **done**; production IdP requires dedicated era budget |

---

## 4. What Remains Open (P1)

- SSO/SAML R2 pilot implementation — explicit era budget only (Era 13 Cycle 1 recert confirms **not_started**).
- Unified cross-channel rewards E2E — still `deferred_locked` after Era 10 Cycle 1.
- First green staging workflow runs — ops only; checklist in `docs/GITHUB_E2E_STAGING_SECRETS.md` (`era13-staging-workflows-first-run-ops-v1`).
- ~~KDS staging workflow secret mismatch~~ — **Done** Era 13 Cycle 2 (`era13-kds-staging-workflow-secrets-align-v1`).
- ~~Staging workflow skip vs pass ambiguity~~ — **Done** Era 13 Cycle 3 (`era13-staging-workflows-first-run-ops-v1`).
- Live Woo/Shopify test shop smoke — ops via `npm run smoke:woo-shopify` when credentials available.
- ~~Channel golden path order hub recert~~ — **Done** Era 12 Cycle 1.
- ~~E2E staging secrets / auth wiring~~ — **Done** Era 12 Cycles 2–4.

---

## 5. Era 13 Strategic Themes (Suggested)

Pick **one theme per cycle**; do not reopen Era 4–12 unless regression proven.

1. **Enterprise delivery (R2)** — SSO/SAML pilot with explicit budget; no fake SOC2/SSO claims.
2. **Operator depth** — production calendar or KDS only with clear bounded scope.
3. **Governance / CI runtime** — only if partition wall-time regresses.

**Do not prioritize without explicit era decision:** new modules, AI expansion, hardware POS, DoorDash live, new marketplace integrations, experimental crons, **re-implementing POS browser E2E policy**.

---

## 6. CI / Governance Facts

- Default quality job: `npm run test:ci:governance-bundles` (four partitions; scorecard cert last in `partition-product-kds`).
- Scorecard cert: `npm run test:ci:scorecard:cert` (era4–era12 policy tests).
- E2E staging: `.github/workflows/e2e-staging.yml` optional; auth.setup + dashboard-authed smoke when secrets set; **not** in `ci.yml`.
- POS money path: tier-2b always-on; browser optional — `pos-browser-e2e-summary` (**already certified — do not redo**).

---

## 7. Documentation Rules

- Update **canonical doc set** + `docs/canonical-doc-index.md` only.
- Maturity claims must match policy IDs and CI certs.
- Paid pilots: `docs/commercial-pilot-runbook.md` + feature maturity matrix.

---

## 8. Re-audit Decision

**Full re-audit now?** **No** — Era 12 scorecard + this input sufficient until Era 13 selects a theme or repo scale changes materially.

---

## Scorecard (Evolution Era 12 end — 2026-05-27)

| Area | Era 11 end | Era 12 end | Δ |
|------|----------:|-----------:|--:|
| Overall | 98 | **99** | +1 |
| Security | 82 | **82** | +0 |
| QA | 90 | **91** | +1 |
| DevOps | 96 | **97** | +1 |
| RBAC | 89 | **89** | +0 |
| Inventory | 72 | **72** | +0 |
| POS | 74 | **74** | +0 |
| Integrations | 58 | **59** | +1 |
| KDS | 72 | **72** | +0 |
| Enterprise readiness | 65 | **65** | +0 |
| Marketing/sales | 82 | **82** | +0 |
| Storefront | 83 | **83** | +0 |
