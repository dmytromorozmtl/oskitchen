# OS Kitchen — Phase L: Maintenance mode (post-honest Product evolution)

**Status:** Product surfaces + Maintenance mode integrity guard **IMPLEMENTED** · Human commercial pilot path attestation **REQUIRED**  
**Policy:** `era24-maintenance-mode-v1` · Integrity `era36-maintenance-mode-integrity-v1`  
**Playbook:** [`docs/next-step-12-commercial-pilot-path-complete-2026-05-28.md`](./next-step-12-commercial-pilot-path-complete-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-product-evolution-phase-k-product-2026-05-28.md`](./next-step-product-evolution-phase-k-product-2026-05-28.md) → honest Product evolution complete

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-maintenance-mode` | 10 operator rhythms · integrity badge |
| Launch Wizard | Today strip | Maintenance mode N/M rhythms · integrity FAIL |
| Owner Briefing | priority 11 | Ranked action per overdue/due-soon rhythm |
| Platform ops | `#maintenance-mode` | Post–product-evolution orchestrator commands |
| Today dashboard | Compact panel | Operator rhythms (era24) + integrity badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-sustained-product-evolution-integrity -- --json
npm run ops:validate-maintenance-mode-integrity -- --json
npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write
# After product evolution healthy + maintenance prerequisites:
# MAINTENANCE_MODE_COMMERCIAL_PILOT_PATH_ATTESTED=1
# Quarterly: MAINTENANCE_MODE_RHYTHM_CALENDAR_REVIEWED=1 after rhythm calendar export
npm run ops:export-maintenance-mode-rhythm-calendar -- --write
npm run smoke:woo-shopify-live
npm run smoke:commerce-webhook-drill
npm run smoke:pilot-metrics-baseline
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-maintenance-mode-integrity -- --json
npm run ops:sync-maintenance-mode-integrity-baseline -- --write
```

**Acceptance:** Product evolution integrity PASS · operator rhythms fresh · no hand-edited PASS in `artifacts/*.json`.

**Then:** Engineering path terminus train — `ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator`.

---

## STOP rules

- `MAINTENANCE_MODE_*` env without honest Product evolution → `maintenance_started_without_product_evolution`
- `RHYTHM_CALENDAR_REVIEWED=1` before product evolution integrity PASS → `fake_rhythm_calendar_attestation`
- Metrics `overall: PASSED` without `proof_captured` → `fake_metrics_pass`
- Product evolution integrity FAIL while Maintenance panel visible → blocked badge on Today + Launch Wizard

---

## Env keys (tracked)

| Key | When to set |
|-----|-------------|
| `MAINTENANCE_MODE_COMMERCIAL_PILOT_PATH_ATTESTED` | After honest product evolution + era25 convergence |
| `MAINTENANCE_MODE_RHYTHM_CALENDAR_REVIEWED` | After quarterly rhythm calendar review + export |

---

## Next step after Phase L PASS

**Phase M IMPLEMENTED** — see [`docs/next-step-engineering-path-terminus-phase-m-product-2026-05-28.md`](./next-step-engineering-path-terminus-phase-m-product-2026-05-28.md)

1. ~~Engineering path terminus integrity guard (Phase M)~~ **DONE** (`era37-engineering-path-terminus-integrity-v1`)
2. `npm run ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator -- --write`

**Following engineering slice:** Phase N Post-terminus steady state integrity (`era38`).
