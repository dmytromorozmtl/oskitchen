# KitchenOS — Phase AJ: Era25 convergence governance terminus freeze (era60)

**Status:** Product surfaces + governance terminus freeze integrity guard **IMPLEMENTED** · Human terminus freeze attestation **REQUIRED**  
**Policy:** `era60-era25-convergence-governance-terminus-freeze-phases-v1` · Integrity `era60-era25-convergence-governance-terminus-freeze-integrity-v1`  
**Prerequisite:** [`docs/next-step-era25-commercial-pilot-convergence-train-capstone-phase-ai-product-2026-05-28.md`](./next-step-era25-commercial-pilot-convergence-train-capstone-phase-ai-product-2026-05-28.md) → honest era25 commercial pilot convergence train capstone

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-convergence-governance-terminus-freeze` | Final freeze of era47–AI governance env · convergence UI suppression |
| Launch Wizard | Today strip | Terminus freeze progress · convergence suppressed badge |
| Owner Briefing | priority **35** (meta) | Ranked action when terminus freeze blocked |
| Platform ops | `#era25-convergence-governance-terminus-freeze` | Nested under train capstone panel |
| Maintenance | Nested under train capstone | Suppression / P0 honesty badges + dual cert commands |
| Gate suppression | `shouldSuppressEra25ProductConvergenceSurfaces` | Also true when `era25ConvergenceGovernanceTerminusFreezeComplete` |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity -- --json
npm run ops:sync-era25-commercial-pilot-convergence-train-capstone-integrity-baseline -- --write
npm run ops:validate-p0-staging-proof-integrity -- --json
npm run smoke:p0-staging-proof-unblock
npm run ops:validate-era25-convergence-governance-terminus-freeze-integrity -- --json
# Clear ERA25_FROZEN_AFTER_GOVERNANCE_TERMINUS_FREEZE_ENV_KEYS before attest:
# ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_ATTESTED=1
# ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_REPORT_REVIEWED=1
# Optional (only when P0 artifact is honestly proof_passed):
# ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_MARKET_PROOF_REFERENCED=1
npm run ops:sync-era25-convergence-governance-terminus-freeze-integrity-baseline -- --write
npm run test:ci:era25-convergence-governance-terminus-freeze-integrity-era60
npm run test:ci:governance-bundles
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** Train capstone integrity PASS · terminus freeze integrity PASS · `shouldSuppressEra25ProductConvergenceSurfaces` true after honest attest+baseline · dual cert green · **P0 ops vault remains the sole market-proof track**.

---

## Integrity chain (era60)

```
evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity
  → evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity (era59)
  → loadP0StagingProofArtifact (market proof honesty guard)
  → detectEra25FrozenEnvMutationAfterGovernanceTerminusFreeze
  → era25ProductConvergenceSurfacesSuppressed when baseline or honest attest
```

**Blocking violations when freeze started:** `terminus_freeze_without_capstone`, `terminus_claims_market_proof_without_p0_artifact`, `era25_frozen_env_mutation_after_terminus_freeze`, `fake_terminus_freeze_*`, upstream era59 fail, `baseline_regression`.

**Tracked env keys:** `ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_ATTESTED`, `ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_REPORT_REVIEWED`, `ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_MARKET_PROOF_REFERENCED`

**Baseline artifact:** `artifacts/era25-convergence-governance-terminus-freeze-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-convergence-governance-terminus-freeze-integrity` | JSON terminus freeze gate |
| `ops:sync-era25-convergence-governance-terminus-freeze-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:era25-convergence-governance-terminus-freeze-integrity-era60` | Unit + cert-live wiring |
| `test:ci:era25-convergence-governance-terminus-freeze-integrity-era60:cert` | Cert-live only (chained in governance-bundles + runbook cert) |

Workflow: `.github/workflows/ops-era25-convergence-governance-terminus-freeze-integrity-validate.yml`

---

## Next step — Phase AK (era61)

**Era25 Band A market proof execution sole-path attestation integrity** — attests that after governance terminus freeze only improvement loop + P0 ops vault execution paths remain operator-mutable (no new era25 convergence env).

| Item | Value |
|------|-------|
| Prerequisite milestone | Honest `era25-convergence-governance-terminus-freeze` baseline + dual cert green |
| Parent evaluator | era60 governance terminus freeze integrity |
| Platform anchor | `#era25-band-a-market-proof-execution-sole-path` (planned) |
| Briefing meta priority | **36** (planned) |
| Env keys (planned) | `ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_ATTESTED`, `..._REPORT_REVIEWED` |
| Baseline artifact | `artifacts/era25-band-a-market-proof-execution-sole-path-integrity-baseline.json` (planned) |
| Violation IDs (planned) | `sole_path_without_terminus_freeze`, `sole_path_claims_p0_complete_without_artifact`, `fake_sole_path_attestation`, upstream era60 fail |
| CI | `test:ci:era25-band-a-market-proof-execution-sole-path-integrity-era61` + extend pure-ops era25 cert |

**Human acceptance (preview):** terminus freeze PASS → attest sole-path → validate JSON → operator playbook locks to P0 vault + improvement loop only until `proof_passed` on artifact.
