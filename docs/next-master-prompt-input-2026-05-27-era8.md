# Next Master Prompt Input — KitchenOS Era 9

**Status:** **Superseded** for recurring execution by [`next-master-prompt-input-2026-05-27-era9.md`](./next-master-prompt-input-2026-05-27-era9.md) (Era 10 handoff).

**Date:** 2026-05-27  
**Purpose:** Canonical facts for the **next** master prompt after Evolution Era 8 completion  
**Era 8 scorecard:** `docs/era8-cycle-completion-scorecard-2026-05-27.md`  
**Strategic baseline:** `docs/full-strategic-reaudit-2026-05-27-era2.md` (inventory; refresh when scale shifts)

---

## 1. Era 8 Outcomes (Facts Only)

All four Era 8 operator-depth / GTM hygiene cycles from era7 prompt input **completed** (cycles 1–4). Policy IDs in `lib/governance/era8-scorecard-policy.ts`.

| Theme | Outcome |
|-------|---------|
| Claims registry | `era8-claims-registry-v1` — zero `needs-evidence` rows; `test:ci:claims-registry:cert` |
| KDS Realtime E2E scope | `era8-kds-realtime-e2e-staging-v1` — Tier E; not in default CI; no Playwright spec yet |
| Pilot preflight strict claims | `era8-pilot-preflight-claims-strict-v1` — `MARKETING_CLAIMS_STRICT=1` in `pilot-preflight.sh` |
| Production calendar move UI | `era8-production-calendar-move-ui-v1` — week-column ←/→ via `movePlanTaskAction` |

**Overall score:** **94/100** (was 92 at Era 7 end).

**Era 4–7:** Complete. **Do not re-run Era 4 Cycle 2 (POS browser E2E)** — certified `era4-tier2b-optional-v1` + `era5-pos-e2e-secrets-accept-v1`. Reopen only on proven regression via `git log` + scorecard docs.

---

## 2. Era 9 Progress (Facts)

| Cycle | Outcome |
|-------|---------|
| **1** | **SSO architecture spike (R1)** — `era9-enterprise-sso-architecture-spike-v1`; design doc only; delivery `not_implemented` |
| **2** | **Governance bundles partition** — `era9-governance-bundles-partition-v1`; parallel CI job; `quality` keeps full bundle |
| **3** | **Cron surface recert** — `era9-cron-surface-recert-v1`; extends Era 4 archive; `test:ci:cron-hygiene:cert` |
| **4** | **RBAC wave 4 recert** — `era9-rbac-wave4-recert-v1`; 11 guarded surfaces; `test:ci:rbac-wave4:cert` |

---

## 3. What Remains Open (P0 for Era 9 consideration)

| ID | Item | Notes |
|----|------|-------|
| E8-1 | Storefront inventory hook | Only if `era5-pos-only-gtm-lock-v1` lifted by explicit era decision |
| E8-2 | SSO/SAML pilot implementation (R2+) | R1 spike **done** (`era9-enterprise-sso-architecture-spike-v1`); production IdP requires dedicated era budget |

---

## 4. What Remains Open (P1)

- KDS Playwright Realtime spec (`e2e/kds-realtime-*.spec.ts`) — staging-only; explicit era decision.
- Unified rewards product/schema era (if dual-ledger lock reversed).
- Production calendar cross-week reschedule / status workflow UI.
- ~~CI workflow runtime optimization (governance bundle split)~~ — **Done** Cycle 2 (`era9-governance-bundles-partition-v1`); typecheck parallel job unchanged (`era6-typecheck-slice-ci-v1`).

---

## 4. Era 9 Strategic Themes (Suggested)

Pick **one theme per cycle**; do not reopen Era 4–8 unless regression proven.

1. **Enterprise delivery** — SSO architecture spike (R1) with explicit era budget; no fake SOC2/SSO claims.
2. **Operator depth** — KDS UI polish; inventory hook only if lock lifted.
3. **CI / DevOps** — workflow runtime, optional governance bundle partitioning.
4. **Surface reduction** — cron/route review without removing production crons.

**Do not prioritize without explicit era decision:** new modules, AI expansion, hardware POS, DoorDash live, new marketplace integrations, experimental crons, **re-implementing POS browser E2E policy**.

---

## 6. CI / Governance Facts

- Default quality job: `npm run test:ci:governance-bundles` (28 `:cert` gates incl. `enterprise-sso-spike` + unit bundles; scorecard cert last).
- Scorecard cert: `npm run test:ci:scorecard:cert` (era4–era8 policy tests).
- Commercial pilot: `test:ci:commercial-pilot-runbook:cert`; preflight runs strict `verify-claims`.
- Storefront money path: pay-later always-on; Stripe browser optional — `storefront-stripe-e2e-summary`.
- POS money path: tier-2b always-on; browser optional — `pos-browser-e2e-summary` (**already certified — do not redo**).

---

## 7. Documentation Rules

- Update **canonical doc set** + `docs/canonical-doc-index.md` only.
- Maturity claims must match policy IDs and CI certs.
- Paid pilots: `docs/commercial-pilot-runbook.md` + feature maturity matrix.

---

## 8. Re-audit Decision

**Full re-audit now?** **No** — Era 8 scorecard + this input sufficient until Era 9 selects a theme or repo scale changes materially.

---

## Scorecard (Evolution Era 8 end — 2026-05-27)

| Area | Era 7 end | Era 8 end | Δ |
|------|----------:|----------:|--:|
| Overall | 92 | **94** | +2 |
| Security | 81 | **81** | +0 |
| QA | 87 | **88** | +1 |
| DevOps | 92 | **93** | +1 |
| RBAC | 86 | **87** | +1 |
| Inventory | 72 | **72** | +0 |
| POS | 74 | **74** | +0 |
| Integrations | 58 | **58** | +0 |
| KDS | 67 | **68** | +1 |
| Enterprise readiness | 62 | **62** | +0 |
| Marketing/sales | 79 | **81** | +2 |
| Storefront | 83 | **83** | +0 |
