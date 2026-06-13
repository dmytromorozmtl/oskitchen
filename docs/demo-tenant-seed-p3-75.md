# Seed/demo tenant (P3-75)

**Policy:** `demo-tenant-seed-p3-75-v1`  
**Department:** Backend  
**Upstream:** `demo-tenant-seed-p1-35-v1`  
**Registry:** [`artifacts/demo-tenant-seed-p3-75-registry.json`](../artifacts/demo-tenant-seed-p3-75-registry.json)

---

## Blueprint targets

| Entity | Count |
|--------|------:|
| Orders | 50 |
| Vendors | 3 |
| Inventory items | 20 |

Plus commercial launch extras: 30 products, 5 staff, published storefront.

---

## Entry points

| Flow | Command / route |
|------|-----------------|
| CLI seed | `SEED_USER_ID=<uuid> npm run db:seed-demo` |
| Interactive demo | `/demo` → `importDemoWorkspace` → `seedCommercialDemoWorkspace` |
| Supervised reset | `npm run tenant:demo:reset -- --email=...` |

---

## Verify

```bash
npm run test:ci:demo-tenant-seed
npm run check:demo-tenant-seed-p3-75
npm run audit:demo-tenant-seed-p3-75
npm run test:ci:demo-tenant-seed-p3-75:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` (P3-75 cert)

---

## Status

P1-35 seeds vendors/inventory/orders via `seedDemoTenantBlueprintExtras`. P3-75 wave 2 wires `/demo` import to the full commercial dataset (**50 orders**, 3 vendors, 20 inventory).
