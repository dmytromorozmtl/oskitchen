# KitchenOS — Шаг 5: Month 2 market readiness (после Week 1 complete)

**Policy:** `era21-month2-market-readiness-v1` · **Backlog:** `KOS-E21-005`  
**Предусловие:** Pilot Week 1 complete — all 5 day phases + Day 5 artifacts  
**Цель:** Investor narrative + GTM landing + product hardening → repeatable paid pilot motion

---

## Decision tree

```
Week 1 complete (era21 Week 1 panels hidden)
        │
        ├── Workstream A: Investor one-pager v3 (real KPIs)
        ├── Workstream B: ICP landing pages (ghost kitchen + meal prep)
        ├── Workstream C: Public API rate limits (P2, optional)
        ├── Workstream D: Case study publish gate (customer approval)
        └── Workstream E: Second pilot pipeline (optional)
                │
                ▼
         Scale readiness review (Step 6)
```

---

## Engineering wiring (era21)

| Surface | When visible |
|---------|--------------|
| `/dashboard/today` | Top action priority **4** + compact Month 2 panel |
| `/dashboard/launch-wizard` | Month 2 workstreams in commercial blockers |
| Platform → Pilot ops | `#month2-market-readiness` phases panel |

**Mutually exclusive gate chain:** P0 (0) → Tier2 (1) → Commercial GO (2) → Week 1 (3) → **Month 2 (4)**.

**Blocking workstreams:** A, B, D — must complete for Month 2 panels to hide.  
**Optional:** C (API rate limits P2), E (second prospect pipeline).

---

## Preflight (1 hour)

```bash
npm run ops:run-month2-market-readiness-post-week1-orchestrator -- --write
npm run ops:validate-pilot-week1-env -- --json          # week1Complete: true
npm run ops:validate-month2-market-readiness-env -- --json
npm run ops:export-month2-market-readiness-env-template -- --write
npm run ops:sync-month2-market-readiness-progress-report -- --write
npm run ops:export-month2-market-readiness-readiness-checklist -- --write
npm run smoke:pilot-metrics-baseline                     # overall: PASSED
npm run smoke:pilot-case-study-draft                     # internal_draft_ready
npm run smoke:pilot-gono-go                              # decision: GO
npm run smoke:investor-narrative-onepager                # gated on metrics PASSED
```

**Post-Week 1 orchestrator milestones (`month2Milestone`):**

| Milestone | Meaning | Exit code (orchestrator `--json`) |
|-----------|---------|-----------------------------------|
| `week1_blocked` | Week 1 incomplete or GO missing | `2` |
| `workstream_a_investor_onepager` | Metrics PASSED; investor sign-off pending | `0` |
| `workstream_b_gtm_icp_landings` | ICP landing review env vars pending | `0` |
| `workstream_d_case_study_publish` | Customer approval + publish smoke pending | `0` |
| `month2_complete` | Blocking A + B + D done | `0` |

Optional workstreams C (API rate limits) and E (second prospect) do **not** block milestone resolution.

**Product surfaces active after Week 1 complete (Month 2 incomplete):**

| Surface | Expected |
|---------|----------|
| `/dashboard/today` | Month 2 ranked action (priority 4) + compact panel |
| `/dashboard/launch-wizard` | Month 2 workstreams in commercial blockers |
| `/solutions/ghost-kitchens` + `/solutions/meal-prep` | ICP landing review targets |
| Platform → Pilot ops | `#month2-market-readiness` phases panel |
| `/dashboard/reports` | Investor KPI source from metrics baseline |

**Honest gates:**

| Artifact | Required state | External claim allowed? |
|----------|----------------|-------------------------|
| `pilot-metrics-baseline-summary.json` | `overall: PASSED` | Yes — cite 6 KPIs |
| `pilot-case-study-draft-summary.json` | `internal_draft_ready` | Internal only |
| `pilot-case-study-draft-summary.json` | `publishProofStatus: proof_ready_for_publish` | Public case study |
| `investor-narrative-onepager-summary.json` | `narrativeProofStatus: proof_ready_with_metrics` | Investor deck KPI table |
| `pilot-gono-go-summary.json` | `decision: GO` | Paid pilot in progress |

Never publish customer name or metrics without `PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed|anonymized_signed`.

---

## Workstream A — Investor one-pager v3

| Step | Action | Surface / command |
|------|--------|-------------------|
| 1 | Re-run metrics baseline with Week 4–8 rolling averages | `npm run smoke:pilot-metrics-baseline` |
| 2 | Draft one-pager with real KPI table | `npm run smoke:investor-narrative-onepager` |
| 3 | Legal review forbidden claims | `docs/investor-narrative-onepager-era17.md` |
| 4 | Founder sign-off | `export MONTH2_INVESTOR_FOUNDER_SIGNOFF=1` |

**Acceptance:** `artifacts/investor-narrative-onepager-summary.json` → `proof_ready_with_metrics`.

---

## Workstream B — GTM ICP landing pages

| ICP segment | Route | Proof hook |
|-------------|-------|------------|
| Ghost kitchen | `/solutions/ghost-kitchens` | Order Hub + KDS TTV from case study |
| Meal prep | `/solutions/meal-prep` | Production calendar + reports export |

```bash
npm run smoke:pilot-forbidden-claims-enforcement
export MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED=1
export MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED=1
```

No "LIVE marketplace" unless `smoke:woo-shopify-live` PASSED on staging.

---

## Workstream C — Public API rate limits (optional P2)

```bash
export MONTH2_API_RATE_LIMITS_DOC_REVIEWED=1
```

Verify Integration Health API keys card at `/dashboard/integration-health`.

---

## Workstream D — Case study publish gate

```bash
export PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed
npm run smoke:pilot-case-study-draft
```

**Acceptance:** `publishProofStatus: proof_ready_for_publish`

---

## Workstream E — Second pilot pipeline (optional)

```bash
export MONTH2_SECOND_PROSPECT_QUEUED=1
# or explicitly defer:
export MONTH2_SECOND_PROSPECT_SKIPPED=1
```

Reuse Step 3 playbook: [`next-step-3-after-tier2-pass-2026-05-28.md`](./next-step-3-after-tier2-pass-2026-05-28.md)

---

## Ops commands

```bash
npm run ops:run-month2-market-readiness-post-week1-orchestrator -- --write
npm run ops:validate-month2-market-readiness-env -- --json
npm run ops:export-month2-market-readiness-env-template -- --write
npm run ops:sync-month2-market-readiness-progress-report -- --write
npm run ops:export-month2-market-readiness-readiness-checklist -- --write
npm run test:ci:month2-market-readiness-era21
npm run test:ci:month2-market-readiness-era21:cert
```

GitHub workflow: `.github/workflows/ops-month2-market-readiness-validate.yml` (includes orchestrator step with `continue-on-error: true`)

**Readiness checklist artifact:** `docs/month2-market-readiness-readiness-checklist.md` (generated via export script — do not hand-edit PASS states)

---

## Product surfaces in Month 2 (operational mode after complete)

| Surface | Expected behavior |
|---------|-------------------|
| `/dashboard/today` | Operational ranked actions — no Steps 1–5 gate panels |
| Owner Briefing | Daily cadence tiles: reports, integration health, production |
| `/dashboard/reports` | Pinned weekly exports from Week 1 |
| Platform → Pilot ops | GO badge + metrics/case study/investor artifact status |

---

## Roadmap only (not Month 2 commitments)

| Item | Status |
|------|--------|
| Offline POS | RFC — not pilot promise |
| Unified loyalty | RFC — competitor leapfrog backlog |
| Table service | RFC — wow-gap audit P3 |

See [`competitor-leapfrog-roadmap-2026-05-28.md`](./competitor-leapfrog-roadmap-2026-05-28.md).

---

## Deliverables checklist

- [ ] Investor one-pager v3 with real KPIs (metrics artifact PASSED)
- [ ] Ghost kitchen + meal prep landing reviewed with forbidden-claims checklist
- [ ] Case study publish gate documented (approval env var)
- [ ] Second prospect in ICP pipeline (optional)
- [ ] GO still valid for active pilot customer
- [ ] No fabricated traction in `artifacts/*.json`
- [ ] `artifacts/month2-market-readiness-progress-report.md` synced for ops standup
- [ ] `docs/month2-market-readiness-readiness-checklist.md` exported via orchestrator

---

## Step 6 preview — Scale readiness (orchestrator plan)

See [`next-step-6-scale-readiness-2026-05-28.md`](./next-step-6-scale-readiness-2026-05-28.md)

**Next engineering slice (Step 6, same pattern as Steps 1–5):**

| Component | Planned artifact |
|-----------|------------------|
| Orchestrator lib | `lib/commercial/scale-readiness-post-month2-orchestrator-era21.ts` |
| Policy | `era21-scale-readiness-post-month2-orchestrator-v1` |
| Milestones | `month2_blocked` → `gate1_per_customer_go` → `gate2_soc2_track` → `gate3_sso_production` → `gate4_resilience_drills` → `gate5_data_room` → `scale_complete` |
| Ops scripts | `ops:run-scale-readiness-post-month2-orchestrator`, `ops:export-scale-readiness-readiness-checklist` |
| Validate env | add `scaleMilestone` + `readyForResilienceSmokes` to JSON |
| UI slice | milestone badge + redirect to Month 2 orchestrator when `month2_blocked` |
| Briefing priority | **5** (mutually exclusive with Steps 1–4) |
| CI workflow | orchestrator step in `ops-scale-readiness-validate.yml` |

**Human gate before Step 6:** all Month 2 blocking workstreams (A + B + D) complete — `month2Complete: true` in validate JSON.

**Immediate action if Week 1 incomplete:** [`next-step-4-pilot-week1-execution-2026-05-28.md`](./next-step-4-pilot-week1-execution-2026-05-28.md)
