# KitchenOS — Phase AI: Era25 commercial pilot convergence train capstone (era59)

**Status:** Product surfaces + train capstone integrity guard **IMPLEMENTED** · Human capstone attestation **REQUIRED**  
**Policy:** `era59-era25-commercial-pilot-convergence-train-capstone-phases-v1` · Integrity `era59-era25-commercial-pilot-convergence-train-capstone-integrity-v1`  
**Prerequisite:** [`docs/next-step-era25-steady-state-operator-loop-lock-phase-ah-product-2026-05-28.md`](./next-step-era25-steady-state-operator-loop-lock-phase-ah-product-2026-05-28.md) → honest era25 steady-state operator loop lock

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-commercial-pilot-convergence-train-capstone` | Close era47–AH governance train with honest P0/GO references |
| Launch Wizard | Today strip | Capstone progress · P0 artifact honesty badge |
| Owner Briefing | priority **34** (meta) | Ranked action when capstone blocked or P0 referenced without artifact |
| Platform ops | `#era25-commercial-pilot-convergence-train-capstone` | Nested under steady-state lock panel |
| Maintenance | Nested under steady-state lock | P0 / capstone integrity badges + dual cert commands |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-steady-state-operator-loop-lock-integrity -- --json
npm run ops:sync-era25-steady-state-operator-loop-lock-integrity-baseline -- --write
npm run ops:validate-p0-staging-proof-integrity -- --json
npm run smoke:p0-staging-proof-unblock
npm run ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity -- --json
# Clear ERA25_FROZEN_AFTER_TRAIN_CAPSTONE_ENV_KEYS before attest:
# ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_ATTESTED=1
# ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_REPORT_REVIEWED=1
# Optional honest rollup references (do not set P0_PROOF_REFERENCED=1 until artifact is proof_passed):
# ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_P0_PROOF_REFERENCED=1
# ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_GO_REFERENCED=1
npm run ops:sync-era25-commercial-pilot-convergence-train-capstone-integrity-baseline -- --write
npm run test:ci:era25-commercial-pilot-convergence-train-capstone-integrity-era59
npm run test:ci:governance-bundles
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** Steady-state lock integrity PASS · capstone integrity PASS · P0 artifact status recorded honestly in baseline (may be `awaiting_ops_credentials`) · dual cert green · era25 convergence surfaces remain suppressed via `shouldSuppressEra25ProductConvergenceSurfaces`.

**P0 commercial note:** Train capstone **closes governance** era47–AH; it does **not** substitute for ops vault / honest `proof_passed` on `artifacts/p0-staging-proof-unblock-summary.json`. Execute Band A P0 in parallel.

---

## Integrity chain (era59)

```
evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity
  → evaluateEra25SteadyStateOperatorLoopLockIntegrity (era58)
  → loadP0StagingProofArtifact (honest P0 reference guard)
  → loadPilotGoNoGoSummaryArtifact (honest GO reference guard)
  → detectEra25FrozenEnvMutationAfterTrainCapstone
```

**Blocking violations when capstone started:** `capstone_without_steady_state_lock`, `capstone_claims_p0_pass_without_artifact`, `capstone_claims_go_without_gono_go_artifact`, `era25_frozen_env_mutation_after_train_capstone`, `fake_capstone_*`, upstream era58 fail, `baseline_regression`.

**Tracked env keys:** `ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_ATTESTED`, `ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_REPORT_REVIEWED`, `ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_P0_PROOF_REFERENCED`, `ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_GO_REFERENCED`

**Baseline artifact:** `artifacts/era25-commercial-pilot-convergence-train-capstone-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity` | JSON train capstone gate |
| `ops:sync-era25-commercial-pilot-convergence-train-capstone-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:era25-commercial-pilot-convergence-train-capstone-integrity-era59` | Unit + cert-live wiring |
| `test:ci:era25-commercial-pilot-convergence-train-capstone-integrity-era59:cert` | Cert-live only (chained in governance-bundles + runbook cert) |

Workflow: `.github/workflows/ops-era25-commercial-pilot-convergence-train-capstone-integrity-validate.yml`

---

## Next step — Phase AJ (era60) — **IMPLEMENTED**

See [`docs/next-step-era25-convergence-governance-terminus-freeze-phase-aj-product-2026-05-28.md`](./next-step-era25-convergence-governance-terminus-freeze-phase-aj-product-2026-05-28.md).

**Phase AK (era61)** — Era25 Band A market proof execution sole-path attestation (planned).
