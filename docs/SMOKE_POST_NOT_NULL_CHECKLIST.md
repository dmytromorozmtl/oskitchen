# Smoke checklist — post NOT NULL + workspace-only scope

Run after `workspace:strict:all` and NOT NULL migration on the target database.

## Production smoke (no Playwright password)

```bash
npm run smoke:production-tenant
SMOKE_PREFLIGHT_EMAIL=owner@kitchen.com npm run smoke:production-tenant
# Pilot kitchens must pass demo gate:
SMOKE_PREFLIGHT_EMAIL=owner@kitchen.com npm run smoke:production-tenant:strict
# If strict mode fails on demo mode:
npm run tenant:demo:reset -- --email=owner@kitchen.com
```

Notes:

- Default smoke may fall back to `E2E_LOGIN_EMAIL` for convenience.
- Strict smoke **does not** use the E2E fallback; always pass a real pilot email explicitly.

## One-command automated smoke (Sprint 24)

```bash
npm run smoke:workspace-post-not-null
```

Or step-by-step:

```bash
npm run workspace:strict:all
npm run workspace:audit:services:strict
npm run verify:staff-scope
npm run test:unit
npm run workspace:reconcile:duplicates    # dry-run; execute if duplicates found
npm run test:e2e:public-smoke
npm run test:e2e:workspace-smoke          # needs E2E_LOGIN_EMAIL + E2E_LOGIN_PASSWORD + running app
```

Playwright spec: `e2e/workspace-post-not-null-smoke.spec.ts`

## Manual (15 min) — visual only if automated green

| # | Flow | Automated | Manual |
|---|------|-----------|--------|
| 1 | Login as workspace owner | `auth.setup.ts` | ☐ visual |
| 2 | **Today** — KPIs | E2E today page | ☐ counts make sense |
| 3 | **Orders** — list + detail | E2E orders | ☐ open real order |
| 4 | **Menus / Products** | E2E menus | ☐ edit one item |
| 5 | **POS** — terminal | E2E POS | ☐ one test order |
| 6 | **Storefront** slug | E2E `/s/{slug}` | ☐ branding OK |
| 7 | Staff scoped data | `verify:staff-scope` + staff E2E | ☐ invite flow |

## Rollback (emergency only)

If a database is **not** on NOT NULL yet:

```bash
export WORKSPACE_SCOPE_LEGACY_OR=1
```

Remove once backfill + NOT NULL are green.

## Beta preflight

```bash
# API or script that calls runKitchenPreflight(email)
```

Expect: workspace exists, orders/menus > 0, demo mode off for production pilots.
