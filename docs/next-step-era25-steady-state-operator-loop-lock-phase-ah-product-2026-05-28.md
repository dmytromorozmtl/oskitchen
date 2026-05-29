# KitchenOS — Phase AH: Era25 steady-state operator loop convergence lock (era58)

**Status:** Product surfaces + steady-state lock integrity guard **IMPLEMENTED** · Human steady-state lock attestation **REQUIRED**  
**Policy:** `era58-era25-steady-state-operator-loop-lock-phases-v1` · Integrity `era58-era25-steady-state-operator-loop-lock-integrity-v1`  
**Prerequisite:** [`docs/next-step-era25-post-re-entrant-charter-lock-phase-ag-product-2026-05-28.md`](./next-step-era25-post-re-entrant-charter-lock-phase-ag-product-2026-05-28.md) → honest era25 post-re-entrant charter lock

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-steady-state-operator-loop-lock` | Lock improvement-loop cadence after charter lock |
| Launch Wizard | Today strip | Steady-state progress · loop rhythm mutation badge |
| Owner Briefing | priority **33** (meta) | Ranked action when steady-state lock blocked |
| Platform ops | `#era25-steady-state-operator-loop-lock` | Nested under charter lock panel |
| Maintenance | Nested under charter lock | Loop rhythm / frozen env badges + dual cert commands |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-post-re-entrant-charter-lock-integrity -- --json
npm run ops:sync-era25-post-re-entrant-charter-lock-integrity-baseline -- --write
npm run ops:validate-continuous-improvement-loop-integrity -- --json
npm run ops:validate-steady-state-operator-loop
npm run ops:validate-era25-steady-state-operator-loop-lock-integrity -- --json
# Clear ERA25_FROZEN_AFTER_STEADY_STATE_LOOP_LOCK_ENV_KEYS before attest:
# ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_ATTESTED=1
# ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_REPORT_REVIEWED=1
npm run ops:sync-era25-steady-state-operator-loop-lock-integrity-baseline -- --write
npm run test:ci:era25-steady-state-operator-loop-lock-integrity-era58
npm run test:ci:governance-bundles
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** Charter lock integrity PASS · improvement loop active + integrity PASS · zero mutable era25 frozen env on lock path · steady-state lock integrity PASS · dual cert green · era25 convergence surfaces remain suppressed via `shouldSuppressEra25ProductConvergenceSurfaces`.

**P0 commercial note:** Steady-state lock does **not** substitute for ops vault / `proof_passed` — convergence governance runs in parallel with Era 20 Band A execution.

---

## Integrity chain (era58)

```
evaluateEra25SteadyStateOperatorLoopLockIntegrity
  → evaluateEra25PostReentrantCharterLockIntegrity (era57)
  → evaluateContinuousImprovementLoopIntegrity (era34)
  → resolveContinuousImprovementLoopActive (era23)
  → detectEra25FrozenEnvMutationAfterSteadyStateLoopLock
  → detectImprovementLoopRhythmMutationAfterSteadyStateLock
```

**Blocking violations when lock started:** `steady_state_lock_without_charter_lock`, `era25_frozen_env_mutation_after_steady_state_lock`, `improvement_loop_rhythm_mutation_after_lock`, `fake_steady_state_lock_*`, upstream era57/era34 fails, `baseline_regression`.

**Tracked env keys:** `ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_ATTESTED`, `ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_REPORT_REVIEWED`

**Baseline artifact:** `artifacts/era25-steady-state-operator-loop-lock-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-steady-state-operator-loop-lock-integrity` | JSON steady-state lock gate |
| `ops:sync-era25-steady-state-operator-loop-lock-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:era25-steady-state-operator-loop-lock-integrity-era58` | Unit + cert-live wiring |
| `test:ci:era25-steady-state-operator-loop-lock-integrity-era58:cert` | Cert-live only (chained in governance-bundles + runbook cert) |

Workflow: `.github/workflows/ops-era25-steady-state-operator-loop-lock-integrity-validate.yml`

---

## Next step — Phase AI (era59)

**Era25 commercial pilot convergence train capstone attestation integrity** — single rollup attestation that era25 convergence train (era47–AH) is honestly closed with P0 proof gates referenced (does not fake `proof_passed`).

| Item | Value |
|------|-------|
| Prerequisite milestone | Honest `era25-steady-state-operator-loop-lock` baseline + dual cert green |
| Parent evaluator | era58 steady-state lock integrity |
| Platform anchor | `#era25-commercial-pilot-convergence-train-capstone` (planned) |
| Briefing meta priority | **34** (planned) |
| Env keys (planned) | `ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_ATTESTED`, `..._REPORT_REVIEWED` |
| Baseline artifact | `artifacts/era25-commercial-pilot-convergence-train-capstone-integrity-baseline.json` (planned) |
| Violation IDs (planned) | `capstone_without_steady_state_lock`, `capstone_claims_p0_pass_without_artifact`, `fake_capstone_attestation`, upstream era58 fail |
| CI | `test:ci:era25-commercial-pilot-convergence-train-capstone-integrity-era59` + extend pure-ops era25 cert |

**Human acceptance (preview):** steady-state lock PASS → attest train capstone → validate JSON → freeze entire era25 convergence governance chain until next major version policy; **execute P0 ops vault in parallel** for market proof.
