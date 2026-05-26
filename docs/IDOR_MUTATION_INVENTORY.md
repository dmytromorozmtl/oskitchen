# Инвентаризация мутаций и API (IDOR / tenant scope) — KitchenOS

**Версия:** 1.3  
**Дата:** 2026-05-17 (обновление волны remediation)  
**Владелец процесса:** Tech Lead + Security champion  
**Методология:** [`docs/TENANT_SCOPE_IDOR_PROGRAM_RU.md`](./TENANT_SCOPE_IDOR_PROGRAM_RU.md)

## Как читать таблицу

| Статус | Значение |
|--------|----------|
| **OK** | По статическому ревью типовой паттерн безопасен (сессия → `userId` / проверка membership / platform guard). |
| **FIXED** | Явно усилено в рамках волны 2026-05 (helper `userHasWorkspaceAccess`, политики support и т.д.). |
| **REVIEW** | Требуется построчное подтверждение владельцем модуля (мутация есть, объём большой). |
| **BLOCKED** | Нельзя закрыть без архитектурного/продуктового решения — в отчёте указана причина. |
| **RISK_ACCEPTED** | Известный риск принят письменно (владелец, дата, ссылка на тикет); не эквивалент OK. |

**Ключ изоляции:** по какому полю гарантируется граница tenant для этой группы.

---

## 1. Сводка

| Категория | Файлов (actions) | OK | FIXED | REVIEW |
|-----------|------------------|-----|-------|--------|
| Auth / onboarding | 2 | 2 | 0 | 0 |
| Support / tickets | 1 | 0 | 1 | 0 |
| Platform / impersonation / support session | 4 | 0 | 0 | 4 |
| Orders / POS / packing / production | 12 | 8 | 4 | 0 |
| Storefront (публичные + дашборд) | 10 | 4 | 0 | 6 |
| CRM / customers / subscriptions | 5 | 0 | 2 | 3 |
| Integrations / webhooks / import | 8 | 3 | 1 | 4 |
| Settings / billing / monetization | 8 | 3 | 1 | 4 |
| Остальные домены (training, playbooks, …) | 35 | 10 | 0 | 25 |

*Уточнение 2026-05-15:* волна A1 закрыла **мутации заказов** (`orders.ts`, ключевые переходы) и **POS** (`pos.ts`, `pos-terminal-customers.ts`). Файлы **packing / production** в этой же категории по-прежнему требуют построчного REVIEW при изменениях.

*Цифры REVIEW — плановая нагрузка на построчный аудит; при закрытии задачи обновляйте строки до OK/FIXED с датой и ссылкой на PR.*

---

## 2. Actions — группы (волна 1: P1 маршруты)

| Группа | Файлы | Ключ изоляции | Статус | Примечание |
|--------|-------|---------------|--------|------------|
| **Support** | `support-tickets.ts` | Ticket + `userHasWorkspaceAccess` для `workspaceId` в форме; `resolveSupportCommentPostPermission` | **FIXED** | Форма тикета: `userHasWorkspaceAccess`; комментарии: политика в `lib/support/support-comment-guards.ts` |
| **Orders (legacy user scope)** | `orders.ts`, `order-creation.ts`, orders pages | `requireTenantActor` → `dataUserId` (workspace owner) | **FIXED** | 2026-05-17: staff видят/мутируют заказы владельца; audit actor = session user |
| **POS** | `pos.ts`, `pos-terminal-customers.ts` | `user.id` + `POSRegister` / `POSShift` с `userId` в сервисах | **OK** | 2026-05-15: `checkoutPosSale` — `findFirst` регистра `{ id, userId }`; смены с `userId` + `registerId` |
| **Storefront public** | `storefront-order.ts`, `storefront-contact.ts`, … | `storeSlug` + настройки витрины | **OK** | Публичный контракт; не workspace session |
| **Storefront dashboard** | `storefront-settings.ts`, `storefront-pages.ts`, `storefront-team-invite.ts` | `userId` / `workspaceId` + `resolveOwnerStorefront` | **FIXED** | 2026-05-17: pages — `findFirst` по `userId`; invites — `workspaceId` + scoped storefront; team actions через `getPrimaryOwnerStorefront` |
| **CRM customers** | `customers.ts`, customers pages | `requireTenantActor` → `dataUserId` | **FIXED** | 2026-05-17: workspace staff see owner CRM; `authorId` = session user |
| **Menus** | `menus.ts`, menus page | `dataUserId` | **FIXED** | 2026-05-17: plans/menus scoped to workspace owner |
| **Integrations Woo/Shopify** | integration pages | `dataUserId` on `integrationConnection` | **FIXED** | 2026-05-17: BETA badges + tenant-scoped connections |
| **Customers / CRM** | `customers.ts` | `dataUserId` + `customers.manage` RBAC | **FIXED** | 2026-05-17: IDOR `findFirst({ id, userId })`; Wave 4: `requireCrmMutation()` + `customers.manage` permission |
| **Production / packing** | `production.ts`, `packing.ts` | `userId` + workspace RBAC | **FIXED** | 2026-05-17: scoped queries; Wave 3: `production.manage` / `packing.manage` |
| **Routes** | `delivery-route.ts` | `userId` + `routes.manage` | **FIXED** | Wave 4: `requireRouteMutation()` |
| **Meal plans** | `meal-plans.ts` | `userId` + `orders.manage` | **FIXED** | Wave 4: `requireMealPlanMutation()` |
| **Import / export** | `import-export.ts`, `import-center.ts` | `dataUserId` + import RBAC | **FIXED** | Wave 5: `assertCapability` uses real owner (`session === dataUserId`); tenant-scoped jobs |
| **Channel command center** | `channel-command-center.ts` | `dataUserId` via `requireChannelActor` | **FIXED** | Wave 5: workspace staff see owner batches; webhook lab sets `workspaceId` |
| **Import center** | `import-center.ts` | `session.userId` + capability gates; сервисы — `ImportJob.userId` | **FIXED** | 2026-05-15: `rollbackImportJob` — удаления сущностей по `userId` / `menu.userId` (defense in depth, ранее `delete` только по `id`) |
| **Billing (tenant = владелец аккаунта)** | `billing.ts`, `customer-subscription.ts` | `requireSessionUser` + `gate()` / `user.id` на всех мутациях | **OK** | 2026-05-15: billing — только свой `userId` в entitlement/subscription; customer-subscription — `userId_email` upsert с `user.id` |
| **Demo / destructive** | `demo.ts`, `demo-golden-scenario.ts` | Owner + `areDemoWorkspaceMutationsAllowed()` | **OK** | Blocked in production via `lib/production-guards.ts` |
| **Platform** | `platform-support*.ts`, `platform-impersonation.ts`, `webhook-replay.ts` | `requireSuperAdmin` + audit + TTL | **FIXED** | 2026-05-17: impersonation TTL 1h, cookie `kos_imp_session`, audit start/end, block super-admin targets, banner + auto-expire |
| **Auth** | `auth.ts` | Публичные потоки | **OK** | |
| **Settings center** | `settings-center.ts` | `resolveKitchenSettingsDataUserId` → owner row; RBAC по session role | **FIXED** | 2026-05-17: workspace members пишут в KitchenSettings владельца; `settings-center-service` — `userId` в upsert |
| **Training** | `training.ts` | `TrainingProgram.userId` / nested `program.userId` в сервисе | **FIXED** | 2026-05-17: все `training-service` мутации с `where: { userId }` |
| **Playbooks** | `playbooks.ts` | `Playbook.userId`, `PlaybookRun.userId` | **FIXED** | 2026-05-17: `startRunAction` — `findFirst` playbook; сервис — scoped queries |

---

## 3. API routes — обязательный список к ревью (POST / PATCH / опасный GET)

Полный перечень файлов: `app/api/**/route.ts`. Ниже — **высокий приоритет** (данные / деньги / вебхуки / экспорт).

| Маршрут | Метод | Статус | Примечание |
|---------|-------|--------|------------|
| `/api/cron/*` (131 routes) | GET/POST | **FIXED** | 2026-05-17: `runCronRoute` + `verifyCronSecret`; experimental crons gated `ENABLE_EXPERIMENTAL_CRONS` |
| `/api/cron/webhook-jobs` | GET/POST | **FIXED** | Migrated to `runCronRoute` |
| `/api/webhooks/stripe` | POST | **FIXED** | 2026-05-17: `constructEvent` + `STRIPE_WEBHOOK_SECRET`; idempotency `billingEvent.stripeEventId`; tests `webhook-signature-verification` |
| `/api/webhooks/shopify/*` | POST | **FIXED** | 2026-05-17: shop domain → connection; `verifyShopifyHmac`; rate limit ingest |
| `/api/webhooks/woocommerce` | POST | **FIXED** | 2026-05-17: `cid` → connection; `verifyWebhookSignature`; 401 on bad sig |
| `/api/checkout` | POST | **FIXED** | 2026-05-17: Supabase session + `subscription.findUnique({ userId })` + `billing_checkout` rate limit |
| `/api/export` | GET | **OK** | 2026-05-15: Supabase `user.id` → `buildExportCsv(user.id)`; `audit_logs` — super-admin |
| `/api/export/report` | GET | **OK** | 2026-05-15: `user.id` + `canDoReports` + `runReport(..., { userId: user.id })` |
| `/api/public/v1/orders`, `/products`, `/customers` | GET/POST | **FIXED** | 2026-05-17: Shared customer Zod via `publicApiOrderCreateSchema`; GET rate limit; `workspaceId` on create |
| `/api/billing/checkout`, `/api/billing/portal` | POST | **OK** | Session-only (`supabase.auth.getUser`); subscription scoped `userId`; no cross-tenant body |
| `/api/storefront/analytics` | POST | **OK** | 2026-05-17: Public by design; slug + published check; `storefront_analytics_ingest` rate limit; optional signed token |
| `/api/delivery/*` | POST | **FIXED** | 2026-05-17: `requireConnectionOwner` + `delivery_api` rate limit |

Остальные маршруты — занести в ту же таблицу по мере спринта (копия шаблона из программы IDOR §4.1).

---

## 4. Следующие шаги (операционный чеклист)

1. [ ] Назначить владельца на каждую группу со статусом **REVIEW**.  
2. [x] Волна 2026-05-15: billing, export API, channel-command-center, import-center, orders/POS — закрыто в §2 / §3 (код + примечание даты; усиление rollback в `import-center-service.ts`).  
3. [x] 2026-05-17: P0 storefront/customers/production/packing/public API/cron — **FIXED** (см. §2–3).  
4. [ ] Закрывать оставшиеся **REVIEW** (training, playbooks, …) → **OK** только с ссылкой на PR.  
5. [ ] 30-day: системный `workspaceId` на REVIEW-мутациях (`lib/scope/tenant-scope.ts` готов).  
6. [ ] Раз в релиз — прогон grep из `TENANT_SCOPE_IDOR_PROGRAM_RU.md` по новым файлам в `actions/` и `app/api/`.

---

*Документ ведётся вручную; при закрытии группы обновляйте §1 сводку. После merge волны 2026-05-15 добавьте ссылку на PR в тикет аудита или в примечания к строкам §2 (замените блок «2026-05-15» на «PR #N»).*
