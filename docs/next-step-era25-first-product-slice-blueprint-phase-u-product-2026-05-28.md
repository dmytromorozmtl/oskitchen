# KitchenOS — Phase U: Era25 first product slice blueprint (post-honest engineering gates)

**Status:** Product surfaces + blueprint integrity guard **IMPLEMENTED** · Human blueprint attestation **REQUIRED**  
**Policy:** `era24-era25-first-product-slice-blueprint-v1` · Integrity `era45-era25-first-product-slice-blueprint-integrity-v1`  
**Playbook:** [`docs/next-era25-first-product-slice-blueprint-2026-05-28.md`](./next-era25-first-product-slice-blueprint-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-era25-engineering-gates-phase-t-product-2026-05-28.md`](./next-step-era25-engineering-gates-phase-t-product-2026-05-28.md) → honest `era25_engineering_gates_open`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-first-product-slice-blueprint` | Canonical slice `owner-daily-briefing-breakthrough` · charter + staging checklist |
| Launch Wizard | Today strip | Blueprint progress · integrity FAIL badge |
| Owner Briefing | priority **20** | Ranked action when blueprint blocked |
| Platform ops | `#era25-first-product-slice-blueprint` | Post-gates orchestrator (embedded under engineering gates panel) |
| Today dashboard | Maintenance panel | Blueprint + gates integrity badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-era25-engineering-gates-integrity -- --json
npm run ops:validate-era25-first-product-slice-blueprint-integrity -- --json
npm run ops:run-era25-first-product-slice-blueprint-post-gates-orchestrator -- --write
# After era25_engineering_gates_open + canonical charter + staging checklist:
# ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ATTESTED=1
# After blueprint report sync + human review:
# ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_REVIEWED=1
npm run ops:validate-era25-first-product-slice-blueprint -- --json
npm run ops:sync-era25-first-product-slice-blueprint-report -- --write
npm run test:ci:era25-first-product-slice-blueprint-era24
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-era25-first-product-slice-blueprint-integrity -- --json
npm run ops:sync-era25-first-product-slice-blueprint-integrity-baseline -- --write
```

**Acceptance:** Engineering gates integrity PASS · `era25_first_product_slice_blueprint_ready` · canonical charter valid · staging checklist valid · zero illegal era25 artifacts.

**Then:** Owner daily briefing breakthrough era25 product slice — `ops:validate-owner-daily-briefing-breakthrough-era25`.

---

## STOP rules

- `ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_*` env without honest gates open → `blueprint_started_without_gates_open`
- `ATTESTED=1` before gates integrity PASS → `fake_blueprint_attestation`
- `REPORT_REVIEWED=1` before blueprint integrity PASS → `fake_blueprint_report_attestation`
- Engineering gates integrity FAIL while blueprint panel visible → blocked badge on Today + Launch Wizard
- Baseline regression when GO or gates no longer honest → `baseline_regression`
- Full GO chain violations propagate when blueprint env present

---

## Env keys (tracked)

| Key | When to set |
|-----|-------------|
| `ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ATTESTED` | After `era25_engineering_gates_open` + charter + staging checklist honest |
| `ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_REVIEWED` | After `sync-era25-first-product-slice-blueprint-report` + human review |

---

## Integrity chain

`evaluateEra25FirstProductSliceBlueprintIntegrity` chains via `evaluateEra25EngineeringGatesIntegrity` (Phase T), which chains through first charter slice (S) → charter exit (R) → … → GO (P0). Gates-open check uses `evaluateEra25EngineeringGatesRequireSignedCharter` milestone `era25_engineering_gates_open`.

---

## Next step after Phase U PASS

**Phase V (`era46`) — Owner daily briefing breakthrough era25 integrity** — mirror era39–era45 on `owner-daily-briefing-breakthrough-*`

| Component | Planned artifact |
|-----------|------------------|
| Evaluator | `owner-daily-briefing-breakthrough-integrity-era46.ts` — chain via `evaluateEra25FirstProductSliceBlueprintIntegrity` |
| Env keys | `OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_*` tracked keys + `detectOwnerDailyBriefingBreakthroughEra25Started()` |
| Violations | `breakthrough_started_without_blueprint_ready`, `era25_first_product_slice_blueprint_integrity_fail`, chain to GO |
| Launch Wizard | `#launch-wizard-era25-owner-daily-briefing-breakthrough` |
| Briefing | priority **21** (meta: breakthrough tiles surface on Today `#era25-owner-daily-briefing-breakthrough`) |
| Prerequisite | honest blueprint (Phase U) + `era25_first_product_slice_blueprint_ready` |

```bash
npm run ops:validate-owner-daily-briefing-breakthrough-era25 -- --json
npm run ops:sync-owner-daily-briefing-breakthrough-era25-report -- --write
```

**Next product phase:** [`docs/next-step-owner-daily-briefing-breakthrough-phase-v-product-2026-05-28.md`](./next-step-owner-daily-briefing-breakthrough-phase-v-product-2026-05-28.md) — Phase V breakthrough integrity (era46) **IMPLEMENTED**.

**Following convergence:** Paid pilot GO convergence era25 · pilot week1 execution convergence — each on dedicated `#era25-*` anchors with separate integrity phases (W, W+1…).
