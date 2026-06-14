# P0-15 — Cross-tenant data leak E2E

**Policy:** `p0-15-cross-tenant-data-leak-e2e-v1`  
**Extends:** `cross-tenant-e2e-p1-14-v1`

Proves **User A** (authed E2E tenant) cannot read **User B** workspace data. Two workspaces seeded in DB; cross-tenant access must return **403** or **404** with no PII leak.

## E2E scenarios

| Scenario | Assertion |
|----------|-----------|
| Dashboard foreign order | `/dashboard/orders/{tenantBOrderId}` → Page not found, no customer name |
| Marketplace invoice | `GET /api/marketplace/orders/{tenantBPoId}/invoice` → 403 or 404 |
| Audit export | `GET /api/dashboard/audit-logs/export?workspaceId={tenantB}` → no tenant B data in body |
| Public API | `GET /api/public/v1/{route}?workspaceId={tenantB}` → 403 or empty `data[]` |

## Contract regression

14 isolation scenarios in `lib/qa/cross-tenant-e2e-contract.ts` — artifact `artifacts/cross-tenant-e2e-summary.json`.

## Commands

```bash
# Policy + contract gate (CI quality job)
npm run check:cross-tenant-data-leak-e2e-p0-15

# Regenerate contract artifact
npm run benchmark:cross-tenant-data-leak-e2e-p0-15

# Playwright E2E (DATABASE_URL + E2E creds; optional E2E_PUBLIC_API_KEY)
npm run test:e2e:cross-tenant-data-leak-e2e
```

## Env

- `DATABASE_URL` — seed tenant B fixtures
- `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` — User A session (chromium-authed)
- `E2E_PUBLIC_API_KEY` — public API route scenarios (optional, skipped if unset)

## Artifact

`artifacts/cross-tenant-data-leak-e2e.json` — P0-15 wiring registry + link to contract summary.
