# KitchenOS — Phase Y: Era25 month 2 market readiness convergence (post-honest week 1)

**Status:** Product surfaces + month 2 convergence integrity guard **IMPLEMENTED** · Human month 2 attestation **REQUIRED**  
**Policy:** `era25-month2-market-readiness-convergence-v1` · Integrity `era49-month2-market-readiness-convergence-integrity-v1`  
**Playbook:** [`docs/next-era25-month2-market-readiness-convergence-2026-05-28.md`](./next-era25-month2-market-readiness-convergence-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-pilot-week1-execution-convergence-phase-x-product-2026-05-28.md`](./next-step-pilot-week1-execution-convergence-phase-x-product-2026-05-28.md) → honest `pilot_week1_execution_convergence_era25_ready`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-month2-market-readiness-convergence` | Workstreams A–E progress · ICP landings link |
| Launch Wizard | Today strip | Month 2 progress · integrity FAIL badge |
| Owner Briefing | priority **24** (meta) | Ranked action when month 2 blocked |
| Owner Briefing | priority **3** (day action) | Existing workstream action via `month2-market-readiness-convergence-briefing-era25` |
| Platform ops | `#era25-month2-market-readiness-convergence` | Post-week1 orchestrator (nested under week 1 panel) |
| Commercial blockers | Inline strip | `Month2MarketReadinessConvergenceEra25Strip` when week 1 convergence visible |

---

## Human sequence (canonical)

```bash
npm run ops:validate-pilot-week1-execution-convergence-integrity -- --json
npm run ops:validate-month2-market-readiness-convergence-integrity -- --json
npm run ops:run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25 -- --write
# After pilot_week1_execution_convergence_era25_ready + workstreams A–E MONTH2_* env:
# MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ATTESTED=1
# After month 2 report sync + human review:
# MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_REVIEWED=1
npm run ops:validate-month2-market-readiness-convergence-era25 -- --json
npm run ops:validate-month2-market-readiness-env -- --json
npm run ops:sync-month2-market-readiness-convergence-era25-report -- --write
npm run test:ci:month2-market-readiness-convergence-era25
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-month2-market-readiness-convergence-integrity -- --json
npm run ops:sync-month2-market-readiness-convergence-integrity-baseline -- --write
```

**Acceptance:** Week 1 convergence integrity PASS · `month2_market_readiness_convergence_era25_ready` · all blocking workstreams complete · metrics baseline PASSED · zero illegal era25 artifacts.

---

## Integrity chain (era49)

```
evaluateMonth2MarketReadinessConvergenceIntegrity
  → evaluatePilotWeek1ExecutionConvergenceIntegrity (era48)
    → evaluatePaidPilotGoConvergenceIntegrity (era47)
      → … → P0 GO
```

**Blocking violations when train started:** `month2_started_without_week1_convergence_ready`, `fake_month2_convergence_attestation`, `fake_month2_convergence_report_attestation`, upstream integrity fails, `baseline_regression`.

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-month2-market-readiness-convergence-integrity` | JSON integrity gate |
| `ops:sync-month2-market-readiness-convergence-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:month2-market-readiness-convergence-integrity-era49` | Unit + cert-live wiring |
| `test:ci:month2-market-readiness-convergence-era25` | Full era25 month 2 convergence slice suite |

Workflow: `.github/workflows/ops-month2-market-readiness-convergence-integrity-validate.yml`

---

## Following — Phase Z (era50)

**Done:** [`docs/next-step-scale-readiness-convergence-phase-z-product-2026-05-28.md`](./next-step-scale-readiness-convergence-phase-z-product-2026-05-28.md)

**Next:** Phase AA Series A partner expansion convergence integrity (era51) on `#era25-series-a-partner-expansion-convergence`.
