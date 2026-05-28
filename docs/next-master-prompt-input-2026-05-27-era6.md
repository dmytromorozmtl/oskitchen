# Next Master Prompt Input — KitchenOS Era 7

**Status:** **Superseded** by [`next-master-prompt-input-2026-05-27-era7.md`](./next-master-prompt-input-2026-05-27-era7.md) for recurring execution prompts.

**Date:** 2026-05-27  
**Purpose:** Canonical facts for the **next** master prompt after Evolution Era 6 completion  
**Era 6 scorecard:** `docs/era6-cycle-completion-scorecard-2026-05-27.md`  
**Strategic baseline:** `docs/full-strategic-reaudit-2026-05-27-era2.md` (inventory; refresh when scale shifts)

---

## 1. Era 6 Outcomes (Facts Only)

All five Era 6 P0 items from era5 prompt input **completed** (cycles 1–5). Policy IDs in `lib/governance/era6-scorecard-policy.ts`.

| Theme | Outcome |
|-------|---------|
| Rewards GTM | `era6-dual-ledger-gtm-lock-v1` — permanent dual ledger; unification `deferred_locked` |
| KDS | `era6-kds-realtime-smoke-v1` — 15s poll fallback unit-certified + Tier D checklist |
| DevOps | `era6-typecheck-slice-ci-v1` — job `typecheck-slices`; `quality` keeps `typecheck:full` |
| RBAC UX | `era6-production-calendar-form-deny-v1` — void form redirect + banner |
| Enterprise | `era6-enterprise-identity-roadmap-v1` — SSO/SCIM/SOC2 `roadmap_only` annual review |

**Overall score:** **90/100** (was 86 at Era 5 end).

**Era 4 / Era 5:** Complete. Do not re-run unless regression proven via `git log` + scorecard docs.

---

## 2. Era 7 Progress (Facts)

| Cycle | Outcome |
|-------|---------|
| **1** | **Commercial pilot runbook** — `era7-commercial-pilot-runbooks-v1`; `docs/commercial-pilot-runbook.md`; `test:ci:commercial-pilot-runbook:cert` |
| **2** | **Storefront Stripe E2E CI policy** — `era7-storefront-stripe-optional-v1`; `storefront-stripe-e2e-summary` artifact; `test:ci:storefront-money-path:cert` extended |
| **3** | **Repo hygiene** — `era7-tests-node-modules-hygiene-v1`; `test:ci:repo-hygiene:cert` |
| **4** | **Marketing claims governance** — `era7-marketing-claims-governance-v1`; `verify-claims` + governance cert |

## 3. What Remains Open (P0 for Era 7 consideration)

| ID | Item | Notes |
|----|------|-------|
| E7-1 | Storefront inventory hook | Only if `era5-pos-only-gtm-lock-v1` lifted by explicit era decision |
| E7-2 | SSO/SAML pilot implementation | Requires dedicated era — not roadmap_only |
| ~~E7-3~~ | ~~Commercial pilot runbooks~~ | **Done** — Cycle 1 (`KOS-E7-001`) |
| ~~E7-4~~ | ~~Stripe live-card storefront E2E~~ | **Done** — Cycle 2 (`KOS-E7-002`) |

---

## 4. What Remains Open (P1)

- ~~`tests/node_modules/` gitignore hygiene~~ — **Done** Cycle 3 (`KOS-E7-003`).
- Unified rewards product/schema era (if dual-ledger lock reversed).
- KDS Playwright Realtime E2E (staging-only; no rush-hour claim).
- Production-calendar `movePlanTaskAction` UI wiring if not yet exposed.

---

## 5. Era 7 Strategic Themes (Suggested)

Pick **one theme per cycle**; do not reopen Era 4–6 unless regression proven.

1. **Commercial readiness** — ~~pilot runbooks~~ + ~~Stripe E2E~~ + ~~claims governance~~ (Cycles 1–4 done); claims-registry `needs-evidence` cleanup.
2. **Operator depth** — storefront E2E, inventory hook (if unlocked), KDS UI polish.
3. **Enterprise delivery** — SSO architecture spike (R1) — only with explicit era budget.
4. **CI hygiene** — ~~gitignore nested test installs~~ (Cycle 3 done); workflow runtime, slice optimization.
5. **Surface reduction** — further route/archive review without removing production crons.

**Do not prioritize without explicit era decision:** new modules, AI expansion, hardware POS, DoorDash live, new marketplace integrations, experimental crons.

---

## 6. CI / Governance Facts

- Default quality job: `npm run test:ci:governance-bundles` (23 `:cert` gates incl. `marketing-claims-governance` + unit bundles).
- Scorecard cert: `npm run test:ci:scorecard:cert` (era4 + era5 + era6 policy tests; must stay last).
- Parallel typecheck: job `typecheck-slices` → `npm run typecheck:ci:slices` (6GB); canonical gate remains `quality` → `typecheck:full` (8GB).
- Security-db: `test:security` includes `test:ci:rbac-wave4` (production calendar form deny tests included).

---

## 7. Documentation Rules

- Update **canonical doc set** + `docs/canonical-doc-index.md` only.
- Maturity claims must match policy IDs and CI certs.
- Do not claim unified rewards, storefront depletion, SSO, SCIM, or SOC 2 Type II without policy change.

---

## 8. Re-audit Decision

**Full re-audit now?** **No** — Era 6 scorecard + this input sufficient until Era 7 selects a theme or repo scale changes materially.

---

## Scorecard (Evolution Era 6 end — 2026-05-27)

| Area | Era 5 end | Era 6 end | Δ |
|------|----------:|----------:|--:|
| Overall | 86 | **90** | +4 |
| Security | 78 | **81** | +3 |
| QA | 84 | **86** | +2 |
| DevOps | 88 | **91** | +3 |
| RBAC | 83 | **86** | +3 |
| Inventory | 72 | **72** | +0 |
| POS | 74 | **74** | +0 |
| Integrations | 58 | **58** | +0 |
| KDS | 64 | **67** | +3 |
| Enterprise readiness | 55 | **62** | +7 |
| Marketing/sales | 71 | **74** | +3 |
| Storefront | 80 | **80** | +0 |
