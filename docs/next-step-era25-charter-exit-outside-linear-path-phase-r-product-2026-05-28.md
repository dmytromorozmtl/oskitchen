# KitchenOS — Phase R: Era25 charter exit outside linear path (post-honest Step 17 FORBIDDEN guard)

**Status:** Product surfaces + era25 charter exit integrity guard **IMPLEMENTED** · Human charter exit attestation **REQUIRED**  
**Policy:** `era24-era25-charter-exit-outside-linear-path-v1` · Integrity `era42-era25-charter-exit-outside-linear-path-integrity-v1`  
**Playbook:** [`docs/next-era25-charter-exit-outside-linear-path-2026-05-28.md`](./next-era25-charter-exit-outside-linear-path-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-linear-chain-terminus-guard-phase-q-product-2026-05-28.md`](./next-step-linear-chain-terminus-guard-phase-q-product-2026-05-28.md) → honest Step 17 FORBIDDEN guard complete

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-charter-exit` | Outside linear catalog · signed charter checklist |
| Launch Wizard | Today strip | Era25 exit milestone · integrity FAIL |
| Owner Briefing | priority **17** | Ranked action when charter exit blocked |
| Platform ops | `#era25-charter-exit-outside-linear-path` | Post–terminus-guard orchestrator (embedded under Step 17 panel) |
| Today dashboard | Compact panel | Charter exit slice + integrity badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-linear-chain-terminus-guard-integrity -- --json
npm run ops:validate-era25-charter-exit-outside-linear-path-integrity -- --json
npm run ops:run-era25-charter-exit-post-terminus-guard-orchestrator -- --write
# After Step 17 guard healthy + step17_forbidden_healthy milestone:
# ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ATTESTED=1
# After charter exit report sync + human review:
# ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_REPORT_REVIEWED=1
npm run ops:validate-era25-charter-exit-outside-linear-path -- --json
npm run ops:sync-era25-charter-exit-outside-linear-path-report -- --write
npm run ops:export-era-charter-readiness-checklist -- --write
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-era25-charter-exit-outside-linear-path-integrity -- --json
npm run ops:sync-era25-charter-exit-outside-linear-path-integrity-baseline -- --write
```

**Acceptance:** Linear chain terminus guard integrity PASS · `step17_forbidden_healthy` · signed `docs/era25-*-charter-2026-*.md` · no hand-edited PASS in `artifacts/*.json`.

**Then:** First era25 charter slice readiness train — `ops:validate-era25-first-charter-slice-readiness`.

---

## STOP rules

- `ERA25_CHARTER_EXIT_*` env without honest Step 17 guard → `charter_exit_started_without_step17_guard`
- `OUTSIDE_LINEAR_PATH_ATTESTED=1` before terminus guard integrity PASS → `fake_charter_exit_attestation`
- `REPORT_REVIEWED=1` before charter exit integrity PASS → `fake_charter_exit_report_attestation`
- Linear chain terminus guard integrity FAIL while charter panel visible → blocked badge on Today + Launch Wizard
- Baseline regression when GO or Step 17 guard no longer honest → `baseline_regression`
- Full GO chain violations propagate when charter exit env present

---

## Env keys (tracked)

| Key | When to set |
|-----|-------------|
| `ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ATTESTED` | After honest Step 17 guard + `step17_forbidden_healthy` milestone |
| `ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_REPORT_REVIEWED` | After `sync-era25-charter-exit-outside-linear-path-report` + human review |

---

## Integrity chain

`evaluateEra25CharterExitOutsideLinearPathIntegrity` chains via `evaluateLinearChainTerminusGuardIntegrity` (Phase Q), which chains through Linear path permanently closed (P) → … → GO (P0).

---

## Next step after Phase R PASS

**Phase S — Era25 first charter slice readiness integrity (`era43`)** — **IMPLEMENTED** · see [`docs/next-step-era25-first-charter-slice-readiness-phase-s-product-2026-05-28.md`](./next-step-era25-first-charter-slice-readiness-phase-s-product-2026-05-28.md)

| Component | Planned artifact |
|-----------|------------------|
| Evaluator | `era25-first-charter-slice-readiness-integrity-era43.ts` — chain via `evaluateEra25CharterExitOutsideLinearPathIntegrity` |
| Env keys | `ERA25_FIRST_CHARTER_SLICE_*` tracked keys + `detectEra25FirstCharterSliceStarted()` |
| Violations | `first_slice_started_without_charter_exit`, `era25_charter_exit_integrity_fail`, chain to GO |
| Launch Wizard | `#launch-wizard-era25-first-charter-slice` |
| Briefing | priority **18** |
| Prerequisite | honest era25 charter exit (Phase R) + `era25_charter_exit_healthy` milestone |

```bash
npm run ops:validate-era25-first-charter-slice-readiness -- --json
npm run ops:sync-era25-first-charter-slice-readiness-report -- --write
```

**Following engineering slice:** Era25 engineering gates · signed charter required before product slice blueprint.
