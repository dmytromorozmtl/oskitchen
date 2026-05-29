# Next Step 17 — Linear Path Permanently Closed Lock Execution

**Date:** 2026-05-29  
**Prerequisite:** Step 16 complete — `milestone: commercial_pilot_path_absolute_end_lock_passed`  
**Goal:** Lock linear path permanently closed after commercial pilot path absolute end convergence  
**Audience:** CTO, Engineering, Ops, Founder

---

## Entry criteria

| Check | Command | Expected |
|-------|---------|----------|
| Absolute end lock PASS | `npm run ops:run-commercial-pilot-path-absolute-end-lock-execution -- --json` | `milestone: commercial_pilot_path_absolute_end_lock_passed` |
| Absolute end integrity | `npm run ops:validate-commercial-pilot-path-absolute-end-integrity -- --json` | `integrityPassed: true` |
| Steady-state loop lock | `npm run ops:run-steady-state-operator-loop-lock-execution -- --json` | `steady_state_operator_loop_passed` |

If Step 16 not PASS — return to [`next-step-16-commercial-pilot-path-absolute-end-lock-execution-2026-05-29.md`](./next-step-16-commercial-pilot-path-absolute-end-lock-execution-2026-05-29.md).

---

## Execution sequence

### 17.1 Linear path permanently closed orchestrator

| Task | Command | Milestone |
|------|---------|-----------|
| Linear path post-absolute-end | `npm run ops:run-linear-path-permanently-closed-post-absolute-end-orchestrator -- --write` | `linear_path_permanently_closed_healthy` |
| Linear path validation | `npm run ops:validate-linear-path-permanently-closed -- --json` | terminal closure honest |
| Linear path integrity | `npm run ops:validate-linear-path-permanently-closed-integrity -- --json` | `integrityPassed: true` |

### 17.2 Era45 linear path permanently closed lock execution

| Gate | Command | Proof |
|------|---------|-------|
| Absolute end lock | `npm run ops:run-commercial-pilot-path-absolute-end-lock-execution -- --json` | `commercial_pilot_path_absolute_end_lock_passed` |
| Linear chain terminus guard | `npm run ops:validate-linear-chain-terminus-guard -- --json` | guard healthy |
| Era25 charter exit outside linear path | `npm run ops:validate-era25-charter-exit-outside-linear-path-integrity -- --json` | integrity PASS |
| Commercial pilot runbook cert | `npm run test:ci:commercial-pilot-runbook:cert` | PASS |

```bash
npm run ops:run-linear-path-permanently-closed-lock-execution -- --write
```

**Target milestone:** `linear_path_permanently_closed_lock_passed`

### 17.3 Era charter exit convergence (Founder)

| Artifact | Owner |
|----------|-------|
| Era25 charter exit attestation | Founder |
| Linear chain terminus guard review | CTO |
| Governance train terminal seal witness prep | Ops |

---

## Product surfaces (verify before Step 17 sign-off)

| Surface | Route | What to check |
|---------|-------|---------------|
| Launch Wizard | `/dashboard/launch-wizard` | Linear path permanently closed panel |
| Platform Ops | `/platform/commercial-pilot-ops#linear-path-permanently-closed` | Terminal closure commands |
| Absolute end | `#commercial-pilot-path-absolute-end` | Step 16 lock command linked |
| Linear chain guard | `#linear-chain-terminus-guard` | Step 17 FORBIDDEN proposals blocked |

---

## Step 18 preview (Linear Chain Terminus Guard Lock)

| Task | Owner |
|------|-------|
| Linear chain terminus guard lock execution orchestrator | Engineering |
| Era25 charter exit lock | CTO |
| Governance train terminal seal witness | Ops |

---

## Honesty guardrails

1. Step 17 requires `commercial_pilot_path_absolute_end_lock_passed` — not absolute end orchestrator alone
2. Linear path closure requires honest absolute end integrity PASS — never fake terminal attestation
3. Never fabricate era charter exit or linear chain terminus guard artifacts
4. Per-pilot GO isolation mandatory through linear path lock
5. ICP = all F&B formats — linear closure covers all commercial pilot path layers

---

## RACI

| Phase | R | A |
|-------|---|---|
| Linear path orchestrator | Engineering + CTO | CTO |
| Linear path lock execution | Ops | COO |
| Linear chain terminus guard | Engineering | CTO |
| Era charter exit | Founder + PM | Founder |
