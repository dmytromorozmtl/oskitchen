# OS Kitchen — Phase AC: Era25 sustained operational excellence convergence (post-honest market leader)

**Status:** Product surfaces + sustained ops convergence integrity guard **IMPLEMENTED** · Human sustained ops attestation **REQUIRED**  
**Policy:** `era25-sustained-operational-excellence-convergence-v1` · Integrity `era53-sustained-operational-excellence-convergence-integrity-v1`  
**Playbook:** [`docs/next-era25-sustained-operational-excellence-convergence-2026-05-28.md`](./next-era25-sustained-operational-excellence-convergence-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-market-leader-positioning-convergence-phase-ab-product-2026-05-28.md`](./next-step-market-leader-positioning-convergence-phase-ab-product-2026-05-28.md) → honest `market_leader_positioning_convergence_era25_ready`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-sustained-operational-excellence-convergence` | Cadences A–D progress · Order Hub + production calendar links |
| Launch Wizard | Today strip | Sustained ops progress · integrity FAIL badge |
| Owner Briefing | priority **28** (meta) | Ranked action when sustained ops blocked |
| Owner Briefing | priority **8** (cadence action) | Existing cadence-level action via `sustained-operational-excellence-convergence-briefing-era25` |
| Platform ops | `#era25-sustained-operational-excellence-convergence` | Post-market-leader orchestrator (nested under market leader panel) |
| Maintenance | Nested under market leader | Sustained ops integrity FAIL · market leader integrity FAIL badges + validate/sync commands |

---

## Human sequence (canonical)

```bash
npm run ops:validate-market-leader-positioning-convergence-integrity -- --json
npm run ops:validate-sustained-operational-excellence-convergence-integrity -- --json
npm run ops:run-sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25 -- --write
# After market_leader_positioning_convergence_era25_ready + cadences A–D SUSTAINED_OPERATIONAL_EXCELLENCE_* env:
# SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ATTESTED=1
# After sustained ops report sync + human review:
# SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_REVIEWED=1
npm run ops:validate-sustained-operational-excellence-convergence-era25 -- --json
npm run ops:validate-sustained-operational-excellence-env -- --json
npm run ops:sync-sustained-operational-excellence-convergence-era25-report -- --write
npm run test:ci:sustained-operational-excellence-convergence-era25
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-sustained-operational-excellence-convergence-integrity -- --json
npm run ops:sync-sustained-operational-excellence-convergence-integrity-baseline -- --write
```

**Acceptance:** Market leader convergence integrity PASS · `sustained_operational_excellence_convergence_era25_ready` · all blocking cadences complete · per-customer GO isolation · honest daily-shift ops surfaces · zero illegal era25 artifacts.

---

## Integrity chain (era53)

```
evaluateSustainedOperationalExcellenceConvergenceIntegrity
  → evaluateMarketLeaderPositioningConvergenceIntegrity (era52)
    → evaluateSeriesAPartnerExpansionConvergenceIntegrity (era51)
      → … → P0 GO
```

**Blocking violations when train started:** `sustained_ops_started_without_market_leader_convergence_ready`, `fake_sustained_ops_convergence_attestation`, `fake_sustained_ops_convergence_report_attestation`, upstream integrity fails, `baseline_regression`.

**Tracked env keys:** `SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ATTESTED`, `SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_REVIEWED`

**Baseline artifact:** `artifacts/sustained-operational-excellence-convergence-integrity-baseline.json`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-sustained-operational-excellence-convergence-integrity` | JSON integrity gate |
| `ops:sync-sustained-operational-excellence-convergence-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:sustained-operational-excellence-convergence-integrity-era53` | Unit + cert-live wiring |
| `test:ci:sustained-operational-excellence-convergence-era25` | Full era25 sustained ops convergence slice suite (`--no-file-parallelism`) |

Workflow: `.github/workflows/ops-sustained-operational-excellence-convergence-integrity-validate.yml`

---

## Following — Phase AD (era54)

**IMPLEMENTED** — see [`docs/next-step-pure-operational-mode-terminus-convergence-phase-ad-product-2026-05-28.md`](./next-step-pure-operational-mode-terminus-convergence-phase-ad-product-2026-05-28.md).

**Next:** Phase AE (era55) era25 commercial pilot convergence train closure integrity.
