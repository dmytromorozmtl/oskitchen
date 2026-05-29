# KitchenOS — Phase AB: Era25 market leader positioning convergence (post-honest Series A)

**Status:** Product surfaces + market leader convergence integrity guard **IMPLEMENTED** · Human market leader attestation **REQUIRED**  
**Policy:** `era25-market-leader-positioning-convergence-v1` · Integrity `era52-market-leader-positioning-convergence-integrity-v1`  
**Playbook:** [`docs/next-era25-market-leader-positioning-convergence-2026-05-28.md`](./next-era25-market-leader-positioning-convergence-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-series-a-partner-expansion-convergence-phase-aa-product-2026-05-28.md`](./next-step-series-a-partner-expansion-convergence-phase-aa-product-2026-05-28.md) → honest `series_a_partner_expansion_convergence_era25_ready`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-market-leader-positioning-convergence` | Pillars 1–4 progress · Reports + category narrative links |
| Launch Wizard | Today strip | Market leader progress · integrity FAIL badge |
| Owner Briefing | priority **27** (meta) | Ranked action when market leader blocked |
| Owner Briefing | priority **7** (pillar action) | Existing pillar-level action via `market-leader-positioning-convergence-briefing-era25` |
| Platform ops | `#era25-market-leader-positioning-convergence` | Post-Series A orchestrator (nested under Series A panel) |
| Commercial blockers | Inline strip | Nested under Series A convergence when visible |

---

## Human sequence (canonical)

```bash
npm run ops:validate-series-a-partner-expansion-convergence-integrity -- --json
npm run ops:validate-market-leader-positioning-convergence-integrity -- --json
npm run ops:run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25 -- --write
# After series_a_partner_expansion_convergence_era25_ready + pillars 1–4 MARKET_LEADER_* env:
# MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ATTESTED=1
# After market leader report sync + human review:
# MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_REVIEWED=1
npm run ops:validate-market-leader-positioning-convergence-era25 -- --json
npm run ops:validate-market-leader-positioning-env -- --json
npm run ops:sync-market-leader-positioning-convergence-era25-report -- --write
npm run test:ci:market-leader-positioning-convergence-era25
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-market-leader-positioning-convergence-integrity -- --json
npm run ops:sync-market-leader-positioning-convergence-integrity-baseline -- --write
```

**Acceptance:** Series A convergence integrity PASS · `market_leader_positioning_convergence_era25_ready` · all blocking pillars complete · per-customer GO isolation · honest category narrative + moat proof · zero illegal era25 artifacts.

---

## Integrity chain (era52)

```
evaluateMarketLeaderPositioningConvergenceIntegrity
  → evaluateSeriesAPartnerExpansionConvergenceIntegrity (era51)
    → evaluateScaleReadinessConvergenceIntegrity (era50)
      → … → P0 GO
```

**Blocking violations when train started:** `market_leader_started_without_series_a_convergence_ready`, `fake_market_leader_convergence_attestation`, `fake_market_leader_convergence_report_attestation`, upstream integrity fails, `baseline_regression`.

**Tracked env keys:** `MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ATTESTED`, `MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_REVIEWED`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-market-leader-positioning-convergence-integrity` | JSON integrity gate |
| `ops:sync-market-leader-positioning-convergence-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:market-leader-positioning-convergence-integrity-era52` | Unit + cert-live wiring |
| `test:ci:market-leader-positioning-convergence-era25` | Full era25 market leader convergence slice suite |

Workflow: `.github/workflows/ops-market-leader-positioning-convergence-integrity-validate.yml`

---

## Next step — Phase AC (era53)

**Sustained operational excellence convergence era25 integrity** — chains `evaluateMarketLeaderPositioningConvergenceIntegrity` (era52), Launch Wizard `#launch-wizard-era25-sustained-operational-excellence-convergence`, Owner Briefing priority **28**, maintenance nested under `#era25-market-leader-positioning-convergence` → `#era25-sustained-operational-excellence-convergence`.

Prerequisite milestone: `market_leader_positioning_convergence_era25_ready` · env `SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_*` (to be added when Phase AC starts).
