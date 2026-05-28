# Era 20 — Pilot execution readiness (metrics + rollback + support)

**Policy:** `era20-pilot-execution-readiness-v1` (`KOS-E20-009`)  
**Date:** 2026-05-28

## Purpose

Unify **success metrics baseline**, **rollback drill**, and **support checklist** for the first paid pilot — without faking GO/NO-GO or customer execution.

## Evidence artifacts

| Artifact | Script | Pre-kickoff expectation |
|----------|--------|-------------------------|
| `pilot-metrics-baseline-summary.json` | `npm run smoke:pilot-metrics-baseline` | **SKIPPED** until Week 1 data |
| `pilot-rollback-drill-summary.json` | `npm run smoke:pilot-rollback-drill` | **proof_passed** after tabletop |
| `pilot-gono-go-summary.json` | `npm run smoke:pilot-gono-go` | Honest **NO-GO** until P0 + customer |
| `pilot-forbidden-claims-enforcement-summary.json` | `npm run smoke:pilot-forbidden-claims-enforcement` | **PASSED** before contract |

## GO/NO-GO behavior (Era 20 Cycle 9)

- Adds evidence gates: `pilot_metrics_baseline`, `pilot_rollback_drill`.
- **Warnings only** for SKIPPED metrics pre-kickoff — not blockers (no gate weakening).
- Rollback incomplete → warning + support checklist pending.

## UI

`/dashboard/implementation` — **Pilot execution readiness** panel with support checklist rows.

## Cross-links

- [`era20-first-paid-pilot-package-2026-05-28.md`](./era20-first-paid-pilot-package-2026-05-28.md) § Success metrics, Support, Rollback
- [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)
- [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md)
- [`pilot-rollback-drill-era17.md`](./pilot-rollback-drill-era17.md)
