# OS Kitchen — era25 Series A / Partner Expansion Convergence

**Status:** **Sixth era25 product slice · IMPLEMENTED · BLOCKED until scale convergence ready**

**Policy:** `era25-series-a-partner-expansion-convergence-v1` · Orchestrator `era25-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-v1`  
**Backlog:** `KOS-E25-006-SERIES-A` · **NOT in linear catalog · NOT Step 18**

**Prerequisite:** `scale_readiness_convergence_era25_ready` + data room index published

---

## Declaration

Sixth **era25 product engineering slice** — wires **Series A / partner expansion tracks A–D** to platform ops after scale readiness.

| Rule | Verdict |
|------|---------|
| Start before scale convergence ready | **FORBIDDEN** |
| Fake Series A PASS in artifacts or env | **FORBIDDEN** |
| Claim audited financials without artifact chain | **FORBIDDEN** |
| Re-open era21 gate chain for steady-state | **FORBIDDEN** |

---

## Milestones (`seriesAPartnerExpansionConvergenceEra25Milestone`)

| Milestone | Meaning | Orchestrator exit |
|-----------|---------|-------------------|
| `scale_convergence_regression_blocked` | Scale slice not ready | `2` |
| `track_a_series_a_data_room` | Data room bundle incomplete | `0` |
| `track_b_partner_channel_expansion` | Partner one-pager missing | `0` |
| `track_c_multi_region_playbook` | Multi-region playbook incomplete | `0` |
| `track_d_customer_success_repeatability` | CS repeatability gates missing | `0` |
| `series_a_partner_expansion_convergence_era25_ready` | All four tracks complete | `0` |

**Smoke readiness flags:**

- `readyForScaleConvergenceRegressionSmokes` — scale convergence blocked
- `readyForDataRoomSmokes` — data room smokes ready
- `readyForPartnerSmokes` — Woo/Shopify partner smokes ready

---

## Ops commands

```bash
npm run ops:validate-series-a-partner-expansion-convergence-era25 -- --json
npm run ops:run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25 -- --json
npm run ops:run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25 -- --write
npm run ops:sync-series-a-partner-expansion-convergence-era25-report -- --write

npm run test:ci:series-a-partner-expansion-convergence-era25
npm run test:ci:series-a-partner-expansion-convergence-era25:cert
npm run test:ci:scale-readiness-convergence-era25
npm run test:ci:commercial-pilot-runbook:cert
```

**Artifacts:** `artifacts/series-a-partner-expansion-convergence-era25-report.md` · reuses era21 `SERIES_A_*` env + data room/partner artifacts

**Workflow:** `.github/workflows/ops-series-a-partner-expansion-convergence-era25-validate.yml`

**Platform ops:** `#era25-series-a-partner-expansion-convergence` (nested under `#era25-scale-readiness-convergence`)

**Launch Wizard:** `#launch-wizard-commercial-blockers` + `SeriesAPartnerExpansionConvergenceEra25Strip`

---

## Convergence targets

| ID | Surface | OS Kitchen link |
|----|---------|----------------|
| `series_a_tracks_panel` | Series A tracks A–D on platform ops | Commercial pilot ops |
| `briefing_action` | Ranked action on blocked track | Owner Daily Briefing hero |
| `launch_wizard` | Inline Series A tracks progress | `/dashboard/launch-wizard` |
| `partner_channel` | Partner channel + integrations honesty | `/integrations` + ICP landings |

---

## Engineering wiring

| Component | Artifact |
|-----------|----------|
| Series A state loader | `lib/commercial/load-series-a-partner-expansion-convergence-state-era25.ts` |
| Briefing + launch wizard slice | `lib/briefing/series-a-partner-expansion-convergence-briefing-era25.ts` |
| Evaluation | `lib/commercial/evaluate-series-a-partner-expansion-convergence-era25.ts` |
| Orchestrator | `lib/commercial/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25.ts` |
| UI slice | `lib/commercial/series-a-partner-expansion-convergence-ui-era25.ts` |
| Launch strip | `components/dashboard/launch-wizard/series-a-partner-expansion-convergence-era25-strip.tsx` |

**Platform ops nesting:**

```
#era25-engineering-gates
  └── … → #era25-scale-readiness-convergence
              └── #era25-series-a-partner-expansion-convergence
```

**Briefing suppression:** when era25 Series A convergence slice is visible, era21 `buildOwnerDailyBriefingSeriesAPartnerExpansionAction` is suppressed.

---

## Human gate (never auto-PASS)

1. `scale_readiness_convergence_era25_ready`
2. Series A data room bundle + competitor feature gap matrix
3. Partner channel one-pager + Woo/Shopify integration honesty
4. Multi-region pilot playbook + forbidden claims review
5. Customer success repeatability — NPS baseline + expansion revenue artifact

---

## Next step (after convergence ready)

See [`next-era25-sustained-operational-excellence-convergence-2026-05-28.md`](./next-era25-sustained-operational-excellence-convergence-2026-05-28.md) — **sustained operational excellence on platform ops** (via market leader convergence first: [`next-era25-market-leader-positioning-convergence-2026-05-28.md`](./next-era25-market-leader-positioning-convergence-2026-05-28.md))

---

## Related docs

- [`next-era25-scale-readiness-convergence-2026-05-28.md`](./next-era25-scale-readiness-convergence-2026-05-28.md)
- [`next-step-7-series-a-partner-expansion-2026-05-28.md`](./next-step-7-series-a-partner-expansion-2026-05-28.md) — era21 reference

---

**Never fake Series A PASS. Blocked tracks are normal until operator execution.**
