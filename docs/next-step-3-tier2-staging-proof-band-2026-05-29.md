# Next Step 3 — Tier 2 Staging Proof Band

**Date:** 2026-05-29  
**Prerequisite:** Step 2 complete — `p0ProofStatus: proof_passed` + integrity PASS  
**Goal:** Tier 2 golden path `proof_passed` on staging + KDS Playwright evidence  
**Audience:** QA, Integration engineer, COO

---

## Entry criteria

| Check | Command | Expected |
|-------|---------|----------|
| P0 PASS | `npm run ops:validate-p0-staging-proof-integrity -- --json` | `integrityPassed: true` |
| P0 execution | `npm run ops:run-p0-staging-proof-execution -- --write` | `milestone: proof_passed` |
| Tier 2 env | `npm run ops:validate-tier2-golden-path-env -- --json` | tracked vars present |

If P0 not PASS — return to [`next-step-2-p0-staging-proof-execution-2026-05-29.md`](./next-step-2-p0-staging-proof-execution-2026-05-29.md).

---

## Execution sequence

### 3.1 Tier 2 post-P0 orchestrator

```bash
npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write
```

Review milestone in stdout. Expected progression:

`awaiting_child_smokes` → `awaiting_manual_fulfillment` → `awaiting_github_evidence` → `proof_passed`

### 3.2 Automated child smokes

```bash
npm run smoke:tier2-staging-golden-path
npm run smoke:kds-staging-playwright
```

**Acceptance:**

- `artifacts/tier2-staging-golden-path-summary.json` → `proof_passed`
- `artifacts/kds-staging-playwright-proof-summary.json` → PASS with HTML report URL

### 3.3 Manual golden path (all F&B formats)

End-to-end on staging:

1. Channel webhook (Woo/Shopify/storefront) → canonical order
2. Order Hub verification
3. KDS ticket + priority lane (rush/allergen order)
4. Packing QC checklist
5. Owner Daily Briefing reflects fulfillment on `/dashboard/today`

Attach screenshots to sign-off — do not commit fake PASS.

### 3.4 GO/NO-GO re-evaluation

```bash
npm run icp-qualification-check
npm run smoke:pilot-gono-go
```

**Expected after Step 3:** `decision: NO-GO` or `CONDITIONAL` with blockers limited to:

- ICP qualification (real `PILOT_GONOGO_ICP_INPUT_JSON`)
- Signed LOI (`PILOT_GONOGO_LOI_SIGNED_DATE`)
- Paid pilot customer (`PILOT_GONOGO_CUSTOMER_NAME`)

---

## Product surfaces (verify after Tier 2 PASS)

| Surface | Route | What to check |
|---------|-------|---------------|
| Integration Health | `/dashboard/integration-health` | Tier 2 golden path banner |
| Owner Briefing | `/dashboard/today` | Tier 2 top action |
| Launch Wizard | `/dashboard/launch-wizard` | Tier 2 panel + blockers |
| Platform Ops | `/platform/commercial-pilot-ops` | Tier 2 phases panel |

---

## Step 4 preview (Commercial Gate)

| Task | Owner |
|------|-------|
| Qualify real ICP prospect (restaurant, bar, café, bakery, catering, etc.) | Sales |
| Sign LOI + DPA | Founder + Legal |
| `PILOT_GONOGO_CUSTOMER_NAME` + `LOI_SIGNED_DATE` | Founder |
| `smoke:pilot-gono-go` → GO | Founder + COO |
| Pilot Week 1 kickoff | CS + COO |

---

## Honesty guardrails

1. Tier 2 `proof_passed` requires manual fulfillment sign-off env vars where applicable
2. KDS Playwright PASS must include GitHub run URL when run in CI
3. Do not claim rush-hour KDS SLO — polling fallback only
4. Storefront-only pilots: document honest channel defer in ICP JSON

---

## RACI

| Phase | R | A |
|-------|---|---|
| Tier 2 smoke | QA | COO |
| Manual golden path | QA + Integration | COO |
| KDS Playwright | QA | CTO |
| GO re-eval | Founder | Founder |
