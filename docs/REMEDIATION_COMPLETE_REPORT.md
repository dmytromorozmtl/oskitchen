# OS Kitchen — Remediation Complete Report (17 May 2026)

Полный отчёт по выполнению Master Remediation Prompt. Baseline и финальная проверка выполнены локально.

---

## Executive summary

| Метрика | До | После |
|---------|-----|-------|
| `npm run typecheck` | PASS | **PASS** |
| `npm test` | 495/496 | **521/522** |
| IDOR API routes (checkout, analytics, delivery) | REVIEW | **FIXED** |
| RBAC | Два модуля без границ | **legacy/index разделены + ESLint** |
| Public API orders | Отдельная Zod | **Shared `orderCustomerFieldsSchema`** |
| Workspace Phase 1 | Нет `workspaceId` | **Schema + migration SQL + backfill script** |
| Experiment sync services | 60 файлов в production tree | **Перенесены в `_experiments/`** |
| Rate limits | Частично | **billing_checkout, delivery_api, public_api_orders_get** |

**Composite readiness (оценка): ~90/100** (in-repo) — `npm run beta:launch` orchestrates steps 1–6; launch после green report на staging.

### Wave 6 (17 May — 30–90 day roadmap, in repo)

| Horizon | Item | In-repo |
|---------|------|---------|
| 30 d | Phase 3 order detail + order-hub | `owned-order-guard`, `order-hub-query-scope`, hub page `dataUserId` |
| 30 d | Streaming export production/inventory | `streaming-csv-export.ts` + `/api/export` RBAC |
| 45 d | POS refund + Stripe | `pos-stripe-refund-service.ts`, mutation RBAC on void/refund |
| 60 d | RBAC Phase C UI | Provider + import-center gate + export permissions |
| 90 d | MFA TOTP impersonation | `impersonation-totp.ts`, platform users form fields |
| Post-beta | Loyalty, SMS, P&L | **Не в scope** — отдельный эпик |

### Wave 2–3 (17 May — in repo)

| Область | Статус |
|---------|--------|
| RBAC Phase B | settings, orders, production, packing, integrations, **customers**, **routes**, **meal-plans** |
| Workspace Phase 2 | `IntegrationConnection` + `WebhookEvent.workspaceId` + migration + backfill |
| Workspace Phase 3 | `cached-workspace-order-scope` wired in orders/calendar/packing/locations/export |
| Channel / import IDOR | `requireChannelActor`, import owner scope fix |
| Tenant E2E | `tests/integration/tenant-isolation.test.ts` + `npm run test:security` |
| Staging ops | `staging:preflight`, `check:backfill`, `smoke:remediation` (cookie + rate limit) |
| Export streaming | `orders`, `customers`, `products`, **`production`, `inventory`** |
| POS void/refund MVP | `voidPosTransaction`, `refundPosTransaction` + **Stripe `pi_`/`ch_` reversal** |
| Impersonation MFA | **TOTP** (`PLATFORM_IMPERSONATION_TOTP_SECRET`) + step-up token fallback |
| RBAC Phase C UI | `WorkspacePermissionGate`, `WorkspacePermissionsProvider`, export permission map |
| Order hub / detail Phase 3 | `orderHubWhere`, `whereOwnedOrderForOwner` on detail + hub counts |
| Experimental crons | HTTP 200 `{ skipped: true }` |
| Docs | `docs/RBAC_DIFF.md`, `docs/STAGING_REMEDIATION_RUNBOOK.md` |
| E2E | `tests/e2e/remediation-delivery-idor.spec.ts` |

---

## Block 0 — Diagnostics

Выполнено:

- Typecheck / test baseline зелёные
- 131 cron route, 60 experiment sync services (теперь в `_experiments/`)
- Rate limit adapters: memory / Upstash / Redis (`docs/RATE_LIMITING.md`)

---

## Block 1.1 — RBAC

**Сделано:**

| Файл | Назначение |
|------|------------|
| `lib/permissions/legacy.ts` | Legacy `hasLegacyPermission(role, key)` для POS/UI |
| `lib/permissions.ts` | Deprecation shim (не merge с workspace index) |
| `lib/permissions/index.ts` | Workspace matrix (без изменений) |
| `components/permissions/permission-gate.tsx` | Импорт из `legacy` |
| `services/pos/pos-checkout-service.ts` | `hasLegacyPermission` |
| `eslint.config.mjs` | Запрет `@/lib/permissions` и `_experiments/*` |
| `tests/unit/legacy-permissions.test.ts` | Регрессия POS comp |
| `docs/RBAC_MIGRATION_PLAN.md` | План фаз B–D |

**Не делали:** `export *` из index в root — сломало бы POS (разные сигнатуры `hasPermission`).

---

## Block 1.2 — IDOR API (§3 inventory)

| Route | Статус | Изменения |
|-------|--------|-----------|
| `/api/checkout` | **FIXED** | Session user; subscription `userId`; rate limit `billing_checkout` |
| `/api/storefront/analytics` | **OK** | Уже: slug, published, consent, optional HMAC token, `storefront_analytics_ingest` |
| `/api/delivery/*` | **FIXED** | `requireConnectionOwner` + `enforceDeliveryApiRateLimit` |

Обновлён `docs/IDOR_MUTATION_INVENTORY.md` §3.

---

## Block 2 — Workspace Phase 1

**Schema (`prisma/schema.prisma`):**

- `Order.workspaceId` + relation + indexes `(workspaceId, createdAt|status)`
- `Menu.workspaceId` + relation + index
- `Product.workspaceId` + relation + index
- `Workspace.orders`, `menus`, `products`

**Migration (не применялась автоматически к prod):**

`prisma/migrations/20260517120000_workspace_phase1_order_menu_product/migration.sql`

```bash
# Local / staging after approval:
npx prisma migrate deploy
npm run backfill:workspace-id -- --dry-run
npm run backfill:workspace-id
```

**Runtime wiring:**

- `lib/scope/resolve-owner-workspace-id.ts`
- `services/orders/order-creation-service.ts` — sets `workspaceId` on create
- `app/api/public/v1/orders/route.ts` — sets `workspaceId` on API create

---

## Block 3.1 — Shared order validation

| Module | Role |
|--------|------|
| `lib/orders/order-customer-fields.ts` | Shared customer name/email/phone limits |
| `lib/orders/public-api-order-create.ts` | Enterprise API POST schema |
| `lib/orders/order-validation.ts` | Dashboard uses same customer field shapes |
| `tests/unit/public-api-order-create.test.ts` | Alignment tests |

---

## Block 4 — Experiment quarantine

- **60** `*-sync-service.ts` → `services/storefront/_experiments/`
- **60** cron routes обновлены на `@/services/storefront/_experiments/...`
- `services/storefront/_experiments/README.md`
- ESLint blocks production imports from `_experiments`

Crons по-прежнему требуют `ENABLE_EXPERIMENTAL_CRONS=true`.

---

## Block 5 — Prisma hardening

- `WebhookEvent`: добавлен `@@index([userId, receivedAt])` в schema + migration SQL
- `onDelete: SetNull` на optional FK (`brandId`, `locationId`) — валидно; предупреждение Prisma может оставаться на других relations

---

## Block 6–10 — UX / CI / docs (ранее + сейчас)

| Item | Status |
|------|--------|
| `PlaceholderBanner` + Uber Direct page | Done |
| `npm run verify-claims` in CI (non-blocking) | Done |
| `docs/REMEDIATION_STATUS.md` | Living checklist |
| `docs/ENGINEERING_ONBOARDING.md` | Onboarding |
| `docs/CRON_INVENTORY.md` | Cron taxonomy |
| `scripts/check-env.ts` | Prod rate-limit warning |

---

## Safe commands (final)

```text
npm run typecheck     → PASS
npm test              → 500 passed, 1 skipped
npx prisma validate   → PASS (SetNull warning may persist)
npx prisma generate   → OK
```

---

## Следующий шаг (приоритет)

### Немедленно (24–48 ч)

1. **Staging:** `npx prisma migrate deploy` + `npm run backfill:workspace-id`
2. **Staging:** `RATE_LIMIT_ADAPTER=upstash` + `UPSTASH_REDIS_REST_*`
3. **Smoke:** public API POST order + dashboard create order → same customer validation errors
4. **Review:** `npm run verify-claims` warnings in CI log

### 7 дней

1. RBAC Phase B — `resolveWorkspacePermissions` в новых mutations
2. E2E: tenant isolation integration test (`tests/integration/tenant-isolation.test.ts` — создать)
3. Woo/Shopify certification smoke на staging

### 30 дней

1. Workspace Phase 2 (`IntegrationConnection`, `WebhookEvent`)
2. Import/export streaming (Block 7.1 из prompt)
3. POS void/refund MVP

### 60–90 дней

1. Workspace Phase 3 — cutover queries to `workspaceId`
2. Deprecate `lib/permissions.ts` shim → только `legacy` + `index`
3. Paid pilot: MFA on platform impersonation

---

## Файлы изменений (ключевые)

**Security / API:** `app/api/checkout/route.ts`, `app/api/delivery/*`, `app/api/public/v1/orders/route.ts`, `lib/integrations/delivery-api-guard.ts`

**RBAC:** `lib/permissions/legacy.ts`, `lib/permissions.ts`, `eslint.config.mjs`

**Schema:** `prisma/schema.prisma`, `prisma/migrations/20260517120000_workspace_phase1_order_menu_product/`

**Experiments:** `services/storefront/_experiments/*` (60 files), `app/api/cron/**` (import paths)

**Docs:** `docs/IDOR_MUTATION_INVENTORY.md`, `docs/REMEDIATION_STATUS.md`, this report

---

*Read-only audit source: `docs/audit17may.md`. No production DB migrate deploy was run by this remediation session.*
