# P1-16 — DEPLOY_SKIP_VITEST removed from deploy scripts

**Policy:** `p1-16-deploy-skip-vitest-removed-v1`

Production deploy must **never** skip vitest via `DEPLOY_SKIP_VITEST`. The canonical path `scripts/deploy-prebuilt-prod.sh` runs the full vitest suite as a required gate before build/deploy.

## Audited scripts

| Script | Vitest gate |
|--------|-------------|
| `scripts/deploy-prebuilt-prod.sh` | `vitest.mjs run` (required) |
| `scripts/predeploy-verify.sh` | `npm run test:unit` |
| `scripts/final-storefront-deploy.sh` | No bypass token (legacy one-off) |
| `scripts/workspace-prod-deploy.sh` | DB migration only |
| `scripts/storefront-post-deploy.sh` | Post-deploy smoke only |

## CI enforcement

- `npm run check:deploy-skip-vitest-p1-16` — scans all audited scripts for forbidden token
- `.github/workflows/deploy-prod-gate.yml` — grep gate on primary deploy script

## Commands

```bash
npm run check:deploy-skip-vitest-p1-16
```
