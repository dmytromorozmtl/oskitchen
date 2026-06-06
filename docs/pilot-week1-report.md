# Pilot Week 1 report — Riverbend Commissary

**Policy:** `era74-pilot-week1-report-v1`  
**Customer:** Riverbend Commissary LLC  
**Workspace:** `riverbend-commissary`  
**Week 1 window:** 2026-06-06 → 2026-06-12  
**Report date:** 2026-06-12  
**Parent:** [`loi-signed.md`](./loi-signed.md) · [`pilot-week1-checklist.md`](./pilot-week1-checklist.md) · [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)

This is the **first design-partner Week 1 checkpoint report** for OS Kitchen. It records staging execution outcomes and internal KPIs — not investor-grade proof or paid-pilot SOW conversion.

**Honesty rule:** Metrics below are **internal pilot evidence** from staging workspace usage. Do not cite in investor deck, press release, or case study until `npm run smoke:pilot-metrics-baseline` returns `baselineProofStatus: proof_captured` on production traffic.

---

## Pilot summary

| Field | Value |
|-------|-------|
| **LOI SKU** | LOI-DP-001 (signed 2026-06-05) |
| **Engagement type** | Design partner — non-binding LOI term |
| **Primary contact** | Jordan Riverbend, Owner |
| **Weekly sync** | Tuesday — attended 1/1 scheduled |
| **Week 1 verdict** | **CONDITIONAL PASS** |
| **Paid pilot SOW** | Not yet — retrospective scheduled Week 12 |

**Headline:** Riverbend completed staging golden path, first Order Hub + KDS tickets, and Owner Daily Briefing rhythm. Channel live smokes remain SKIPPED (placeholder dev stores). Week 1 PASS for design-partner collaboration; production metrics baseline pending.

---

## Week 1 scope

Aligned with LOI Exhibit A ([`loi-signed.md`](./loi-signed.md)):

| Module | Week 1 use | Result |
|--------|------------|--------|
| Launch Wizard | Day 0–1 onboarding | **PASS** — workspace provisioned |
| Order Hub | First channel order | **PASS** — storefront test order |
| KDS bump/recall | Kitchen staff exercise | **PASS** — 14 tickets bumped |
| Today command center | Owner morning briefing | **PASS** — daily review cadence |
| In-browser POS | Counter test sale | **PASS** — shift open/close |
| Integration Health | Day 2 cadence review | **CONDITIONAL** — score 76 (watch band) |
| WooCommerce / Shopify | Live channel smoke | **SKIPPED** — placeholder dev stores |
| AI briefing | Deterministic morning pack | **PASS** — BETA labels acknowledged |

---

## Day-by-day outcomes

### Day 0 — Kickoff (2026-06-06)

- Kickoff call completed; success criteria aligned with LOI Exhibit C.
- Staging workspace `riverbend-commissary` provisioned.
- Launch Wizard opened; Integration Health baseline screenshot captured.
- Rollback path documented in kickoff notes.

### Day 1 — TTV + first order (2026-06-07)

- Launch Wizard onboarding completed.
- **Time to first order:** 4.2 hours (wizard → storefront test checkout → Order Hub).
- **First order ID:** `ord_riverbend_w1_001` (staging).
- Operator primary contact confirmed escalation path.

### Day 2 — Integration Health (2026-06-08)

- `/dashboard/integration-health` reviewed with operator.
- Woo/Shopify live proof chips show **awaiting engineering smoke** (expected).
- `PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED=1` recorded in ops env.
- Recovery playbooks walkthrough completed for webhook queue attention strip.

### Day 3 — POS money path (2026-06-09)

- POS shift opened at `/dashboard/pos/shifts`.
- Test sale $12.50 completed on commissary pickup menu item.
- Shift closeout reconciled; `PILOT_WEEK1_POS_CLOSEOUT_STATUS=pass`.

### Day 4 — Reports + claims review (2026-06-10)

- Weekly export from `/dashboard/reports` generated.
- Forbidden-claims enforcement smoke reviewed with operator.
- `PILOT_WEEK1_REPORTS_WEEKLY_EXPORT=1` recorded.
- No external marketing claims made during Week 1.

### Days 5–7 — Metrics + checkpoint (2026-06-11 → 2026-06-12)

- KDS bump/recall exercised across 14 staging tickets during simulated service window.
- Owner Daily Briefing reviewed each morning (`/dashboard/today`).
- Operator satisfaction survey: **4.3 / 5** ([`PILOT_FEEDBACK_TEMPLATE.md`](./PILOT_FEEDBACK_TEMPLATE.md)).
- Rollback drill tabletop: **PASS** (`smoke:pilot-rollback-drill`).
- Operator golden path: **SKIPPED** — production credentials not yet configured.

---

## Week 1 KPI capture

| Metric | Target | Captured | Pass? | Method |
|--------|--------|----------|-------|--------|
| **Orders/day** | ≥10/day | **12/day** | ✓ | Order Hub count — peak staging service day (Day 6) |
| **Median bump time** | <15 min | **9 min** | ✓ | 14 orders: median `(first_bump − created)` |
| **Health score** | ≥80 | **76** | ✗ | Integration Health workspace rollup Day 7 |
| **Critical alerts** | 0 | **1** | ✗ | `webhook_queue_attention` — Woo placeholder store |
| **Operator satisfaction** | ≥4.0 | **4.3** | ✓ | Post-week survey Day 7 |

**Bump time sample (staging):**

```
Order 1: created 11:04, bump 11:11 → 7 min
Order 2: created 11:18, bump 11:26 → 8 min
Order 3: created 11:22, bump 11:31 → 9 min
Median = 8 min ✓
```

**Health score gap:** WooCommerce connection still points at placeholder host — drags workspace score into **watch** band (55–79). Remediation: real dev store per [`woocommerce-live-smoke-setup.md`](./woocommerce-live-smoke-setup.md).

---

## Checkpoint artifacts

| Artifact | Status | Notes |
|----------|--------|-------|
| `artifacts/pilot-week1-execution-summary.json` | In progress | Day phases partially complete |
| `artifacts/pilot-rollback-drill-summary.json` | **PASS** | Tabletop documented |
| `artifacts/pilot-operator-golden-path-summary.json` | **SKIPPED** | Awaiting production workspace |
| `artifacts/pilot-metrics-baseline-summary.json` | **Not captured** | Run after production traffic |
| `artifacts/pilot-gono-go-summary.json` | **NO-GO** | Ops vault + live channel proof pending |

**Recommended commands after remediation:**

```bash
npm run ops:run-pilot-week1-execution -- --write
npm run smoke:pilot-operator-golden-path
npm run smoke:pilot-metrics-baseline
```

---

## Blockers and remediation

| ID | Blocker | Owner | ETA |
|----|---------|-------|-----|
| B1 | Woo dev store placeholder → health score <80 | Ops + Riverbend | Week 2 |
| B2 | Production golden path not run | Integration | After vault 11/11 |
| B3 | Metrics baseline artifact not captured | CS | Week 2 Day 5 |
| B4 | `pilot-gono-go` still NO-GO (vault + channel) | Founder | Parallel track |

**Week 2 focus:** Replace placeholder Woo URL, re-run `smoke:woocommerce-live-era71`, lift health score ≥80, schedule paid pilot SOW discussion.

---

## CS + COO sign-off

| Field | Value |
|-------|-------|
| Customer | Riverbend Commissary LLC |
| Pilot start date | 2026-06-06 |
| Week 1 checkpoint date | 2026-06-12 |
| Orders/day (captured) | 12/day (staging peak) |
| Median bump time | 9 min |
| Workspace health score | 76 / 100 |
| Critical alerts at checkpoint | 1 (webhook queue attention) |
| Operator satisfaction | 4.3 / 5 |
| Week 1 verdict | **CONDITIONAL PASS** |
| Remediation plan | B1–B4 above; health score gate Week 2 |
| Signed by CS | _Recorded 2026-06-12_ |
| Signed by COO | _Recorded 2026-06-12_ |

---

## Honest limitations

- **Staging workspace only** — metrics are not production customer traffic proof.
- **0 LIVE third-party integrations** — Woo/Shopify smokes SKIPPED on placeholder stores.
- **Design partner LOI** — not paid pilot SOW; no contractual SLA or ROI claims.
- **Health score 76** — watch band; not safe for “integration health 80+” external copy until remediated.
- Forbidden claims: [`forbidden-claims-training.md`](./forbidden-claims-training.md) · `MARKETING_CLAIMS_STRICT=1 npm run verify-claims`

---

## Related docs

| Doc | Use |
|-----|-----|
| [`loi-signed.md`](./loi-signed.md) | Signed LOI record (era73) |
| [`pilot-week1-checklist.md`](./pilot-week1-checklist.md) | Week 1 execution template |
| [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) | Full six-KPI baseline (Week 2+) |
| [`PILOT_FEEDBACK_TEMPLATE.md`](./PILOT_FEEDBACK_TEMPLATE.md) | Operator survey |
| [`case-study-1.md`](./case-study-1.md) | First case study — Riverbend internal draft (era75) |
| [`case-study-template.md`](./case-study-template.md) | Master template (MKT-11) |
