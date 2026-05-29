# KitchenOS — Phase D: Pilot Week 1 execution (post-honest GO)

**Status:** Product surfaces + Week 1 integrity guard **IMPLEMENTED** · Human Day 1–5 execution **REQUIRED**  
**Policy:** `era21-pilot-week1-execution-v1` · Integrity `era28-pilot-week1-execution-integrity-v1`  
**Playbook:** [`docs/next-step-4-pilot-week1-execution-2026-05-28.md`](./next-step-4-pilot-week1-execution-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-commercial-go-closure-phase-c-product-2026-05-28.md`](./next-step-commercial-go-closure-phase-c-product-2026-05-28.md) → honest `decision: GO`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-pilot-week1` | Week 1 progress · integrity badge |
| Launch Wizard | Commercial blockers | 5-day phases panel |
| Today strip | `launch-wizard-today-strip-week1` | Week 1 N/5 days · integrity FAIL |
| Owner Briefing | priority 3 | Ranked action per next day |
| Integration Health | `#integration-health-pilot-week1` | Day 2 cadence honesty |
| Platform ops | Week 1 phases | Post-GO orchestrator commands |

---

## Human sequence (canonical)

```bash
npm run ops:validate-pilot-gono-go-integrity -- --json
npm run ops:validate-pilot-week1-execution-integrity -- --json
npm run ops:run-pilot-week1-execution-post-go-orchestrator -- --write
npm run ops:export-pilot-week1-env-template -- --write
# Day 1–4: record PILOT_WEEK1_* env after real milestones
npm run smoke:pilot-metrics-baseline
npm run smoke:pilot-case-study-draft
npm run smoke:pilot-gono-go
npm run ops:validate-pilot-week1-execution-integrity -- --json
npm run ops:sync-pilot-week1-execution-integrity-baseline -- --write
```

**Acceptance:** All 5 phases complete · metrics `overall: PASSED` + `proof_captured` · case study `internal_draft_ready` · GO re-run still honest.

**Then:** Month 2 market readiness train — `ops:run-month2-market-readiness-post-week1-orchestrator`.

---

## STOP rules

- `PILOT_WEEK1_*` env without honest GO → `week1_started_without_honest_go`
- Metrics `overall: PASSED` without captured metrics → `fake_metrics_pass`
- GO integrity FAIL while Week 1 panel visible → blocked badge on Today + Launch Wizard

---

## Next step after Phase D PASS

1. [`docs/next-step-month2-phase-e-product-2026-05-28.md`](./next-step-month2-phase-e-product-2026-05-28.md) — Month 2 integrity + product wiring
2. [`docs/next-step-5-month2-market-readiness-2026-05-28.md`](./next-step-5-month2-market-readiness-2026-05-28.md)
3. `npm run ops:run-month2-market-readiness-post-week1-orchestrator -- --write`

**Following engineering slice (optional):** Scale readiness integrity (Phase F) · PostHog `briefing_click` on Week 1 day CTAs.
