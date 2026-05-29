# Next Step 9 — Market Leader Positioning

**Date:** 2026-05-29  
**Prerequisite:** Step 8 complete — `milestone: series_a_partner_expansion_passed`  
**Goal:** Category narrative, competitive moat proof, analyst kit  
**Audience:** Founder, PM, Marketing, Sales, Legal

---

## Entry criteria

| Check | Command | Expected |
|-------|---------|----------|
| Series A expansion PASS | `npm run ops:run-series-a-partner-expansion-execution -- --json` | `milestone: series_a_partner_expansion_passed` |
| Series A integrity | `npm run ops:validate-series-a-partner-expansion-integrity -- --json` | `integrityPassed: true` |
| Production GA PASS | `npm run ops:run-production-ga-execution -- --json` | `milestone: production_ga_passed` |

If Series A not PASS — return to [`next-step-8-series-a-partner-expansion-2026-05-29.md`](./next-step-8-series-a-partner-expansion-2026-05-29.md).

---

## Execution sequence

### 9.1 Category narrative (Pillar 1)

| Artifact | Owner |
|----------|-------|
| Ghost kitchen + meal prep OS positioning | PM + Marketing |
| Case study draft with operator evidence | CS |
| Forbidden claims on public landings | Legal |

```bash
npm run smoke:pilot-case-study-draft
npm run smoke:pilot-forbidden-claims-enforcement
npm run ops:run-market-leader-positioning-post-series-a-orchestrator -- --write
```

Env: `MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED=1`

### 9.2 Competitive moat proof (Pillar 2)

| Task | Owner |
|------|-------|
| Competitor leapfrog roadmap updated | PM |
| Feature maturity matrix with pilot evidence | PM |
| Competitor matrix evidence aligned | QA |

```bash
npm run smoke:competitor-feature-gap-matrix
```

Env: `MARKET_LEADER_COMPETITIVE_MOAT_REVIEWED=1`

### 9.3 Analyst / press kit (Pillar 3)

| Artifact | Owner |
|----------|-------|
| Investor narrative onepager (updated) | Founder |
| Metrics baseline with trend | Ops |
| Rollback drill proof for enterprise buyers | Integration |

```bash
npm run smoke:investor-narrative-onepager
npm run smoke:pilot-metrics-baseline
npm run smoke:pilot-rollback-drill
```

Env: `MARKET_LEADER_ANALYST_KIT_PUBLISHED=1`

### 9.4 Second paid pilot or enterprise SSO production (Pillar 4)

| Task | Owner |
|------|-------|
| Second paid pilot LOI or enterprise SSO production | Sales + Integration |
| Per-customer GO isolation maintained | Legal |
| Enterprise SSO staging proof | Integration |

```bash
npm run smoke:enterprise-sso-idp-staging
npm run smoke:pilot-gono-go
```

Env: `MARKET_LEADER_SECOND_PILOT_OR_ENTERPRISE_SSO=1`

---

## Product surfaces (verify before market leader launch)

| Surface | Route | What to check |
|---------|-------|---------------|
| Launch Wizard | `/dashboard/launch-wizard` | Market leader panel visible |
| Public landings | `/solutions/ghost-kitchens`, `/solutions/meal-prep` | Category narrative honest |
| Platform Ops | `/platform/commercial-pilot-ops` | Full artifact chain |
| Reports | `/dashboard/reports` | Metrics baseline trend |
| Integration Health | `/dashboard/integration-health` | Enterprise SSO honest LIVE/SKIPPED |

---

## Step 10 preview (Sustained Operational Excellence)

| Task | Owner |
|------|-------|
| Sustained ops excellence gates | COO |
| `ops:run-sustained-operational-excellence-post-market-leader-orchestrator` | Ops |
| Continuous improvement loop | PM + CS |
| Multi-pilot repeatability evidence | Founder |

---

## Honesty guardrails

1. Market leader positioning requires `series_a_partner_expansion_passed` — not pilot-only evidence
2. Case study claims require `caseStudyProofStatus: internal_draft_ready` minimum — no fake customer logos
3. Enterprise SSO production claims require `gate3_enterprise_sso_production` PASS
4. Category narrative covers all F&B formats — not ghost-kitchen-only positioning
5. Competitor matrix must remain `evidence_aligned_era17` — never hand-edit PASS

---

## RACI

| Phase | R | A |
|-------|---|---|
| Category narrative | PM + Marketing | Founder |
| Competitive moat | PM | PM |
| Analyst kit | Founder + Ops | Founder |
| Second pilot / enterprise SSO | Sales + Integration | Sales |
