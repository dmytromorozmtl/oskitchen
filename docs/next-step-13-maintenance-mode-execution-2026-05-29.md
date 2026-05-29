# Next Step 13 — Maintenance Mode Execution

**Date:** 2026-05-29  
**Prerequisite:** Step 12 complete — `milestone: continuous_improvement_loop_passed`  
**Goal:** Steady-state maintenance rhythm after CI loop sign-off  
**Audience:** CTO, COO, Ops, Founder

---

## Entry criteria

| Check | Command | Expected |
|-------|---------|----------|
| CI loop PASS | `npm run ops:run-continuous-improvement-loop-execution -- --json` | `milestone: continuous_improvement_loop_passed` |
| CI loop integrity | `npm run ops:validate-continuous-improvement-loop-integrity -- --json` | `integrityPassed: true` |
| Product evolution PASS | `npm run ops:run-sustained-product-evolution-execution -- --json` | `milestone: sustained_product_evolution_passed` |

If CI loop not PASS — return to [`next-step-12-continuous-improvement-loop-execution-2026-05-29.md`](./next-step-12-continuous-improvement-loop-execution-2026-05-29.md).

---

## Execution sequence

### 13.1 Weekly rhythm closure

| Rhythm | Owner |
|--------|-------|
| Mon shift handoffs | COO |
| Wed integration health | Integration |
| Fri progress sync | Founder |

```bash
npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write
npm run ops:validate-maintenance-mode -- --json
```

### 13.2 Monthly cadence closure

| Rhythm | Owner |
|--------|-------|
| W1 metrics baseline | CS |
| W2 feedback triage | PM |
| W3 improvement loop review | COO |
| W4 product evolution review | PM |

```bash
npm run smoke:pilot-metrics-baseline
npm run ops:sync-maintenance-mode-playbook-report -- --write
```

### 13.3 Maintenance mode integrity guard

| Task | Owner |
|------|-------|
| era36 integrity baseline | Ops |
| Rhythm calendar attestation honesty | CTO |

```bash
npm run ops:validate-maintenance-mode-integrity -- --json
```

### 13.4 Era25 re-entrant product evolution readiness

| Task | Owner |
|------|-------|
| Re-entrant integrity (era56) | PM |
| Charter lock phase (era57) | CTO |

```bash
npm run ops:validate-sustained-product-evolution-re-entrant-integrity -- --json
npm run ops:validate-era25-post-re-entrant-charter-lock-integrity -- --json
```

---

## Product surfaces (verify before maintenance mode sign-off)

| Surface | Route | What to check |
|---------|-------|---------------|
| Platform Ops | `/platform/commercial-pilot-ops` | `#maintenance-mode` panel |
| Today strip | `/dashboard/today` | Rhythm calendar compact |
| Launch Wizard | `/dashboard/launch-wizard` | Maintenance mode anchor |
| Integration Health | `/dashboard/integration-health` | Wed rhythm evidence |

---

## Step 14 preview (Production Pilot Ready Closure)

| Task | Owner |
|------|-------|
| Full chain execution validation | CTO |
| `run:production-pilot-ready` all steps PASS | Ops |
| Investor narrative + data room bundle | Founder |
| Final GO/NO-GO re-certification | COO |

---

## Honesty guardrails

1. Maintenance mode requires `continuous_improvement_loop_passed` — not CI-loop-only evidence
2. Rhythm calendar attestation requires product evolution integrity PASS first
3. Weekly rhythms require real operator usage — not checkbox-only
4. Monthly cadence must cite per-customer metrics — never shared artifacts
5. ICP = all F&B formats — maintenance rhythms cover all operator formats

---

## RACI

| Phase | R | A |
|-------|---|---|
| Weekly rhythm closure | COO + Integration | COO |
| Monthly cadence | PM + CS | PM |
| Maintenance integrity | Ops + CTO | CTO |
| Era25 re-entrant readiness | PM + CTO | CTO |
