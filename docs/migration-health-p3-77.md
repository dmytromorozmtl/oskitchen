# Migration health checker (P3-77)

**Policy:** `migration-health-p3-77-v1`  
**Department:** DevOps  
**Upstream:** `migration-health-checker-v1`  
**Registry:** [`artifacts/migration-health-p3-77-registry.json`](../artifacts/migration-health-p3-77-registry.json)

---

## Checks

| Tier | Command | When |
|------|---------|------|
| Offline (CI default) | `npm run check:migration-health` | Every deploy gate — validate schema + migration lock |
| Prod drift (wave 2) | `npm run check:migration-health -- --require-db` | Weekly + manual prod drift via `migration-health-prod-drift.yml` with `DIRECT_URL` secret |

Prod drift runs `prisma migrate diff --from-url DIRECT_URL --to-schema-datamodel prisma/schema.prisma` and fails on DDL output.

---

## Verify

```bash
npm run check:migration-health
npm run check:migration-health-p3-77
npm run audit:migration-health-p3-77
npm run test:ci:migration-health-p3-77:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` (offline + P3-77 cert)  
Prod drift: `.github/workflows/migration-health-prod-drift.yml`

---

## Status

P1-34 offline validation wired in deploy gate. P3-77 adds scheduled/manual prod schema diff against `prisma/schema.prisma`.
