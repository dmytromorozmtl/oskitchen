# Матрица паритета: витрина checkout (клиент ↔ сервер)

**Версия:** 1.0  
**Дата:** 2026-05-15  
**Клиент:** `components/storefront/store-checkout-client.tsx`  
**Сервер:** `actions/storefront-order.ts` → `submitPublicStorefrontOrder`

Правило: **UI может смягчать UX, но не может ослаблять безопасность** — все блокирующие условия воспроизводимы на сервере.

| # | Правило / проверка | Клиент (UX) | Сервер (`submitPublicStorefrontOrder` и вспомогательные) | Тест / регрессия |
|---|---------------------|-------------|------------------------------------------------------------|------------------|
| 1 | Витрина включена, preorder, опубликована | Навигация, кнопки | `enabled`, `preorderEnabled`, `published` | Интеграция (по возможности) |
| 2 | Окно закрытия / «kitchen closed» | `orderingPaused` (= closure) | `isStorefrontInClosureWindow(sf)` | — |
| 3 | Меню привязано, не catalog-only | props меню | `activeMenuId`, `catalogOnly` | — |
| 4 | Pickup / delivery разрешены | toggles | `pickupEnabled` / `deliveryEnabled` | — |
| 5 | Условия использования | `requireTerms` | `termsRequired` + `termsAccepted` | — |
| 6 | Дневной cutoff | UI copy | `isPastDailyOrderCutoff` | — |
| 7 | Лимит заказов в день | — | `maxOrdersPerDay` + count | — |
| 8 | Строки корзины ∈ текущего меню | локальная корзина | `menuProductIds` + `findMany` продуктов | — |
| 9 | Лимит количества на SKU | — | `maxStorefrontQuantity` | — |
| 10 | Даты pickup/delivery обязательны | inputs | проверка наличия дат по типу | — |
| 11 | Blackout даты | — | `isDateInStorefrontBlackout` | — |
| 12 | Доставка (зоны, адрес) | UI | `validateStorefrontDelivery` | — |
| 13 | Fulfillment rules | — | `runStorefrontFulfillmentRuleEngine` | — |
| 14 | Минимальный чек | `minimumOrderAmount` | `minimumOrderAmount` vs subtotal | — |
| 15 | **Pay later only → нельзя online** | `onlineCheckoutAllowed`, `payLaterOnly` | `isStorefrontOnlineCheckoutAvailable` (в т.ч. `payLaterOnly`) | **Юнит:** `tests/unit/storefront-payment-paylater.test.ts` |
| 16 | Online checkout → Stripe/currency | режим Stripe в UI | `stripeMinorAmountForOrder` + session create | — |
| 17 | Rate limit публичного POST | — | Политики `PUBLIC_POST_RATE_LIMITING` (если подключены к action) | REVIEW в отдельной задаче |

---

## Обновление документа

При любом изменении клиента checkout добавьте строку или измените §ссылку на серверные строки кода в PR.
