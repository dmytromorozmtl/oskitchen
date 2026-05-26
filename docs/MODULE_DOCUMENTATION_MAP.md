# Module → documentation map

**Версия:** 1.0  
**Дата:** 2026-05-15

Колонки: **Owner** (назначить в команде), **Status** (Beta / GA / Roadmap), **Top docs**, **Critical routes**, **Critical services**, **Tests**, **Gaps**

| Module | Owner (TBD) | Status | Top docs | Critical routes | Critical services | Tests | Gaps |
|--------|-------------|--------|----------|-----------------|-------------------|-------|------|
| Orders | — | GA path | `ORDER_CREATION_*`, `PRODUCTION_ORDERS_SOURCE_VIEW` | `/dashboard/orders`, `/api/checkout` | `order-creation-service`, `orders` actions | Partial | E2E lifecycle |
| POS | — | GA path | `POS_TERMINAL_READY_REPORT` | `/dashboard/pos/terminal` | `pos-checkout-service` | `pos-checkout` flow e2e | Hardware caveats |
| Storefront | — | GA path | `STOREFRONT_CHECKOUT_*` | `/s/[storeSlug]/checkout` | storefront server actions | `storefront.spec` | Draft theme |
| Webhooks | — | Beta→GA | `WEBHOOK_QUEUE_RETRY_*` | `/api/webhooks/*`, cron | `webhook-job-runner`, `webhook-replay-service` | Unit guards added | Per-route signature tests |
| Billing | — | GA path | `BILLING_STRIPE_*` | `/api/webhooks/stripe` | Stripe services | Limited | Safe-state tests |
| Public API | — | Enterprise | `PUBLIC_API_WEBHOOK_SECURITY_REPORT` | `/api/public/v1/*` | `api-public/auth` | **New** unit | Scopes, idempotency |
| Platform | — | Internal | `PLATFORM_ADMIN_SUPPORT_*` | `/platform/*` | platform services | Need denial e2e | grep audit |
| Support | — | GA path | `SUPPORT_MODULE_AUDIT` | `/dashboard/support` | ticket services | Partial | SLA automation |
| Import center | — | GA path | `IMPORT_CENTER_*` | `/dashboard/import-center` | `import-center-service` | Partial | Large file perf |
| Integrations | — | Beta | `CHANNEL_*`, `SALES_CHANNELS_*` | `/dashboard/sales-channels` | integration sync | Manual | Partner claims |

*Таблица сокращённая; расширяйте строками по мере ICP.*
