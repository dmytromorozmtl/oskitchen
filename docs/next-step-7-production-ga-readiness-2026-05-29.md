# Next Step 7 — Production GA Readiness

**Date:** 2026-05-29  
**Prerequisite:** Step 6 complete — `milestone: pilot_scale_expansion_passed` + scale integrity PASS  
**Goal:** Production general availability readiness — security, pricing, launch narrative  
**Audience:** CTO, COO, Security, Marketing, Legal, Founder

---

## Entry criteria

| Check | Command | Expected |
|-------|---------|----------|
| Scale expansion PASS | `npm run ops:run-pilot-scale-expansion-execution -- --json` | `milestone: pilot_scale_expansion_passed` |
| Scale integrity | `npm run ops:validate-scale-readiness-integrity -- --json` | `integrityPassed: true` |
| Commercial inflection | `npm run ops:run-commercial-inflection-readiness-orchestrator -- --json` | `milestone: commercial_inflection_ready` |

If scale expansion not PASS — return to [`next-step-6-pilot-scale-expansion-2026-05-29.md`](./next-step-6-pilot-scale-expansion-2026-05-29.md).

---

## Execution sequence

### 7.1 Production GA checklist

| Area | Owner | Deliverable |
|------|-------|-------------|
| Engineering gates | CTO | P0 + Tier 2 + scale readiness all PASS on production |
| Ops runbooks | COO | `docs/commercial-pilot-runbook.md` updated with GA cutover |
| Cron + monitoring | Ops | Production cron gate PASS |
| Rollback path | Integration | Documented + drill within 90 days |

```bash
npm run run:production-pilot-ready
npm run ops:validate-scale-readiness-integrity -- --json
```

### 7.2 SOC2 / security review

| Task | Owner |
|------|-------|
| Security questionnaire | Security |
| Forbidden claims audit | Marketing + Legal |
| Webhook + API security smokes | QA |

```bash
npm run smoke:pilot-forbidden-claims-enforcement
npm run test:security
```

**Honesty:** Do not claim SOC2 Type II until audit complete — `SCALE_SOC2_READINESS_TRACK_REVIEWED=1` only.

### 7.3 Pricing + packaging finalization

| Artifact | Owner |
|----------|-------|
| Pricing tiers documented | Founder + Sales |
| ICP segments finalized (all F&B) | Sales |
| Expansion LOI template | Legal |

### 7.4 Public launch narrative

Marketing drafts public narrative with forbidden claims enforcement PASS.

```bash
npm run smoke:investor-narrative-onepager
npm run smoke:pilot-forbidden-claims-enforcement
```

---

## Product surfaces (verify before GA)

| Surface | Route | What to check |
|---------|-------|---------------|
| Launch Wizard | `/dashboard/launch-wizard` | GA mode readiness |
| Integration Health | `/dashboard/integration-health` | All channels honest LIVE/SKIPPED |
| Platform Ops | `/platform/commercial-pilot-ops` | Full artifact chain |
| Public landings | `/solutions/*` | Forbidden claims accurate |

---

## Step 8 preview (Series A / Partner Expansion)

| Task | Owner |
|------|-------|
| Series A partner expansion gates | Sales + Founder |
| `ops:run-series-a-partner-expansion-post-scale-orchestrator` | COO |
| Data room artifact chain complete | Founder |
| Second paid pilot or enterprise SSO production | Sales + Integration |

---

## Honesty guardrails

1. GA launch requires scale readiness `scale_complete` — not pilot-only evidence
2. Public claims must pass `smoke:pilot-forbidden-claims-enforcement`
3. Per-customer GO isolation — never reuse GO artifact across prospects
4. KDS: polling fallback only — no rush-hour SLO claims

---

## RACI

| Phase | R | A |
|-------|---|---|
| Production GA checklist | CTO + COO | CTO |
| Security review | Security | CTO |
| Pricing + packaging | Founder + Sales | Founder |
| Launch narrative | Marketing + Legal | Founder |
