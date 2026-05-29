# KitchenOS — Phase AG: Era25 post-re-entrant operator charter lock integrity (era57)

**Status:** Product surfaces + charter lock integrity guard **IMPLEMENTED** · Human charter lock attestation **REQUIRED**  
**Policy:** `era57-era25-post-re-entrant-charter-lock-phases-v1` · Integrity `era57-era25-post-re-entrant-charter-lock-integrity-v1`  
**Prerequisite:** [`docs/next-step-sustained-product-evolution-re-entrant-phase-af-product-2026-05-28.md`](./next-step-sustained-product-evolution-re-entrant-phase-af-product-2026-05-28.md) → honest sustained product evolution re-entrant

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-post-re-entrant-charter-lock` | Freeze era25 linear/charter env after honest re-entrant |
| Launch Wizard | Today strip | Charter lock progress · frozen env mutation badge |
| Owner Briefing | priority **32** (meta) | Ranked action when charter lock blocked |
| Platform ops | `#era25-post-re-entrant-charter-lock` | Nested under re-entrant panel |
| Maintenance | Nested under re-entrant | Frozen env / integrity badges + validate + governance cert |

---

## Human sequence (canonical)

```bash
npm run ops:validate-sustained-product-evolution-re-entrant-integrity -- --json
npm run ops:sync-sustained-product-evolution-re-entrant-integrity-baseline -- --write
npm run ops:validate-era25-post-re-entrant-charter-lock-integrity -- --json
# Clear all ERA25_FROZEN_AFTER_CHARTER_LOCK_ENV_KEYS from operator env before attest:
# ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_ATTESTED=1
# ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_REPORT_REVIEWED=1
npm run ops:sync-era25-post-re-entrant-charter-lock-integrity-baseline -- --write
npm run test:ci:era25-post-re-entrant-charter-lock-integrity-era57
npm run test:ci:governance-bundles
```

**Acceptance:** Re-entrant integrity PASS · zero mutable era25 linear convergence env keys on lock path · charter lock integrity PASS · governance-bundles cert green · era25 convergence Launch Wizard / briefing strips remain suppressed via `shouldSuppressEra25ProductConvergenceSurfaces`.

---

## Integrity chain (era57)

```
evaluateEra25PostReentrantCharterLockIntegrity
  → evaluateSustainedProductEvolutionReentrantIntegrity (era56)
  → evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity (era55)
  → detectEra25FrozenEnvMutationAfterCharterLock (frozen env registry)
```

**Blocking violations when lock started:** `charter_lock_without_reentrant_honest`, `era25_linear_env_mutation_after_lock`, `fake_charter_lock_*`, upstream era56/era55/GO fails, `baseline_regression`.

**Tracked env keys:** `ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_ATTESTED`, `ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_REPORT_REVIEWED`

**Baseline artifact:** `artifacts/era25-post-re-entrant-charter-lock-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-post-re-entrant-charter-lock-integrity` | JSON charter lock gate |
| `ops:sync-era25-post-re-entrant-charter-lock-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:era25-post-re-entrant-charter-lock-integrity-era57` | Unit + cert-live wiring |
| `test:ci:era25-post-re-entrant-charter-lock-integrity-era57:cert` | Cert-live only (chained in governance-bundles partition-platform) |

Workflow: `.github/workflows/ops-era25-post-re-entrant-charter-lock-integrity-validate.yml`

---

## Next step — Phase AH (era58)

**Era25 steady-state operator loop convergence lock** — lock improvement-loop rhythms and operator cadence after charter lock baseline; dual cert via governance-bundles + commercial-pilot-runbook.

| Item | Value |
|------|-------|
| Prerequisite milestone | Honest `era25-post-re-entrant-charter-lock` baseline + governance-bundles cert green |
| Parent evaluator | era57 charter lock integrity |
| Platform anchor | `#era25-steady-state-operator-loop-lock` (planned) |
| Briefing meta priority | **33** (planned) |
| Env keys (planned) | `ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_ATTESTED`, `..._REPORT_REVIEWED` |
| Baseline artifact | `artifacts/era25-steady-state-operator-loop-lock-integrity-baseline.json` (planned) |
| Violation IDs (planned) | `steady_state_lock_without_charter_lock`, `improvement_loop_rhythm_mutation_after_lock`, `fake_steady_state_lock_attestation`, upstream era57 fail |
| CI | `test:ci:era25-steady-state-operator-loop-lock-integrity-era58` + extend runbook cert |

**Human acceptance (preview):** charter lock PASS → attest steady-state loop lock → validate JSON → sustain improvement loop only with frozen era25 charter env.
