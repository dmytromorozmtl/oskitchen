# era25 Owner Daily Briefing Breakthrough — Staging Proof Ops Checklist

**Status:** **BLOCKED until P0 ops vault complete · honest NO-GO**

**Policy:** `era25-owner-daily-briefing-breakthrough-v1` (preview — not shipped until blueprint ready)  
**Backlog:** `KOS-E25-001-ODB-BREAKTHROUGH`  
**Blueprint:** `docs/next-era25-first-product-slice-blueprint-2026-05-28.md`  
**Date:** 2026-05-28

---

## Purpose

Staging proof checklist for the **first era25 product slice** — Owner Daily Briefing Breakthrough (WOW pillar). This slice evolves era19 briefing aggregation into era25 commercial breakthrough surfaces on `#era25-owner-daily-briefing-breakthrough`.

**Honesty:** Missing P0 credentials → smokes **SKIPPED WITH REASON**. Any child **FAILED** → aggregate **FAILED**. No fake PASS in `artifacts/*.json`.

---

## P0 ops vault (11 env vars)

| Field | Current value |
|-------|---------------|
| `p0ProofStatus` | `awaiting_ops_credentials` |
| Missing vars | 11 — see `docs/era18-p0-staging-proof-ops-checklist.md` |

Re-run after vault configuration:

```bash
npm run smoke:p0-staging-proof-unblock
npm run smoke:p0-staging-proof-unblock -- --checklist-only
```

**NO-GO** until `p0ProofStatus: proof_passed`.

---

## Staging smoke commands

```bash
npm run ops:validate-era25-first-product-slice-blueprint -- --json
npm run ops:run-era25-first-product-slice-blueprint-post-gates-orchestrator -- --json
npm run test:ci:era25-first-product-slice-blueprint-era24
npm run test:ci:era25-first-product-slice-blueprint-era24:cert
npm run test:ci:commercial-pilot-runbook:cert
```

Product slice smokes (after era25 code ships):

```bash
npm run test:ci:owner-daily-briefing-breakthrough-era25
npm run test:ci:owner-daily-briefing-breakthrough-era25:cert
```

---

## CI cert chain

| Script | Purpose |
|--------|---------|
| `test:ci:era25-first-product-slice-blueprint-era24` | Blueprint orchestration unit tests |
| `test:ci:era25-first-product-slice-blueprint-era24:cert` | Live repo wiring cert |
| `test:ci:owner-daily-briefing-breakthrough-era25` | Product slice unit tests (future) |
| `test:ci:owner-daily-briefing-breakthrough-era25:cert` | Product cert (future) |
| `test:ci:commercial-pilot-runbook:cert` | Release gate — always required |

---

## Rollback / NO-GO

Rollback triggers:

- Gates regression (`era25_engineering_gates_open` → blocked)
- Terminus guard FAIL
- Illegal era25 product artifacts before blueprint ready
- P0 proof regression
- Forbidden claims enforcement FAIL

**NO-GO** until all blueprint milestones pass and leadership sign-off recorded in charter doc.

---

## Leadership sign-off

Required before era25 product merge:

- [ ] Charter `docs/era25-owner-daily-briefing-breakthrough-charter-2026-*.md` signed (10 sections)
- [ ] Ops lead reviewed this checklist honestly
- [ ] Product lead confirmed WOW pillar scope (breakthrough map cycles 13–18)
- [ ] No regression on Steps 12–16 steady-state rhythms

**Sign-off:** _pending — human required_
