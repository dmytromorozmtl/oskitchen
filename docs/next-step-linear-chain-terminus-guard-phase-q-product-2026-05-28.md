# KitchenOS — Phase Q: Linear chain terminus guard (post-honest Linear path permanently closed)

**Status:** Product surfaces + Linear chain terminus guard integrity guard **IMPLEMENTED** · Human Step 17 FORBIDDEN attestation **REQUIRED**  
**Policy:** `era24-linear-chain-terminus-guard-v1` · Integrity `era41-linear-chain-terminus-guard-integrity-v1`  
**Playbook:** [`docs/next-step-17-forbidden-linear-chain-terminus-2026-05-28.md`](./next-step-17-forbidden-linear-chain-terminus-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-linear-path-permanently-closed-phase-p-product-2026-05-28.md`](./next-step-linear-path-permanently-closed-phase-p-product-2026-05-28.md) → honest Linear path permanently closed complete

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-linear-chain-terminus-guard` | Step 17 FORBIDDEN · catalog integrity badge |
| Launch Wizard | Today strip | Step 17 max step 16 · integrity FAIL |
| Owner Briefing | priority **16** | Ranked action when Step 17 guard blocked |
| Platform ops | `#linear-chain-step17-forbidden` | Post–linear-path-closed orchestrator (embedded under Step 16 panel) |
| Today dashboard | Compact panel | Step 17 guard slice + integrity badges |

---

## Human sequence (canonical)

```bash
npm run ops:validate-linear-path-permanently-closed-integrity -- --json
npm run ops:validate-linear-chain-terminus-guard-integrity -- --json
npm run ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator -- --write
# After linear path permanently closed healthy + catalog guard PASS:
# LINEAR_CHAIN_TERMINUS_GUARD_STEP17_FORBIDDEN_ATTESTED=1
# After terminus guard report sync + human review:
# LINEAR_CHAIN_TERMINUS_GUARD_REPORT_REVIEWED=1
npm run ops:validate-linear-chain-terminus-guard -- --json
npm run ops:sync-linear-chain-terminus-guard-report -- --write
npm run ops:export-era-charter-readiness-checklist -- --write
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-linear-chain-terminus-guard-integrity -- --json
npm run ops:sync-linear-chain-terminus-guard-integrity-baseline -- --write
```

**Acceptance:** Linear path permanently closed integrity PASS · catalog max step 16 · Step 17+ forbidden · no hand-edited PASS in `artifacts/*.json`.

**Then:** Era25 charter exit outside linear path train — `ops:validate-era25-charter-exit-outside-linear-path`.

---

## STOP rules

- `LINEAR_CHAIN_TERMINUS_GUARD_*` env without honest Linear path permanently closed → `terminus_guard_started_without_linear_path_closed`
- `STEP17_FORBIDDEN_ATTESTED=1` before linear path integrity PASS → `fake_step17_forbidden_attestation`
- `REPORT_REVIEWED=1` before terminus guard integrity PASS → `fake_terminus_guard_report_attestation`
- Linear path permanently closed integrity FAIL while Step 17 panel visible → blocked badge on Today + Launch Wizard
- Baseline regression when GO or linear path closure no longer honest → `baseline_regression`
- Full GO chain violations propagate when terminus guard env present

---

## Env keys (tracked)

| Key | When to set |
|-----|-------------|
| `LINEAR_CHAIN_TERMINUS_GUARD_STEP17_FORBIDDEN_ATTESTED` | After honest linear path closure + `linear_path_permanently_closed_healthy` milestone |
| `LINEAR_CHAIN_TERMINUS_GUARD_REPORT_REVIEWED` | After `sync-linear-chain-terminus-guard-report` + human review |

---

## Integrity chain

`evaluateLinearChainTerminusGuardIntegrity` chains via `evaluateLinearPathPermanentlyClosedIntegrity` (Phase P), which chains through Commercial pilot path absolute end (O) → … → GO (P0).

---

## Next step after Phase Q PASS

**Phase R — Era25 charter exit outside linear path integrity (`era42`)** — mirror era28–era41 on `era25-charter-exit-outside-linear-path-*`

| Component | Planned artifact |
|-----------|------------------|
| Evaluator | `era25-charter-exit-outside-linear-path-integrity-era42.ts` — chain via `evaluateLinearChainTerminusGuardIntegrity` |
| Env keys | `ERA25_CHARTER_EXIT_*` tracked keys + `detectEra25CharterExitStarted()` |
| Violations | `charter_exit_started_without_step17_guard`, `linear_chain_terminus_guard_integrity_fail`, chain to GO |
| Launch Wizard | `#launch-wizard-era25-charter-exit` |
| Briefing | priority **17** |
| Prerequisite | honest Step 17 guard (Phase Q) + `step17_forbidden_healthy` milestone |

```bash
npm run ops:validate-era25-charter-exit-outside-linear-path -- --json
npm run ops:sync-era25-charter-exit-outside-linear-path-report -- --write
```

**Following engineering slice:** First era25 charter slice readiness validation · engineering gates require signed charter.
