# KitchenOS — Phase AQ: Era25 post-band-a-governance steady product mode witness (era67)

**Status:** Product surfaces + steady product mode witness integrity guard **IMPLEMENTED** · Human steady product mode witness attestation **REQUIRED** (capstone-driven)  
**Policy:** `era67-era25-post-band-a-governance-steady-product-mode-witness-phases-v1` · Integrity `era67-era25-post-band-a-governance-steady-product-mode-witness-integrity-v1`  
**Prerequisite:** [`docs/next-step-era25-band-a-governance-chain-capstone-witness-phase-ap-product-2026-05-28.md`](./next-step-era25-band-a-governance-chain-capstone-witness-phase-ap-product-2026-05-28.md) → honest Band A governance chain capstone witness

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-post-band-a-governance-steady-product-mode-witness` | Post-governance steady product ops witness |
| Launch Wizard | Today strip | Steady product mode progress · steady mode badge |
| Owner Briefing | priority **42** (meta) | Ranked action → platform ops until steady mode integrity PASS |
| Platform ops | `#era25-post-band-a-governance-steady-product-mode-witness` | Nested under Band A capstone witness panel |
| Maintenance | Nested under capstone witness | steady product mode / integrity FAIL / governance reopen badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-band-a-governance-chain-capstone-witness-integrity -- --json
npm run ops:sync-era25-band-a-governance-chain-capstone-witness-integrity-baseline -- --write
npm run ops:validate-continuous-improvement-loop-integrity -- --json
npm run ops:validate-era25-post-band-a-governance-steady-product-mode-witness-integrity -- --json
# Clear ERA25_FROZEN_AFTER_STEADY_PRODUCT_MODE_WITNESS_ENV_KEYS before attest:
# ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_ATTESTED=1
# ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_REPORT_REVIEWED=1
npm run ops:sync-era25-post-band-a-governance-steady-product-mode-witness-integrity-baseline -- --write
npm run test:ci:era25-post-band-a-governance-steady-product-mode-witness-integrity-era67
npm run test:ci:governance-bundles
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** Band A capstone witness active · improvement loop integrity PASS · steady product mode witness integrity PASS · `postBandAGovernanceSteadyProductModeWitnessActive` true after honest attest+baseline · dual cert green.

---

## Integrity chain (era67)

```
evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity
  → evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity (era66, capstoneIntegrityOverride in UI)
  → evaluateContinuousImprovementLoopIntegrity (era34)
  → detectEra25GovernanceReopenClaimedAfterSteadyProductModeWitness
  → postBandAGovernanceSteadyProductModeWitnessActive when baseline or honest attest
```

**Blocking violations when steady product mode witness started:** `steady_product_mode_witness_without_capstone`, `steady_product_mode_witness_claims_governance_reopen`, `continuous_improvement_loop_integrity_fail`, `fake_steady_product_mode_witness_*`, upstream era66 fail, `baseline_regression`.

**Tracked env keys:** `ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_ATTESTED`, `ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_REPORT_REVIEWED`

**Baseline artifact:** `artifacts/era25-post-band-a-governance-steady-product-mode-witness-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-post-band-a-governance-steady-product-mode-witness-integrity` | JSON steady product mode witness gate |
| `ops:sync-era25-post-band-a-governance-steady-product-mode-witness-integrity-baseline` | Record honest baseline (requires capstone witness + improvement loop PASS) |
| `test:ci:era25-post-band-a-governance-steady-product-mode-witness-integrity-era67` | Unit + cert-live wiring |
| `test:ci:era25-post-band-a-governance-steady-product-mode-witness-integrity-era67:cert` | Cert-live only |

Workflow: `.github/workflows/ops-era25-post-band-a-governance-steady-product-mode-witness-integrity-validate.yml`

Cert chains: `test:ci:governance-bundles:partition-platform`, `test:ci:commercial-pilot-runbook:cert`, `test:ci:pure-operational-mode-terminus-era25:cert`

---

## Next step — Phase AR (era68) — **IMPLEMENTED**

See [`docs/next-step-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-phase-ar-product-2026-05-28.md`](./next-step-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-phase-ar-product-2026-05-28.md).

---

## Next step — Phase AR (era68) — archive preview

**Era25 post-steady-product-mode commercial ops rhythm permanence integrity** — after steady product mode witness, locks honest commercial artifact rhythm forever with zero era25 env mutation; improvement loop remains sole governance surface.

| Item | Value |
|------|-------|
| Prerequisite milestone | Honest `era25-post-band-a-governance-steady-product-mode-witness` baseline + dual cert green |
| Parent evaluator | era67 post-band-a-governance steady product mode witness integrity |
| Platform anchor | `#era25-post-steady-product-mode-commercial-ops-rhythm-permanence` |
| Briefing meta priority | **43** |
| Env keys | `ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA25_ATTESTED`, `..._REPORT_REVIEWED` |
| Baseline artifact | `artifacts/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-baseline.json` |
| Violation IDs | `commercial_ops_rhythm_permanence_without_steady_product_mode`, `commercial_ops_rhythm_permanence_claims_governance_reopen`, `fake_commercial_ops_rhythm_permanence_*`, upstream era67 fail |
| CI | `test:ci:era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68` |

**Human acceptance:** steady product mode witness PASS → attest commercial ops rhythm permanence → validate JSON → operator playbook sustains honest GO/commercial artifacts with improvement loop only, zero era25 convergence env mutation forever.
