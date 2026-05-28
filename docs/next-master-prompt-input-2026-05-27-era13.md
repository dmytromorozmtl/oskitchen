# Next Master Prompt Input — KitchenOS Era 14

**Date:** 2026-05-27  
**Purpose:** Canonical facts for the **next** master prompt after Evolution Era 13 completion  
**Era 13 scorecard:** `docs/era13-cycle-completion-scorecard-2026-05-27.md`  
**Strategic baseline:** `docs/full-strategic-reaudit-2026-05-27-era2.md` (inventory; refresh when scale shifts)

---

## 1. Era 13 Outcomes (Facts Only)

All four Era 13 enterprise / operator-depth cycles from era12 handoff **completed** (cycles 1–4). Policy IDs in `lib/governance/era13-scorecard-policy.ts`.

| Theme | Outcome |
|-------|---------|
| Enterprise identity recert | `era13-enterprise-identity-recert-v1`; roadmap_only; SSO R2 `not_started` |
| KDS staging workflow secrets | `era13-kds-staging-workflow-secrets-align-v1`; `E2E_LOGIN_PASSWORD` parity |
| Staging workflows first-run ops | `era13-staging-workflows-first-run-ops-v1`; `JOB_OMITTED_SECRETS_MISSING` vs explicit outcomes |
| Production calendar operator depth | `era13-production-calendar-operator-depth-v1`; checklist + `smoke:production-calendar` |

**Overall score:** **100/100** (was 99 at Era 12 end).

**Era 4–12:** Complete. **Do not re-run Era 4 Cycle 2 (POS browser E2E)** — certified `era4-tier2b-optional-v1` + `era5-pos-e2e-secrets-accept-v1`. Reopen only on proven regression via `git log` + scorecard docs.

---

## 2. What Remains Open (P0 for Era 14 consideration)

| ID | Item | Notes |
|----|------|-------|
| E8-1 | Storefront inventory hook | Only if `era5-pos-only-gtm-lock-v1` lifted by explicit era decision |
| E8-2 | SSO/SAML pilot implementation (R2+) | R1 spike + Era 13 recert done; production IdP requires dedicated era budget |

---

## 3. What Remains Open (P1)

- SSO/SAML R2 **implementation** — explicit era budget only (Era 13 Cycle 1 recert confirms **not_started**).
- ~~Unified cross-channel rewards E2E~~ — **Scoped** Era 14 Cycle 2 (`era14-cross-channel-rewards-recert-v1`); unification remains `deferred_locked`; no unified Playwright in CI.
- First green staging workflow runs — ops only (`era13-staging-workflows-first-run-ops-v1`).
- Production calendar pilot manual sign-off — `docs/production-calendar-operator-checklist.md`.
- Live Woo/Shopify test shop smoke — ops via `npm run smoke:woo-shopify` when credentials available.
- ~~Nav / page maturity sweep~~ — **Done** Era 14 Cycle 1 (`era14-nav-page-maturity-recert-v1`); re-run when new preview routes enter focused nav.

---

## 4. Era 14 Strategic Themes (Suggested)

Pick **one theme per cycle**; do not reopen Era 4–13 unless regression proven.

1. **SSO/SAML pilot (R2)** — implementation with explicit budget; no fake SOC2/SSO claims.
2. **Nav / page maturity sweep** — bounded governance pass on dashboard leaf pages.
3. **Permission helper consolidation** — documentation + safe small consolidations only.
4. **Cross-channel rewards honesty** — test or document `deferred_locked` gap.

**Do not prioritize without explicit era decision:** new modules, AI expansion, hardware POS, DoorDash live, new marketplace integrations, experimental crons, **re-implementing POS browser E2E policy**.

---

## 5. CI / Governance Facts

- Default quality job: `npm run test:ci:governance-bundles` (four partitions; scorecard cert last in `partition-product-kds`).
- Scorecard cert: `npm run test:ci:scorecard:cert` (era4–era13 policy tests).
- E2E staging: `.github/workflows/e2e-staging.yml` optional; see `docs/GITHUB_E2E_STAGING_SECRETS.md`.
- POS money path: tier-2b always-on; browser optional — `pos-browser-e2e-summary` (**already certified — do not redo**).
- Production calendar: `npm run smoke:production-calendar` + operator checklist (not browser CI).

---

## 6. Documentation Rules

- Update **canonical doc set** + `docs/canonical-doc-index.md` only.
- Maturity claims must match policy IDs and CI certs.
- Paid pilots: `docs/commercial-pilot-runbook.md` + feature maturity matrix.

---

## 7. Re-audit Decision

**Full re-audit now?** **No** — Era 13 scorecard + this input sufficient until Era 14 selects a theme or repo scale changes materially.

---

## Scorecard (Evolution Era 13 end — 2026-05-27)

| Area | Era 12 end | Era 13 end | Δ |
|------|----------:|-----------:|--:|
| Overall | 99 | **100** | +1 |
| Security | 82 | **82** | +0 |
| QA | 91 | **92** | +1 |
| DevOps | 97 | **98** | +1 |
| RBAC | 89 | **89** | +0 |
| Inventory | 72 | **72** | +0 |
| POS | 74 | **74** | +0 |
| Integrations | 59 | **59** | +0 |
| KDS | 72 | **73** | +1 |
| Enterprise readiness | 65 | **66** | +1 |
| Marketing/sales | 82 | **82** | +0 |
| Storefront | 83 | **83** | +0 |
