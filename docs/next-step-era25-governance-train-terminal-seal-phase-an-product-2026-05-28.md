# KitchenOS — Phase AN: Era25 governance train terminal seal (era64)

**Status:** Product surfaces + governance train terminal seal integrity guard **IMPLEMENTED** · Human seal attestation **REQUIRED** (witness-driven)  
**Policy:** `era64-era25-governance-train-terminal-seal-phases-v1` · Integrity `era64-era25-governance-train-terminal-seal-integrity-v1`  
**Prerequisite:** [`docs/next-step-era25-post-market-proof-steady-operational-witness-phase-am-product-2026-05-28.md`](./next-step-era25-post-market-proof-steady-operational-witness-phase-am-product-2026-05-28.md) → honest post-market steady ops witness

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-governance-train-terminal-seal` | Final seal on era47–AM convergence governance train |
| Launch Wizard | Today strip | Terminal seal progress · train sealed badge |
| Owner Briefing | priority **39** (meta) | Ranked action → improvement loop until seal integrity PASS |
| Platform ops | `#era25-governance-train-terminal-seal` | Nested under post-market steady ops witness panel |
| Maintenance | Nested under steady witness | train sealed / integrity FAIL / governance reopen badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-post-market-proof-steady-operational-witness-integrity -- --json
npm run ops:sync-era25-post-market-proof-steady-operational-witness-integrity-baseline -- --write
npm run ops:validate-continuous-improvement-loop-integrity -- --json
npm run ops:validate-era25-governance-train-terminal-seal-integrity -- --json
# Clear ERA25_FROZEN_AFTER_TERMINAL_SEAL_ENV_KEYS before attest:
# ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_ATTESTED=1
# ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_REPORT_REVIEWED=1
npm run ops:sync-era25-governance-train-terminal-seal-integrity-baseline -- --write
npm run test:ci:era25-governance-train-terminal-seal-integrity-era64
npm run test:ci:governance-bundles
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** Steady witness active · governance chain closed · improvement loop integrity PASS · seal integrity PASS · `era25GovernanceTrainSealed` true after honest attest+baseline · dual cert green.

---

## Integrity chain (era64)

```
evaluateEra25GovernanceTrainTerminalSealIntegrity
  → evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity (era63, witnessIntegrityOverride in UI)
  → evaluateContinuousImprovementLoopIntegrity (era34)
  → detectEra25GovernanceReopenClaimedAfterTerminalSeal
  → era25GovernanceTrainSealed when baseline or honest attest on frozen governance train
```

**Blocking violations when seal started:** `seal_without_steady_witness`, `seal_claims_governance_reopen`, `continuous_improvement_loop_integrity_fail`, `fake_seal_*`, upstream era63 fail, `baseline_regression`.

**Tracked env keys:** `ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_ATTESTED`, `ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_REPORT_REVIEWED`

**Baseline artifact:** `artifacts/era25-governance-train-terminal-seal-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-governance-train-terminal-seal-integrity` | JSON terminal seal gate |
| `ops:sync-era25-governance-train-terminal-seal-integrity-baseline` | Record honest baseline (requires steady witness + improvement loop PASS) |
| `test:ci:era25-governance-train-terminal-seal-integrity-era64` | Unit + cert-live wiring |
| `test:ci:era25-governance-train-terminal-seal-integrity-era64:cert` | Cert-live only |

Workflow: `.github/workflows/ops-era25-governance-train-terminal-seal-integrity-validate.yml`

Cert chains: `test:ci:governance-bundles:partition-platform`, `test:ci:commercial-pilot-runbook:cert`, `test:ci:pure-operational-mode-terminus-era25:cert`

---

## Next step — Phase AO (era65)

**Era25 post-terminal-seal commercial ops permanence integrity** — attests that after governance train terminal seal the platform sustains honest commercial artifact rhythm + improvement loop only, with zero era25 governance env mutation through permanence baseline.

| Item | Value |
|------|-------|
| Prerequisite milestone | Honest `era25-governance-train-terminal-seal` baseline + dual cert green |
| Parent evaluator | era64 governance train terminal seal integrity |
| Platform anchor | `#era25-post-terminal-seal-commercial-ops-permanence` (planned) |
| Briefing meta priority | **40** (planned) |
| Env keys (planned) | `ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_ATTESTED`, `..._REPORT_REVIEWED` |
| Baseline artifact | `artifacts/era25-post-terminal-seal-commercial-ops-permanence-integrity-baseline.json` (planned) |
| Violation IDs (planned) | `permanence_without_terminal_seal`, `permanence_claims_governance_reopen`, `fake_permanence_attestation`, upstream era64 fail |
| CI | `test:ci:era25-post-terminal-seal-commercial-ops-permanence-integrity-era65` |

**Human acceptance (preview):** terminal seal PASS → attest commercial ops permanence → validate JSON → operator playbook sustains GO artifacts + improvement loop without reopening any era25 frozen governance env.
