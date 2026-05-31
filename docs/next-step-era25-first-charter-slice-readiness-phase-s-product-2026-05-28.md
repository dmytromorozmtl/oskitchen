# OS Kitchen — Phase S: Era25 first charter slice readiness (post-honest charter exit)

**Status:** Product surfaces + first charter slice integrity guard **IMPLEMENTED** · Human slice attestation **REQUIRED**  
**Implemented follow-on:** [`docs/next-step-era25-engineering-gates-phase-t-product-2026-05-28.md`](./next-step-era25-engineering-gates-phase-t-product-2026-05-28.md) (Phase T · era44)  
**Policy:** `era24-era25-first-charter-slice-readiness-v1` · Integrity `era43-era25-first-charter-slice-readiness-integrity-v1`  
**Playbook:** [`docs/next-era25-first-charter-slice-template-2026-05-28.md`](./next-era25-first-charter-slice-template-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-era25-charter-exit-outside-linear-path-phase-r-product-2026-05-28.md`](./next-step-era25-charter-exit-outside-linear-path-phase-r-product-2026-05-28.md) → honest era25 charter exit complete

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-first-charter-slice` | 10 charter sections · section readiness badge |
| Launch Wizard | Today strip | First slice milestone · integrity FAIL |
| Owner Briefing | priority **18** | Ranked action when slice blocked |
| Platform ops | `#era25-first-charter-slice-readiness` | Post–charter-exit orchestrator (embedded under charter exit panel) |
| Today dashboard | Compact panel | Section validation + integrity badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-charter-exit-outside-linear-path-integrity -- --json
npm run ops:validate-era25-first-charter-slice-readiness-integrity -- --json
npm run ops:run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator -- --write
# After era25_charter_exit_healthy + signed docs/era25-*-charter-2026-*.md:
# ERA25_FIRST_CHARTER_SLICE_READINESS_ATTESTED=1
# After slice readiness report sync + human review:
# ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_REVIEWED=1
npm run ops:validate-era25-first-charter-slice-readiness -- --json
npm run ops:sync-era25-first-charter-slice-readiness-report -- --write
npm run test:ci:era25-first-charter-slice-readiness-era24
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-era25-first-charter-slice-readiness-integrity -- --json
npm run ops:sync-era25-first-charter-slice-readiness-integrity-baseline -- --write
```

**Acceptance:** Era25 charter exit integrity PASS · all 10 charter sections valid · `era25_first_charter_slice_ready` milestone · no hand-edited PASS in `artifacts/*.json`.

**Then:** Era25 engineering gates require signed charter train — `ops:validate-era25-engineering-gates-require-signed-charter`.

---

## STOP rules

- `ERA25_FIRST_CHARTER_SLICE_*` env without honest charter exit → `first_slice_started_without_charter_exit`
- `READINESS_ATTESTED=1` before charter exit integrity PASS → `fake_first_slice_attestation`
- `REPORT_REVIEWED=1` before slice integrity PASS → `fake_first_slice_report_attestation`
- Charter exit integrity FAIL while slice panel visible → blocked badge on Today + Launch Wizard
- Baseline regression when GO or charter exit no longer honest → `baseline_regression`
- Full GO chain violations propagate when first slice env present

---

## Env keys (tracked)

| Key | When to set |
|-----|-------------|
| `ERA25_FIRST_CHARTER_SLICE_READINESS_ATTESTED` | After honest charter exit + `era25_charter_exit_healthy` milestone |
| `ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_REVIEWED` | After `sync-era25-first-charter-slice-readiness-report` + human review |

---

## Integrity chain

`evaluateEra25FirstCharterSliceReadinessIntegrity` chains via `evaluateEra25CharterExitOutsideLinearPathIntegrity` (Phase R), which chains through Step 17 guard (Q) → … → GO (P0).

---

## Next step after Phase S PASS

**Phase T — Era25 engineering gates require signed charter integrity (`era44`)** — mirror era28–era43 on `era25-engineering-gates-*`

| Component | Planned artifact |
|-----------|------------------|
| Evaluator | `era25-engineering-gates-integrity-era44.ts` — chain via `evaluateEra25FirstCharterSliceReadinessIntegrity` |
| Env keys | `ERA25_ENGINEERING_GATES_*` tracked keys + `detectEra25EngineeringGatesStarted()` |
| Violations | `engineering_gates_started_without_first_slice_ready`, `era25_first_charter_slice_integrity_fail`, chain to GO |
| Launch Wizard | `#launch-wizard-era25-engineering-gates` |
| Briefing | priority **19** |
| Prerequisite | honest first charter slice (Phase S) + `era25_first_charter_slice_ready` milestone |

```bash
npm run ops:validate-era25-engineering-gates-require-signed-charter -- --json
npm run ops:sync-era25-engineering-gates-report -- --write
```

**Following engineering slice:** First era25 product slice blueprint · engineering gates require signed charter before any era25 code paths.
