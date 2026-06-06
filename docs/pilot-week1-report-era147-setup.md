# Pilot Week 1 report setup (Era 147)

Era 147 certifies the first design-partner Week 1 checkpoint report: LOI parent chain, KPI capture, and execution orchestrator wiring.

## Wiring surfaces

| Path | Role |
|------|------|
| `docs/pilot-week1-report.md` | Week 1 checkpoint — Riverbend Commissary CONDITIONAL PASS |
| `docs/loi-signed.md` | Parent LOI-DP-001 signed record |
| `docs/pilot-week1-checklist.md` | Week 0–1 execution checklist |
| `lib/commercial/pilot-week1-report-era74-policy.ts` | Canonical era74 policy constants |
| `lib/ops/pilot-week1-execution-orchestrator.ts` | Week 1 execution orchestrator |
| `scripts/ops/run-pilot-week1-execution.ts` | Ops runner for Week 1 phases |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pilot-week1-report-era147` | Full era147 cert + wiring audit |
| `npm run test:ci:pilot-week1-report-era147` | Era147 + era74 + orchestrator tests |
| `npm run test:ci:pilot-week1-report-era147:cert` | Wiring cert only (CI gate) |
| `npm run ops:run-pilot-week1-execution -- --write` | Week 1 execution summary artifact |

## Human activation

1. Confirm LOI-DP-001 signed and workspace `riverbend-commissary` provisioned.
2. Execute Week 1 per `docs/pilot-week1-checklist.md`.
3. Update `docs/pilot-week1-report.md` with Day 0–5 outcomes and KPI capture.
4. Record CS + COO sign-off before external citation.
5. Run `npm run ops:run-pilot-week1-execution -- --write` — execution milestone.
6. Run `npm run smoke:pilot-week1-report-era147` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `week1_checkpoint_report` | docs/pilot-week1-report.md + era74 policy |
| `kpi_capture` | orders/day, bump time, health score, operator satisfaction |
| `loi_parent_chain` | LOI-DP-001 → Week 1 report linkage |

## Artifact

Summary written to `artifacts/pilot-week1-report-era147-smoke-summary.json` (gitignored).

See also: [pilot-week1-report.md](./pilot-week1-report.md) · [loi-signed.md](./loi-signed.md)
