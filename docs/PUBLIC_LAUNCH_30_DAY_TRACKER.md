# Public launch tracker (30 days → 100/100)

**Owner:** Engineering · **Last updated:** 2026-05-17

| # | Workstream | Status | Evidence |
|---|------------|--------|----------|
| 1 | Workspace tenancy (`dataUserId`) | **Done (code)** | `getTenantActor` + 361 dashboard pages + 84 actions; root `layout.tsx` |
| 2 | CI E2E staging | **Ready (ops)** | `.github/workflows/e2e-staging.yml`, `docs/GITHUB_E2E_STAGING_SECRETS.md` |
| 3 | Observability | **Done** | `ops-signals.ts`, cron wrap, webhook invalid emit |
| 4 | Profiling | **Done** | `QUERY_PROFILE`, `order-list-constants`, lean select |
| 5 | Nav business-mode | **Done** | tests MEAL_PREP + CATERING + GHOST_KITCHEN |
| 6 | Legal / BETA | **Done** | Marketing copy BETA + in-app certification runner |
| 6b | Woo/Shopify certification | **Ready (test shop)** | `IntegrationCertificationPanel`, `smoke:woo-shopify`, `WOO_SHOPIFY_TEST_SHOP_SETUP.md` |
| 7 | Incident response | **Done** | `INCIDENT_RESPONSE_RUNBOOK.md` |

## Tenancy batch (Week 1) — completed in code

- [x] `app/dashboard/products/**`
- [x] `app/dashboard/menu-planner/**`
- [x] `app/dashboard/routes/**`
- [x] `app/dashboard/sales-channels/**`
- [x] All other dashboard `page.tsx` (via `scripts/migrate-dashboard-tenant-scope.mjs`)
- [x] Server actions batch (`scripts/migrate-actions-tenant-scope.mjs`)
- [x] Layouts: dashboard, storefront, locations, pos, product-mapping

Pattern:

```typescript
import { getTenantActor } from "@/lib/scope/cached-tenant";

const { sessionUser, dataUserId } = await getTenantActor();
// prisma tenant rows: userId: dataUserId
// profile / RBAC / audit actor: sessionUser.id
```

Server actions:

```typescript
const { sessionUser, dataUserId } = await requireTenantActor();
```

Verify: `node scripts/verify-tenant-scope-coverage.mjs` (expect 0–1 intentional `requireSessionUser` in platform-only paths).

## GitHub secrets for staging E2E

See **`docs/GITHUB_E2E_STAGING_SECRETS.md`**.

| Secret / Var | Purpose |
|--------------|---------|
| `E2E_STAGING_BASE_URL` | Staging URL |
| `E2E_LOGIN_EMAIL` | Tenant owner or staff test user |
| `E2E_PASSWORD` | Password |
| `E2E_STOREFRONT_SLUG` (var) | e.g. `hello` |

## Week 2–4 (remaining)

- [ ] IDOR long-tail — `docs/IDOR_MUTATION_INVENTORY.md` (~20 REVIEW rows per release)
- [ ] Woo/Shopify certification on test shop — run in-app + `npm run smoke:woo-shopify -- --owner-email …`
- [ ] Sentry alert rules in UI — `docs/SENTRY_ALERT_RULES.md`
- [ ] Marketing BETA copy pass (public site, not only dashboard badges)
- [ ] 3 pilot customers without SEV-1 (operational)

## Definition of 100/100

- [x] All dashboard modules use tenant actor (code)
- [ ] Staging E2E green daily (needs secrets + first green run)
- [ ] Sentry alerts configured in product UI
- [ ] Manual + automated smoke on prod after each release
- [ ] Woo/Shopify certification signed OR marketing stays BETA
- [ ] Pilot SLA agreed with first 3 customers
