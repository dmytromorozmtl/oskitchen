# Pilot execution checklist — 16 steps

**Policy:** `pilot-execution-checklist-v1`  
**Status:** operator + GTM execution template — customize dates per customer  
**Updated:** 2026-06-02  
**Parent:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · [`loi-design-partner-template.md`](./loi-design-partner-template.md) · **GO/NO-GO:** [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json)

Use this checklist from **first qualified conversation** through **pilot close**. Set `[KICKOFF_DATE]` when LOI or paid pilot SOW is signed. Do not skip steps marked **Blocker** without documented SKIPPED WITH REASON.

**Honesty rule:** External claims (case study, investor deck, LIVE integration labels) require steps **13–15** captured with artifact PASS — not checkbox optimism.

---

## How to use

1. Copy the table into your pilot tracker (Notion, CRM, or spreadsheet).
2. Replace `[KICKOFF_DATE]` with the signed LOI/SOW date.
3. Assign named owners (roles below are defaults).
4. Mark status: `todo` · `in_progress` · `done` · `skipped_with_reason`
5. Re-run `npm run smoke:pilot-gono-go` after steps **4**, **10**, and **15**.

| Role | Default owner |
|------|---------------|
| **Founder** | GO/NO-GO, mid-pilot review |
| **Sales** | ICP, LOI, SOW |
| **Legal** | Contract review |
| **Ops** | Staging vault, P0 smokes, migrations |
| **Engineering** | Tier 0 cert, golden path support |
| **CS** | Workspace provision, weekly sync |
| **Integration** | Channels, webhooks, rollback |
| **Customer ops lead** | Design partner / pilot operator |

---

## 16-step execution checklist

| # | Step | Owner | Due (from kickoff) | Blocker? | Done |
|---|------|-------|-------------------|:--------:|:----:|
| 1 | **Qualify ICP** — complete criteria in [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md); confirm no disqualifiers; record in `PILOT_GONOGO_ICP_INPUT_JSON` | Sales | `[KICKOFF_DATE]` − 14 days | **Y** | ☐ |
| 2 | **Sign design partner LOI** — countersigned PDF on file; set `PILOT_GONOGO_CUSTOMER_NAME` + `PILOT_GONOGO_LOI_SIGNED_DATE` ([`loi-design-partner-template.md`](./loi-design-partner-template.md)) | Sales + Legal | `[KICKOFF_DATE]` − 7 days | **Y** | ☐ |
| 3 | **Stage environment ready** — staging URL, SSL, database, cron, webhook endpoints per staging checklist (Task 15 doc when published); vault secrets catalog started | Ops | `[KICKOFF_DATE]` − 7 days | **Y** | ☐ |
| 4 | **P0 staging smokes PASS** — `npm run smoke:p0-staging-proof-unblock`; artifact `p0ProofStatus: proof_passed` ([`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md)) | Ops + Engineering | `[KICKOFF_DATE]` − 3 days | **Y** | ☐ |
| 5 | **Tier 0 engineering gate PASS** — `npm run smoke:pilot-tier-preflight`; governance bundles green on release SHA | Engineering | `[KICKOFF_DATE]` − 3 days | **Y** | ☐ |
| 6 | **Forbidden claims verify PASS** — `MARKETING_CLAIMS_STRICT=1 npm run verify-claims`; sales deck + SOW reviewed | Engineering + Legal | `[KICKOFF_DATE]` − 2 days | **Y** | ☐ |
| 7 | **Provision pilot workspace** — slug reserved, owner invite sent, modules enabled per Exhibit A; Launch Wizard accessible | CS | Day 0 (`[KICKOFF_DATE]`) | **Y** | ☐ |
| 8 | **Kickoff call + rollback briefing** — success metrics aligned; rollback steps from [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md#rollback-plan) acknowledged | CS + Integration | Day 0 | **Y** | ☐ |
| 9 | **Operator golden path (Tier 2)** — [`pilot-operator-golden-path-era17.md`](./pilot-operator-golden-path-era17.md); `npm run smoke:pilot-operator-golden-path` manual sign-off on staging | Customer ops lead + CS | Day 0 – Day 3 | **Y** | ☐ |
| 10 | **Connect qualified channel** — Woo **or** Shopify test shop **or** storefront only (per SOW); label BETA integrations honestly on Integration Health | Integration | Day 1 – Day 5 | N | ☐ |
| 11 | **First live order path** — order visible in Order Hub + KDS bump; record time-to-first-order | Customer ops lead | Day 2 – Day 7 | N | ☐ |
| 12 | **Production traffic gate** — explicit written go from Founder + CS after steps 4, 9, 11; no rush-hour or LIVE marketplace claims | Founder | Day 7 – Day 10 | **Y** | ☐ |
| 13 | **Capture Week 1 metrics baseline** — orders/day, bump time, health score per [`pilot-week1-checklist.md`](./pilot-week1-checklist.md); `npm run smoke:pilot-metrics-baseline` | CS + Customer ops lead | Day 7 – Day 14 | N | ☐ |
| 14 | **Weekly sync cadence** — 30–45 min sync on agreed day; defects logged in support; ≥80% attendance through mid-pilot | CS | Weekly from Day 7 | N | ☐ |
| 15 | **Mid-pilot GO/NO-GO review** — `npm run smoke:pilot-gono-go` + `npm run cert:commercial-pilot-evidence-era16`; update `artifacts/pilot-gono-go-summary.json` | Founder | Day 30 – Day 45 | **Y** | ☐ |
| 16 | **Pilot close decision** — convert to paid (SOW renewal), extend LOI, or execute rollback drill ([`pilot-rollback-drill-era17.md`](./pilot-rollback-drill-era17.md)); case study only with written approval | Founder + Sales + CS | Day 60 – Day 90 | **Y** | ☐ |

---

## Step detail (quick links)

| Step | Primary doc / command |
|------|------------------------|
| 1 | [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) · `evaluatePilotIcpQualification` |
| 2 | [`loi-design-partner-template.md`](./loi-design-partner-template.md) |
| 3 | [`STAGING_PILOT_OPS_RUNBOOK.md`](./STAGING_PILOT_OPS_RUNBOOK.md) · [`artifacts/vault-readiness-report.json`](../artifacts/vault-readiness-report.json) |
| 4 | `npm run smoke:p0-staging-proof-unblock` |
| 5 | `npm run smoke:pilot-tier-preflight` |
| 6 | `npm run smoke:pilot-forbidden-claims-enforcement` |
| 7 | [`PILOT_ONBOARDING_RUNBOOK.md`](./PILOT_ONBOARDING_RUNBOOK.md) · `/dashboard/launch-wizard` |
| 8 | [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) |
| 9 | [`pilot-operator-golden-path-era17.md`](./pilot-operator-golden-path-era17.md) |
| 10 | [`channel-pilot-playbook-era17.md`](./channel-pilot-playbook-era17.md) |
| 11 | [`pilot-week1-checklist.md`](./pilot-week1-checklist.md) Days 1–2 |
| 12 | [`PAID_PILOT_GO_NO_GO_CHECKLIST.md`](./PAID_PILOT_GO_NO_GO_CHECKLIST.md) |
| 13 | [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) |
| 14 | LOI Exhibit B · [`PILOT_FEEDBACK_TEMPLATE.md`](./PILOT_FEEDBACK_TEMPLATE.md) |
| 15 | [`era20-first-paid-pilot-package-2026-05-28.md`](./era20-first-paid-pilot-package-2026-05-28.md) |
| 16 | [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md#rollback-summary) |

---

## Current blockers (June 2 snapshot)

Reference only — re-verify before each pilot:

| Step | Known gap | Honest status |
|------|-----------|---------------|
| 4 | 11 vault env vars missing | P0 **SKIPPED** in CI |
| 2 | No signed LOI on record | `loiSignedDate: null` |
| 5 | Tier 0 local PASS | Engineering gate OK |
| 15 | Overall decision | **NO-GO** until 2 + 4 PASS |

Source: [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json)

---

## Sign-off row (pilot close)

| Field | Value |
|-------|-------|
| Customer | |
| Kickoff date | |
| Mid-pilot decision | GO / CONDITIONAL / NO-GO |
| Final decision | Convert / Extend / Rollback |
| Metrics artifact | `pilot-metrics-baseline` PASS? ☐ |
| Forbidden claims re-run | ☐ |
| Founder sign-off | _________________ Date ______ |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | Tier 0–3 gates |
| [`pilot-week1-checklist.md`](./pilot-week1-checklist.md) | Day-by-day Week 1 |
| [`PAID_PILOT_GO_NO_GO_CHECKLIST.md`](./PAID_PILOT_GO_NO_GO_CHECKLIST.md) | Decision criteria |
| [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) | Module maturity |
