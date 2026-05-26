# Critical test coverage — expansion report

**Версия:** 1.0  
**Дата:** 2026-05-15

## Done this pass

| Область | Файл теста | Покрытие |
|---------|------------|----------|
| Public API key auth | `tests/unit/public-api-auth.test.ts` | hash, invalid prefix, inactive/revoked, happy path |
| Webhook replay workspace | `tests/unit/webhook-replay-workspace-guard.test.ts` | owner self, admin member, intruder denied |

## Recommended next (no real external keys)

| # | Область | Подход | Приоритет |
|---|---------|--------|------------|
| 1 | Order lifecycle transitions | Vitest + mock `prisma` / вызов `validateOrderDbStatusTransition` где возможно | P0 |
| 2 | Webhook job state | Unit на чистые функции извлечённые из runner или snapshot вход/выход с mock tx | P0 |
| 3 | Billing / plan gate | Mock `canUseFeature` + `getBillingAccess` для веток без Stripe | P0 |
| 4 | Platform denial | Unit на guard/helper рядом с `requirePlatformAccess` | P0 |
| 5 | Storefront draft | Component or server util test для «preview token only» | P1 |
| 6 | Product mapping confidence | Unit на pure function если выделена из сервиса | P1 |
| 7 | Rate limit 429 shape | Assert headers on mocked `consumeRateLimitToken` failure | P1 |

## Explicitly out of scope (fixtures only)

- Реальные вызовы Stripe / Shopify / Woo / Resend в CI.  
- Продакшен ключи в репозитории.
