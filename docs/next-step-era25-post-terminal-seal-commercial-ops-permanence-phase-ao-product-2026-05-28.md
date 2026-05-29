# KitchenOS — Phase AO: Era25 post-terminal-seal commercial ops permanence (era65)

**Status:** Product surfaces + commercial ops permanence integrity guard **IMPLEMENTED** · Human permanence attestation **REQUIRED** (seal-driven)  
**Policy:** `era65-era25-post-terminal-seal-commercial-ops-permanence-phases-v1` · Integrity `era65-era25-post-terminal-seal-commercial-ops-permanence-integrity-v1`  
**Prerequisite:** [`docs/next-step-era25-governance-train-terminal-seal-phase-an-product-2026-05-28.md`](./next-step-era25-governance-train-terminal-seal-phase-an-product-2026-05-28.md) → honest governance train terminal seal

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-post-terminal-seal-commercial-ops-permanence` | Sustained commercial ops after train seal |
| Launch Wizard | Today strip | Permanence progress · ops permanence badge |
| Owner Briefing | priority **40** (meta) | Ranked action → commercial ops until permanence integrity PASS |
| Platform ops | `#era25-post-terminal-seal-commercial-ops-permanence` | Nested under governance train terminal seal panel |
| Maintenance | Nested under terminal seal | ops permanence / integrity FAIL / governance reopen badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-governance-train-terminal-seal-integrity -- --json
npm run ops:sync-era25-governance-train-terminal-seal-integrity-baseline -- --write
npm run ops:validate-continuous-improvement-loop-integrity -- --json
npm run ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity -- --json
# Clear ERA25_FROZEN_AFTER_PERMANENCE_ENV_KEYS before attest:
# ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_ATTESTED=1
# ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_REPORT_REVIEWED=1
npm run ops:sync-era25-post-terminal-seal-commercial-ops-permanence-integrity-baseline -- --write
npm run test:ci:era25-post-terminal-seal-commercial-ops-permanence-integrity-era65
npm run test:ci:governance-bundles
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** Terminal seal active · steady witness active · improvement loop integrity PASS · permanence integrity PASS · `postTerminalSealCommercialOpsPermanenceActive` true after honest attest+baseline · dual cert green.

---

## Integrity chain (era65)

```
evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity
  → evaluateEra25GovernanceTrainTerminalSealIntegrity (era64, sealIntegrityOverride in UI)
  → evaluateContinuousImprovementLoopIntegrity (era34)
  → detectEra25GovernanceReopenClaimedAfterPermanence
  → postTerminalSealCommercialOpsPermanenceActive when baseline or honest attest
```

**Blocking violations when permanence started:** `permanence_without_terminal_seal`, `permanence_claims_governance_reopen`, `continuous_improvement_loop_integrity_fail`, `fake_permanence_*`, upstream era64 fail, `baseline_regression`.

**Tracked env keys:** `ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_ATTESTED`, `ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_REPORT_REVIEWED`

**Baseline artifact:** `artifacts/era25-post-terminal-seal-commercial-ops-permanence-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity` | JSON commercial ops permanence gate |
| `ops:sync-era25-post-terminal-seal-commercial-ops-permanence-integrity-baseline` | Record honest baseline (requires terminal seal + improvement loop PASS) |
| `test:ci:era25-post-terminal-seal-commercial-ops-permanence-integrity-era65` | Unit + cert-live wiring |
| `test:ci:era25-post-terminal-seal-commercial-ops-permanence-integrity-era65:cert` | Cert-live only |

Workflow: `.github/workflows/ops-era25-post-terminal-seal-commercial-ops-permanence-integrity-validate.yml`

Cert chains: `test:ci:governance-bundles:partition-platform`, `test:ci:commercial-pilot-runbook:cert`, `test:ci:pure-operational-mode-terminus-era25:cert`

---

## Next step — Phase AP (era66) — **IMPLEMENTED**

See [`docs/next-step-era25-band-a-governance-chain-capstone-witness-phase-ap-product-2026-05-28.md`](./next-step-era25-band-a-governance-chain-capstone-witness-phase-ap-product-2026-05-28.md).

---

## Next step — Phase AP (era66) — archive preview

**Era25 band-a governance chain capstone witness integrity** — terminal witness that the full Band A governance stack (era61 sole-path → era62 closure → era63 witness → era64 seal → era65 permanence) is honestly closed and only product/commercial steady-state ops remain.

| Item | Value |
|------|-------|
| Prerequisite milestone | Honest `era25-post-terminal-seal-commercial-ops-permanence` baseline + dual cert green |
| Parent evaluator | era65 post-terminal-seal commercial ops permanence integrity |
| Platform anchor | `#era25-band-a-governance-chain-capstone-witness` |
| Briefing meta priority | **41** |
| Env keys | `ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_ATTESTED`, `..._REPORT_REVIEWED` |
| Baseline artifact | `artifacts/era25-band-a-governance-chain-capstone-witness-integrity-baseline.json` |
| Violation IDs | `capstone_witness_without_permanence`, `capstone_witness_claims_governance_reopen`, `fake_capstone_witness_attestation`, upstream era65 fail |
| CI | `test:ci:era25-band-a-governance-chain-capstone-witness-integrity-era66` |

**Human acceptance:** commercial ops permanence PASS → attest Band A governance chain capstone witness → validate JSON → operator playbook enters post-governance steady product mode with zero era25 env mutation.
