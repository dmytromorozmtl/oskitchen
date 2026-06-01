# Pilot Week 1 Checklist

**Status:** Template — use after commercial GO + signed pilot SOW  
**Audience:** CS, COO, Integration lead, pilot operator  
**Parent:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) · [`next-step-5-pilot-week1-2026-05-29.md`](./next-step-5-pilot-week1-2026-05-29.md)

---

## Purpose

Single Week 1 execution checklist for the first paid pilot operator — daily tasks, acceptance gates, and **three KPI fields** required before external claims:

| KPI | Field | Week 1 target (customize in SOW) |
|-----|-------|----------------------------------|
| **Orders/day** | `orders_per_day` | Baseline captured Day 5–7 (example: ≥10/day for active kitchen) |
| **Bump time** | `median_bump_minutes` | Median order → first KDS bump **< 15 min** during service |
| **Health score** | `workspace_health_score` | Integration health workspace score **≥ 80** with zero critical alerts |

**Honesty rule:** Week 1 metrics are **internal pilot evidence** until `npm run smoke:pilot-metrics-baseline` returns `proof_captured`. Do not cite in investor deck or sales until baseline artifact PASS.

---

## Entry criteria (Day 0)

| Gate | Check | Owner |
|------|-------|-------|
| GO/NO-GO | `artifacts/pilot-gono-go-summary.json` → `decision: GO` or `CONDITIONAL` | Founder |
| Signed SOW / LOI | Customer name + start date on record | Sales |
| Workspace live | Production workspace provisioned (not staging-only demo) | CS |
| Roles assigned | Owner, manager, kitchen, cashier as needed | CS |
| Rollback path | Documented in kickoff call notes | Integration |
| Support boundary | Operator knows SKIPPED vs PASS language | CS |

If vault still **0/11** — label live channel sections **SKIPPED WITH REASON**; run manual Order Hub + KDS flows only.

---

## Day-by-day checklist

### Day 0 — Kickoff

- [ ] Kickoff call completed (agenda recorded)
- [ ] Success criteria aligned with SOW Exhibit C
- [ ] Operator primary contact + escalation path confirmed
- [ ] Launch Wizard opened at `/dashboard/launch-wizard`
- [ ] Integration Health baseline screenshot (`/dashboard/integrations/health`)

### Days 1–2 — Connect + first order

- [ ] Channel connected (Woo **or** Shopify **or** storefront — per SOW)
- [ ] Product mapping: zero blocking unmapped SKUs for pilot menu
- [ ] First live order visible in Order Hub (`/dashboard/order-hub`)
- [ ] First KDS ticket visible (`/dashboard/kitchen`)
- [ ] Record **time to first order** (hours from kickoff)

### Days 3–4 — Production rhythm

- [ ] POS or storefront checkout used during real service window
- [ ] KDS bump + recall exercised by kitchen staff
- [ ] Packing QC checklist used at least once
- [ ] Owner Daily Briefing reviewed (`/dashboard/today`)
- [ ] Cross-channel inventory conflicts triaged (if multi-channel SOW)

### Days 5–7 — Metrics capture + checkpoint

- [ ] **Orders/day** calculated (7-day rolling or peak service day — document method)
- [ ] **Bump time** sampled (≥10 orders: order created → first bump timestamp)
- [ ] **Health score** recorded from Integration Health dashboard
- [ ] Operator satisfaction survey (1–5) — see [`PILOT_FEEDBACK_TEMPLATE.md`](./PILOT_FEEDBACK_TEMPLATE.md)
- [ ] Checkpoint smokes run (see below)
- [ ] CS + COO sign-off row completed

---

## Week 1 KPI capture sheet

Copy into pilot CRM or SOW appendix.

| Metric | How to measure | Day captured | Value | Pass? |
|--------|----------------|--------------|-------|-------|
| **Orders/day** | Count from Order Hub or `/dashboard/today` briefing — same 24h window each day | Day ___ | ___ /day | ☐ |
| **Bump time (median)** | For each sampled order: `(first_bump_at − order_created_at)` in minutes; report median | Day ___ | ___ min | ☐ < 15 min |
| **Health score** | Workspace rollup on `/dashboard/integrations/health` (0–100) | Day ___ | ___ /100 | ☐ ≥ 80 |
| Critical alerts | Count of `score_critical` or `webhook_failures` alerts open at checkpoint | Day ___ | ___ | ☐ 0 |
| Operator satisfaction | Post-week survey average | Day 7 | ___ /5 | ☐ ≥ 4.0 |

**Sample bump time calculation:**

```
Order A: created 12:04, first bump 12:11 → 7 min
Order B: created 12:18, first bump 12:35 → 17 min
Order C: created 12:22, first bump 12:29 → 7 min
Median bump time = 7 min ✓
```

**Health score bands:** Healthy ≥ 80 · Watch 55–79 · Critical < 55 (see [`integration-health-sales-deck-v2.md`](./integration-health-sales-deck-v2.md))

---

## Checkpoint commands

```bash
# Week 1 execution milestone assess
npm run ops:run-pilot-week1-execution -- --write

# Operator golden path (production)
npm run smoke:pilot-operator-golden-path

# Metrics baseline — set env vars from KPI sheet above
export PILOT_METRICS_PILOT_WEEK=1
export PILOT_METRICS_CUSTOMER_REF="your-pilot-slug"
export PILOT_METRICS_CAPTURED_AT="2026-06-08"
export PILOT_METRICS_ORDERS_PER_DAY=18
export PILOT_METRICS_KDS_BUMP_RATE=92          # optional: % tickets bumped same shift
export PILOT_METRICS_OPERATOR_FEEDBACK_SCORE=4.2
npm run smoke:pilot-metrics-baseline

# Rollback drill (tabletop — document outcome)
npm run smoke:pilot-rollback-drill
```

Review artifacts:

| Artifact | Pass signal |
|----------|-------------|
| `artifacts/pilot-operator-golden-path-summary.json` | `overall: PASSED` (honest production) |
| `artifacts/pilot-metrics-baseline-summary.json` | `baselineProofStatus: proof_captured` |
| `artifacts/pilot-rollback-drill-summary.json` | Documented tabletop — not faked PASS |

---

## CS + COO sign-off (Day 7)

| Field | Value |
|-------|-------|
| Customer | |
| Pilot start date | |
| Week 1 checkpoint date | |
| Orders/day (captured) | |
| Median bump time (min) | |
| Workspace health score | |
| Critical alerts at checkpoint | |
| Operator satisfaction (1–5) | |
| Week 1 verdict | ☐ PASS · ☐ CONDITIONAL · ☐ FAIL |
| Remediation plan (if CONDITIONAL/FAIL) | |
| Signed by CS | |
| Signed by COO | |

**Env vars for orchestrator (optional):**

```bash
export PILOT_WEEK1_CHECKPOINT_DATE="2026-06-08"
export PILOT_WEEK1_OPERATOR_SATISFACTION=4.2
```

---

## Surfaces to verify during Week 1

| Surface | Route | Week 1 check |
|---------|-------|--------------|
| Owner Briefing | `/dashboard/today` | Live orders + fulfillment actions |
| Order Hub | `/dashboard/order-hub` | All channels in one queue |
| KDS | `/dashboard/kitchen` | Bump/recall; LIVE vs POLLING badge honest |
| Integration Health | `/dashboard/integrations/health` | Score + alerts + recovery playbooks |
| Launch Wizard | `/dashboard/launch-wizard` | Pilot mode progress |
| Cross-channel inventory | `/dashboard/inventory/cross-channel` | If SOW includes sync |

---

## Safe wording (Week 1)

**Allowed:**

- "Week 1 pilot checkpoint captured internally"
- "Operator median bump time under 15 minutes during service"
- "Integration health score 80+ with no critical alerts at checkpoint"

**Not allowed until baseline artifact PASS:**

- "Production-proven at scale"
- "Guaranteed sub-second KDS" (requires SLO proof artifact)
- "100% channel uptime"
- Investor or case-study metrics from partial Week 1 data

---

## References

- [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) — full six-KPI baseline (Week 2+)
- [`PILOT_FEEDBACK_TEMPLATE.md`](./PILOT_FEEDBACK_TEMPLATE.md) — operator survey
- [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) — SOW Exhibit C
- [`kds-slo-proof-plan.md`](./kds-slo-proof-plan.md) — technical SLO proof (separate from Week 1 bump time)
