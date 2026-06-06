# P0 orchestrator PASS smoke setup (Era 142)

Era 142 certifies P0 orchestrator PASS wiring: vault gate → child smokes → `p0ArtifactOverall: PASSED`.

## Wiring surfaces

| Path | Role |
|------|------|
| `lib/ops/p0-staging-proof-execution-orchestrator.ts` | Phase statuses, milestone resolver, p0_aggregate |
| `lib/execution/final-02-p0-orchestrator-artifact-audit-policy.ts` | QA-01 artifact honesty gate |
| `lib/ops/vault-readiness-report.ts` | Vault report builder with `p0ArtifactOverall` |
| `scripts/run-p0-orchestrator-staging.sh` | Local QA-01 runner (7 steps) |
| `.github/workflows/p0-orchestrator.yml` | CI P0 orchestrator workflow |

## Artifacts

| Artifact | Expected |
|----------|----------|
| `artifacts/vault-readiness-report.json` | `p0ArtifactOverall: "PASSED"` |
| `artifacts/p0-orchestrator-staging-run-summary.json` | `overall: "PASS"` |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:p0-orchestrator-pass-era142` | Full era142 cert + wiring audit |
| `npm run test:ci:p0-orchestrator-pass-era142` | Era142 + FINAL-02 unit tests |
| `npm run test:ci:p0-orchestrator-pass-era142:cert` | Wiring cert only (CI gate) |

## Human activation

1. Configure all 11 ops vault secrets — `docs/ops-vault-matrix.md`.
2. Run `./scripts/run-p0-orchestrator-staging.sh` — all 7 steps PASS.
3. Confirm `artifacts/vault-readiness-report.json` line 14 → `p0ArtifactOverall: PASSED`.
4. Confirm staging run summary → `overall: PASS`.
5. Run `npm run smoke:p0-orchestrator-pass-era142` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `vault_gate` | 11-secret vault matrix + FINAL-01 gate |
| `child_smokes` | Workflows, channel, SSO tier-2 smokes |
| `p0_aggregate` | P0 unblock + integrity validation |

## Artifact

Summary written to `artifacts/p0-orchestrator-pass-smoke-summary.json` (gitignored).
