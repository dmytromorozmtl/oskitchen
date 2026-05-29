# KitchenOS — era25 Scale Readiness Convergence

**Status:** **Fifth era25 product slice · IMPLEMENTED · BLOCKED until month 2 convergence ready**

**Policy:** `era25-scale-readiness-convergence-v1` · Orchestrator `era25-scale-readiness-convergence-post-month2-convergence-orchestrator-v1`  
**Backlog:** `KOS-E25-005-SCALE` · **NOT in linear catalog · NOT Step 18**

**Prerequisite:** `month2_market_readiness_convergence_era25_ready` + honest GO still valid

---

## Declaration

Fifth **era25 product engineering slice** — wires **Scale readiness gates 1–5** to platform ops after month 2 market readiness.

| Rule | Verdict |
|------|---------|
| Start before month 2 convergence ready | **FORBIDDEN** |
| Fake scale PASS in artifacts or env | **FORBIDDEN** |
| Claim SOC2 certification without honest track | **FORBIDDEN** |
| Re-open era21 gate chain for steady-state | **FORBIDDEN** |

---

## Milestones (`scaleReadinessConvergenceEra25Milestone`)

| Milestone | Meaning | Orchestrator exit |
|-----------|---------|-------------------|
| `month2_convergence_regression_blocked` | Month 2 slice not ready | `2` |
| `gate1_per_customer_pilot_ops` | Per-customer GO isolation missing | `0` |
| `gate2_soc2_readiness_track` | SOC2 readiness track not reviewed | `0` |
| `gate3_enterprise_sso_production` | SSO production cutover incomplete | `0` |
| `gate4_operational_resilience` | Rollback + webhook drills incomplete | `0` |
| `gate5_data_room_artifact_chain` | Data room artifact chain missing | `0` |
| `scale_readiness_convergence_era25_ready` | Gates 1–5 complete | `0` |

Optional Gate 6 (second paid pilot) does **not** block milestone resolution — same as era21.

**Smoke readiness flags:**

- `readyForMonth2ConvergenceRegressionSmokes` — month 2 convergence blocked
- `readyForResilienceSmokes` — gates 1–3 complete, resilience smokes ready

---

## Ops commands

```bash
npm run ops:validate-scale-readiness-convergence-era25 -- --json
npm run ops:run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25 -- --json
npm run ops:run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25 -- --write
npm run ops:sync-scale-readiness-convergence-era25-report -- --write

npm run test:ci:scale-readiness-convergence-era25
npm run test:ci:scale-readiness-convergence-era25:cert
npm run test:ci:month2-market-readiness-convergence-era25
npm run test:ci:commercial-pilot-runbook:cert
```

**Artifacts:** `artifacts/scale-readiness-convergence-era25-report.md` · reuses era21 `SCALE_*` env + rollback/data room artifacts

**Workflow:** `.github/workflows/ops-scale-readiness-convergence-era25-validate.yml`

**Platform ops:** `#era25-scale-readiness-convergence` (nested under `#era25-month2-market-readiness-convergence`)

**Launch Wizard:** `#launch-wizard-commercial-blockers` + `ScaleReadinessConvergenceEra25Strip`

---

## Convergence targets

| ID | Surface | KitchenOS link |
|----|---------|----------------|
| `scale_gates_panel` | Scale gates 1–5 on platform ops | Commercial pilot ops |
| `briefing_action` | Ranked action on blocked gate | Owner Daily Briefing hero |
| `launch_wizard` | Inline scale gates progress | `/dashboard/launch-wizard` |
| `integration_health_sso` | Enterprise SSO production status | `/dashboard/integration-health` |

---

## Engineering wiring

| Component | Artifact |
|-----------|----------|
| Scale state loader | `lib/commercial/load-scale-readiness-convergence-state-era25.ts` |
| Briefing + launch wizard slice | `lib/briefing/scale-readiness-convergence-briefing-era25.ts` |
| Evaluation | `lib/commercial/evaluate-scale-readiness-convergence-era25.ts` |
| Orchestrator | `lib/commercial/scale-readiness-convergence-post-month2-convergence-orchestrator-era25.ts` |
| UI slice | `lib/commercial/scale-readiness-convergence-ui-era25.ts` |
| Launch strip | `components/dashboard/launch-wizard/scale-readiness-convergence-era25-strip.tsx` |

**Platform ops nesting:**

```
#era25-engineering-gates
  └── … → #era25-month2-market-readiness-convergence
              └── #era25-scale-readiness-convergence
```

**Briefing suppression:** when era25 scale convergence slice is visible, era21 `buildOwnerDailyBriefingScaleReadinessAction` is suppressed (same pattern as month 2 / week 1).

---

## Human gate (never auto-PASS)

1. `month2_market_readiness_convergence_era25_ready`
2. `SCALE_PER_CUSTOMER_GO_ISOLATION=1` — separate GO per customer
3. `SCALE_SOC2_READINESS_TRACK_REVIEWED=1` — honest SOC2 readiness track
4. Enterprise SSO production cutover or documented deferral
5. `smoke:pilot-rollback-drill` + webhook resilience attestation
6. Investor/partner data room artifact chain published

---

## Next step (after convergence ready)

See [`next-era25-series-a-partner-expansion-convergence-2026-05-28.md`](./next-era25-series-a-partner-expansion-convergence-2026-05-28.md) — **Series A / partner expansion on platform ops**

---

## Related docs

- [`next-era25-month2-market-readiness-convergence-2026-05-28.md`](./next-era25-month2-market-readiness-convergence-2026-05-28.md)
- [`next-step-6-scale-readiness-2026-05-28.md`](./next-step-6-scale-readiness-2026-05-28.md) — era21 reference

---

**Never fake scale PASS. Blocked gates are normal until operator execution.**
