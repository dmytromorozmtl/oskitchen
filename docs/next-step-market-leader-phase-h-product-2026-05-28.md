# OS Kitchen — Phase H: Market leader positioning (post-honest Series A)

**Status:** Product surfaces + Market leader integrity guard **IMPLEMENTED** · Human Pillars 1–4 **REQUIRED**  
**Policy:** `era21-market-leader-positioning-v1` · Integrity `era32-market-leader-positioning-integrity-v1`  
**Playbook:** [`docs/next-step-8-market-leader-positioning-2026-05-28.md`](./next-step-8-market-leader-positioning-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-series-a-phase-g-product-2026-05-28.md`](./next-step-series-a-phase-g-product-2026-05-28.md) → honest Series A complete

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-market-leader` | Pillars 1–4 · integrity badge |
| Launch Wizard | Commercial blockers | Market leader phases panel |
| Today strip | `launch-wizard-today-strip-market-leader` | Market leader N/4 pillars · integrity FAIL |
| Owner Briefing | priority 7 | Ranked action per next pillar |
| Platform ops | `#market-leader-positioning` | Post-Series A orchestrator commands |

---

## Human sequence (canonical)

```bash
npm run ops:validate-series-a-partner-expansion-integrity -- --json
npm run ops:validate-market-leader-positioning-integrity -- --json
npm run ops:run-market-leader-positioning-post-series-a-orchestrator -- --write
npm run ops:export-market-leader-positioning-env-template -- --write
# Pillars 1–4: record MARKET_LEADER_* env after real milestones
npm run smoke:pilot-case-study-draft
npm run smoke:pilot-rollback-drill
npm run smoke:investor-narrative-onepager
npm run ops:validate-market-leader-positioning-integrity -- --json
npm run ops:sync-market-leader-positioning-integrity-baseline -- --write
```

**Acceptance:** Pillars 1–4 complete · case study customer approval · rollback `proof_passed` · investor `proof_ready_with_metrics` · no unvalidated "market leader" claims.

**Then:** Sustained operational excellence train — `ops:run-sustained-operational-excellence-post-market-leader-orchestrator`.

---

## STOP rules

- `MARKET_LEADER_*` env without honest Series A → `market_leader_started_without_series_a`
- Investor `overall: PASSED` without metrics proof → `fake_investor_pass`
- Rollback `proof_passed` with SKIPPED steps → `fake_rollback_pass`
- Series A integrity FAIL while Market leader panel visible → blocked badge on Today + Launch Wizard

---

## Next step after Phase H PASS

1. Sustained operational excellence integrity guard (Phase I) — **IMPLEMENTED** — see [`docs/next-step-sustained-ops-phase-i-product-2026-05-28.md`](./next-step-sustained-ops-phase-i-product-2026-05-28.md)
2. `npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator -- --write`

**Following engineering slice (optional):** era25 convergence reads integrity baseline · PostHog on pillar CTAs.
