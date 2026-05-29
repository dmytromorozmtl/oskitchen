# Next Step 6 — Pilot Scale + Expansion

**Date:** 2026-05-29  
**Prerequisite:** Step 5 complete — `milestone: week1_execution_passed` + Week 1 integrity PASS  
**Goal:** Scale paid pilot to Week 2–4 usage review and expansion decision  
**Audience:** CS, Sales, Founder, PM

---

## Entry criteria

| Check | Command | Expected |
|-------|---------|----------|
| Week 1 PASS | `npm run ops:run-pilot-week1-execution -- --json` | `milestone: week1_execution_passed` |
| Week 1 integrity | `npm run ops:validate-pilot-week1-execution-integrity -- --json` | `integrityPassed: true` |
| GO still honest | `npm run ops:validate-pilot-gono-go-integrity -- --json` | `integrityPassed: true` |

If Week 1 not PASS — return to [`next-step-5-pilot-week1-2026-05-29.md`](./next-step-5-pilot-week1-2026-05-29.md).

---

## Execution sequence

### 6.1 Week 2–4 usage review

| Week | Focus | Owner |
|------|-------|-------|
| Week 2 | Daily ops cadence — Owner Briefing, Integration Health | CS |
| Week 3 | Reports + metrics trend vs baseline | CS + COO |
| Week 4 | Expansion readiness — second location or format | Sales + Founder |

```bash
npm run smoke:pilot-metrics-baseline
npm run ops:run-commercial-inflection-readiness-orchestrator -- --json
```

### 6.2 Multi-location onboarding (if applicable)

For operators with `locationCount > 1` in ICP JSON:

1. Provision second workspace or location scope
2. Repeat channel connect on production
3. KDS + POS training for second site
4. Document honest defer for locations not yet live

### 6.3 Paid conversion / expansion LOI

| Artifact | Owner | Notes |
|----------|-------|-------|
| Expansion LOI | Sales + Legal | New location or format add-on |
| Updated ICP JSON | Sales | Reflect actual operator growth |
| `PILOT_GONOGO_CUSTOMER_NAME` update | Founder | Only if contract scope changes |

### 6.4 Feature maturity matrix update

```bash
# Review docs/feature-maturity-matrix.md against live pilot evidence
npm run run:production-pilot-ready
```

PM updates maturity scores based on real operator usage — not aspirational claims.

---

## Product surfaces (verify during scale phase)

| Surface | Route | What to check |
|---------|-------|---------------|
| Owner Briefing | `/dashboard/today` | Week 2–4 trends |
| Reports | `/dashboard/reports` | Weekly export cadence |
| Integration Health | `/dashboard/integration-health` | Multi-channel if applicable |
| Platform Ops | `/platform/commercial-pilot-ops` | Pilot status + blockers |

---

## Step 7 preview (Production GA Readiness)

| Task | Owner |
|------|-------|
| Production GA checklist | CTO + COO |
| SOC2 / security review | Security |
| Pricing + packaging finalization | Founder + Sales |
| Public launch narrative (forbidden claims audit) | Marketing + Legal |

---

## Honesty guardrails

1. Expansion claims require signed LOI — not verbal intent
2. Multi-location LIVE status per channel — not blanket "all locations integrated"
3. Feature maturity `pilot_ready` → `production_ready` requires operator evidence
4. Do not claim rush-hour KDS SLO — polling fallback only

---

## RACI

| Phase | R | A |
|-------|---|---|
| Week 2–4 usage review | CS | COO |
| Multi-location onboarding | CS + Integration | COO |
| Expansion LOI | Sales + Legal | Founder |
| Maturity matrix update | PM | CTO |
