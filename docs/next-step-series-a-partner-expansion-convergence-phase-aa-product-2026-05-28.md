# KitchenOS — Phase AA: Era25 Series A partner expansion convergence (post-honest scale)

**Status:** Product surfaces + Series A convergence integrity guard **IMPLEMENTED** · Human Series A attestation **REQUIRED**  
**Policy:** `era25-series-a-partner-expansion-convergence-v1` · Integrity `era51-series-a-partner-expansion-convergence-integrity-v1`  
**Playbook:** [`docs/next-era25-series-a-partner-expansion-convergence-2026-05-28.md`](./next-era25-series-a-partner-expansion-convergence-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-scale-readiness-convergence-phase-z-product-2026-05-28.md`](./next-step-scale-readiness-convergence-phase-z-product-2026-05-28.md) → honest `scale_readiness_convergence_era25_ready`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-series-a-partner-expansion-convergence` | Tracks A–D progress · Reports + Integration Health links |
| Launch Wizard | Today strip | Series A progress · integrity FAIL badge |
| Owner Briefing | priority **26** (meta) | Ranked action when Series A blocked |
| Owner Briefing | priority **6** (track action) | Existing track-level action via `series-a-partner-expansion-convergence-briefing-era25` |
| Platform ops | `#era25-series-a-partner-expansion-convergence` | Post-scale orchestrator (nested under scale panel) |
| Commercial blockers | Inline strip | Nested under scale convergence when visible |

---

## Human sequence (canonical)

```bash
npm run ops:validate-scale-readiness-convergence-integrity -- --json
npm run ops:validate-series-a-partner-expansion-convergence-integrity -- --json
npm run ops:run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25 -- --write
# After scale_readiness_convergence_era25_ready + tracks A–D SERIES_A_* env:
# SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ATTESTED=1
# After Series A report sync + human review:
# SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_REVIEWED=1
npm run ops:validate-series-a-partner-expansion-convergence-era25 -- --json
npm run ops:validate-series-a-partner-expansion-env -- --json
npm run ops:sync-series-a-partner-expansion-convergence-era25-report -- --write
npm run test:ci:series-a-partner-expansion-convergence-era25
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-series-a-partner-expansion-convergence-integrity -- --json
npm run ops:sync-series-a-partner-expansion-convergence-integrity-baseline -- --write
```

**Acceptance:** Scale convergence integrity PASS · `series_a_partner_expansion_convergence_era25_ready` · all blocking tracks complete · per-customer GO isolation · honest data room + partner artifacts · zero illegal era25 artifacts.

---

## Integrity chain (era51)

```
evaluateSeriesAPartnerExpansionConvergenceIntegrity
  → evaluateScaleReadinessConvergenceIntegrity (era50)
    → evaluateMonth2MarketReadinessConvergenceIntegrity (era49)
      → … → P0 GO
```

**Blocking violations when train started:** `series_a_started_without_scale_convergence_ready`, `fake_series_a_convergence_attestation`, `fake_series_a_convergence_report_attestation`, upstream integrity fails, `baseline_regression`.

**Tracked env keys:** `SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ATTESTED`, `SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_REVIEWED`

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-series-a-partner-expansion-convergence-integrity` | JSON integrity gate |
| `ops:sync-series-a-partner-expansion-convergence-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:series-a-partner-expansion-convergence-integrity-era51` | Unit + cert-live wiring |
| `test:ci:series-a-partner-expansion-convergence-era25` | Full era25 Series A convergence slice suite |

Workflow: `.github/workflows/ops-series-a-partner-expansion-convergence-integrity-validate.yml`

---

## Following — Phase AB (era52)

**IMPLEMENTED** — see [`docs/next-step-market-leader-positioning-convergence-phase-ab-product-2026-05-28.md`](./next-step-market-leader-positioning-convergence-phase-ab-product-2026-05-28.md).

**Next:** Phase AC (era53) sustained operational excellence convergence integrity.
