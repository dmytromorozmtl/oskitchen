# BETA integrations registry smoke

Policy: `era17-beta-integrations-registry-smoke-v1`

After DEV-48 (email orders intake), OS Kitchen ships **eighteen BETA integrations** with zero PLACEHOLDER entries in `lib/integrations/integration-registry.ts`. This smoke validates engineering scaffold integrity — **not** live tenant proof.

## What it checks

1. Registry lists exactly eighteen `BETA` entries and zero `PLACEHOLDER`.
2. Each integration has a dashboard page with `BetaBadge`.
3. Each integration has required service and API route files (see `BETA_INTEGRATION_SCAFFOLD_PATHS` in policy).

## Run

```bash
npm run smoke:beta-integrations-registry
```

Artifact: `artifacts/smoke-beta-integrations-registry-summary.json`

Cert chain:

```bash
npm run test:ci:beta-integrations-registry-era17:cert
```

## Sales honesty

`overall: PASSED` means code scaffold is complete. GTM must still label integrations **BETA** until staging live smokes produce PASS artifacts per channel.
