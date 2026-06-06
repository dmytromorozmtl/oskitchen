# LIVE integration DoD smoke

Policy: `era17-live-integration-dod-smoke-v1`

Capstone smoke for the BETA integration governance arc (DEV-49–DEV-55). Combines integrity audit + LIVE DoD gate tracker into one CI artifact.

## What it checks

1. Cert chain (DoD tracker + integrity + env readiness tests).
2. Seven BETA integrations with G1 scaffold complete; seventeen LIVE in registry.
3. G2 env readiness counts recorded (missing vars expected in CI).
4. G3/G4 remain `not_measured` — honest, not LIVE claims.

## Run

```bash
npm run smoke:live-integration-dod
```

Artifact: `artifacts/smoke-live-integration-dod-summary.json`

Cert chain:

```bash
npm run test:ci:live-integration-dod-era17:cert
```

## P0 orchestrator

Runs as **Tier 1 — always-on** in `.github/workflows/p0-orchestrator.yml` (no vault required).

## Sales honesty

`overall: PASSED` means engineering DoD audit machinery ran — **not** production LIVE integration proof.
