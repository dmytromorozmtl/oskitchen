# OS Kitchen — Phase M: Engineering path terminus (post-honest Maintenance mode)

**Status:** Product surfaces + Engineering path terminus integrity guard **IMPLEMENTED** · Human master-path attestation **REQUIRED**  
**Policy:** `era24-engineering-path-terminus-v1` · Integrity `era37-engineering-path-terminus-integrity-v1`  
**Playbook:** [`docs/next-step-13-engineering-path-terminus-2026-05-28.md`](./next-step-13-engineering-path-terminus-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-maintenance-mode-phase-l-product-2026-05-28.md`](./next-step-maintenance-mode-phase-l-product-2026-05-28.md) → honest Maintenance mode complete

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-engineering-terminus` | 16-step master path · integrity badge |
| Launch Wizard | Today strip | Engineering path N/M steps · integrity FAIL |
| Owner Briefing | priority **12** | Ranked action per blocked gate step |
| Platform ops | `#engineering-path-terminus` | Post–maintenance-mode orchestrator commands (embedded in maintenance panel) |
| Today dashboard | Compact panel | Engineering path terminus slice + integrity badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-maintenance-mode-integrity -- --json
npm run ops:validate-engineering-path-terminus-integrity -- --json
npm run ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator -- --write
# After maintenance mode healthy + commercial pilot path gate chain honest:
# ENGINEERING_PATH_TERMINUS_MASTER_PATH_ATTESTED=1
# After status report sync + human review:
# ENGINEERING_PATH_TERMINUS_STATUS_REPORT_REVIEWED=1
npm run ops:validate-commercial-pilot-path -- --json
npm run ops:sync-commercial-pilot-path-status-report -- --write
npm run smoke:pilot-metrics-baseline
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-engineering-path-terminus-integrity -- --json
npm run ops:sync-engineering-path-terminus-integrity-baseline -- --write
```

**Acceptance:** Maintenance mode integrity PASS · gate chain steps honest · no hand-edited PASS in `artifacts/*.json`.

**Then:** Post-terminus steady state train — `ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator`.

---

## STOP rules

- `ENGINEERING_PATH_TERMINUS_*` env without honest Maintenance mode → `terminus_started_without_maintenance_mode`
- `STATUS_REPORT_REVIEWED=1` before maintenance mode integrity PASS → `fake_status_report_attestation`
- Maintenance mode integrity FAIL while Engineering path panel visible → blocked badge on Today + Launch Wizard
- Baseline regression when GO or Maintenance mode no longer honest → `baseline_regression`
- Full GO chain violations (Week1 → Month2 → … → Maintenance) propagate when terminus env present

---

## Env keys (tracked)

| Key | When to set |
|-----|-------------|
| `ENGINEERING_PATH_TERMINUS_MASTER_PATH_ATTESTED` | After honest maintenance mode + gate chain prerequisites |
| `ENGINEERING_PATH_TERMINUS_STATUS_REPORT_REVIEWED` | After `sync-commercial-pilot-path-status-report` + human review |

---

## Integrity chain

`evaluateEngineeringPathTerminusIntegrity` chains via `evaluateMaintenanceModeIntegrity` (Phase L), which chains through Product evolution (K) → Improvement loop (J) → … → GO (P0).

---

## Next step after Phase M PASS

**Phase N IMPLEMENTED** — see [`docs/next-step-post-terminus-steady-state-phase-n-product-2026-05-28.md`](./next-step-post-terminus-steady-state-phase-n-product-2026-05-28.md)

1. ~~Post-terminus steady state integrity guard (Phase N)~~ **DONE** (`era38-post-terminus-steady-state-integrity-v1`)
2. `npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write`

**Following engineering slice:** Phase O Commercial pilot path absolute end integrity (`era39`).
