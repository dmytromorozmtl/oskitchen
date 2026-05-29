# KitchenOS — Phase AP: Era25 Band A governance chain capstone witness (era66)

**Status:** Product surfaces + Band A capstone witness integrity guard **IMPLEMENTED** · Human capstone witness attestation **REQUIRED** (permanence-driven)  
**Policy:** `era66-era25-band-a-governance-chain-capstone-witness-phases-v1` · Integrity `era66-era25-band-a-governance-chain-capstone-witness-integrity-v1`  
**Prerequisite:** [`docs/next-step-era25-post-terminal-seal-commercial-ops-permanence-phase-ao-product-2026-05-28.md`](./next-step-era25-post-terminal-seal-commercial-ops-permanence-phase-ao-product-2026-05-28.md) → honest commercial ops permanence

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-band-a-governance-chain-capstone-witness` | Terminal witness that era61–AO stack is closed |
| Launch Wizard | Today strip | Capstone witness progress · Band A closed badge |
| Owner Briefing | priority **41** (meta) | Ranked action → platform ops until capstone witness integrity PASS |
| Platform ops | `#era25-band-a-governance-chain-capstone-witness` | Nested under commercial ops permanence panel |
| Maintenance | Nested under permanence | capstone witness / integrity FAIL / governance reopen badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity -- --json
npm run ops:sync-era25-post-terminal-seal-commercial-ops-permanence-integrity-baseline -- --write
npm run ops:validate-continuous-improvement-loop-integrity -- --json
npm run ops:validate-era25-band-a-governance-chain-capstone-witness-integrity -- --json
# Clear ERA25_FROZEN_AFTER_CAPSTONE_WITNESS_ENV_KEYS before attest:
# ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_ATTESTED=1
# ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_REPORT_REVIEWED=1
npm run ops:sync-era25-band-a-governance-chain-capstone-witness-integrity-baseline -- --write
npm run test:ci:era25-band-a-governance-chain-capstone-witness-integrity-era66
npm run test:ci:governance-bundles
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** Commercial ops permanence active · improvement loop integrity PASS · capstone witness integrity PASS · `bandAGovernanceChainCapstoneWitnessActive` true after honest attest+baseline · dual cert green.

---

## Integrity chain (era66)

```
evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity
  → evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity (era65, permanenceIntegrityOverride in UI)
  → evaluateContinuousImprovementLoopIntegrity (era34)
  → detectEra25GovernanceReopenClaimedAfterCapstoneWitness
  → bandAGovernanceChainCapstoneWitnessActive when baseline or honest attest
```

**Blocking violations when capstone witness started:** `capstone_witness_without_permanence`, `capstone_witness_claims_governance_reopen`, `continuous_improvement_loop_integrity_fail`, `fake_capstone_witness_*`, upstream era65 fail, `baseline_regression`.

**Tracked env keys:** `ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_ATTESTED`, `ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_REPORT_REVIEWED`

**Baseline artifact:** `artifacts/era25-band-a-governance-chain-capstone-witness-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-band-a-governance-chain-capstone-witness-integrity` | JSON Band A capstone witness gate |
| `ops:sync-era25-band-a-governance-chain-capstone-witness-integrity-baseline` | Record honest baseline (requires permanence + improvement loop PASS) |
| `test:ci:era25-band-a-governance-chain-capstone-witness-integrity-era66` | Unit + cert-live wiring |
| `test:ci:era25-band-a-governance-chain-capstone-witness-integrity-era66:cert` | Cert-live only |

Workflow: `.github/workflows/ops-era25-band-a-governance-chain-capstone-witness-integrity-validate.yml`

Cert chains: `test:ci:governance-bundles:partition-platform`, `test:ci:commercial-pilot-runbook:cert`, `test:ci:pure-operational-mode-terminus-era25:cert`

---

## Next step — Phase AQ (era67) — **IMPLEMENTED**

See [`docs/next-step-era25-post-band-a-governance-steady-product-mode-witness-phase-aq-product-2026-05-28.md`](./next-step-era25-post-band-a-governance-steady-product-mode-witness-phase-aq-product-2026-05-28.md).

---

## Next step — Phase AQ (era67) — archive preview

**Era25 post-band-a-governance steady product mode witness integrity** — after capstone witness, attests post-governance steady product mode (improvement loop + honest commercial artifacts only, zero era25 env mutation).

| Item | Value |
|------|-------|
| Prerequisite milestone | Honest `era25-band-a-governance-chain-capstone-witness` baseline + dual cert green |
| Parent evaluator | era66 Band A governance chain capstone witness integrity |
| Platform anchor | `#era25-post-band-a-governance-steady-product-mode-witness` |
| Briefing meta priority | **42** |
| Env keys | `ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_ATTESTED`, `..._REPORT_REVIEWED` |
| Baseline artifact | `artifacts/era25-post-band-a-governance-steady-product-mode-witness-integrity-baseline.json` |
| Violation IDs | `steady_product_mode_witness_without_capstone`, `steady_product_mode_witness_claims_governance_reopen`, `fake_steady_product_mode_witness_*`, upstream era66 fail |
| CI | `test:ci:era25-post-band-a-governance-steady-product-mode-witness-integrity-era67` |

**Human acceptance:** Band A capstone witness PASS → attest post-governance steady product mode witness → validate JSON → operator playbook enters pure product improvement loop with zero era25 env mutation forever.
