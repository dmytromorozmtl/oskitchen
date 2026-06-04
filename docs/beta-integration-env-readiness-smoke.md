# BETA integration env readiness smoke

Policy: `era17-beta-integration-env-readiness-smoke-v1`

Companion to the Integration Health env readiness panel (DEV-50). Records platform `requiredEnv` audit state for all eighteen BETA registry integrations — **not** tenant credential connections or live smoke PASS.

## What it checks

1. Cert chain passes (registry + env readiness unit tests).
2. All eighteen BETA integrations audited for `requiredEnv` presence.
3. Artifact records `readyCount`, `optionalCount`, `missingCount`, and per-integration missing var names.

## Run

```bash
npm run smoke:beta-integration-env-readiness
```

Artifact: `artifacts/smoke-beta-integration-env-readiness-summary.json`

Strict staging gate (requires at least one integration env-ready or optional-only):

```bash
BETA_ENV_STRICT=1 npm run smoke:beta-integration-env-readiness
```

Cert chain:

```bash
npm run test:ci:beta-integration-env-readiness-era17:cert
```

## Sales honesty

`overall: PASSED` means the env audit machinery ran successfully. Missing platform vars in CI is expected — use the artifact counts for ops vault planning, not as a LIVE integration claim.
