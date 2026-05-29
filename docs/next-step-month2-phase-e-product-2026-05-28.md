# KitchenOS — Phase E: Month 2 market readiness (post-honest Week 1)

**Status:** Product surfaces + Month 2 integrity guard **IMPLEMENTED** · Human workstreams A–D **REQUIRED**  
**Policy:** `era21-month2-market-readiness-v1` · Integrity `era29-month2-market-readiness-integrity-v1`  
**Playbook:** [`docs/next-step-5-month2-market-readiness-2026-05-28.md`](./next-step-5-month2-market-readiness-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-pilot-week1-phase-d-product-2026-05-28.md`](./next-step-pilot-week1-phase-d-product-2026-05-28.md) → honest Week 1 + `proof_captured` metrics

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-month2` | Month 2 progress · integrity badge |
| Launch Wizard | Commercial blockers | Workstreams A–E panel |
| Today strip | `launch-wizard-today-strip-month2` | Month 2 N/3 blocking workstreams · integrity FAIL |
| Owner Briefing | priority 3 | Ranked action per next workstream |
| Platform ops | `#month2-market-readiness` | Post-Week1 orchestrator commands |

---

## Human sequence (canonical)

```bash
npm run ops:validate-pilot-week1-execution-integrity -- --json
npm run ops:validate-month2-market-readiness-integrity -- --json
npm run ops:run-month2-market-readiness-post-week1-orchestrator -- --write
npm run ops:export-month2-market-readiness-env-template -- --write
# Workstreams A–D: record MONTH2_* / PILOT_CASE_STUDY_CUSTOMER_APPROVAL after real milestones
npm run smoke:investor-narrative-onepager
npm run smoke:pilot-forbidden-claims-enforcement
npm run smoke:pilot-case-study-draft
npm run ops:validate-month2-market-readiness-integrity -- --json
npm run ops:sync-month2-market-readiness-integrity-baseline -- --write
```

**Acceptance:** Blocking workstreams A, B, D complete · investor `proof_ready_with_metrics` · case study publish gate honest · no fake PASS in artifacts.

**Then:** Scale readiness train — `ops:run-scale-readiness-post-month2-orchestrator`.

---

## STOP rules

- `MONTH2_*` env without honest Week 1 → `month2_started_without_week1`
- Investor `overall: PASSED` without metrics → `fake_investor_pass`
- Case study `proof_ready_for_publish` without approval → `fake_case_study_publish`
- Week 1 integrity FAIL while Month 2 panel visible → blocked badge on Today + Launch Wizard

---

## Next step after Phase E PASS

1. [`docs/next-step-scale-phase-f-product-2026-05-28.md`](./next-step-scale-phase-f-product-2026-05-28.md) — Scale integrity + product wiring
2. [`docs/next-step-6-scale-readiness-2026-05-28.md`](./next-step-6-scale-readiness-2026-05-28.md)
3. `npm run ops:run-scale-readiness-post-month2-orchestrator -- --write`

**Following engineering slice (optional):** Series A integrity (Phase G) · PostHog `briefing_click` on Month 2 workstream CTAs.
