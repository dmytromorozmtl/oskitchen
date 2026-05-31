# OS Kitchen — Phase AM: Era25 post-market-proof steady operational witness (era63)

**Status:** Product surfaces + post-market steady ops witness integrity guard **IMPLEMENTED** · Human witness attestation **REQUIRED** (closure-driven)  
**Policy:** `era63-era25-post-market-proof-steady-operational-witness-phases-v1` · Integrity `era63-era25-post-market-proof-steady-operational-witness-integrity-v1`  
**Prerequisite:** [`docs/next-step-era25-p0-market-proof-honest-closure-capstone-phase-al-product-2026-05-28.md`](./next-step-era25-p0-market-proof-honest-closure-capstone-phase-al-product-2026-05-28.md) → honest P0 closure capstone + `era25MarketProofGovernanceChainClosed`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-post-market-proof-steady-operational-witness` | Post-Band-A steady ops witness after closure capstone |
| Launch Wizard | Today strip | Steady witness progress · improvement loop / governance frozen badges |
| Owner Briefing | priority **38** (meta) | Ranked action → improvement loop until witness integrity PASS |
| Platform ops | `#era25-post-market-proof-steady-operational-witness` | Nested under P0 closure capstone panel |
| Maintenance | Nested under closure capstone | witness active / integrity FAIL / governance reopen badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity -- --json
npm run ops:sync-era25-p0-market-proof-honest-closure-capstone-integrity-baseline -- --write
npm run ops:validate-continuous-improvement-loop-integrity -- --json
npm run ops:validate-era25-post-market-proof-steady-operational-witness-integrity -- --json
# Clear ERA25_FROZEN_AFTER_WITNESS_ENV_KEYS before attest:
# ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_ATTESTED=1
# ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_REPORT_REVIEWED=1
npm run ops:sync-era25-post-market-proof-steady-operational-witness-integrity-baseline -- --write
npm run test:ci:era25-post-market-proof-steady-operational-witness-integrity-era63
npm run test:ci:governance-bundles
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** P0 closure capstone PASS · governance chain closed · improvement loop integrity PASS · witness integrity PASS · `postMarketProofSteadyOpsWitnessActive` true after honest attest+baseline · era25 convergence env stays frozen · dual cert green.

---

## Integrity chain (era63)

```
evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity
  → evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity (era62, closureCapstoneIntegrityOverride in UI)
  → evaluateContinuousImprovementLoopIntegrity (era34)
  → detectEra25GovernanceReopenClaimedAfterWitness (frozen era25 env keys)
  → postMarketProofSteadyOpsWitnessActive when baseline or honest attest on frozen governance
```

**Blocking violations when witness started:** `witness_without_closure_capstone`, `witness_claims_governance_reopen`, `continuous_improvement_loop_integrity_fail`, `fake_witness_*`, upstream era62 / GO fail, `baseline_regression`.

**Tracked env keys:** `ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_ATTESTED`, `ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_REPORT_REVIEWED`

**Baseline artifact:** `artifacts/era25-post-market-proof-steady-operational-witness-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-post-market-proof-steady-operational-witness-integrity` | JSON steady ops witness gate |
| `ops:sync-era25-post-market-proof-steady-operational-witness-integrity-baseline` | Record honest baseline (requires closure + improvement loop PASS) |
| `test:ci:era25-post-market-proof-steady-operational-witness-integrity-era63` | Unit + cert-live wiring |
| `test:ci:era25-post-market-proof-steady-operational-witness-integrity-era63:cert` | Cert-live only |

Workflow: `.github/workflows/ops-era25-post-market-proof-steady-operational-witness-integrity-validate.yml`

Cert chains: `test:ci:governance-bundles:partition-platform`, `test:ci:commercial-pilot-runbook:cert`, `test:ci:pure-operational-mode-terminus-era25:cert`

---

## Next step — Phase AN (era64) — **IMPLEMENTED**

See [`docs/next-step-era25-governance-train-terminal-seal-phase-an-product-2026-05-28.md`](./next-step-era25-governance-train-terminal-seal-phase-an-product-2026-05-28.md).

**Next:** Phase AO (era65) — Era25 post-terminal-seal commercial ops permanence integrity (preview in AN doc).
