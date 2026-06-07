# Pilot Week 1 Roadmap

**Status:** Canonical operator timeline for the first paid pilot week  
**Audience:** CS, COO, integration lead, pilot owner  
**Policy:** `pilot-week1-roadmap-absolute-final-v1` (`lib/commercial/pilot-week1-roadmap-policy.ts`)  
**Related:** [`pilot-week1-checklist.md`](./pilot-week1-checklist.md) · [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · [`loi-signed.md`](./loi-signed.md)

---

## Purpose

Single **T-day roadmap** for Pilot Week 1 — four milestones from kickoff through owner briefing review. Use this for sales handoff, CS scheduling, and Launch Wizard alignment. Detailed daily tasks live in [`pilot-week1-checklist.md`](./pilot-week1-checklist.md).

**Honesty rule:** Milestones are **internal pilot evidence** until `npm run smoke:pilot-metrics-baseline` returns `proof_captured`. Do not cite orders/day, bump time, or health score externally until baseline artifact PASS.

---

## Entry gates (before T-0)

| Gate | Check | Owner |
|------|-------|-------|
| ICP qualified | LOI stage ≥ **Countersigned** per [`loi-signed.md`](./loi-signed.md) | Sales |
| GO/NO-GO | `artifacts/pilot-gono-go-summary.json` → `GO` or `CONDITIONAL` | Founder |
| Workspace live | Production workspace provisioned (not staging-only demo) | CS |
| Roles assigned | Owner, manager, kitchen, cashier as needed | CS |
| Support boundary | Operator understands SKIPPED vs PASS language | CS |

If vault P0 secrets are incomplete — label live channel steps **SKIPPED WITH REASON**; run Order Hub + KDS flows manually per [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md).

---

## Milestone timeline

| Milestone | Day | Outcome | Primary surfaces |
|-----------|-----|---------|------------------|
| **T-0 onboarding** | Kickoff (Day 0) | Workspace live, roles assigned, Launch Wizard started | `/dashboard/launch-wizard`, `/dashboard/quick-start` |
| **T+1 KDS** | Day 1 | Kitchen stations configured, test ticket visible, bump/recall exercised | `/dashboard/kitchen`, `/dashboard/kitchen/stations` |
| **T+3 first order** | Day 3 | First live order in Order Hub → KDS within service window | `/dashboard/order-hub`, `/dashboard/kitchen` |
| **T+7 briefing** | Day 7 | Owner Daily Briefing reviewed; Week 1 KPIs captured | `/dashboard/today`, `/dashboard/integrations/health` |

---

## T-0 — Onboarding (Day 0)

**Goal:** Operator can log in, see Launch Wizard, and confirm success criteria from SOW.

### CS checklist

- [ ] Kickoff call completed — agenda recorded in pilot CRM
- [ ] Success criteria aligned with SOW Exhibit C
- [ ] Primary contact + escalation path confirmed
- [ ] Launch Wizard opened at `/dashboard/launch-wizard`
- [ ] Integration Health baseline screenshot at `/dashboard/integrations/health`
- [ ] Rollback path documented in kickoff notes

### Operator checklist

- [ ] Log in with assigned role (owner or manager)
- [ ] Complete Launch Wizard **Connect** and **Configure** steps
- [ ] Confirm menu / product catalog imported or mapped
- [ ] Know where to open support ticket (in-app or email per SOW)

### Pass criteria

| Signal | Target |
|--------|--------|
| Launch Wizard progress | ≥ 2 phases started |
| Roles | Owner + at least one kitchen or cashier user active |
| Time to first login | < 4 hours from kickoff email |

---

## T+1 — KDS (Day 1)

**Goal:** Kitchen staff see tickets on KDS and can bump/recall during a test service.

### CS + integration checklist

- [ ] KDS stations created for pilot kitchen layout
- [ ] Routing rules reviewed (default station → expedite if applicable)
- [ ] Test order injected or manual ticket created
- [ ] Kitchen staff trained on bump, recall, and item-level status

### Operator checklist

- [ ] Open KDS on kitchen tablet or browser at `/dashboard/kitchen`
- [ ] Confirm ticket appears within **60 seconds** of test order
- [ ] Bump ticket — verify disappears from active queue
- [ ] Recall ticket — verify returns to active queue

### Pass criteria

| Signal | Target |
|--------|--------|
| KDS ticket visibility | Test ticket visible on ≥ 1 station |
| Bump exercised | ≥ 1 ticket bumped by kitchen staff |
| Median test bump time | < 15 min (order created → first bump) for test orders |

**Note:** Rush-hour SLA is **not** in pilot scope — see [`sales-forbidden-claims-training-era20.md`](./sales-forbidden-claims-training-era20.md).

---

## T+3 — First order (Day 3)

**Goal:** First **live** order flows channel → Order Hub → KDS during a real or simulated service window.

### CS checklist

- [ ] Channel connected (Woo, Shopify, storefront, or in-browser POS — per SOW)
- [ ] Product mapping: zero blocking unmapped SKUs for pilot menu
- [ ] Operator notified when first live order arrives
- [ ] Record **time to first order** (hours from T-0 kickoff)

### Operator checklist

- [ ] Place or receive first live order (customer, test card, or channel sync)
- [ ] Confirm order visible in Order Hub at `/dashboard/order-hub`
- [ ] Confirm KDS ticket fires for kitchen
- [ ] Complete bump through to packed/ready state (if packing QC in scope)

### Pass criteria

| Signal | Target |
|--------|--------|
| First live order ID | Captured in pilot CRM / `PILOT_WEEK1_FIRST_ORDER_ID` env |
| Order Hub visibility | Order status trackable within 2 min of ingest |
| KDS linkage | Ticket created for same order ID |
| Time to first order | Documented (target: ≤ 72 h from T-0 for active kitchens) |

If live channel smoke is **SKIPPED** — first order may be manual POS or storefront test checkout; label evidence accordingly.

---

## T+7 — Briefing (Day 7)

**Goal:** Owner reviews Daily Briefing, Integration Health score, and Week 1 KPI sheet; CS + COO sign-off.

### CS checklist

- [ ] Owner Daily Briefing walkthrough at `/dashboard/today`
- [ ] **Orders/day** calculated (document 24 h window method)
- [ ] **Bump time** sampled (≥ 10 orders: median order created → first bump)
- [ ] **Health score** from Integration Health (`/dashboard/integrations/health`)
- [ ] Operator satisfaction survey (1–5) — [`PILOT_FEEDBACK_TEMPLATE.md`](./PILOT_FEEDBACK_TEMPLATE.md)
- [ ] Checkpoint smokes run (see below)
- [ ] CS + COO sign-off row completed

### Operator checklist

- [ ] Review Owner Daily Briefing — understand orders, alerts, and recommended actions
- [ ] Confirm Integration Health score ≥ 80 with zero critical alerts (or document open items)
- [ ] Attend Week 1 checkpoint call (30 min)

### Pass criteria

| KPI | Week 1 target (customize in SOW) |
|-----|----------------------------------|
| **Orders/day** | Baseline captured (example: ≥ 10/day for active kitchen) |
| **Bump time (median)** | < 15 min during service |
| **Health score** | ≥ 80 with zero critical alerts |
| **Operator satisfaction** | ≥ 4.0 / 5 on post-week survey |

---

## Checkpoint commands (T+7)

```bash
# Week 1 execution milestone assess
npm run ops:run-pilot-week1-execution -- --write

# Operator golden path (production)
npm run smoke:pilot-operator-golden-path

# Metrics baseline — set env vars from KPI sheet
export PILOT_METRICS_PILOT_WEEK=1
export PILOT_METRICS_CUSTOMER_REF="your-pilot-slug"
export PILOT_METRICS_CAPTURED_AT="2026-06-08"
export PILOT_METRICS_ORDERS_PER_DAY=18
export PILOT_METRICS_OPERATOR_FEEDBACK_SCORE=4.2
npm run smoke:pilot-metrics-baseline
```

---

## Human gate checklist

| # | Gate | Owner | Evidence |
|---|------|-------|----------|
| 1 | T-0 onboarding complete | CS | Launch Wizard screenshot + kickoff notes |
| 2 | T+1 KDS bump exercised | Integration | KDS station ID + bump timestamp |
| 3 | T+3 first live order ID | Operator | Order Hub row + channel source |
| 4 | T+7 briefing + KPIs | COO | `artifacts/pilot-metrics-baseline-summary.json` PASS |
| 5 | No external metrics claims | Sales | Baseline artifact before deck/case study |

---

## Escalation

| Issue | Escalate to | SLA |
|-------|-------------|-----|
| KDS ticket not firing | Integration lead | Same business day |
| Channel sync failure | Integration + CS | 4 h |
| Health score < 55 | COO + engineering on-call | 24 h |
| Operator wants scope change | Founder + sales | Next weekly sync |

**Rollback:** Follow [`pilot-rollback-drill-era17.md`](./pilot-rollback-drill-era17.md) — tabletop minimum before T+3 first order.
