# OS Kitchen — Шаг 7: Series A / partner expansion (после Scale readiness complete)

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
npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write
npm run ops:validate-scale-readiness-env -- --json        # scaleComplete: true
npm run ops:validate-series-a-partner-expansion-env -- --json
npm run ops:export-series-a-partner-expansion-env-template -- --write
npm run ops:sync-series-a-partner-expansion-progress-report -- --write
npm run ops:export-series-a-partner-expansion-readiness-checklist -- --write
npm run smoke:investor-narrative-onepager
npm run smoke:competitor-feature-gap-matrix
npm run test:ci:commercial-pilot-runbook:cert
```

**Post-Scale orchestrator milestones (`seriesAMilestone`):**

| Milestone | Track | Exit code (orchestrator `--json`) |
|-----------|-------|-----------------------------------|
| `scale_blocked` | Scale gates 1–5 incomplete | `2` |
| `track_a_series_a_data_room` | data room bundle + competitor matrix | `0` |
| `track_b_partner_channel_expansion` | partner one-pager + integration honesty | `0` |
| `track_c_multi_region_playbook` | multi-region playbook + claims review | `0` |
| `track_d_customer_success_repeatability` | CS playbook + NPS/support metrics | `0` |
| `series_a_complete` | Tracks A–D done | `0` |

**Product surfaces active after Scale complete (Series A incomplete):**

| Surface | Expected |
|---------|----------|
| `/dashboard/today` | Series A ranked action (priority 6) + compact panel |
| `/dashboard/launch-wizard` | Series A tracks in commercial blockers |
| Platform → Pilot ops | `#series-a-partner-expansion` panel |
| `/solutions/ghost-kitchens` + `/integrations` | partner channel surfaces |
| `/dashboard/reports` | data room KPI source |

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

| Partner motion | OS Kitchen surface |
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
npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write
npm run ops:validate-series-a-partner-expansion-env -- --json
npm run ops:export-series-a-partner-expansion-env-template -- --write
npm run ops:sync-series-a-partner-expansion-progress-report -- --write
npm run ops:export-series-a-partner-expansion-readiness-checklist -- --write
npm run test:ci:series-a-partner-expansion-era21
npm run test:ci:series-a-partner-expansion-era21:cert
```

GitHub workflow: `.github/workflows/ops-series-a-partner-expansion-validate.yml` (includes orchestrator step with `continue-on-error: true`)

**Readiness checklist artifact:** `docs/series-a-partner-expansion-readiness-checklist.md` (generated via export script — do not hand-edit PASS states)

---

## Deliverables checklist

- [ ] Data room bundle with artifact hashes (no manual PASS edits)
- [ ] Partner one-pager with honest integration maturity
- [ ] Multi-region staging runbook drafted
- [ ] CS playbook with real Week 1 → Month 2 metrics from pilot #1
- [ ] Second+ customer GO artifacts isolated per Gate 1 policy
- [ ] No hand-edited PASS in `artifacts/*.json`
- [ ] `artifacts/series-a-partner-expansion-progress-report.md` synced
- [ ] `docs/series-a-partner-expansion-readiness-checklist.md` exported via orchestrator

---

## Step 8 preview — Market leader positioning (orchestrator plan)

See [`next-step-8-market-leader-positioning-2026-05-28.md`](./next-step-8-market-leader-positioning-2026-05-28.md)

**Next engineering slice (Step 8, same pattern as Steps 1–7):**

| Component | Planned artifact |
|-----------|------------------|
| Orchestrator lib | `lib/commercial/market-leader-positioning-post-series-a-orchestrator-era21.ts` |
| Policy | `era21-market-leader-positioning-post-series-a-orchestrator-v1` |
| Milestones | `series_a_blocked` → `pillar1_category_narrative` → `pillar2_moat_proof` → `pillar3_analyst_kit` → `pillar4_expansion_motion` → `market_leader_complete` |
| Ops scripts | `ops:run-market-leader-positioning-post-series-a-orchestrator`, `ops:export-market-leader-positioning-readiness-checklist` |
| Validate env | add `marketLeaderMilestone` + `readyForMoatSmokes` to JSON |
| UI slice | milestone badge + redirect to Series A orchestrator when `series_a_blocked` |
| Briefing priority | **7** (mutually exclusive with Steps 1–6) |
| CI workflow | orchestrator step in `ops-market-leader-positioning-validate.yml` |

**Human gate before Step 8:** all Series A tracks A–D complete — `seriesAComplete: true` in validate JSON.

**Immediate action if Scale incomplete:** [`next-step-6-scale-readiness-2026-05-28.md`](./next-step-6-scale-readiness-2026-05-28.md)
