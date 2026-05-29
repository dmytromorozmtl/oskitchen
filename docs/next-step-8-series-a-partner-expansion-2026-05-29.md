# Next Step 8 — Series A / Partner Expansion

**Date:** 2026-05-29  
**Prerequisite:** Step 7 complete — `milestone: production_ga_passed`  
**Goal:** Series A fundraise readiness + partner channel expansion  
**Audience:** Founder, Sales, COO, Legal, Marketing

---

## Entry criteria

| Check | Command | Expected |
|-------|---------|----------|
| Production GA PASS | `npm run ops:run-production-ga-execution -- --json` | `milestone: production_ga_passed` |
| Scale integrity | `npm run ops:validate-scale-readiness-integrity -- --json` | `integrityPassed: true` |
| Commercial inflection | `npm run ops:run-commercial-inflection-readiness-orchestrator -- --json` | `milestone: commercial_inflection_ready` |

If production GA not PASS — return to [`next-step-7-production-ga-readiness-2026-05-29.md`](./next-step-7-production-ga-readiness-2026-05-29.md).

---

## Execution sequence

### 8.1 Series A data room bundle

| Artifact | Owner |
|----------|-------|
| Investor narrative onepager | Founder |
| Competitor feature gap matrix | PM |
| Pilot case study draft | CS |
| Metrics baseline | Ops |

```bash
npm run smoke:investor-narrative-onepager
npm run smoke:competitor-feature-gap-matrix
npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write
```

Env: `SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED=1`

### 8.2 Partner channel expansion

| Task | Owner |
|------|-------|
| Woo/Shopify partner one-pager | Sales + Integration |
| Honest LIVE maturity per channel | Integration |
| Integration Health audit | QA |

```bash
npm run smoke:woo-shopify-live
npm run smoke:woo-shopify
```

Env: `SERIES_A_PARTNER_ONEPAGER_REVIEWED=1`

### 8.3 Multi-region pilot playbook

| Task | Owner |
|------|-------|
| EU/US staging honesty | Ops |
| Forbidden claims strict review | Marketing + Legal |

```bash
npm run smoke:pilot-forbidden-claims-enforcement
```

Env: `SERIES_A_MULTI_REGION_PLAYBOOK_DRAFTED=1`, `SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED=1`

### 8.4 Customer success repeatability

| Artifact | Owner |
|----------|-------|
| CS playbook from pilot #1 | CS |
| NPS + expansion metrics | Founder |

```bash
npm run smoke:pilot-metrics-baseline
```

Env: `SERIES_A_CS_PLAYBOOK_REVIEWED=1`

---

## Product surfaces (verify before Series A)

| Surface | Route | What to check |
|---------|-------|---------------|
| Launch Wizard | `/dashboard/launch-wizard` | Series A panel visible |
| Integration Health | `/dashboard/integration-health` | Woo/Shopify honest LIVE/SKIPPED |
| Platform Ops | `/platform/commercial-pilot-ops` | Full artifact chain |
| Public landings | `/solutions/*` | Forbidden claims accurate |
| Integrations | `/integrations` | Partner channel copy honest |

---

## Step 9 preview (Market Leader Positioning)

| Task | Owner |
|------|-------|
| Market leader positioning gates | Founder + PM |
| `ops:run-market-leader-positioning-post-series-a-orchestrator` | COO |
| Competitor leapfrog roadmap | PM |
| Second paid pilot or enterprise SSO production | Sales + Integration |

---

## Honesty guardrails

1. Series A data room requires production GA `production_ga_passed` — not pilot-only evidence
2. Partner channel copy must match Integration Health LIVE/SKIPPED status
3. Never claim enterprise SSO production until `gate3_enterprise_sso_production` PASS
4. Per-customer GO isolation — never reuse GO artifact across prospects
5. ICP = all F&B formats — not ghost-kitchen-only

---

## RACI

| Phase | R | A |
|-------|---|---|
| Series A data room | Founder + PM | Founder |
| Partner channel | Sales + Integration | Sales |
| Multi-region playbook | Ops + Legal | COO |
| CS repeatability | CS + Founder | Founder |
