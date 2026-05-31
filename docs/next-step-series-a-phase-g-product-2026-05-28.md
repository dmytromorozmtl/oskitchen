# OS Kitchen — Phase G: Series A / partner expansion (post-honest Scale)

**Status:** Product surfaces + Series A integrity guard **IMPLEMENTED** · Human Gates A–D **REQUIRED**  
**Policy:** `era21-series-a-partner-expansion-v1` · Integrity `era31-series-a-partner-expansion-integrity-v1`  
**Playbook:** [`docs/next-step-7-series-a-partner-expansion-2026-05-28.md`](./next-step-7-series-a-partner-expansion-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-scale-phase-f-product-2026-05-28.md`](./next-step-scale-phase-f-product-2026-05-28.md) → honest Scale complete

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-series-a` | Series A tracks · integrity badge |
| Launch Wizard | Commercial blockers | Tracks A–D panel |
| Today strip | `launch-wizard-today-strip-series-a` | Series A N/4 tracks · integrity FAIL |
| Owner Briefing | priority 6 | Ranked action per next track |
| Platform ops | `#series-a-partner-expansion` | Post-Scale orchestrator commands |

---

## Human sequence (canonical)

```bash
npm run ops:validate-scale-readiness-integrity -- --json
npm run ops:validate-series-a-partner-expansion-integrity -- --json
npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write
npm run ops:export-series-a-partner-expansion-env-template -- --write
# Tracks A–D: record SERIES_A_* env after real milestones
npm run smoke:competitor-feature-gap-matrix
npm run smoke:investor-narrative-onepager
npm run smoke:woo-shopify-live
npm run ops:validate-series-a-partner-expansion-integrity -- --json
npm run ops:sync-series-a-partner-expansion-integrity-baseline -- --write
```

**Acceptance:** Tracks A–D complete · competitor matrix `evidence_aligned_era17` · data room chain honest · no LIVE partner claims without `smoke:woo-shopify-live`.

**Then:** Market leader positioning train — `ops:run-market-leader-positioning-post-series-a-orchestrator`.

---

## STOP rules

- `SERIES_A_*` env without honest Scale → `series_a_started_without_scale`
- Competitor matrix `overall: PASSED` with `certPassed: false` → `fake_competitor_matrix_pass`
- Scale integrity FAIL while Series A panel visible → blocked badge on Today + Launch Wizard

---

## Next step after Phase G PASS

1. Market leader positioning integrity guard (Phase H) — **IMPLEMENTED** — see [`docs/next-step-market-leader-phase-h-product-2026-05-28.md`](./next-step-market-leader-phase-h-product-2026-05-28.md)
2. `npm run ops:run-market-leader-positioning-post-series-a-orchestrator -- --write`

**Following engineering slice (optional):** Sustained operational excellence integrity (Phase I) · PostHog on Series A track CTAs.
