# KitchenOS — era25 Paid Pilot GO Convergence

**Status:** **Second era25 product slice · IMPLEMENTED · BLOCKED until breakthrough + honest GO**

**Policy:** `era25-paid-pilot-go-convergence-v1` · Orchestrator `era25-paid-pilot-go-convergence-post-breakthrough-orchestrator-v1`  
**Backlog:** `KOS-E25-002-PILOT-GO` · **NOT in linear catalog · NOT Step 18**

**Prerequisite:** `owner_daily_briefing_breakthrough_era25_ready` + honest `decision: GO` in artifact

---

## Declaration

Second **era25 product engineering slice** — wires **B3 Pilot GO/NO-GO** to paid pilot execution surfaces.

| Rule | Verdict |
|------|---------|
| Start before breakthrough slice ready | **FORBIDDEN** |
| Fake GO in artifacts or briefing | **FORBIDDEN** |
| Skip ICP qualification | **FORBIDDEN** |
| Re-open era21 gate chain for steady-state | **FORBIDDEN** |

---

## Milestones (`paidPilotGoConvergenceEra25Milestone`)

| Milestone | Meaning | Orchestrator exit |
|-----------|---------|-------------------|
| `breakthrough_regression_blocked` | Breakthrough not ready | `2` |
| `awaiting_icp_qualification` | ICP not qualified | `0` |
| `awaiting_loi` | No signed LOI | `0` |
| `attention_forbidden_claims` | Claims scan FAIL | `0` |
| `awaiting_go_decision` | Evaluator not GO | `0` |
| `awaiting_kickoff_checklist` | Human kickoff doc incomplete | `0` |
| `paid_pilot_go_convergence_era25_ready` | GO + kickoff checklist | `0` |

**Smoke readiness flags:**

- `readyForBreakthroughRegressionSmokes` — breakthrough blocked
- `readyForIcpSmokes` — ICP not qualified
- `readyForLoiSmokes` — LOI not recorded
- `readyForForbiddenClaimsSmokes` — forbidden claims not PASS

---

## Ops commands

```bash
npm run ops:validate-paid-pilot-go-convergence-era25 -- --json
npm run ops:run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25 -- --json
npm run ops:run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25 -- --write
npm run ops:sync-paid-pilot-go-convergence-era25-report -- --write

npm run test:ci:paid-pilot-go-convergence-era25
npm run test:ci:paid-pilot-go-convergence-era25:cert
npm run test:ci:owner-daily-briefing-breakthrough-era25
```

**Artifacts:** `artifacts/paid-pilot-go-convergence-era25-report.md` · `artifacts/pilot-gono-go-summary.json` (honest — never fake)

**Workflow:** `.github/workflows/ops-paid-pilot-go-convergence-era25-validate.yml`

**Kickoff checklist:** [`era25-paid-pilot-kickoff-checklist-2026-05-28.md`](./era25-paid-pilot-kickoff-checklist-2026-05-28.md)

**Platform ops:** `#era25-paid-pilot-go-convergence` (nested under `#era25-owner-daily-briefing-breakthrough`)

**Launch Wizard:** `#launch-wizard-commercial-blockers` + `PaidPilotGoConvergenceEra25Strip`

---

## Convergence targets

| ID | Surface | KitchenOS link |
|----|---------|----------------|
| `b3_tile` | B3 breakthrough tile live GO data | Today breakthrough panel |
| `briefing_action` | Ranked action on NO-GO | Owner Daily Briefing hero |
| `launch_wizard` | Inline GO/NO-GO strip | `/dashboard/launch-wizard` |
| `platform_ops` | Convergence panel | Commercial pilot ops |

---

## Engineering wiring

| Component | Artifact |
|-----------|----------|
| GO state loader | `lib/commercial/load-paid-pilot-go-convergence-state-era25.ts` |
| B3 + briefing action | `lib/briefing/paid-pilot-go-convergence-briefing-era25.ts` |
| Evaluation | `lib/commercial/evaluate-paid-pilot-go-convergence-era25.ts` |
| Orchestrator | `lib/commercial/paid-pilot-go-convergence-post-breakthrough-orchestrator-era25.ts` |
| UI slice | `lib/commercial/paid-pilot-go-convergence-ui-era25.ts` |
| Launch strip | `components/dashboard/launch-wizard/paid-pilot-go-convergence-era25-strip.tsx` |

---

## Human gate (never auto-PASS)

1. Breakthrough milestone `owner_daily_briefing_breakthrough_era25_ready`
2. ICP qualified — `PILOT_ICP_*` env + artifact
3. Signed LOI — `PILOT_GONOGO_CUSTOMER_NAME` + `PILOT_GONOGO_LOI_SIGNED_DATE`
4. `smoke:pilot-forbidden-claims-enforcement` → PASS
5. `smoke:pilot-gono-go` → honest `decision: GO`
6. Leadership sign-off on kickoff checklist

---

## Next step (after convergence ready)

See [`next-era25-pilot-week1-execution-convergence-2026-05-28.md`](./next-era25-pilot-week1-execution-convergence-2026-05-28.md) — **pilot week 1 execution on platform ops**

---

## Related docs

- [`next-era25-owner-daily-briefing-breakthrough-product-slice-2026-05-28.md`](./next-era25-owner-daily-briefing-breakthrough-product-slice-2026-05-28.md)
- [`era25-paid-pilot-kickoff-checklist-2026-05-28.md`](./era25-paid-pilot-kickoff-checklist-2026-05-28.md)

---

**Never fake GO. NO-GO is normal until human execution.**
