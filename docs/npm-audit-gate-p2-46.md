# npm audit CI gate (P2-46)

**Policy:** `npm-audit-gate-p2-46-v1`  
**Artifact:** `artifacts/npm-audit-gate-p2-46.json`

Gap P2-46 adds a merge-blocking dependency audit: `npm audit --audit-level=high` runs after `npm ci` in CI and deploy-prod-gate.

## Command

```bash
npm run audit:dependencies:high
# equivalent: npm audit --audit-level=high
```

## CI placement

| Workflow | Step | Runs after |
|----------|------|------------|
| `.github/workflows/ci.yml` | Dependency audit (high severity gate) | `npm ci` |
| `.github/workflows/deploy-prod-gate.yml` | Dependency audit (high severity gate) | `npm ci` |

## Wiring check

```bash
npm run check:npm-audit-gate-p2-46
```

## Remediation

When the gate fails, run `npm audit` locally, apply safe fixes with `npm audit fix`, and document any accepted risks for dev-only tooling.
