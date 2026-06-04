# BETA integrations integrity smoke

Policy: `era17-beta-integrations-integrity-smoke-v1`

Unified bundle chaining **registry scaffold audit** (DEV-49) and **platform env readiness audit** (DEV-51) into one CI artifact.

## What it checks

1. Registry cert chain — eighteen BETA integrations with complete scaffold (pages, services, API routes).
2. Env cert chain — eighteen BETA integrations audited for `requiredEnv` presence.
3. Combined artifact with `registryProofStatus` and `envProofStatus`.

## Run

```bash
npm run smoke:beta-integrations-integrity
```

Artifact: `artifacts/smoke-beta-integrations-integrity-summary.json`

Strict env gate (propagates `BETA_ENV_STRICT=1`):

```bash
BETA_ENV_STRICT=1 npm run smoke:beta-integrations-integrity
```

Cert chain:

```bash
npm run test:ci:beta-integrations-integrity-era17:cert
```

## Sub-smokes

| Sub-smoke | Command |
|-----------|---------|
| Registry only | `npm run smoke:beta-integrations-registry` |
| Env only | `npm run smoke:beta-integration-env-readiness` |

## Sales honesty

`overall: PASSED` means engineering integrity audits ran successfully — not LIVE integration proof or tenant credential validation.
