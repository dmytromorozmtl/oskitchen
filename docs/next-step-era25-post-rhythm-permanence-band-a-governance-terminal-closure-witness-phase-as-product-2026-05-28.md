# KitchenOS — Phase AS: Era25 post-rhythm-permanence Band A governance terminal closure witness (era69)

**Status:** Product surfaces + Band A governance terminal closure witness integrity guard **IMPLEMENTED** · Human terminal closure witness attestation **REQUIRED** (rhythm permanence-driven)  
**Policy:** `era69-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-phases-v1` · Integrity `era69-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-v1`  
**Prerequisite:** [`docs/next-step-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-phase-ar-product-2026-05-28.md`](./next-step-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-phase-ar-product-2026-05-28.md) → honest commercial ops rhythm permanence

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness` | Final witness that era61–AR governance stack is permanently closed |
| Launch Wizard | Today strip | Band A terminal closure progress · closed witness badge |
| Owner Briefing | priority **44** (meta) | Ranked action → commercial ops until terminal closure witness integrity PASS |
| Platform ops | `#era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness` | Nested under commercial ops rhythm permanence panel |
| Maintenance | Nested under rhythm permanence | terminal closure witness / integrity FAIL / governance reopen badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity -- --json
npm run ops:sync-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-baseline -- --write
npm run ops:validate-continuous-improvement-loop-integrity -- --json
npm run ops:validate-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity -- --json
# Clear ERA25_FROZEN_AFTER_TERMINAL_CLOSURE_WITNESS_ENV_KEYS before attest:
# ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_ATTESTED=1
# ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_REPORT_REVIEWED=1
npm run ops:sync-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-baseline -- --write
npm run test:ci:era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-era69
npm run test:ci:governance-bundles
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** Commercial ops rhythm permanence active · improvement loop integrity PASS · terminal closure witness integrity PASS · `postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive` true after honest attest+baseline · dual cert green.

---

## Integrity chain (era69)

```
evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity
  → evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity (era68, rhythmPermanenceIntegrityOverride in UI)
  → evaluateContinuousImprovementLoopIntegrity (era34)
  → detectEra25GovernanceReopenClaimedAfterTerminalClosureWitness
  → postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive when baseline or honest attest
```

**Blocking violations when terminal closure witness started:** `terminal_closure_witness_without_rhythm_permanence`, `terminal_closure_witness_claims_governance_reopen`, `continuous_improvement_loop_integrity_fail`, `fake_terminal_closure_witness_*`, upstream era68 fail, `baseline_regression`.

**Tracked env keys:** `ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_ATTESTED`, `ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_REPORT_REVIEWED`

**Frozen keys:** `ERA25_FROZEN_AFTER_TERMINAL_CLOSURE_WITNESS_ENV_KEYS` = rhythm permanence frozen + rhythm permanence tracked

**Baseline artifact:** `artifacts/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity` | JSON Band A terminal closure witness gate |
| `ops:sync-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-baseline` | Record honest baseline (requires rhythm permanence + improvement loop PASS) |
| `test:ci:era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-era69` | Unit + cert-live wiring |
| `test:ci:era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-era69:cert` | Cert-live only |

Workflow: `.github/workflows/ops-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-validate.yml`

Cert chains: `test:ci:governance-bundles:partition-platform`, `test:ci:commercial-pilot-runbook:cert`, `test:ci:pure-operational-mode-terminus-era25:cert`

---

## Nesting chain (UI)

```
permanence (era65)
  → capstone witness (era66)
    → steady product mode witness (era67)
      → commercial ops rhythm permanence (era68)
        → Band A governance terminal closure witness (era69)
          → [era70 steady operator playbook lock — planned]
```

---

## Next step — Phase AT (era70)

**Era25 post-terminal-closure steady operator playbook lock integrity** — after terminal closure witness, locks operator playbook into pure improvement-loop + commercial artifact rhythm with zero era25 env mutation forever.

| Item | Planned |
|------|---------|
| Prerequisite milestone | Honest `era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness` baseline + dual cert green |
| Parent evaluator | era69 post-rhythm-permanence Band A governance terminal closure witness integrity |
| Platform anchor | `#era25-post-terminal-closure-steady-operator-playbook-lock` (planned) |
| Briefing meta priority | **45** (planned) |
| Env keys (planned) | `ERA25_POST_TERMINAL_CLOSURE_STEADY_OPERATOR_PLAYBOOK_LOCK_ERA25_ATTESTED`, `..._REPORT_REVIEWED` |
| Baseline artifact | `artifacts/era25-post-terminal-closure-steady-operator-playbook-lock-integrity-baseline.json` (planned) |
| Violation IDs (planned) | `steady_operator_playbook_lock_without_terminal_closure_witness`, `steady_operator_playbook_lock_claims_governance_reopen`, `fake_steady_operator_playbook_lock_*`, upstream era69 fail |
| CI | `test:ci:era25-post-terminal-closure-steady-operator-playbook-lock-integrity-era70` |

**Human acceptance (preview):** terminal closure witness PASS → attest steady operator playbook lock → validate JSON → operator enters pure post-governance steady state with zero era25 env mutation forever; only improvement loop + honest commercial artifacts remain mutable surfaces.
