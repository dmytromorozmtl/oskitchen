# OS Kitchen — Phase AE: Era25 commercial pilot convergence train closure integrity (post-pure ops terminus)

**Status:** Product surfaces + train closure rollup integrity guard **IMPLEMENTED** · Human train closure attestation **REQUIRED**  
**Policy:** `era25-commercial-pilot-convergence-train-closure-phases-v1` · Integrity `era55-era25-commercial-pilot-convergence-train-closure-integrity-v1`  
**Prerequisite:** [`docs/next-step-pure-operational-mode-terminus-convergence-phase-ad-product-2026-05-28.md`](./next-step-pure-operational-mode-terminus-convergence-phase-ad-product-2026-05-28.md) → honest `pure_operational_mode_era25_active`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-commercial-pilot-convergence-train-closure` | Rollup of era47–era54 convergence integrity baselines · runbook cert command |
| Launch Wizard | Today strip | Train closure progress · integrity FAIL badge |
| Owner Briefing | priority **30** (meta) | Ranked action when train closure blocked |
| Platform ops | `#era25-commercial-pilot-convergence-train-closure` | Nested under pure ops terminus panel |
| Maintenance | Nested under pure ops | Baseline honest count · validate/sync/runbook cert commands |

---

## Human sequence (canonical)

```bash
npm run ops:validate-pure-operational-mode-terminus-convergence-integrity -- --json
# Sync era47–era54 convergence integrity baselines after each phase validate PASS:
npm run ops:sync-paid-pilot-go-convergence-integrity-baseline -- --write
npm run ops:sync-pilot-week1-execution-convergence-integrity-baseline -- --write
npm run ops:sync-month2-market-readiness-convergence-integrity-baseline -- --write
npm run ops:sync-scale-readiness-convergence-integrity-baseline -- --write
npm run ops:sync-series-a-partner-expansion-convergence-integrity-baseline -- --write
npm run ops:sync-market-leader-positioning-convergence-integrity-baseline -- --write
npm run ops:sync-sustained-operational-excellence-convergence-integrity-baseline -- --write
npm run ops:sync-pure-operational-mode-terminus-convergence-integrity-baseline -- --write
npm run ops:validate-era25-commercial-pilot-convergence-train-closure-integrity -- --json
# After pure ops active + 8/8 baselines honest GO:
# ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ATTESTED=1
# ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_REPORT_REVIEWED=1
npm run ops:sync-era25-commercial-pilot-convergence-train-closure-integrity-baseline -- --write
npm run test:ci:era25-commercial-pilot-convergence-train-closure-integrity-era55
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** Pure ops terminus integrity PASS · eight era47–era54 convergence baselines on disk and honest · train closure integrity PASS · commercial-pilot-runbook cert green · era25 convergence surfaces remain suppressed in pure operational mode.

---

## Integrity chain (era55)

```
evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity
  → evaluatePureOperationalModeTerminusConvergenceIntegrity (era54)
    → evaluateSustainedOperationalExcellenceConvergenceIntegrity (era53)
      → … → P0 GO
  → readConvergenceIntegrityBaseline (era47–era54 registry)
```

**Blocking violations when train started:** `convergence_train_closure_without_pure_ops_active`, `missing_convergence_integrity_baseline`, `convergence_integrity_baseline_not_honest`, `fake_convergence_train_closure_*`, upstream era47–54 fails, `baseline_regression`.

**Tracked env keys:** `ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ATTESTED`, `ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_REPORT_REVIEWED`

**Baseline artifact:** `artifacts/era25-commercial-pilot-convergence-train-closure-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-commercial-pilot-convergence-train-closure-integrity` | JSON rollup gate |
| `ops:sync-era25-commercial-pilot-convergence-train-closure-integrity-baseline` | Record honest train closure after acceptance |
| `test:ci:era25-commercial-pilot-convergence-train-closure-integrity-era55` | Unit + cert-live wiring |
| `test:ci:era25-commercial-pilot-convergence-train-closure-integrity-era55:cert` | Cert-live only (chained in runbook cert) |
| `test:ci:pure-operational-mode-terminus-era25` | Full pure ops + train closure slice suite |

Workflow: `.github/workflows/ops-era25-commercial-pilot-convergence-train-closure-integrity-validate.yml`

---

## Following — Phase AF (era56)

**IMPLEMENTED** — see [`docs/next-step-sustained-product-evolution-re-entrant-phase-af-product-2026-05-28.md`](./next-step-sustained-product-evolution-re-entrant-phase-af-product-2026-05-28.md).

**Next:** Phase AG — era25 post-re-entrant operator charter lock integrity (era57), sketched in the AF doc.
