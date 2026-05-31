# OS Kitchen — Phase Z: Era25 scale readiness convergence (post-honest month 2)

**Status:** Product surfaces + scale convergence integrity guard **IMPLEMENTED** · Human scale attestation **REQUIRED**  
**Policy:** `era25-scale-readiness-convergence-v1` · Integrity `era50-scale-readiness-convergence-integrity-v1`  
**Playbook:** [`docs/next-era25-scale-readiness-convergence-2026-05-28.md`](./next-era25-scale-readiness-convergence-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-month2-market-readiness-convergence-phase-y-product-2026-05-28.md`](./next-step-month2-market-readiness-convergence-phase-y-product-2026-05-28.md) → honest `month2_market_readiness_convergence_era25_ready`

---

## Product wiring

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | `#launch-wizard-era25-scale-readiness-convergence` | Gates 1–5 progress · Integration Health link |
| Launch Wizard | Today strip | Scale progress · integrity FAIL badge |
| Owner Briefing | priority **25** (meta) | Ranked action when scale blocked |
| Owner Briefing | priority **5** (gate action) | Existing gate-level action via `scale-readiness-convergence-briefing-era25` |
| Platform ops | `#era25-scale-readiness-convergence` | Post-month2 orchestrator (nested under month 2 panel) |
| Commercial blockers | Inline strip | `ScaleReadinessConvergenceEra25Strip` when month 2 convergence visible |

---

## Human sequence (canonical)

```bash
npm run ops:validate-month2-market-readiness-convergence-integrity -- --json
npm run ops:validate-scale-readiness-convergence-integrity -- --json
npm run ops:run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25 -- --write
# After month2_market_readiness_convergence_era25_ready + gates 1–5 SCALE_* env:
# SCALE_READINESS_CONVERGENCE_ERA25_ATTESTED=1
# After scale report sync + human review:
# SCALE_READINESS_CONVERGENCE_ERA25_REPORT_REVIEWED=1
npm run ops:validate-scale-readiness-convergence-era25 -- --json
npm run ops:validate-scale-readiness-env -- --json
npm run ops:sync-scale-readiness-convergence-era25-report -- --write
npm run test:ci:scale-readiness-convergence-era25
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-scale-readiness-convergence-integrity -- --json
npm run ops:sync-scale-readiness-convergence-integrity-baseline -- --write
```

**Acceptance:** Month 2 convergence integrity PASS · `scale_readiness_convergence_era25_ready` · all blocking gates complete · per-customer GO isolation · honest SOC2 track · zero illegal era25 artifacts.

---

## Integrity chain (era50)

```
evaluateScaleReadinessConvergenceIntegrity
  → evaluateMonth2MarketReadinessConvergenceIntegrity (era49)
    → evaluatePilotWeek1ExecutionConvergenceIntegrity (era48)
      → … → P0 GO
```

**Blocking violations when train started:** `scale_started_without_month2_convergence_ready`, `fake_scale_convergence_attestation`, `fake_scale_convergence_report_attestation`, upstream integrity fails, `baseline_regression`.

---

## CI / ops

| Command | Purpose |
|---------|---------|
| `ops:validate-scale-readiness-convergence-integrity` | JSON integrity gate |
| `ops:sync-scale-readiness-convergence-integrity-baseline` | Record honest baseline after acceptance |
| `test:ci:scale-readiness-convergence-integrity-era50` | Unit + cert-live wiring |
| `test:ci:scale-readiness-convergence-era25` | Full era25 scale convergence slice suite |

Workflow: `.github/workflows/ops-scale-readiness-convergence-integrity-validate.yml`

---

## Following — Phase AA (era51)

**IMPLEMENTED** — see [`docs/next-step-series-a-partner-expansion-convergence-phase-aa-product-2026-05-28.md`](./next-step-series-a-partner-expansion-convergence-phase-aa-product-2026-05-28.md).

**Next:** Phase AB (era52) market leader positioning convergence integrity.
