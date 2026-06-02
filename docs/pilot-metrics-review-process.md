# Pilot metrics review process

**Policy:** `pilot-metrics-review-process-v1`  
**Updated:** 2026-06-02  
**Owner:** Founder + Customer Success  
**Metrics source:** [`docs/pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) · [`artifacts/pilot-metrics-baseline-summary.json`](../artifacts/pilot-metrics-baseline-summary.json)  
**Parent:** [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) steps 13–16 · [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)

This process defines **when and how** pilot KPIs are captured, reviewed, and escalated — separate from engineering smoke PASS. Metrics reviews inform mid-pilot GO/NO-GO and pilot close; they do **not** auto-upgrade sales claims.

---

## Purpose

| Goal | Outcome |
|------|---------|
| Measure pilot health with real operator data | `baselineProofStatus: proof_captured` |
| Catch regressions before pilot close | Week 8 review vs week 2 baseline |
| Gate investor / case study language | `overall: PASSED` on metrics artifact only |
| Document remediation when below target | Written plan — not silent failure |

**Honesty rule:** Template targets in ICP Exhibit C are **not** live metrics. SKIPPED artifact = no external KPI claims.

---

## Review cadence

| Review | Timing | Pilot checklist step | Required attendees |
|--------|--------|----------------------|-------------------|
| **R0 — Template check** | Pre-kickoff | Before step 7 | CS + Ops |
| **R1 — Week 2 baseline** | Day 7–14 after kickoff | Step 13 | CS + Customer ops lead |
| **R2 — Weekly trend** | Weekly sync (optional) | Step 14 | CS |
| **R3 — Week 8 checkpoint** | ~Day 56 | Between 13 and 15 | Founder + CS + Customer ops lead |
| **R4 — Mid-pilot GO/NO-GO** | Day 30–45 | Step 15 | Founder + CS + Integration |
| **R5 — Pilot close** | Day 60–90 | Step 16 | Founder + Sales + CS |

Minimum for external metrics: **R1 captured** + **R3 reviewed** + **R5 signed**.

---

## The six pilot KPIs

From `era17-pilot-metrics-baseline-v1` — customize targets per SOW before R1.

| ID | Metric | Unit | Review focus |
|----|--------|------|--------------|
| `orders_per_day` | Orders per day (hub + storefront + POS) | orders/day | Trend week 2 → week 8 |
| `storefront_checkout_success_rate` | Storefront checkout success | % | Staging vs production noted separately |
| `pos_checkout_completion` | POS tier-2b cash path | PASSED/FAILED | Manual sign-off — not rush-hour cert |
| `kds_bump_rate` | KDS bump/recall during service | % | Operational sign-off only |
| `support_tickets_per_week` | Support volume | tickets/week | Trend + time-to-first-response |
| `operator_feedback_score` | Operator survey | 1–5 | ≥4.0 or remediation plan |

Full definitions and env vars: [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md)

---

## R0 — Template check (pre-kickoff)

**When:** After step 6 (forbidden claims PASS), before workspace provision.

**Actions:**
1. Confirm Exhibit C targets in LOI/SOW are customized (not copy-paste examples).
2. Run template-only smoke:
   ```bash
   npm run smoke:pilot-metrics-baseline -- --template-only
   ```
3. Expect `overall: SKIPPED` and all metrics `missing` — **this is correct**.

**Exit:** CS confirms metrics capture owner and week-2 calendar hold on customer ops lead.

---

## R1 — Week 2 baseline capture

**When:** Pilot day 7–14, stable operator usage (≥3 service days).

**Data collection (CS + customer ops lead):**

| Source | Metric |
|--------|--------|
| Order Hub + analytics exports | `orders_per_day` |
| Storefront checkout logs / admin | `storefront_checkout_success_rate` |
| Tier-2b golden path sign-off | `pos_checkout_completion` |
| KDS service window observation | `kds_bump_rate` |
| Support queue | `support_tickets_per_week` |
| Optional midpoint survey | `operator_feedback_score` (may defer to R3) |

**Capture command (example):**

```bash
export PILOT_METRICS_PILOT_WEEK=2
export PILOT_METRICS_CUSTOMER_REF="design-partner-slug"
export PILOT_METRICS_CAPTURED_AT="2026-06-15"
export PILOT_METRICS_ORDERS_PER_DAY=18
export PILOT_METRICS_STOREFRONT_CHECKOUT_SUCCESS_RATE=96
export PILOT_METRICS_POS_CHECKOUT_STATUS=PASSED
export PILOT_METRICS_KDS_BUMP_RATE=92
export PILOT_METRICS_SUPPORT_TICKETS_PER_WEEK=3
export PILOT_METRICS_OPERATOR_FEEDBACK_SCORE=4.2
npm run smoke:pilot-metrics-baseline
```

**Review artifact:** `artifacts/pilot-metrics-baseline-summary.json`

| Field | Pass criterion |
|-------|----------------|
| `baselineProofStatus` | `proof_captured` (all 6 KPIs) |
| `overall` | `PASSED` |
| `capturedCount` | `6` |

**R1 decision:**

| Outcome | Action |
|---------|--------|
| **PASS** | Store snapshot; schedule R3; continue weekly sync |
| **PARTIAL** (`proof_partial`) | Do **not** use in investor materials; complete missing KPIs within 7 days |
| **FAIL** | Founder review within 48h; remediation or CONDITIONAL GO at R4 |

---

## R2 — Weekly trend (lightweight)

**When:** Each weekly sync (step 14), 15 minutes on metrics.

**Agenda:**
1. Orders/day vs prior week (rough — full capture at R3).
2. New support tickets and blockers.
3. Integration Health regressions (P0 banner, SKIPPED smokes).
4. Operator anecdotal feedback (log in `PILOT_FEEDBACK_TEMPLATE.md`).

**No artifact required** unless a metric crosses a contractual threshold — then trigger ad-hoc re-capture.

---

## R3 — Week 8 checkpoint

**When:** ~Day 56 (or mid-pilot if SOW is shorter).

**Agenda (45 min):**

1. Re-export all six KPIs; run `smoke:pilot-metrics-baseline` with `PILOT_METRICS_PILOT_WEEK=8`.
2. Compare week 8 vs week 2 snapshot (table in meeting notes).
3. Review remediation items from R1/R2.
4. Confirm no forbidden claims drift (`MARKETING_CLAIMS_STRICT=1 npm run verify-claims`).
5. Pre-read for R4: list open P0 blockers from Integration Health.

**Decision matrix:**

| Signal | Decision |
|--------|----------|
| ≥4 KPIs improved or stable; operator score ≥4.0 | **On track** → proceed to R4 |
| 2–3 KPIs below target with remediation in flight | **Conditional** → document plan; Founder approves continue |
| Orders flat/down + support spike + operator score <3.5 | **Escalate** → engineering + integration war room |
| P0 smoke FAILED or rollback drill not done | **Block R4 GO** until ops vault fixed |

---

## R4 — Mid-pilot GO/NO-GO (metrics slice)

**When:** Day 30–45 (step 15). Metrics are **one input** — not the sole gate.

**Required inputs:**

| Input | Command / artifact |
|-------|-------------------|
| Metrics baseline | `artifacts/pilot-metrics-baseline-summary.json` — prefer week 2 + week 8 |
| Commercial GO/NO-GO | `npm run smoke:pilot-gono-go` → `artifacts/pilot-gono-go-summary.json` |
| Evidence pack | `npm run cert:commercial-pilot-evidence-era16` |
| Forbidden claims | `npm run smoke:pilot-forbidden-claims-enforcement` |

**Metrics-specific gates for GO:**

- `baselineProofStatus: proof_captured` at least once (R1).
- No metric fabricated — values traceable to dashboard export or sign-off sheet.
- Remediation plans documented for any KPI below SOW target.

**Metrics do not override:** P0 staging SKIPPED, unsigned LOI, or NO-GO on tier preflight.

---

## R5 — Pilot close review

**When:** Day 60–90 (step 16).

**Final metrics capture:** Re-run smoke with `PILOT_METRICS_PILOT_WEEK=final` (or week number per SOW).

**Close outcomes tied to metrics:**

| Pilot close | Metrics requirement |
|-------------|---------------------|
| **Convert to paid** | Final snapshot PASS; operator score ≥4.0 or remediation closed |
| **Extend LOI** | Document which KPIs missed target + extension plan |
| **Rollback** | Capture final state for post-mortem; do not cite metrics in marketing |
| **Case study approved** | R1 + R5 PASS + written customer approval ([`case-study-template.md`](./case-study-template.md)) |

**Sign-off row:** Use table in [`pilot-execution-checklist.md`](./pilot-execution-checklist.md#sign-off-row-pilot-close).

---

## Roles and RACI

| Activity | Founder | CS | Customer ops | Engineering | Integration |
|----------|:-------:|:--:|:------------:|:-----------:|:-----------:|
| Set SOW targets | A | R | C | I | I |
| R1 data capture | I | A | R | C | I |
| R2 weekly trend | I | A | R | I | I |
| R3 checkpoint | A | R | R | C | C |
| R4 GO/NO-GO | A | R | C | C | C |
| R5 close + case study gate | A | R | C | I | I |

A = accountable · R = responsible · C = consulted · I = informed

---

## Forbidden uses of metrics

Do **not**:

- Publish investor deck KPIs unless `overall: PASSED` / `proof_captured` (all six).
- Cite `proof_partial` snapshots externally — treat as SKIPPED.
- Claim rush-hour KDS SLA from bump rate alone.
- Treat staging checkout rate as production SLA.
- Hand-edit `artifacts/pilot-metrics-baseline-summary.json` — re-run smoke script.

Enforced by: [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · `era17-pilot-metrics-baseline-v1`

---

## Escalation

| Trigger | Escalate to | SLA |
|---------|-------------|-----|
| Metric missing 7 days after R1 due date | Founder | 48h remediation plan |
| Support tickets >2× baseline for 2 weeks | CS lead + Engineering | War room within 72h |
| Integration error rate spike during pilot | Integration on-call | Same day |
| Customer requests metric in public case study before R5 PASS | Legal + Founder | Block until artifact PASS |

---

## Artifacts checklist

| Artifact | Path | When updated |
|----------|------|--------------|
| Metrics summary | `artifacts/pilot-metrics-baseline-summary.json` | Each R1/R3/R5 capture |
| GO/NO-GO summary | `artifacts/pilot-gono-go-summary.json` | R4 |
| Pilot feedback | `docs/PILOT_FEEDBACK_TEMPLATE.md` (filled) | Weekly R2 |
| Meeting notes | CRM / Notion pilot record | R3, R4, R5 |

---

## Commands reference

```bash
# Template-only (pre-kickoff)
npm run smoke:pilot-metrics-baseline -- --template-only

# Live capture (after setting env vars)
npm run smoke:pilot-metrics-baseline

# Policy tests
npm run test:ci:pilot-metrics-baseline-era17

# Mid-pilot bundle
npm run smoke:pilot-gono-go
npm run cert:commercial-pilot-evidence-era16
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

---

## Related docs

| Doc | Use |
|-----|-----|
| [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) | KPI definitions + capture |
| [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) | 16-step pilot timeline |
| [`pilot-week1-checklist.md`](./pilot-week1-checklist.md) | Early operational signals |
| [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) | External claim gates |
| [`loi-design-partner-template.md`](./loi-design-partner-template.md) | Exhibit C targets |
| [`pilot-acceptance-criteria.md`](./pilot-acceptance-criteria.md) | Close criteria (Task 60) |
