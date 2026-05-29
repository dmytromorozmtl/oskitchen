# KitchenOS — era25 Pilot Week 1 Execution Convergence

**Status:** **Third era25 product slice · IMPLEMENTED · BLOCKED until GO convergence ready**

**Policy:** `era25-pilot-week1-execution-convergence-v1` · Orchestrator `era25-pilot-week1-execution-convergence-post-go-convergence-orchestrator-v1`  
**Backlog:** `KOS-E25-003-PILOT-W1` · **NOT in linear catalog · NOT Step 18**

**Prerequisite:** `paid_pilot_go_convergence_era25_ready` + honest GO artifact

---

## Declaration

Third **era25 product engineering slice** — wires **Pilot Week 1 day phases** to platform ops after paid pilot GO.

| Rule | Verdict |
|------|---------|
| Start before GO convergence ready | **FORBIDDEN** |
| Fake Day 1–5 PASS in artifacts | **FORBIDDEN** |
| Skip metrics baseline artifact | **FORBIDDEN** |
| Re-open era21 gate chain for steady-state | **FORBIDDEN** |

---

## Milestones (`pilotWeek1ExecutionConvergenceEra25Milestone`)

| Milestone | Meaning | Orchestrator exit |
|-----------|---------|-------------------|
| `go_convergence_regression_blocked` | GO slice not ready | `2` |
| `awaiting_day1_ttv` | Day 1 TTV not recorded | `0` |
| `attention_integration_health` | Day 2 integration health not reviewed | `0` |
| `awaiting_day3_pos_money_path` | Day 3 POS closeout missing | `0` |
| `awaiting_day4_reports_review` | Day 4 reports export missing | `0` |
| `awaiting_metrics_baseline` | Day 5 metrics/case study/GO re-run | `0` |
| `pilot_week1_execution_convergence_era25_ready` | All 5 day phases + artifacts | `0` |

**Smoke readiness flags:**

- `readyForGoConvergenceRegressionSmokes` — GO convergence blocked
- `readyForDay5Smokes` — Days 1–4 complete, Day 5 smokes ready

---

## Ops commands

```bash
npm run ops:validate-pilot-week1-execution-convergence-era25 -- --json
npm run ops:run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25 -- --json
npm run ops:run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25 -- --write
npm run ops:sync-pilot-week1-execution-convergence-era25-report -- --write

npm run test:ci:pilot-week1-execution-convergence-era25
npm run test:ci:pilot-week1-execution-convergence-era25:cert
npm run test:ci:paid-pilot-go-convergence-era25
```

**Artifacts:** `artifacts/pilot-week1-execution-convergence-era25-report.md` · reuses era21 `PILOT_WEEK1_*` env + Day 5 artifacts

**Workflow:** `.github/workflows/ops-pilot-week1-execution-convergence-era25-validate.yml`

**Platform ops:** `#era25-pilot-week1-execution-convergence` (nested under `#era25-paid-pilot-go-convergence`)

**Launch Wizard:** `#launch-wizard-commercial-blockers` + `PilotWeek1ExecutionConvergenceEra25Strip`

---

## Convergence targets

| ID | Surface | KitchenOS link |
|----|---------|----------------|
| `week1_phases_panel` | Week 1 day phases | Commercial pilot ops |
| `briefing_action` | Ranked action on blocked day | Owner Daily Briefing hero |
| `launch_wizard` | Inline week 1 progress | `/dashboard/launch-wizard` |
| `integration_health` | Week 1 cadence banner | `/dashboard/integration-health` |

---

## Engineering wiring

| Component | Artifact |
|-----------|----------|
| Week 1 state loader | `lib/commercial/load-pilot-week1-execution-convergence-state-era25.ts` |
| Briefing + launch strip | `lib/briefing/pilot-week1-execution-convergence-briefing-era25.ts` |
| Evaluation | `lib/commercial/evaluate-pilot-week1-execution-convergence-era25.ts` |
| Orchestrator | `lib/commercial/pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25.ts` |
| UI slice | `lib/commercial/pilot-week1-execution-convergence-ui-era25.ts` |
| Launch strip | `components/dashboard/launch-wizard/pilot-week1-execution-convergence-era25-strip.tsx` |
| era21 phases reuse | `lib/commercial/pilot-week1-execution-phases-era21.ts` |

---

## Human gate (never auto-PASS)

1. `paid_pilot_go_convergence_era25_ready`
2. Day 1 — `PILOT_WEEK1_TTV_HOURS` + `PILOT_WEEK1_FIRST_ORDER_ID`
3. Day 2 — `PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED=1`
4. Day 3 — `PILOT_WEEK1_POS_CLOSEOUT_STATUS=pass`
5. Day 4 — `PILOT_WEEK1_REPORTS_WEEKLY_EXPORT=1`
6. Day 5 — metrics baseline + case study + GO re-run smokes

---

## Next step (after convergence ready)

See [`next-era25-scale-readiness-convergence-2026-05-28.md`](./next-era25-scale-readiness-convergence-2026-05-28.md) — **scale readiness on platform ops** (month 2 implemented — see [`next-era25-month2-market-readiness-convergence-2026-05-28.md`](./next-era25-month2-market-readiness-convergence-2026-05-28.md))

---

## Related docs

- [`next-era25-paid-pilot-go-convergence-2026-05-28.md`](./next-era25-paid-pilot-go-convergence-2026-05-28.md)
- [`next-step-4-pilot-week1-execution-2026-05-28.md`](./next-step-4-pilot-week1-execution-2026-05-28.md) — era21 reference

---

**Never fake week 1 PASS. Blocked days are normal until operator execution.**
