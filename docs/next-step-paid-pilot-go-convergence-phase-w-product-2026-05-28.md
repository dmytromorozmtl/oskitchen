# KitchenOS — Phase W: Era25 paid pilot GO convergence (post-honest breakthrough)

**Status:** Product surfaces + GO convergence integrity guard **IMPLEMENTED** · Human convergence attestation **REQUIRED**  
**Policy:** `era25-paid-pilot-go-convergence-v1` · Integrity `era47-paid-pilot-go-convergence-integrity-v1`  
**Playbook:** [`docs/next-era25-paid-pilot-go-convergence-2026-05-28.md`](./next-era25-paid-pilot-go-convergence-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-owner-daily-briefing-breakthrough-phase-v-product-2026-05-28.md`](./next-step-owner-daily-briefing-breakthrough-phase-v-product-2026-05-28.md) → honest `owner_daily_briefing_breakthrough_era25_ready`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-paid-pilot-go-convergence` | B3 GO/NO-GO · ICP · LOI · kickoff checklist |
| Launch Wizard | Today strip | GO convergence progress · integrity FAIL badge |
| Owner Briefing | priority **22** (meta) | Ranked action when convergence blocked |
| Owner Briefing | priority **1** (B3) | Existing NO-GO tile action via `paid-pilot-go-convergence-briefing-era25` |
| Platform ops | `#era25-paid-pilot-go-convergence` | Post-breakthrough orchestrator (nested under breakthrough) |
| Commercial blockers | Inline strip | `PaidPilotGoConvergenceEra25Strip` when breakthrough visible |

---

## Human sequence (canonical)

```bash
npm run ops:validate-owner-daily-briefing-breakthrough-integrity -- --json
npm run ops:validate-paid-pilot-go-convergence-integrity -- --json
npm run ops:run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25 -- --write
# After owner_daily_briefing_breakthrough_era25_ready + honest GO evaluator:
# PAID_PILOT_GO_CONVERGENCE_ERA25_ATTESTED=1
# After convergence report sync + human review:
# PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_REVIEWED=1
npm run ops:validate-paid-pilot-go-convergence-era25 -- --json
npm run ops:sync-paid-pilot-go-convergence-era25-report -- --write
npm run smoke:pilot-gono-go
npm run smoke:pilot-forbidden-claims-enforcement
npm run test:ci:paid-pilot-go-convergence-era25
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-paid-pilot-go-convergence-integrity -- --json
npm run ops:sync-paid-pilot-go-convergence-integrity-baseline -- --write
```

**Acceptance:** Breakthrough integrity PASS · `paid_pilot_go_convergence_era25_ready` · ICP qualified · LOI recorded · forbidden-claims PASS · kickoff checklist present · zero illegal era25 artifacts.

---

## Integrity chain (era47)

```
evaluatePaidPilotGoConvergenceIntegrity
  → evaluateOwnerDailyBriefingBreakthroughIntegrity (era46)
    → evaluateEra25FirstProductSliceBlueprintIntegrity (era45)
      → … → P0 GO
```

**Blocking violations when train started:** `convergence_started_without_breakthrough_ready`, `fake_convergence_attestation`, `fake_convergence_report_attestation`, upstream integrity fails, `baseline_regression`.

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-paid-pilot-go-convergence-integrity` | JSON integrity gate |
| `ops:sync-paid-pilot-go-convergence-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:paid-pilot-go-convergence-integrity-era47` | Unit + cert-live wiring |
| `test:ci:paid-pilot-go-convergence-era25` | Full era25 GO convergence slice suite |

Workflow: `.github/workflows/ops-paid-pilot-go-convergence-integrity-validate.yml`

---

## Next step — Phase X (era48)

**Pilot week 1 execution convergence era25 integrity** — chains `evaluatePaidPilotGoConvergenceIntegrity`, Launch Wizard `#launch-wizard-era25-pilot-week1-execution-convergence`, Owner Briefing priority **23**, maintenance nested under `#era25-paid-pilot-go-convergence`.

Prerequisite milestone: `paid_pilot_go_convergence_era25_ready` · env `PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_*` (to be added in phases file when Phase X starts).
