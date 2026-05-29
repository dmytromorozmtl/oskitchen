# KitchenOS — era25 Series A / Partner Expansion Convergence

**Status:** **BLOCKED until `scale_readiness_convergence_era25_ready` · NOT auto-implemented**

**Prerequisite:** Scale convergence ready + data room index published

---

## Declaration

Sixth era25 product convergence slice — wires **Series A / partner expansion tracks** to platform ops after scale readiness.

| Rule | Verdict |
|------|---------|
| Start before scale convergence ready | **FORBIDDEN** |
| Fake Series A PASS in artifacts or env | **FORBIDDEN** |
| Claim audited financials without artifact chain | **FORBIDDEN** |
| Re-open era21 gate chain for steady-state | **FORBIDDEN** |

---

## Pre-flight

```bash
npm run ops:validate-scale-readiness-convergence-era25 -- --json
npm run ops:validate-series-a-partner-expansion-env -- --json
npm run test:ci:commercial-pilot-runbook:cert
```

Expected convergence JSON:

```json
{
  "scaleReadinessConvergenceEra25Milestone": "scale_readiness_convergence_era25_ready",
  "convergenceBlocked": false,
  "scaleComplete": true
}
```

---

## Scope (preview)

| Deliverable | Detail |
|-------------|--------|
| Series A tracks panel | era25 nested under scale on platform ops |
| Briefing ranked action | Open blocked track when not ready (priority 6) |
| Launch Wizard | Inline Series A tracks progress strip |
| Policy | `era25-series-a-partner-expansion-convergence-v1` |
| Backlog | `KOS-E25-006-SERIES-A` |
| Anchor | `#era25-series-a-partner-expansion-convergence` |

---

## Milestones (preview)

| Milestone | Meaning | Exit |
|-----------|---------|------|
| `scale_convergence_regression_blocked` | Scale slice not ready | `2` |
| `track_a_series_a_data_room` | Data room bundle incomplete | `0` |
| `track_b_partner_channel_expansion` | Partner one-pager + integration honesty | `0` |
| `track_c_multi_region_playbook` | Multi-region playbook + claims review | `0` |
| `track_d_customer_success_repeatability` | NPS + expansion revenue gates | `0` |
| `series_a_partner_expansion_convergence_era25_ready` | All four tracks complete | `0` |

---

## Human gate

1. Scale convergence `scale_readiness_convergence_era25_ready`
2. Series A data room bundle + competitor feature gap matrix
3. Partner channel one-pager + Woo/Shopify integration honesty
4. Multi-region pilot playbook + forbidden claims review
5. Customer success repeatability — NPS baseline + expansion revenue artifact

---

## Platform ops nesting (target)

```
#era25-engineering-gates
  └── … → #era25-scale-readiness-convergence
              └── #era25-series-a-partner-expansion-convergence  ← pending
```

---

## Engineering wiring (preview)

| Component | Artifact (planned) |
|-----------|-------------------|
| Series A state loader | `lib/commercial/load-series-a-partner-expansion-convergence-state-era25.ts` |
| Briefing + launch wizard | `lib/briefing/series-a-partner-expansion-convergence-briefing-era25.ts` |
| Evaluation | `lib/commercial/evaluate-series-a-partner-expansion-convergence-era25.ts` |
| Orchestrator | `lib/commercial/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25.ts` |
| UI slice | `lib/commercial/series-a-partner-expansion-convergence-ui-era25.ts` |
| Launch strip | `components/dashboard/launch-wizard/series-a-partner-expansion-convergence-era25-strip.tsx` |

Reuses era21: `series-a-partner-expansion-phases-era21`, `validate-series-a-partner-expansion-env`, post-scale orchestrator chain.

**Briefing suppression:** when era25 Series A convergence slice is visible, era21 `buildOwnerDailyBriefingSeriesAPartnerExpansionAction` is suppressed.

---

## Ops commands (preview)

```bash
npm run ops:validate-series-a-partner-expansion-convergence-era25 -- --json
npm run ops:run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25 -- --json
npm run ops:run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25 -- --write
npm run ops:sync-series-a-partner-expansion-convergence-era25-report -- --write

npm run test:ci:series-a-partner-expansion-convergence-era25
npm run test:ci:series-a-partner-expansion-convergence-era25:cert
npm run test:ci:scale-readiness-convergence-era25
```

---

## Related docs

- [`next-era25-scale-readiness-convergence-2026-05-28.md`](./next-era25-scale-readiness-convergence-2026-05-28.md)
- [`next-step-7-series-a-partner-expansion-2026-05-28.md`](./next-step-7-series-a-partner-expansion-2026-05-28.md) — era21 reference

---

**Never fake Series A PASS. Blocked tracks are normal until operator execution.**
