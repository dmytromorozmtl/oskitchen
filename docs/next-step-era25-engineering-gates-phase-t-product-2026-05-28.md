# OS Kitchen — Phase T: Era25 engineering gates require signed charter (post-honest first charter slice)

**Status:** Product surfaces + engineering gates integrity guard **IMPLEMENTED** · Human gates attestation **REQUIRED**  
**Implemented follow-on:** [`docs/next-step-era25-first-product-slice-blueprint-phase-u-product-2026-05-28.md`](./next-step-era25-first-product-slice-blueprint-phase-u-product-2026-05-28.md) (Phase U · era45)  
**Policy:** `era24-era25-engineering-gates-require-signed-charter-v1` · Integrity `era44-era25-engineering-gates-integrity-v1`  
**Playbook:** [`docs/next-era25-engineering-gates-require-signed-charter-2026-05-28.md`](./next-era25-engineering-gates-require-signed-charter-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-era25-first-charter-slice-readiness-phase-s-product-2026-05-28.md`](./next-step-era25-first-charter-slice-readiness-phase-s-product-2026-05-28.md) → honest `era25_first_charter_slice_ready`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-engineering-gates` | Gates milestone · signed charter enforcement |
| Launch Wizard | Today strip | Gates progress · integrity FAIL badge |
| Owner Briefing | priority **19** | Ranked action when gates blocked |
| Platform ops | `#era25-engineering-gates-require-signed-charter` | Post–readiness orchestrator (embedded under first charter slice panel) |
| Today dashboard | Maintenance panel | Gates integrity + first slice integrity badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-first-charter-slice-readiness-integrity -- --json
npm run ops:validate-era25-engineering-gates-integrity -- --json
npm run ops:run-era25-engineering-gates-post-readiness-orchestrator -- --write
# After era25_first_charter_slice_ready + signed charter:
# ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ATTESTED=1
# After gates report sync + human review:
# ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_REPORT_REVIEWED=1
npm run ops:validate-era25-engineering-gates-require-signed-charter -- --json
npm run ops:sync-era25-engineering-gates-require-signed-charter-report -- --write
npm run test:ci:era25-engineering-gates-require-signed-charter-era24
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-era25-engineering-gates-integrity -- --json
npm run ops:sync-era25-engineering-gates-integrity-baseline -- --write
```

**Acceptance:** First charter slice integrity PASS · `era25_engineering_gates_open` milestone · no illegal era25 product artifacts · no hand-edited PASS in `artifacts/*.json`.

**Then:** First era25 product slice blueprint train — `ops:validate-era25-first-product-slice-blueprint`.

---

## STOP rules

- `ERA25_ENGINEERING_GATES_*` env without honest first charter slice → `engineering_gates_started_without_first_slice_ready`
- `ATTESTED=1` before first slice integrity PASS → `fake_engineering_gates_attestation`
- `REPORT_REVIEWED=1` before gates integrity PASS → `fake_engineering_gates_report_attestation`
- First charter slice integrity FAIL while gates panel visible → blocked badge on Today + Launch Wizard
- Baseline regression when GO or first slice no longer honest → `baseline_regression`
- Full GO chain violations propagate when engineering gates env present

---

## Env keys (tracked)

| Key | When to set |
|-----|-------------|
| `ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ATTESTED` | After honest first charter slice + `era25_first_charter_slice_ready` |
| `ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_REPORT_REVIEWED` | After `sync-era25-engineering-gates-require-signed-charter-report` + human review |

---

## Integrity chain

`evaluateEra25EngineeringGatesIntegrity` chains via `evaluateEra25FirstCharterSliceReadinessIntegrity` (Phase S), which chains through charter exit (R) → Step 17 guard (Q) → … → GO (P0).

---

## Next step after Phase T PASS

**Phase U (`era45`) — Era25 first product slice blueprint integrity** — mirror era39–era44 on `era25-first-product-slice-blueprint-*`

| Component | Planned artifact |
|-----------|------------------|
| Evaluator | `era25-first-product-slice-blueprint-integrity-era45.ts` — chain via `evaluateEra25EngineeringGatesIntegrity` |
| Env keys | Blueprint attestation keys + `detectEra25FirstProductSliceBlueprintStarted()` |
| Violations | `blueprint_started_without_gates_open`, `era25_engineering_gates_integrity_fail`, chain to GO |
| Launch Wizard | `#launch-wizard-era25-first-product-slice-blueprint` |
| Briefing | priority **20** |
| Prerequisite | honest engineering gates (Phase T) + `era25_engineering_gates_open` |

```bash
npm run ops:validate-era25-first-product-slice-blueprint -- --json
npm run ops:sync-era25-first-product-slice-blueprint-report -- --write
```

**Following product slice:** Owner daily briefing breakthrough era25 · blueprint gates owner briefing convergence on dedicated `#era25-*` anchors only.
