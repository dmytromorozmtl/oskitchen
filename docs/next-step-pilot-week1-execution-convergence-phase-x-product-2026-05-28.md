# KitchenOS — Phase X: Era25 pilot week 1 execution convergence (post-honest GO convergence)

**Status:** Product surfaces + week 1 convergence integrity guard **IMPLEMENTED** · Human week 1 attestation **REQUIRED**  
**Policy:** `era25-pilot-week1-execution-convergence-v1` · Integrity `era48-pilot-week1-execution-convergence-integrity-v1`  
**Playbook:** [`docs/next-era25-pilot-week1-execution-convergence-2026-05-28.md`](./next-era25-pilot-week1-execution-convergence-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-paid-pilot-go-convergence-phase-w-product-2026-05-28.md`](./next-step-paid-pilot-go-convergence-phase-w-product-2026-05-28.md) → honest `paid_pilot_go_convergence_era25_ready`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-pilot-week1-execution-convergence` | Days 1–5 progress · integration health link |
| Launch Wizard | Today strip | Week 1 progress · integrity FAIL badge |
| Owner Briefing | priority **23** (meta) | Ranked action when week 1 blocked |
| Owner Briefing | priority **2** (day action) | Existing day-level action via `pilot-week1-execution-convergence-briefing-era25` |
| Platform ops | `#era25-pilot-week1-execution-convergence` | Post-GO orchestrator (nested under paid pilot GO panel) |
| Commercial blockers | Inline strip | `PilotWeek1ExecutionConvergenceEra25Strip` when GO convergence visible |

---

## Human sequence (canonical)

```bash
npm run ops:validate-paid-pilot-go-convergence-integrity -- --json
npm run ops:validate-pilot-week1-execution-convergence-integrity -- --json
npm run ops:run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25 -- --write
# After paid_pilot_go_convergence_era25_ready + Days 1–5 PILOT_WEEK1_* env:
# PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ATTESTED=1
# After week 1 report sync + human review:
# PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_REVIEWED=1
npm run ops:validate-pilot-week1-execution-convergence-era25 -- --json
npm run ops:validate-pilot-week1-env -- --json
npm run ops:sync-pilot-week1-execution-convergence-era25-report -- --write
npm run test:ci:pilot-week1-execution-convergence-era25
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-pilot-week1-execution-convergence-integrity -- --json
npm run ops:sync-pilot-week1-execution-convergence-integrity-baseline -- --write
```

**Acceptance:** GO convergence integrity PASS · `pilot_week1_execution_convergence_era25_ready` · all 5 day phases complete · metrics baseline on Day 5 · zero illegal era25 artifacts.

---

## Integrity chain (era48)

```
evaluatePilotWeek1ExecutionConvergenceIntegrity
  → evaluatePaidPilotGoConvergenceIntegrity (era47)
    → evaluateOwnerDailyBriefingBreakthroughIntegrity (era46)
      → … → P0 GO
```

**Blocking violations when train started:** `week1_started_without_go_convergence_ready`, `fake_week1_convergence_attestation`, `fake_week1_convergence_report_attestation`, upstream integrity fails, `baseline_regression`.

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-pilot-week1-execution-convergence-integrity` | JSON integrity gate |
| `ops:sync-pilot-week1-execution-convergence-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:pilot-week1-execution-convergence-integrity-era48` | Unit + cert-live wiring |
| `test:ci:pilot-week1-execution-convergence-era25` | Full era25 week 1 convergence slice suite |

Workflow: `.github/workflows/ops-pilot-week1-execution-convergence-integrity-validate.yml`

---

## Next step — Phase Y (era49)

**Month 2 market readiness convergence era25 integrity** — chains `evaluatePilotWeek1ExecutionConvergenceIntegrity`, Launch Wizard `#launch-wizard-era25-month2-market-readiness-convergence`, Owner Briefing priority **24**, maintenance nested under `#era25-pilot-week1-execution-convergence` → `#era25-month2-market-readiness-convergence`.

Prerequisite milestone: `pilot_week1_execution_convergence_era25_ready` · env `MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_*` (to be added when Phase Y starts).
