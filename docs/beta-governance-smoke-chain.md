# BETA governance smoke chain

Policy: `era17-beta-governance-smoke-chain-v1`

Integration capstone: `beta-governance-smoke-chain-integration-v1` (QA-45)

Chains **registry → integrity → LIVE DoD** smokes into one honest CI artifact after DEV-49–DEV-55.

## What it checks

1. Registry scaffold — eighteen BETA integrations, zero placeholders.
2. Integrity — env readiness audit chained from registry proof.
3. LIVE DoD — gate tracker with G3/G4 `not_measured` (not LIVE claims).

## Run

```bash
npm run smoke:beta-governance-chain
```

Artifact: `artifacts/smoke-beta-governance-smoke-chain-summary.json`

Cert chain:

```bash
npm run test:ci:beta-governance-smoke-chain-era17:cert
```

## P0 orchestrator

Runs as **Tier 1 — always-on** in `.github/workflows/p0-orchestrator.yml` after LIVE DoD smoke.

## Sales honesty

`overall: PASSED` means the full BETA governance smoke chain ran — **not** production LIVE integration proof.
