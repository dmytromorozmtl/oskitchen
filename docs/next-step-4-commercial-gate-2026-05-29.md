# Next Step 4 — Commercial Gate (ICP + LOI + GO)

**Date:** 2026-05-29  
**Prerequisite:** Step 3 complete — `tier2ProofStatus: proof_passed` + Tier 2 integrity PASS  
**Goal:** Commercial pilot GO/NO-GO with real ICP prospect, signed LOI, and paid pilot customer  
**Audience:** Founder, Sales, Legal, COO

---

## Entry criteria

| Check | Command | Expected |
|-------|---------|----------|
| Tier 2 PASS | `npm run ops:run-tier2-staging-proof-execution -- --json` | `milestone: proof_passed` |
| Tier 2 integrity | `npm run ops:validate-tier2-staging-golden-path-integrity -- --json` | `integrityPassed: true` |
| P0 integrity | `npm run ops:validate-p0-staging-proof-integrity -- --json` | `integrityPassed: true` |

If Tier 2 not PASS — return to [`next-step-3-tier2-staging-proof-band-2026-05-29.md`](./next-step-3-tier2-staging-proof-band-2026-05-29.md).

---

## Execution sequence

### 4.1 ICP qualification (all F&B formats)

Qualify a real operator prospect — restaurant, bar, café, bakery, catering, ghost kitchen, or multi-format group.

```bash
cp config/commercial/pilot-icp-prospect-draft.template.json config/commercial/pilot-icp-prospect.json
# Edit with real prospect data — never commit secrets or PII to git
export PILOT_GONOGO_ICP_INPUT_JSON="$(cat config/commercial/pilot-icp-prospect.json)"
npm run icp-qualification-check
```

**Acceptance:**

- `artifacts/pilot-icp-qualification-summary.json` → qualified segments documented
- Storefront-only pilots: honest channel defer recorded in ICP JSON
- Multi-location: `locationCount` and `primaryFormat` accurate

### 4.2 LOI + DPA sign-off

| Artifact | Owner | Env var |
|----------|-------|---------|
| Signed LOI | Founder + Legal | `PILOT_GONOGO_LOI_SIGNED_DATE` (ISO date) |
| DPA executed | Legal | Record in commercial ops vault (not in git) |
| Pilot customer name | Founder | `PILOT_GONOGO_CUSTOMER_NAME` |

**Honesty:** Do not set LOI date or customer name without signed documents.

### 4.3 GO/NO-GO evaluation

```bash
npm run smoke:pilot-gono-go
```

Review `artifacts/pilot-gono-go-summary.json`.

**Expected after Step 4 complete:**

- `decision: GO` or `CONDITIONAL` with only operational (non-engineering) blockers
- Engineering blockers (P0, Tier 2, KDS) must be absent

### 4.4 Commercial inflection readiness

```bash
npm run ops:run-commercial-inflection-readiness-orchestrator -- --json
npm run run:production-pilot-ready
```

---

## Product surfaces (verify after GO)

| Surface | Route | What to check |
|---------|-------|---------------|
| Launch Wizard | `/dashboard/launch-wizard` | Commercial blockers cleared |
| Owner Briefing | `/dashboard/today` | Pilot Week 1 top action |
| Platform Ops | `/platform/commercial-pilot-ops` | GO decision + blockers |
| Implementation | `/dashboard/implementation` | ICP qualification panel |

---

## Step 5 preview (Pilot Week 1)

| Task | Owner |
|------|-------|
| Pilot kickoff call with operator | CS + COO |
| Staging → production cutover plan | Integration |
| Owner Daily Briefing baseline | CS |
| KDS + POS cashier training | CS |
| Week 1 checkpoint smoke | QA |

---

## Honesty guardrails

1. `PILOT_GONOGO_CUSTOMER_NAME` requires a real paid pilot — no placeholder names
2. ICP JSON must reflect actual operator format (not ghost-kitchen-only)
3. GO without Tier 2 `proof_passed` is forbidden — integrity validators will fail
4. CONDITIONAL GO must list explicit human-owned blockers with dates

---

## RACI

| Phase | R | A |
|-------|---|---|
| ICP qualification | Sales | Founder |
| LOI + DPA | Legal | Founder |
| GO/NO-GO | Founder + COO | Founder |
| Pilot Week 1 kickoff | CS | COO |
