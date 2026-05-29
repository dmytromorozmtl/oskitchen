# KitchenOS — era25 Market Leader Positioning Convergence

**Status:** **Seventh era25 product slice · IMPLEMENTED · BLOCKED until Series A convergence ready**

**Policy:** `era25-market-leader-positioning-convergence-v1` · Orchestrator `era25-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-v1`  
**Backlog:** `KOS-E25-007-MARKET-LEADER` · **NOT in linear catalog · NOT Step 18**

**Prerequisite:** `series_a_partner_expansion_convergence_era25_ready` + competitor leapfrog roadmap reviewed

---

## Declaration

Seventh **era25 product engineering slice** — wires **Market leader positioning pillars 1–4** to platform ops after Series A / partner expansion.

| Rule | Verdict |
|------|---------|
| Start before Series A convergence ready | **FORBIDDEN** |
| Fake market leader PASS in artifacts or env | **FORBIDDEN** |
| Claim category leadership without audited proof | **FORBIDDEN** |
| Re-open era21 gate chain for steady-state | **FORBIDDEN** |

---

## Milestones (`marketLeaderPositioningConvergenceEra25Milestone`)

| Milestone | Meaning | Orchestrator exit |
|-----------|---------|-------------------|
| `series_a_convergence_regression_blocked` | Series A slice not ready | `2` |
| `pillar1_category_narrative` | Category narrative incomplete | `0` |
| `pillar2_competitive_moat_proof` | Competitive moat proof missing | `0` |
| `pillar3_analyst_press_kit` | Analyst-ready brief not published | `0` |
| `pillar4_expansion_revenue_motion` | Expansion revenue motion incomplete | `0` |
| `market_leader_positioning_convergence_era25_ready` | All pillars complete | `0` |

**Smoke readiness flags:**

- `readyForSeriesAConvergenceRegressionSmokes` — Series A convergence blocked
- `readyForMoatSmokes` — moat pillar smokes ready
- `readyForAnalystKitSmokes` — analyst kit smokes ready

---

## Ops commands

```bash
npm run ops:validate-market-leader-positioning-convergence-era25 -- --json
npm run ops:run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25 -- --json
npm run ops:run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25 -- --write
npm run ops:sync-market-leader-positioning-convergence-era25-report -- --write

npm run test:ci:market-leader-positioning-convergence-era25
npm run test:ci:market-leader-positioning-convergence-era25:cert
npm run test:ci:series-a-partner-expansion-convergence-era25
npm run test:ci:commercial-pilot-runbook:cert
```

**Artifacts:** `artifacts/market-leader-positioning-convergence-era25-report.md` · reuses era21 `MARKET_LEADER_*` env + moat/analyst artifacts

**Workflow:** `.github/workflows/ops-market-leader-positioning-convergence-era25-validate.yml`

**Platform ops:** `#era25-market-leader-positioning-convergence` (nested under `#era25-series-a-partner-expansion-convergence`)

**Launch Wizard:** `#launch-wizard-commercial-blockers` + `MarketLeaderPositioningConvergenceEra25Strip`

---

## Convergence targets

| ID | Surface | KitchenOS link |
|----|---------|----------------|
| `positioning_pillars_panel` | Market leader pillars 1–4 on platform ops | Commercial pilot ops |
| `briefing_action` | Ranked action on blocked pillar | Owner Daily Briefing hero |
| `launch_wizard` | Inline positioning pillars progress | `/dashboard/launch-wizard` |
| `category_narrative` | Category narrative + moat proof honesty | ICP landings + `/dashboard/reports` |

---

## Engineering wiring

| Component | Artifact |
|-----------|----------|
| Positioning state loader | `lib/commercial/load-market-leader-positioning-convergence-state-era25.ts` |
| Briefing + launch wizard slice | `lib/briefing/market-leader-positioning-convergence-briefing-era25.ts` |
| Evaluation | `lib/commercial/evaluate-market-leader-positioning-convergence-era25.ts` |
| Orchestrator | `lib/commercial/market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25.ts` |
| UI slice | `lib/commercial/market-leader-positioning-convergence-ui-era25.ts` |
| Launch strip | `components/dashboard/launch-wizard/market-leader-positioning-convergence-era25-strip.tsx` |

Reuses era21: `market-leader-positioning-phases-era21`, `validate-market-leader-positioning-env`, post-Series-A orchestrator chain.

**Platform ops nesting:**

```
#era25-engineering-gates
  └── … → #era25-series-a-partner-expansion-convergence
              └── #era25-market-leader-positioning-convergence
```

**Briefing suppression:** when era25 market leader convergence slice is visible, era21 `buildOwnerDailyBriefingMarketLeaderPositioningAction` is suppressed.

---

## Human gate (never auto-PASS)

1. `series_a_partner_expansion_convergence_era25_ready`
2. Category narrative aligned with competitor leapfrog roadmap
3. Competitive moat proof from feature maturity matrix + gap matrix
4. Analyst-ready brief published with honest claims review
5. Expansion revenue motion from pilot #1 metrics baseline

---

## Next step (after convergence ready)

See [`next-era25-sustained-operational-excellence-convergence-2026-05-28.md`](./next-era25-sustained-operational-excellence-convergence-2026-05-28.md) — **sustained operational excellence on platform ops**

---

## Related docs

- [`next-era25-series-a-partner-expansion-convergence-2026-05-28.md`](./next-era25-series-a-partner-expansion-convergence-2026-05-28.md)
- [`next-step-8-market-leader-positioning-2026-05-28.md`](./next-step-8-market-leader-positioning-2026-05-28.md) — era21 reference

---

**Never fake market leader PASS. Blocked pillars are normal until operator execution.**
