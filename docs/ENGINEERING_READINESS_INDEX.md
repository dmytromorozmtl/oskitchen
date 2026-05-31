# Engineering readiness — index (start here)

**Версия:** 1.0  
**Дата:** 2026-05-15

## 1. Start here

- **Коммерческий hardening audit:** [`COMMERCIAL_RELEASE_HARDENING_AUDIT.md`](./COMMERCIAL_RELEASE_HARDENING_AUDIT.md)  
- **Итоговое решение о релизе:** [`OS Kitchen_RELEASE_HARDENING_FINAL_REPORT.md`](./OS Kitchen_RELEASE_HARDENING_FINAL_REPORT.md)  
- **Карта модулей → документы:** [`MODULE_DOCUMENTATION_MAP.md`](./MODULE_DOCUMENTATION_MAP.md)  
- **Трекер (шаблон):** [`ENGINEERING_READINESS_DASHBOARD_TEMPLATE.md`](./ENGINEERING_READINESS_DASHBOARD_TEMPLATE.md)

## 2. Architecture

- `docs/IMPLEMENTATION_ARCHITECTURE.md` (и смежные)  
- `prisma/schema.prisma` — схема как «источник правды» модели данных

## 3. Environment

- `README.md`, `.env.example`, `docs/SUPABASE_PRODUCTION_SETUP.md`

## 4. Database

- Migrations: `prisma/migrations`  
- `npm run db:deploy`

## 5. Auth / RBAC / tenant

- `docs/TENANT_SCOPE_IDOR_PROGRAM_RU.md`  
- `docs/IDOR_MUTATION_INVENTORY.md`  
- **Paid pilot go/no-go:** [`PAID_PILOT_GO_NO_GO_CHECKLIST.md`](./PAID_PILOT_GO_NO_GO_CHECKLIST.md)  
- **Workspace migration:** [`WORKSPACE_MIGRATION_PLAN.md`](./WORKSPACE_MIGRATION_PLAN.md), [`WORKSPACE_MIGRATION_RUNBOOK_STAGING.md`](./WORKSPACE_MIGRATION_RUNBOOK_STAGING.md)  
- **Golden path (manual):** [`PILOT_GOLDEN_PATH_CHECKLIST.md`](./PILOT_GOLDEN_PATH_CHECKLIST.md)  
- Commands: `npm run verify:pilot-readiness`, `npm run staging:pilot:complete`  
- Ops runbook: [`STAGING_PILOT_OPS_RUNBOOK.md`](./STAGING_PILOT_OPS_RUNBOOK.md)  
- `lib/platform-owner.ts` — founder superadmin (`workspace.moroz@gmail.com`)

## 6. Orders / FoodOps

- `docs/ORDER_CREATION_*`, Order Hub help

## 7. POS

- `docs/POS_TERMINAL_READY_REPORT.md`, `docs/POS_WORKFLOW_COMPLETION_FINAL.md`

## 8. Storefront

- `docs/STOREFRONT_*`, `docs/STOREFRONT_CHECKOUT_RULE_MATRIX.md`

## 9. Webhooks / integrations

- `docs/WEBHOOK_QUEUE_RETRY_ARCHITECTURE.md`  
- `docs/PUBLIC_API_WEBHOOK_SECURITY_REPORT.md`

## 10. Billing

- `docs/BILLING_STRIPE_SETUP.md`, `docs/BILLING_SECURITY.md`

## 11. Support / platform

- `docs/PLATFORM_ADMIN_SUPPORT_COMPLETION.md`  
- `app/platform/**`

## 12. Security / compliance narrative

- `docs/data-room/SECURITY_OVERVIEW.md`  
- `app/trust/page.tsx`

## 13. Observability

- `docs/OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md`  
- `docs/OBSERVABILITY_PROD_ACTIVATION_CHECKLIST.md`

## 14. QA / testing

- `docs/TESTING.md`  
- `docs/PLAYWRIGHT_RELEASE_CI_HARDENING.md`

## 15. Release

- `docs/GO_LIVE_CHECKLIST.md`  
- `docs/PLAYWRIGHT_RELEASE_CI_RU.md`

## 16. Known launch blockers

- См. финальный отчёт § remaining blockers

## 17. Module readiness table

- [`MODULE_DOCUMENTATION_MAP.md`](./MODULE_DOCUMENTATION_MAP.md)
