# KitchenOS — Phase F: Scale readiness (post-honest Month 2)

**Status:** Product surfaces + Scale integrity guard **IMPLEMENTED** · Human Gates 1–5 **REQUIRED**  
**Policy:** `era21-scale-readiness-v1` · Integrity `era30-scale-readiness-integrity-v1`  
**Playbook:** [`docs/next-step-6-scale-readiness-2026-05-28.md`](./next-step-6-scale-readiness-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-month2-phase-e-product-2026-05-28.md`](./next-step-month2-phase-e-product-2026-05-28.md) → honest Month 2 complete

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-scale` | Scale progress · integrity badge |
| Launch Wizard | Commercial blockers | Gates 1–6 panel |
| Today strip | `launch-wizard-today-strip-scale` | Scale N/5 gates · integrity FAIL |
| Owner Briefing | priority 3 | Ranked action per next gate |
| Platform ops | `#scale-readiness` | Post-Month2 orchestrator commands |

---

## Human sequence (canonical)

```bash
npm run ops:validate-month2-market-readiness-integrity -- --json
npm run ops:validate-scale-readiness-integrity -- --json
npm run ops:run-scale-readiness-post-month2-orchestrator -- --write
npm run ops:export-scale-readiness-env-template -- --write
# Gates 1–5: record SCALE_* env after real milestones
npm run smoke:pilot-rollback-drill
npm run smoke:commerce-webhook-drill
npm run smoke:pilot-gono-go
npm run ops:validate-scale-readiness-integrity -- --json
npm run ops:sync-scale-readiness-integrity-baseline -- --write
```

**Acceptance:** Blocking gates 1–5 complete · rollback `proof_passed` · data room chain honest · no SOC2 false claims.

**Then:** Series A partner expansion train — `ops:run-series-a-partner-expansion-post-scale-orchestrator`.

---

## STOP rules

- `SCALE_*` env without honest Month 2 → `scale_started_without_month2`
- Rollback `proof_passed` without all steps PASSED → `fake_rollback_pass`
- Month 2 integrity FAIL while Scale panel visible → blocked badge on Today + Launch Wizard

---

## Next step after Phase F PASS

1. Series A partner expansion integrity guard (Phase G) — mirror era28–era30
2. `npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write`

**Following engineering slice (optional):** Market leader positioning integrity · PostHog on Scale gate CTAs.
