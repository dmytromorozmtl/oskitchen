# Next Step 10 — Sustained Operational Excellence

**Date:** 2026-05-29  
**Prerequisite:** Step 9 complete — `milestone: market_leader_positioning_passed`  
**Goal:** Recurring ops cadences after market leader positioning  
**Audience:** COO, Ops, CS, Integration, Founder

---

## Entry criteria

| Check | Command | Expected |
|-------|---------|----------|
| Market leader PASS | `npm run ops:run-market-leader-positioning-execution -- --json` | `milestone: market_leader_positioning_passed` |
| Market leader integrity | `npm run ops:validate-market-leader-positioning-integrity -- --json` | `integrityPassed: true` |
| Series A expansion PASS | `npm run ops:run-series-a-partner-expansion-execution -- --json` | `milestone: series_a_partner_expansion_passed` |

If market leader not PASS — return to [`next-step-9-market-leader-positioning-2026-05-29.md`](./next-step-9-market-leader-positioning-2026-05-29.md).

---

## Execution sequence

### 10.1 Cadence A — Daily operational excellence

| Surface | Owner |
|---------|-------|
| Owner Briefing (`/dashboard/today`) | Ops |
| Order Hub | Kitchen manager |
| Production calendar | Ops |

Env: `SUSTAINED_OPS_DAILY_CADENCE_ATTESTED=1`

### 10.2 Cadence B — Weekly integration health

| Task | Owner |
|------|-------|
| Integration Health review | Integration |
| Webhook replay drill | QA |

```bash
npm run smoke:commerce-webhook-drill
npm run smoke:webhook-replay-p1-expansion
```

Env: `SUSTAINED_OPS_WEEKLY_INTEGRATION_REVIEWED=1`

### 10.3 Cadence C — Monthly metrics + CS review

| Artifact | Owner |
|----------|-------|
| Metrics baseline trend | Ops |
| CS playbook update | CS |

```bash
npm run smoke:pilot-metrics-baseline
```

Env: `SUSTAINED_OPS_MONTHLY_METRICS_REFRESHED=1`

### 10.4 Cadence D — Quarterly governance + rollback drill

| Task | Owner |
|------|-------|
| Rollback drill within 90 days | Integration |
| Forbidden claims re-audit | Legal + Marketing |
| GO/NO-GO re-validation per customer | Founder |

```bash
npm run smoke:pilot-rollback-drill
npm run smoke:pilot-forbidden-claims-enforcement
npm run smoke:pilot-gono-go
npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator -- --write
```

Env: `SUSTAINED_OPS_QUARTERLY_GOVERNANCE_AUDITED=1`

---

## Product surfaces (verify before sustained ops sign-off)

| Surface | Route | What to check |
|---------|-------|---------------|
| Today / Owner Briefing | `/dashboard/today` | Daily cadence attested |
| Order Hub | `/dashboard/order-hub` | Rush-hour ops honest |
| Production calendar | `/dashboard/production-calendar` | Scheduling accuracy |
| Integration Health | `/dashboard/integration-health` | Weekly review logged |
| Platform Ops | `/platform/commercial-pilot-ops` | Full artifact chain |

---

## Step 11 preview (Sustained Product Evolution)

| Task | Owner |
|------|-------|
| Product evolution gates | PM + Founder |
| `ops:run-sustained-product-evolution-post-sustained-ops-orchestrator` | PM |
| Feature maturity matrix refresh | PM |
| Continuous improvement loop closure | COO |

---

## Honesty guardrails

1. Sustained ops requires `market_leader_positioning_passed` — not pilot-only evidence
2. Daily cadence attestation requires real operator usage — not checkbox-only
3. Quarterly rollback drill must show `rollbackProofStatus: proof_passed` — never fake
4. Per-customer GO isolation — never reuse GO artifact across prospects
5. ICP = all F&B formats — cadences apply to restaurant, bar, café, bakery, catering, etc.

---

## RACI

| Phase | R | A |
|-------|---|---|
| Daily ops cadence | Ops + Kitchen | COO |
| Weekly integration | Integration + QA | COO |
| Monthly metrics | Ops + CS | Founder |
| Quarterly governance | Founder + Legal | Founder |
