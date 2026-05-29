# KitchenOS — Шаг 9: Sustained operational excellence (после Market leader complete)

**Policy:** `era21-sustained-operational-excellence-v1` · **Backlog:** `KOS-E21-009`  
**Предусловие:** Market leader positioning pillars 1–4 complete  
**Цель:** Recurring ops cadence — final era21 gate before pure operational mode

---

## Decision tree

```
Market leader complete (era21 market leader panels hidden)
        │
        ├── Cadence A: Daily operational excellence (Today + Order Hub + calendar)
        ├── Cadence B: Weekly integration health + webhook review
        ├── Cadence C: Monthly pilot metrics rolling baseline refresh
        └── Cadence D: Quarterly forbidden-claims + maturity matrix audit
                │
                ▼
         Pure operational mode (no era21 gate panels — Step 10 doc only)
```

---

## Engineering wiring (era21)

| Surface | When visible |
|---------|--------------|
| `/dashboard/today` | Top action priority **8** + compact sustained ops panel |
| `/dashboard/launch-wizard` | Cadences in commercial blockers |
| Platform → Pilot ops | `#sustained-operational-excellence` phases panel |

**Gate chain (mutually exclusive):** P0 (0) → … → Market leader (7) → **Sustained ops (8)**.

After Step 9 complete → **pure operational mode** (only `operationalEmptyState` + shift tiles).

---

## Preflight

```bash
npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator -- --write   # planned — Step 9 orchestrator
npm run ops:validate-market-leader-positioning-env -- --json   # marketLeaderComplete: true
npm run ops:validate-sustained-operational-excellence-env -- --json
npm run ops:export-sustained-operational-excellence-env-template -- --write
npm run ops:sync-sustained-operational-excellence-progress-report -- --write
npm run ops:export-sustained-operational-excellence-readiness-checklist -- --write   # planned
npm run smoke:pilot-metrics-baseline
npm run smoke:pilot-forbidden-claims-enforcement
npm run test:ci:commercial-pilot-runbook:cert
```

**Planned post-Market-leader orchestrator milestones (`sustainedOpsMilestone`):**

| Milestone | Cadence | Exit code (orchestrator `--json`) |
|-----------|---------|-----------------------------------|
| `market_leader_blocked` | Market leader pillars 1–4 incomplete | `2` |
| `cadence_a_daily_ops` | Today + Order Hub + daily attestation | `0` |
| `cadence_b_weekly_integration` | integration health + webhook smokes | `0` |
| `cadence_c_monthly_metrics` | rolling metrics baseline refresh | `0` |
| `cadence_d_quarterly_audit` | forbidden-claims + maturity matrix | `0` |
| `sustained_ops_complete` | Cadences A–D done | `0` |

**Smoke readiness flags (planned in validate env JSON):**

- `readyForIntegrationSmokes`: cadence B incomplete + channel credentials present but weekly review not attested
- `readyForMetricsSmokes`: cadence C incomplete + prior baseline captured but monthly refresh missing

**Wiring surfaces when sustained ops incomplete:** briefing priority **8**, Launch Wizard commercial blockers, Platform `#sustained-operational-excellence`. Redirect to Market leader orchestrator when `market_leader_blocked`.

---

## Cadence A — Daily operational excellence

| Surface | Focus |
|---------|-------|
| `/dashboard/today` | Order Hub, production calendar, risk radar |
| `/dashboard/order-hub` | Active orders + handoffs |
| `/dashboard/production-calendar` | Service window prep |

```bash
export SCALE_PER_CUSTOMER_GO_ISOLATION=1
export SUSTAINED_OPS_DAILY_CADENCE_ATTESTED=1
```

Maintains GO validity + per-customer isolation from Scale Gate 1.

---

## Cadence B — Weekly integration health

```bash
npm run smoke:woo-shopify-live
npm run smoke:commerce-webhook-drill
export SUSTAINED_OPS_WEEKLY_INTEGRATION_REVIEWED=1
```

Routes: `/dashboard/integration-health`, `/platform/commercial-pilot-ops`

Re-run smokes after any channel credential rotation — never upgrade SKIPPED to PASS manually.

---

## Cadence C — Monthly metrics rolling baseline

```bash
npm run smoke:pilot-metrics-baseline
export SUSTAINED_OPS_MONTHLY_METRICS_REFRESHED=1
```

Update env snapshot per customer — separate baselines per Scale Gate 1 isolation policy.

---

## Cadence D — Quarterly governance audit

```bash
npm run smoke:pilot-forbidden-claims-enforcement
npm run smoke:competitor-feature-gap-matrix
export SUSTAINED_OPS_QUARTERLY_GOVERNANCE_AUDITED=1
```

Review: `docs/feature-maturity-matrix.md`, `docs/sales-forbidden-claims-training-era20.md`

---

## Ops commands

```bash
npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator -- --write   # planned
npm run ops:validate-sustained-operational-excellence-env -- --json
npm run ops:export-sustained-operational-excellence-env-template -- --write
npm run ops:sync-sustained-operational-excellence-progress-report -- --write
npm run ops:export-sustained-operational-excellence-readiness-checklist -- --write   # planned
npm run test:ci:sustained-operational-excellence-era21
npm run test:ci:sustained-operational-excellence-era21:cert
```

GitHub workflow: `.github/workflows/ops-sustained-operational-excellence-validate.yml` (+ planned orchestrator step)

**Readiness checklist artifact (planned):** `docs/sustained-operational-excellence-readiness-checklist.md`

---

## Deliverables checklist

- [ ] Daily ops cadence attested with GO still valid
- [ ] Weekly integration health review scheduled
- [ ] Monthly metrics baseline refresh per active customer
- [ ] Quarterly forbidden-claims audit on calendar
- [ ] Per-customer GO artifacts remain isolated
- [ ] No hand-edited PASS in `artifacts/*.json`
- [ ] `artifacts/sustained-operational-excellence-progress-report.md` synced
- [ ] `docs/sustained-operational-excellence-readiness-checklist.md` exported via orchestrator

---

## Step 10 preview — Continuous improvement loop (informational only)

See [`next-step-10-continuous-improvement-loop-2026-05-28.md`](./next-step-10-continuous-improvement-loop-2026-05-28.md)

**Engineering slice (Step 10 — era22, not era21 gate):**

| Component | Artifact |
|-----------|----------|
| Policy | `era22-continuous-improvement-loop-v1` |
| UI panel | `#continuous-improvement-loop` on Today + Platform ops |
| Briefing | **No new priority** — informational loop after Step 9 complete |
| Env keys | None — uses existing metrics + forbidden-claims smokes as inputs |

**Human gate before Step 10:** `sustainedOpsComplete: true` via Step 9 orchestrator.

**Immediate action if Market leader incomplete:** [`next-step-8-market-leader-positioning-2026-05-28.md`](./next-step-8-market-leader-positioning-2026-05-28.md)
