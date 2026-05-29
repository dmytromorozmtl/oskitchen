# KitchenOS — Phase AF: Era25 sustained product evolution re-entrant integrity (post-train-closure)

**Status:** Product surfaces + re-entrant integrity guard **IMPLEMENTED** · Human re-entrant attestation **REQUIRED**  
**Policy:** `era56-sustained-product-evolution-re-entrant-phases-v1` · Integrity `era56-sustained-product-evolution-re-entrant-integrity-v1`  
**Prerequisite:** [`docs/next-step-era25-commercial-pilot-convergence-train-closure-phase-ae-product-2026-05-28.md`](./next-step-era25-commercial-pilot-convergence-train-closure-phase-ae-product-2026-05-28.md) → honest era25 commercial pilot convergence train closure

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-sustained-product-evolution-re-entrant` | Improvement-loop-only product evolution after train closure |
| Launch Wizard | Today strip | Re-entrant progress · linear convergence reopened badge |
| Owner Briefing | priority **31** (meta) | Ranked action when re-entrant blocked |
| Platform ops | `#sustained-product-evolution-re-entrant` | Nested under train closure rollup panel |
| Maintenance | Nested under train closure | Improvement loop / linear-reopen badges + validate/sync commands |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-commercial-pilot-convergence-train-closure-integrity -- --json
npm run ops:sync-era25-commercial-pilot-convergence-train-closure-integrity-baseline -- --write
npm run ops:validate-continuous-improvement-loop-integrity -- --json
npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write
npm run ops:validate-sustained-product-evolution-integrity -- --json
npm run ops:validate-sustained-product-evolution-re-entrant-integrity -- --json
# After train closure honest + improvement loop active + no era25 linear convergence env keys:
# SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_ATTESTED=1
# SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_REPORT_REVIEWED=1
npm run ops:sync-sustained-product-evolution-re-entrant-integrity-baseline -- --write
npm run test:ci:sustained-product-evolution-re-entrant-integrity-era56
npm run test:ci:commercial-pilot-runbook:cert
```

**Acceptance:** Train closure integrity PASS · improvement loop active · product evolution integrity PASS · no era25 linear convergence attest env keys · re-entrant integrity PASS · era25 convergence Launch Wizard / briefing strips remain suppressed via `shouldSuppressEra25ProductConvergenceSurfaces`.

---

## Integrity chain (era56)

```
evaluateSustainedProductEvolutionReentrantIntegrity
  → evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity (era55)
  → evaluateSustainedProductEvolutionIntegrity (era35)
  → resolveContinuousImprovementLoopActive (era22)
  → detectEra25LinearConvergenceSurfaceReopened (era47–AC env keys)
```

**Blocking violations when train started:** `reentrant_evolution_without_train_closure`, `linear_convergence_surface_reopened`, `improvement_loop_not_active`, `fake_reentrant_*`, upstream era55/era35 fails, `baseline_regression`.

**Tracked env keys:** `SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_ATTESTED`, `SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_REPORT_REVIEWED`

**Baseline artifact:** `artifacts/sustained-product-evolution-re-entrant-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-sustained-product-evolution-re-entrant-integrity` | JSON re-entrant gate |
| `ops:sync-sustained-product-evolution-re-entrant-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:sustained-product-evolution-re-entrant-integrity-era56` | Unit + cert-live wiring |
| `test:ci:sustained-product-evolution-re-entrant-integrity-era56:cert` | Cert-live only (chained in runbook cert) |

Workflow: `.github/workflows/ops-sustained-product-evolution-re-entrant-integrity-validate.yml`

---

## Next step — Phase AG (era57)

**Era25 post-re-entrant operator charter lock integrity** — freeze era25 linear convergence artifacts and charter-adjacent env keys after honest re-entrant baseline; governance-bundle cert only.

| Item | Value |
|------|-------|
| Prerequisite milestone | Honest `sustained-product-evolution-re-entrant` baseline + runbook cert green |
| Parent evaluator | era56 re-entrant integrity |
| Platform anchor | `#era25-post-re-entrant-charter-lock` |
| Briefing meta priority | **32** |
| Env keys (planned) | `ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_ATTESTED`, `..._REPORT_REVIEWED` |
| Baseline artifact | `artifacts/era25-post-re-entrant-charter-lock-integrity-baseline.json` |
| Violation IDs (planned) | `charter_lock_without_reentrant_honest`, `era25_linear_env_mutation_after_lock`, `fake_charter_lock_attestation`, upstream era56 fail |
| CI | `test:ci:era25-post-re-entrant-charter-lock-integrity-era57` + extend governance-bundles cert |

**Human acceptance (preview):** re-entrant integrity PASS → attest charter lock → validate JSON → zero mutable era25 linear convergence env until next major version policy.
