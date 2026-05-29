# KitchenOS — Phase AL: Era25 P0 market proof honest closure capstone (era62)

**Status:** Product surfaces + P0 honest closure capstone integrity guard **IMPLEMENTED** · Human closure attestation **REQUIRED** (artifact-driven)  
**Policy:** `era62-era25-p0-market-proof-honest-closure-capstone-phases-v1` · Integrity `era62-era25-p0-market-proof-honest-closure-capstone-integrity-v1`  
**Prerequisite:** [`docs/next-step-era25-band-a-market-proof-execution-sole-path-phase-ak-product-2026-05-28.md`](./next-step-era25-band-a-market-proof-execution-sole-path-phase-ak-product-2026-05-28.md) → honest Band A sole-path lock

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-p0-market-proof-honest-closure-capstone` | Terminal Band A closure when P0 artifact is proof_passed |
| Launch Wizard | Today strip | P0 closure progress · governance chain closed badge |
| Owner Briefing | priority **37** (meta) | Ranked action → P0 ops vault until honest proof_passed |
| Platform ops | `#era25-p0-market-proof-honest-closure-capstone` | Nested under Band A sole-path panel |
| Maintenance | Nested under sole-path | governance closed / P0 artifact honesty badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-band-a-market-proof-execution-sole-path-integrity -- --json
npm run ops:sync-era25-band-a-market-proof-execution-sole-path-integrity-baseline -- --write
npm run ops:validate-p0-staging-proof-integrity -- --json
npm run smoke:p0-staging-proof-unblock
# Verify artifacts/p0-staging-proof-unblock-summary.json shows proof_passed
npm run ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity -- --json
# Clear ERA25_FROZEN_AFTER_CLOSURE_CAPSTONE_ENV_KEYS before attest:
# ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_ATTESTED=1
# ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_REPORT_REVIEWED=1
npm run ops:sync-era25-p0-market-proof-honest-closure-capstone-integrity-baseline -- --write
npm run test:ci:era25-p0-market-proof-honest-closure-capstone-integrity-era62
npm run test:ci:governance-bundles
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** Sole-path locked · P0 artifact honestly `proof_passed` · closure capstone integrity PASS · `era25MarketProofGovernanceChainClosed` true after honest attest+baseline · dual cert green.

---

## Integrity chain (era62)

```
evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity
  → evaluateEra25BandAMarketProofExecutionSolePathIntegrity (era61, with solePathIntegrityOverride in UI)
  → loadP0StagingProofArtifact (closure is artifact-driven)
  → detectEra25FrozenEnvMutationAfterClosureCapstone
  → era25MarketProofGovernanceChainClosed when baseline or honest attest + proof_passed
```

**Blocking violations when closure started:** `closure_without_sole_path`, `closure_claims_proof_passed_without_artifact`, `closure_attested_before_proof_passed_artifact`, `era25_frozen_env_mutation_after_closure_capstone`, `fake_closure_*`, upstream era61 fail, `baseline_regression`.

**Tracked env keys:** `ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_ATTESTED`, `ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_REPORT_REVIEWED`

**Baseline artifact:** `artifacts/era25-p0-market-proof-honest-closure-capstone-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity` | JSON closure capstone gate |
| `ops:sync-era25-p0-market-proof-honest-closure-capstone-integrity-baseline` | Record honest baseline (requires proof_passed artifact) |
| `test:ci:era25-p0-market-proof-honest-closure-capstone-integrity-era62` | Unit + cert-live wiring |
| `test:ci:era25-p0-market-proof-honest-closure-capstone-integrity-era62:cert` | Cert-live only |

Workflow: `.github/workflows/ops-era25-p0-market-proof-honest-closure-capstone-integrity-validate.yml`

---

## Next step — Phase AM (era63) — **IMPLEMENTED**

See [`docs/next-step-era25-post-market-proof-steady-operational-witness-phase-am-product-2026-05-28.md`](./next-step-era25-post-market-proof-steady-operational-witness-phase-am-product-2026-05-28.md).

**Next:** Phase AN (era64) — Era25 governance train terminal seal integrity (preview in AM doc).
