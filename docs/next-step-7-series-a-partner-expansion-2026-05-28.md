# KitchenOS — Шаг 7: Series A / partner expansion (после Scale readiness complete)

**Policy:** `era21-series-a-partner-expansion-v1` · **Backlog:** `KOS-E21-007`  
**Предусловие:** Scale readiness blocking gates 1–5 complete; data room index published  
**Цель:** Fundraise-ready narrative + partner channel motion + multi-region pilot playbook

---

## Decision tree

```
Scale complete (era21 scale panels hidden)
        │
        ├── Track A: Series A data room (audited artifacts + financial model)
        ├── Track B: Strategic partner integrations (Woo/Shopify expansion)
        ├── Track C: Multi-region pilot playbook (EU/US staging honesty)
        └── Track D: Customer success repeatability (NPS + expansion revenue)
                │
                ▼
         Market leader positioning review (Step 8)
```

---

## Engineering wiring (era21)

| Surface | When visible |
|---------|--------------|
| `/dashboard/today` | Top action priority **6** + compact Series A panel |
| `/dashboard/launch-wizard` | Series A tracks in commercial blockers |
| Platform → Pilot ops | `#series-a-partner-expansion` phases panel |

**Gate chain (mutually exclusive):** P0 (0) → Tier2 (1) → GO (2) → Week1 (3) → Month2 (4) → Scale (5) → **Series A (6)**.

**Blocking tracks:** A, B, C, D — all four required.

---

## Preflight

```bash
npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write   # planned — Step 7 orchestrator
npm run ops:validate-scale-readiness-env -- --json        # scaleComplete: true
npm run ops:validate-series-a-partner-expansion-env -- --json
npm run ops:export-series-a-partner-expansion-env-template -- --write
npm run ops:sync-series-a-partner-expansion-progress-report -- --write
npm run ops:export-series-a-partner-expansion-readiness-checklist -- --write   # planned
npm run smoke:investor-narrative-onepager
npm run smoke:competitor-feature-gap-matrix
npm run test:ci:commercial-pilot-runbook:cert
```

**Planned post-Scale orchestrator milestones (`seriesAMilestone`):**

| Milestone | Track | Blocking? |
|-----------|-------|-----------|
| `scale_blocked` | Scale gates 1–5 incomplete | prerequisite |
| `track_a_data_room` | `SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED=1` | yes |
| `track_b_partner_channel` | partner one-pager + Woo/Shopify smoke honesty | yes |
| `track_c_multi_region` | multi-region playbook drafted | yes |
| `track_d_cs_playbook` | CS playbook with real pilot metrics | yes |
| `series_a_complete` | Tracks A–D done | terminal |

**Wiring surfaces when Series A incomplete:** briefing priority **6**, Launch Wizard commercial blockers, Platform `#series-a-partner-expansion`. Redirect to Scale orchestrator when `scale_blocked`.

---

## Track A — Series A data room

| Deliverable | Source artifact / doc |
|-------------|----------------------|
| Traction KPI table | `pilot-metrics-baseline-summary.json` |
| Engineering proof | P0 + Tier2 + rollback artifacts |
| Customer narrative | `pilot-case-study-draft-summary.json` (publish gate) |
| Competitive positioning | `docs/competitor-leapfrog-roadmap-2026-05-28.md` |
| Honest maturity map | `docs/feature-maturity-matrix.md` |

```bash
npm run smoke:investor-narrative-onepager
npm run smoke:competitor-feature-gap-matrix
export SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED=1
```

**Prerequisite:** `SCALE_DATA_ROOM_INDEX_PUBLISHED=1` + competitor matrix `evidence_aligned_era17`.

**Forbidden:** Forward-looking revenue guarantees, SOC2 claims without audit, unified inventory/loyalty as shipped.

---

## Track B — Partner channel expansion

| Partner motion | KitchenOS surface |
|----------------|-------------------|
| Woo/Shopify co-marketing | `/solutions/ghost-kitchens`, Integration Health |
| POS hardware partners | `/integrations`, honest capability matrix |
| Meal prep vertical GTM | `/solutions/meal-prep`, production calendar demo |

```bash
npm run smoke:woo-shopify-live
export SERIES_A_PARTNER_ONEPAGER_REVIEWED=1
```

Run `npm run smoke:woo-shopify-live` before any "LIVE marketplace" partner copy.

---

## Track C — Multi-region pilot playbook

```bash
export SCALE_PER_CUSTOMER_GO_ISOLATION=1
export SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED=1
export SERIES_A_MULTI_REGION_PLAYBOOK_DRAFTED=1
```

- Staging URLs per region with honest SKIPPED/PASS labels
- Separate GO artifacts per region pilot (extends Gate 1 isolation policy)
- Forbidden claims review per locale (`MARKETING_CLAIMS_STRICT=1` or `SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED=1`)

---

## Track D — Customer success repeatability

| Metric | Target motion |
|--------|---------------|
| Operator NPS | `PILOT_METRICS_OPERATOR_FEEDBACK_SCORE` |
| Expansion revenue | Track second SKU / second location in metrics baseline |
| Support load | `PILOT_METRICS_SUPPORT_TICKETS_PER_WEEK` trending down |

```bash
npm run smoke:pilot-metrics-baseline
export SERIES_A_CS_PLAYBOOK_REVIEWED=1
```

Owner Briefing daily cadence — operational tiles only after Step 7 complete (no gate panels).

---

## Ops commands

```bash
npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write   # planned
npm run ops:validate-series-a-partner-expansion-env -- --json
npm run ops:export-series-a-partner-expansion-env-template -- --write
npm run ops:sync-series-a-partner-expansion-progress-report -- --write
npm run ops:export-series-a-partner-expansion-readiness-checklist -- --write   # planned
npm run test:ci:series-a-partner-expansion-era21
npm run test:ci:series-a-partner-expansion-era21:cert
```

GitHub workflow: `.github/workflows/ops-series-a-partner-expansion-validate.yml` (+ planned orchestrator step)

**Readiness checklist artifact (planned):** `docs/series-a-partner-expansion-readiness-checklist.md`

---

## Deliverables checklist

- [ ] Data room bundle with artifact hashes (no manual PASS edits)
- [ ] Partner one-pager with honest integration maturity
- [ ] Multi-region staging runbook drafted
- [ ] CS playbook with real Week 1 → Month 2 metrics from pilot #1
- [ ] Second+ customer GO artifacts isolated per Gate 1 policy
- [ ] No hand-edited PASS in `artifacts/*.json`
- [ ] `artifacts/series-a-partner-expansion-progress-report.md` synced

---

## Step 8 preview — Market leader positioning

See [`next-step-8-market-leader-positioning-2026-05-28.md`](./next-step-8-market-leader-positioning-2026-05-28.md)

**Engineering:** `era21-market-leader-positioning-v1` · briefing priority **7** · `#market-leader-positioning`

**Immediate action if Scale incomplete:** [`next-step-6-scale-readiness-2026-05-28.md`](./next-step-6-scale-readiness-2026-05-28.md)
