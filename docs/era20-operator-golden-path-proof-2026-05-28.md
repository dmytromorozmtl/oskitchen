# Era 20 operator golden path proof (2026-05-28)

**Policy:** `era20-operator-golden-path-proof-v1` (`lib/commercial/era20-operator-golden-path-proof-era20-policy.ts`)

**Extends:** `era17-pilot-operator-golden-path-v1`, `era20-first-paid-pilot-package-v1`, `era19-launch-wizard-v1`

**Status:** `workflow_map_ready_awaiting_tier2_execution` — does **not** claim Tier 2 `proof_passed` or pilot GO.

---

## Tier 2 execution gate

Tier 2 remains **SKIPPED** in `smoke:pilot-gono-go` until an operator executes the Era 17 checklist on staging and records outcomes in `artifacts/pilot-operator-golden-path-summary.json`.

| Env var | Purpose |
| --- | --- |
| `PILOT_GOLDEN_PATH_STAGING_URL` | Staging base URL |
| `PILOT_GOLDEN_PATH_OPERATOR_EMAIL` | Operator account |
| `PILOT_GOLDEN_PATH_COMMIT_SHA` | Build under test |
| `PILOT_GOLDEN_PATH_DURATION_MINUTES` | Expected duration (45–60) |

**Orchestrator:** `npm run smoke:pilot-operator-golden-path`

**Honest rule:** Do not set phase env vars to `PASSED` without executing the workflow on staging.

---

## Workflow proof matrix

| Workflow ID | Actor | Primary UI | E2E state | Blocker | Next action |
| --- | --- | --- | --- | --- | --- |
| `owner_briefing_to_action` | Owner | `/dashboard/today` | staging_manual | No outcome telemetry | Tier 2 phase 1 — click top briefing action |
| `launch_wizard_to_go_live` | Owner | `/dashboard/launch-wizard` | staging_manual | P0 + customer gates | Complete wizard steps 1–7 |
| `storefront_to_packing` | Owner, kitchen, packer | Order hub → KDS → packing | real_ci | Live channel ingest needs P0 PASS | Tier 2 phases 2–3, 6 |
| `pos_to_inventory` | Cashier, manager | POS terminal + shifts | real_ci | Hardware/offline out of scope | Tier 2 phase 5 |
| `manager_discount_audit` | Manager | POS terminal override | staging_manual | No Toast PIN parity claim | Spot-check discount + override |
| `shift_closeout` | Cashier, manager | POS shifts | staging_manual | None (software path) | Tier 2 phase 5 closeout |
| `integration_health_recovery` | Owner, support | Integration Health | pilot_manual | P0 channel/SSO SKIPPED | Recovery checklist + P0 smokes |
| `support_impersonation_audit` | Support admin | Platform support | pilot_manual | Support boundaries doc | Week 2 tabletop |

Canonical rows: `lib/commercial/era20-operator-golden-path-proof-era20.ts` (`ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS`).

---

## Launch Wizard step crosswalk

| Wizard step | Tier 2 phase | Primary workflow |
| --- | --- | --- |
| `business-profile` | onboarding | `owner_briefing_to_action` |
| `menu-catalog` | onboarding | `owner_briefing_to_action` |
| `storefront` | storefront | `storefront_to_packing` |
| `pos` | pos | `pos_to_inventory`, `shift_closeout` |
| `kds-production` | kds | `storefront_to_packing` |
| `integrations` | integrations | `integration_health_recovery` |
| `go-live-proof` | orders | `launch_wizard_to_go_live` |
| `pilot-readiness` | onboarding | `owner_briefing_to_action` |

UI: Launch Wizard shows **Operator golden path** panel (`launch-wizard-golden-path-panel`) mapping each step to Tier 2 phase labels.

---

## Owner Daily Briefing crosswalk

| Briefing tile family | Workflow | Deep link pattern |
| --- | --- | --- |
| Fulfillment / orders | `storefront_to_packing` | Order hub, KDS, packing |
| POS / shifts | `pos_to_inventory`, `shift_closeout` | POS terminal, shifts |
| Integrations | `integration_health_recovery` | Integration Health |
| Launch / pilot | `launch_wizard_to_go_live` | Launch Wizard, go-live |

Briefing must not show fake green for integrations — SKIPPED states propagate from commercial ops model.

---

## Staging sign-off env vars

P0 proof (11 vars) blocks live channel and SSO smokes referenced by workflows `storefront_to_packing` and `integration_health_recovery`. See `docs/era18-p0-staging-proof-ops-checklist.md`.

After P0 PASS:

1. `npm run smoke:p0-staging-proof-unblock`
2. `npm run smoke:pilot-operator-golden-path` (with manual phase env vars)
3. `npm run smoke:pilot-gono-go`

---

## CI certification

```bash
npm run test:ci:era20-operator-golden-path-proof
npm run test:ci:era20-operator-golden-path-proof:cert
```

Chained in `test:ci:commercial-pilot-runbook:cert`.
