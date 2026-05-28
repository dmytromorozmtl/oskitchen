# KitchenOS — Шаг 4: Pilot Week 1 (после GO decision)

**Policy:** `era21-pilot-week1-execution-v1` · **Backlog:** `KOS-E21-004`  
**Предусловие:** `artifacts/pilot-gono-go-summary.json` → `"decision": "GO"`  
**Цель:** TTV baseline + Week 1 KPIs + case study draft → market readiness Month 2

---

## Decision tree

```
decision: GO
        │
        ├── Day 1: TTV study (Launch Wizard → first order)
        ├── Day 2: Owner Briefing + Integration Health cadence
        ├── Day 3: POS shift closeout drill
        ├── Day 4: Reports + forbidden claims review
        ├── Day 5: metrics baseline + case study draft + GO re-run
        └── Week 1 complete → operational mode (panels hidden)
                │
                ▼
         Month 2 market readiness (Step 5)
```

---

## Engineering wiring (era21)

| Surface | When visible |
|---------|--------------|
| `/dashboard/today` | Top action priority **3** + compact Week 1 panel |
| `/dashboard/launch-wizard` | Week 1 phases in commercial blockers (GO, week incomplete) |
| `/dashboard/integration-health` | Banner at `#integration-health-pilot-week1` |
| Platform → Pilot ops | Week 1 phases panel |

**Mutually exclusive with Steps 1–3:** P0 (0) → Tier2 (1) → Commercial GO (2) → **Week 1 (3)**.

---

## Preflight (30 min)

```bash
npm run ops:validate-commercial-go-closure-env -- --json   # decision: GO
npm run ops:validate-pilot-week1-env -- --json
npm run ops:export-pilot-week1-env-template -- --write
npm run ops:sync-pilot-week1-progress-report -- --write
```

**Product surfaces active after GO (week incomplete):**

| Surface | Expected |
|---------|----------|
| `/dashboard/today` | Week 1 ranked action + compact panel |
| `/dashboard/launch-wizard` | GO badge + Week 1 checklist |
| Platform → Pilot ops | GO artifact + Week 1 phases |
| `/dashboard/integration-health` | Week 1 cadence banner |
| `/dashboard/reports` | Day 4 next-action cards |

---

## Day 1 — TTV + onboarding

| Time | Action | Surface | Evidence |
|------|--------|---------|----------|
| 0:00 | Start Launch Wizard timer | `/dashboard/launch-wizard` | Screenshot / note |
| +30m | Connect channel (if not done) | `/dashboard/sales-channels` | Integration Health |
| +2h | First order in Order Hub | `/dashboard/order-hub` | Order ID |
| EOD | Owner Briefing review | `/dashboard/today` | `briefing_click` events |

**Env after real execution:**

```bash
export PILOT_WEEK1_TTV_HOURS="8.5"
export PILOT_WEEK1_FIRST_ORDER_ID="ord_REAL_ID"
```

**Target:** TTV < 24h (stretch: < 8h vs Square onboarding narrative)

---

## Day 2 — Integration Health cadence

- Owner reviews Integration Health — channel cards honest (no fake LIVE)
- Support admin checks Platform → Pilot ops panel
- Run `npm run smoke:woo-shopify-live` if channel scope expanded

```bash
export PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED=1
```

---

## Day 3 — POS money path

| Step | Route | Verify |
|------|-------|--------|
| Open shift | `/dashboard/pos/shifts` | Shift open |
| Sale | `/dashboard/pos` | Receipt |
| Close shift | `/dashboard/pos/shifts` | Closeout PASS |

```bash
export PILOT_WEEK1_POS_CLOSEOUT_STATUS=pass
```

Cross-ref: `era20-pos-money-path-flow-proof` if staging drill scheduled.

---

## Day 4 — Reports + owner review

- `/dashboard/reports` — first weekly export
- Review forbidden claims still accurate in customer-facing copy
- `npm run smoke:pilot-forbidden-claims-enforcement` if marketing updated

```bash
export PILOT_WEEK1_REPORTS_WEEKLY_EXPORT=1
```

---

## Day 5 — Metrics baseline + narrative

**Prerequisite:** Days 1–4 env vars set (`npm run ops:validate-pilot-week1-env` → `readyForDay5Smokes: yes`)

```bash
npm run smoke:pilot-metrics-baseline
npm run smoke:pilot-case-study-draft
npm run smoke:pilot-gono-go    # re-run — must stay GO
```

**Acceptance artifacts:**

- `artifacts/pilot-metrics-baseline-summary.json` — 6 KPIs with real numbers → `overall: PASSED`
- `artifacts/pilot-case-study-draft-summary.json` — `caseStudyProofStatus: internal_draft_ready`
- `artifacts/pilot-gono-go-summary.json` — still `"decision": "GO"`

When all pass, Week 1 panels disappear from Today / Launch Wizard / Platform / Integration Health.

---

## Ops commands

```bash
npm run ops:validate-pilot-week1-env -- --json
npm run ops:export-pilot-week1-env-template -- --write
npm run ops:sync-pilot-week1-progress-report -- --write
npm run test:ci:pilot-week1-execution-era21
npm run test:ci:pilot-week1-execution-era21:cert
```

GitHub workflow: `.github/workflows/ops-pilot-week1-validate.yml`

---

## Engineering P1 (parallel, not blocking Week 1)

| Item | Command |
|------|---------|
| Webhook replay | `npm run smoke:webhook-replay-p1-expansion` |
| Commerce webhook drill | `npm run smoke:commerce-webhook-drill` |
| Rollback tabletop | `npm run smoke:pilot-rollback-drill` |
| Support impersonation E2E | Playwright with staging creds |

---

## Forbidden in Week 1 sales narrative

- "Production-ready platform"
- "SOC2 certified"
- "LIVE marketplace" (unless channel smoke PASS + honest wording)
- Customer reference without signed permission

---

## Deliverables checklist

- [ ] TTV documented in case study draft
- [ ] Week 1 KPIs in metrics baseline artifact
- [ ] GO re-run still **GO**
- [ ] Owner Briefing used daily (telemetry)
- [ ] No manual edits to `artifacts/*.json` faking PASS
- [ ] `artifacts/pilot-week1-progress-report.md` synced for ops standup

---

## Step 5 preview — Month 2 market readiness

See [`next-step-5-month2-market-readiness-2026-05-28.md`](./next-step-5-month2-market-readiness-2026-05-28.md)

**Immediate action if not GO yet:** [`next-step-3-after-tier2-pass-2026-05-28.md`](./next-step-3-after-tier2-pass-2026-05-28.md)
