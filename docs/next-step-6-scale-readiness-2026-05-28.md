# OS Kitchen — Шаг 6: Scale readiness (после Month 2 complete)

**Policy:** `era21-scale-readiness-v1` · **Backlog:** `KOS-E21-006`  
**Предусловие:** Month 2 blocking workstreams A + B + D complete; GO still valid  
**Цель:** Multi-customer pilot ops + enterprise expansion gates → repeatable scale motion

---

## Decision tree

```
Month 2 complete (era21 Month 2 panels hidden)
        │
        ├── Gate 1: Per-customer GO artifacts (no shared GO)
        ├── Gate 2: SOC2 readiness track (no false certification)
        ├── Gate 3: Enterprise SSO production cutover
        ├── Gate 4: Rollback + webhook resilience drills
        ├── Gate 5: Investor/partner data room artifact chain
        └── Gate 6: Second paid pilot (optional)
                │
                ▼
         Series A / partner expansion review (Step 7)
```

---

## Engineering wiring (era21)

| Surface | When visible |
|---------|--------------|
| `/dashboard/today` | Top action priority **5** + compact scale panel |
| `/dashboard/launch-wizard` | Scale gates in commercial blockers |
| Platform → Pilot ops | `#scale-readiness` phases panel |

**Gate chain (mutually exclusive):** P0 (0) → Tier2 (1) → GO (2) → Week1 (3) → Month2 (4) → **Scale (5)**.

**Blocking gates:** 1–5. **Optional:** Gate 6 (second paid pilot).

---

## Preflight

```bash
npm run ops:run-scale-readiness-post-month2-orchestrator -- --write
npm run ops:validate-month2-market-readiness-env -- --json   # month2Complete: true
npm run ops:validate-scale-readiness-env -- --json
npm run ops:export-scale-readiness-env-template -- --write
npm run ops:sync-scale-readiness-progress-report -- --write
npm run ops:export-scale-readiness-readiness-checklist -- --write
npm run smoke:pilot-gono-go                                  # decision: GO
npm run smoke:pilot-rollback-drill
npm run smoke:pilot-metrics-baseline
```

**Post-Month 2 orchestrator milestones (`scaleMilestone`):**

| Milestone | Gate | Exit code (orchestrator `--json`) |
|-----------|------|-----------------------------------|
| `month2_blocked` | Month 2 A + B + D incomplete | `2` |
| `gate1_per_customer_pilot_ops` | `SCALE_PER_CUSTOMER_GO_ISOLATION=1` | `0` |
| `gate2_soc2_readiness_track` | `SCALE_SOC2_READINESS_TRACK_REVIEWED=1` | `0` |
| `gate3_enterprise_sso_production` | SSO pass or honest deferral | `0` |
| `gate4_operational_resilience` | rollback + webhook smokes + attestation | `0` |
| `gate5_data_room_artifact_chain` | artifact chain + index published | `0` |
| `scale_complete` | Gates 1–5 done | `0` |

Optional Gate 6 (second paid pilot) does **not** block milestone resolution.

**Product surfaces active after Month 2 complete (scale incomplete):**

| Surface | Expected |
|---------|----------|
| `/dashboard/today` | Scale ranked action (priority 5) + compact panel |
| `/dashboard/launch-wizard` | Scale gates in commercial blockers |
| Platform → Pilot ops | `#scale-readiness` phases panel |
| `/dashboard/integration-health` | SSO production status |
| `/dashboard/implementation` | Per-customer GO isolation |

---

## Gate 1 — Multi-tenant pilot ops

```bash
export SCALE_PER_CUSTOMER_GO_ISOLATION=1
```

| Requirement | Why |
|-------------|-----|
| Separate GO artifact per customer | Never reuse LOI/GO across prospects |
| Per-customer metrics baseline | KPI attribution for case studies |
| Platform ops honest status | Support admin sees real artifact state |

Routes: `/platform/commercial-pilot-ops#scale-readiness`, `/dashboard/implementation`

---

## Gate 2 — SOC2 readiness track

```bash
export SCALE_SOC2_READINESS_TRACK_REVIEWED=1
npm run smoke:pilot-forbidden-claims-enforcement
```

- Separate from commercial pilot GO — **do not claim SOC2** in sales until audit complete
- Doc: [`sales-forbidden-claims-training-era20.md`](./sales-forbidden-claims-training-era20.md)
- Cert chain: `test:ci:commercial-pilot-runbook:cert`

---

## Gate 3 — Enterprise SSO production

**Prerequisite:** P0 SSO staging child `overall: PASSED` in `artifacts/p0-staging-proof-unblock-summary.json`

```bash
export SCALE_SSO_PRODUCTION_STATUS=pass
# or honest deferral:
export SCALE_SSO_PRODUCTION_STATUS=deferred_honest
export SCALE_SSO_PRODUCTION_DEFERRED_REASON="Production IdP cutover scheduled — staging PASS recorded"
```

Routes: `/dashboard/launch-wizard`, `/dashboard/integration-health`

---

## Gate 4 — Operational resilience at scale

```bash
npm run smoke:pilot-rollback-drill
npm run smoke:commerce-webhook-drill
npm run smoke:webhook-replay-p1-expansion
export SCALE_RESILIENCE_DRILLS_ATTESTED=1
```

**Acceptance:** `artifacts/pilot-rollback-drill-summary.json` → `rollbackProofStatus: proof_passed`

---

## Gate 5 — Data room artifact chain

All artifacts smoke-honest before external share:

| Artifact | Minimum state |
|----------|---------------|
| `p0-staging-proof-unblock-summary.json` | `proof_passed` |
| `tier2-staging-golden-path-summary.json` | `proof_passed` |
| `pilot-metrics-baseline-summary.json` | `overall: PASSED` |
| `investor-narrative-onepager-summary.json` | `proof_ready_with_metrics` |
| `pilot-case-study-draft-summary.json` | `internal_draft_ready` |
| `pilot-gono-go-summary.json` | `decision: GO` |

```bash
export SCALE_DATA_ROOM_INDEX_PUBLISHED=1
```

---

## Gate 6 — Second paid pilot (optional)

```bash
export SCALE_SECOND_PAID_PILOT_QUEUED=1
# or: export SCALE_SECOND_PAID_PILOT_SKIPPED=1
```

Reuse Step 3 playbook per customer — never share GO artifacts.

---

## Ops commands

```bash
npm run ops:run-scale-readiness-post-month2-orchestrator -- --write
npm run ops:validate-scale-readiness-env -- --json
npm run ops:export-scale-readiness-env-template -- --write
npm run ops:sync-scale-readiness-progress-report -- --write
npm run ops:export-scale-readiness-readiness-checklist -- --write
npm run test:ci:scale-readiness-era21
npm run test:ci:scale-readiness-era21:cert
```

GitHub workflow: `.github/workflows/ops-scale-readiness-validate.yml` (includes orchestrator step with `continue-on-error: true`)

**Readiness checklist artifact:** `docs/scale-readiness-readiness-checklist.md` (generated via export script — do not hand-edit PASS states)

---

## Deliverables checklist

- [ ] Per-customer GO isolation attested
- [ ] SOC2 track reviewed — no false certification claims
- [ ] SSO production pass or honest deferral with reason
- [ ] Rollback + webhook drills PASS on staging
- [ ] Data room index published with audited artifact chain
- [ ] Second paid pilot queued or explicitly skipped (optional)
- [ ] No hand-edited PASS in `artifacts/*.json`
- [ ] `artifacts/scale-readiness-progress-report.md` synced
- [ ] `docs/scale-readiness-readiness-checklist.md` exported via orchestrator

---

## Step 7 preview — Series A / partner expansion (orchestrator plan)

See [`next-step-7-series-a-partner-expansion-2026-05-28.md`](./next-step-7-series-a-partner-expansion-2026-05-28.md)

**Next engineering slice (Step 7, same pattern as Steps 1–6):**

| Component | Planned artifact |
|-----------|------------------|
| Orchestrator lib | `lib/commercial/series-a-partner-expansion-post-scale-orchestrator-era21.ts` |
| Policy | `era21-series-a-partner-expansion-post-scale-orchestrator-v1` |
| Milestones | `scale_blocked` → `track_a_data_room` → `track_b_partner_channel` → `track_c_multi_region` → `track_d_cs_playbook` → `series_a_complete` |
| Ops scripts | `ops:run-series-a-partner-expansion-post-scale-orchestrator`, `ops:export-series-a-partner-expansion-readiness-checklist` |
| Validate env | add `seriesAMilestone` + `readyForPartnerSmokes` to JSON |
| UI slice | milestone badge + redirect to Scale orchestrator when `scale_blocked` |
| Briefing priority | **6** (mutually exclusive with Steps 1–5) |
| CI workflow | orchestrator step in `ops-series-a-partner-expansion-validate.yml` |

**Human gate before Step 7:** all Scale blocking gates 1–5 complete — `scaleComplete: true` in validate JSON.

**Immediate action if Month 2 incomplete:** [`next-step-5-month2-market-readiness-2026-05-28.md`](./next-step-5-month2-market-readiness-2026-05-28.md)
