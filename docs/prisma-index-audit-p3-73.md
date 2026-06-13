# Prisma index audit (P3-73)

**Policy:** `prisma-index-audit-p3-73-v1`  
**Department:** Backend  
**Upstream:** `prisma-index-audit-p1-36-v1`  
**Registry:** [`artifacts/prisma-index-audit-p3-73-registry.json`](../artifacts/prisma-index-audit-p3-73-registry.json)

---

## Scope

| Tier | Coverage |
|------|----------|
| All models | 401 models in `prisma/schema.prisma` |
| Tenant-scope | `userId`, `workspaceId`, `organizationId` must be indexed when present |
| Hot-path (wave 2) | 12 order/KDS/POS/webhook/staff models — zero FK index gaps |

### Hot-path models

`Order`, `OrderItem`, `WebhookEvent`, `POSShift`, `POSTransaction`, `POSPayment`, `POSAuditEvent`, `KitchenTask`, `KitchenTaskComment`, `StaffShift`, `StaffEvent`, `CustomerFeedback`

---

## Verify

```bash
npm run check:prisma-indexes
npm run check:prisma-index-audit-p3-73
npm run audit:prisma-index-audit-p3-73
npm run test:ci:prisma-index-audit-p3-73:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` (check:prisma-indexes + P3-73 cert)

---

## Status

- **401/401** models audited (June 2026)
- **0** tenant-scope index gaps
- **12/12** hot-path models with zero FK index gaps (wave 2)
- **145** informational FK gaps remain on non-hot-path models (tracked, not blocking)
