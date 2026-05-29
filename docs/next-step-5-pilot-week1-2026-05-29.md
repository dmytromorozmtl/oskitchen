# Next Step 5 — Pilot Week 1 Kickoff

**Date:** 2026-05-29  
**Prerequisite:** Step 4 complete — `milestone: commercial_gate_passed` + GO integrity PASS  
**Goal:** Paid pilot operator live on KitchenOS with Week 1 checkpoint  
**Audience:** CS, COO, Integration, QA

---

## Entry criteria

| Check | Command | Expected |
|-------|---------|----------|
| Commercial gate PASS | `npm run ops:run-commercial-gate-execution -- --json` | `milestone: commercial_gate_passed` |
| GO integrity | `npm run ops:validate-pilot-gono-go-integrity -- --json` | `integrityPassed: true` |
| Production pilot ready | `npm run run:production-pilot-ready` | vault + engineering gates honest |

If commercial gate not PASS — return to [`next-step-4-commercial-gate-2026-05-29.md`](./next-step-4-commercial-gate-2026-05-29.md).

---

## Execution sequence

### 5.1 Pilot kickoff (Day 0)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Kickoff call with operator | CS + COO | Recorded agenda + success criteria |
| Confirm ICP format match | Sales | ICP JSON matches live operator (restaurant, bar, café, bakery, catering, etc.) |
| Workspace + roles provisioned | CS | Owner, manager, kitchen, cashier roles assigned |
| Staging → production cutover plan | Integration | Documented rollback path |

### 5.2 Operator onboarding (Days 1–3)

End-to-end on **production** (not staging):

1. Channel connect (Woo/Shopify/storefront) → live order
2. Order Hub verification
3. KDS ticket flow + priority lane (rush/allergen)
4. POS cashier speed mode default
5. Packing QC checklist
6. Owner Daily Briefing reflects live fulfillment on `/dashboard/today`

### 5.3 Week 1 checkpoint smoke

```bash
npm run smoke:pilot-operator-golden-path
npm run smoke:pilot-metrics-baseline
npm run smoke:pilot-rollback-drill
```

**Acceptance:**

- `artifacts/pilot-operator-golden-path-summary.json` → honest PASS on production
- Metrics baseline recorded
- Rollback drill documented (not faked)

### 5.4 CS + COO sign-off

| Env var | When to set |
|---------|-------------|
| `PILOT_WEEK1_CHECKPOINT_DATE` | After Day 7 review |
| `PILOT_WEEK1_OPERATOR_SATISFACTION` | Post-checkpoint survey |

---

## Product surfaces (verify during Week 1)

| Surface | Route | What to check |
|---------|-------|---------------|
| Owner Briefing | `/dashboard/today` | Live orders + fulfillment actions |
| Launch Wizard | `/dashboard/launch-wizard` | Pilot mode active |
| KDS | `/dashboard/kitchen` | Polling honesty banner visible |
| POS | `/dashboard/pos` | Cashier speed mode default |
| Integration Health | `/dashboard/integration-health` | Live channel status |

---

## Step 6 preview (Pilot Scale + Expansion)

| Task | Owner |
|------|-------|
| Week 2–4 usage review | CS |
| Second location onboarding (if multi-site) | CS + Integration |
| Paid conversion / expansion LOI | Sales + Founder |
| Feature maturity matrix update | PM |

---

## Honesty guardrails

1. Week 1 PASS requires production orders — not staging replays
2. Do not claim rush-hour KDS SLO — polling fallback only
3. Storefront-only pilots: document honest channel defer in ICP JSON
4. Rollback drill must be executable — not a checkbox

---

## RACI

| Phase | R | A |
|-------|---|---|
| Kickoff + onboarding | CS | COO |
| Production cutover | Integration | CTO |
| Week 1 checkpoint | QA + CS | COO |
| Expansion decision | Sales + Founder | Founder |
