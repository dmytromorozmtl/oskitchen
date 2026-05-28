# Era 17 — Pilot success metrics baseline

**Policy:** `era17-pilot-metrics-baseline-v1`  
**Status:** **awaiting_baseline_capture** — no live pilot snapshot until customer week-2 data  
**Parent:** [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) Exhibit C · [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)

Capture **real** pilot KPIs for customer success review and (later) investor narrative. Template targets are **not** live metrics — do not use in sales decks without a captured snapshot.

---

## When to capture

| Window | Action |
|--------|--------|
| Pre-pilot | Run `npm run smoke:pilot-metrics-baseline -- --template-only` — expect all metrics **SKIPPED WITH REASON** |
| Pilot week 2 | Baseline snapshot after stable operator usage |
| Pilot week 8 | Review snapshot vs baseline; document remediation if below target |
| Pilot close | Final operator feedback score + support trend |

Requires **paid pilot GO** (`era17-pilot-gono-go-v1` decision GO or CONDITIONAL with documented warnings).

---

## Metric definitions

| ID | Metric | Unit | Example target (customize per SOW) |
|----|--------|------|-------------------------------------|
| `orders_per_day` | Orders per day (hub + storefront + POS) | orders/day | Baseline week 2; review week 8 |
| `storefront_checkout_success_rate` | Storefront pay-later checkout success | percent | ≥95% staging; document production |
| `pos_checkout_completion` | POS tier-2b cash checkout | status | PASSED manual sign-off |
| `kds_bump_rate` | KDS bump/recall during service | percent | Manual sign-off — **not** rush-hour certified |
| `support_tickets_per_week` | Support volume | tickets/week | Track trend only unless contracted |
| `operator_feedback_score` | Operator survey | 1–5 | ≥4.0 average or remediation plan |

---

## Capture methods

### Option A — per-metric env vars

```bash
export PILOT_METRICS_PILOT_WEEK=2
export PILOT_METRICS_CUSTOMER_REF="acme-kitchen-pilot"
export PILOT_METRICS_CAPTURED_AT="2026-06-15"
export PILOT_METRICS_ORDERS_PER_DAY=18
export PILOT_METRICS_STOREFRONT_CHECKOUT_SUCCESS_RATE=96
export PILOT_METRICS_POS_CHECKOUT_STATUS=PASSED
export PILOT_METRICS_KDS_BUMP_RATE=92
export PILOT_METRICS_SUPPORT_TICKETS_PER_WEEK=3
export PILOT_METRICS_OPERATOR_FEEDBACK_SCORE=4.2
npm run smoke:pilot-metrics-baseline
```

### Option B — JSON snapshot

```bash
export PILOT_METRICS_SNAPSHOT_JSON='{"ordersPerDay":18,"storefrontCheckoutSuccessRate":96,"operatorFeedbackScore":4.2}'
npm run smoke:pilot-metrics-baseline
```

Review **`artifacts/pilot-metrics-baseline-summary.json`** — `overall: PASSED` requires `baselineProofStatus: proof_captured` (all six KPIs) before citing metrics externally.

---

## Honesty rules

- **Do not** publish investor metrics unless `overall: PASSED` / `proof_captured` (all six KPIs).
- **Do not** cite `proof_partial` snapshots in investor materials — treat as **SKIPPED** until complete.
- **Do not** claim rush-hour KDS SLA from bump rate alone.
- **Do not** treat staging checkout rate as production SLA.
- Era 41 investor narrative uses this artifact only when real pilot data exists.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | Tier gates + GO/NO-GO |
| [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) | Contract Exhibit C wording |
| [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) | KPI capture (`era17-pilot-metrics-baseline-v1`) |
| [`PRODUCT_ROADMAP_2026.md`](./PRODUCT_ROADMAP_2026.md) | Longer-term GA metrics (non-canonical for Era 17 pilot) |
