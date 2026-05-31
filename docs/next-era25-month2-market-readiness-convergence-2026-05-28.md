# OS Kitchen — era25 Month 2 Market Readiness Convergence

**Status:** **Fourth era25 product slice · IMPLEMENTED · BLOCKED until week 1 convergence ready**

**Policy:** `era25-month2-market-readiness-convergence-v1` · Orchestrator `era25-month2-market-readiness-convergence-post-week1-convergence-orchestrator-v1`  
**Backlog:** `KOS-E25-004-MONTH2` · **NOT in linear catalog · NOT Step 18**

**Prerequisite:** `pilot_week1_execution_convergence_era25_ready` + honest metrics baseline artifact

---

## Declaration

Fourth **era25 product engineering slice** — wires **Month 2 market readiness workstreams** to platform ops after pilot week 1.

| Rule | Verdict |
|------|---------|
| Start before week 1 convergence ready | **FORBIDDEN** |
| Fake month 2 PASS in artifacts | **FORBIDDEN** |
| Skip investor one-pager artifact | **FORBIDDEN** |
| Re-open era21 gate chain for steady-state | **FORBIDDEN** |

---

## Milestones (`month2MarketReadinessConvergenceEra25Milestone`)

| Milestone | Meaning | Orchestrator exit |
|-----------|---------|-------------------|
| `week1_convergence_regression_blocked` | Week 1 slice not ready | `2` |
| `awaiting_metrics_baseline_review` | Metrics artifact stale/missing | `0` |
| `awaiting_investor_onepager` | Investor one-pager missing | `0` |
| `awaiting_gtm_icp_landings` | ICP landing review incomplete | `0` |
| `attention_case_study_draft` | Case study not internal-ready | `0` |
| `month2_market_readiness_convergence_era25_ready` | All month 2 artifacts + env | `0` |

**Smoke readiness flags:**

- `readyForWeek1ConvergenceRegressionSmokes` — week 1 convergence blocked
- `readyForInvestorOnepagerSmoke` — metrics baseline PASSED, investor one-pager smokes ready

---

## Ops commands

```bash
npm run ops:validate-month2-market-readiness-convergence-era25 -- --json
npm run ops:run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25 -- --json
npm run ops:run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25 -- --write
npm run ops:sync-month2-market-readiness-convergence-era25-report -- --write

npm run test:ci:month2-market-readiness-convergence-era25
npm run test:ci:month2-market-readiness-convergence-era25:cert
npm run test:ci:pilot-week1-execution-convergence-era25
npm run test:ci:commercial-pilot-runbook:cert
```

**Artifacts:** `artifacts/month2-market-readiness-convergence-era25-report.md` · reuses era21 `MONTH2_*` env + investor/case study artifacts

**Workflow:** `.github/workflows/ops-month2-market-readiness-convergence-era25-validate.yml`

**Platform ops:** `#era25-month2-market-readiness-convergence` (nested under `#era25-pilot-week1-execution-convergence`)

**Launch Wizard:** `#launch-wizard-commercial-blockers` + `Month2MarketReadinessConvergenceEra25Strip`

---

## Convergence targets

| ID | Surface | OS Kitchen link |
|----|---------|----------------|
| `month2_workstreams_panel` | Month 2 workstreams A–E on platform ops | Commercial pilot ops |
| `briefing_action` | Ranked action on blocked workstream | Owner Daily Briefing hero |
| `launch_wizard` | Inline month 2 progress | `/dashboard/launch-wizard` |
| `icp_landings` | ICP landing review convergence | `/solutions/ghost-kitchens` + `/solutions/meal-prep` |

---

## Engineering wiring

| Component | Artifact |
|-----------|----------|
| Month 2 state loader | `lib/commercial/load-month2-market-readiness-convergence-state-era25.ts` |
| Briefing + launch wizard slice | `lib/briefing/month2-market-readiness-convergence-briefing-era25.ts` |
| Evaluation | `lib/commercial/evaluate-month2-market-readiness-convergence-era25.ts` |
| Orchestrator | `lib/commercial/month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25.ts` |
| UI slice | `lib/commercial/month2-market-readiness-convergence-ui-era25.ts` |
| Launch strip | `components/dashboard/launch-wizard/month2-market-readiness-convergence-era25-strip.tsx` |

**Platform ops nesting:**

```
#era25-engineering-gates
  └── #era25-first-product-slice-blueprint
        └── #era25-owner-daily-briefing-breakthrough
              └── #era25-paid-pilot-go-convergence
                    └── #era25-pilot-week1-execution-convergence
                          └── #era25-month2-market-readiness-convergence
```

**Briefing suppression:** when era25 month 2 convergence slice is visible, era21 `buildOwnerDailyBriefingMonth2MarketReadinessAction` is suppressed (same pattern as week 1).

---

## Human gate (never auto-PASS)

1. `pilot_week1_execution_convergence_era25_ready`
2. Metrics baseline artifact `overall: PASSED`
3. Case study draft `internal_draft_ready`
4. Investor one-pager artifact present + `MONTH2_INVESTOR_FOUNDER_SIGNOFF=1`
5. ICP landing review — `MONTH2_GTM_*_LANDING_REVIEWED=1`
6. Leadership review of month 2 readiness checklist

---

## Next step (after convergence ready)

See [`next-era25-series-a-partner-expansion-convergence-2026-05-28.md`](./next-era25-series-a-partner-expansion-convergence-2026-05-28.md) — **Series A / partner expansion on platform ops** (scale implemented — see [`next-era25-scale-readiness-convergence-2026-05-28.md`](./next-era25-scale-readiness-convergence-2026-05-28.md))

---

## Related docs

- [`next-era25-pilot-week1-execution-convergence-2026-05-28.md`](./next-era25-pilot-week1-execution-convergence-2026-05-28.md)
- [`next-step-5-month2-market-readiness-2026-05-28.md`](./next-step-5-month2-market-readiness-2026-05-28.md) — era21 reference

---

**Never fake month 2 PASS. Blocked workstreams are normal until operator execution.**
