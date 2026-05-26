# WooCommerce & Shopify — отчёт сертификации

**Дата:** 2026-05-17

## Что сделано в коде

### 1. In-app certification (test shop)

На страницах:

- `/dashboard/integrations/woocommerce`
- `/dashboard/integrations/shopify`

Добавлен блок **Test shop certification**:

- Кнопка **Run certification checks** — 9–10 автоматических проверок
- Результат: `PASS` / `PARTIAL` / `FAIL` + детали по каждому пункту
- Sign-off (только **owner**): Engineering → Security → Pilot 7d
- Badge **BETA** всегда виден; **Pilot signed** после трёх подписей
- Никогда не показывается ложный зелёный «Verified»

### 2. Сервис проверок

| Файл | Назначение |
|------|------------|
| `lib/integrations/channel-certification-types.ts` | Типы, чеклист |
| `services/integrations/channel-certification-runner.ts` | Логика проверок + сохранение в `settingsJson.certification` |
| `actions/channel-certification.ts` | Server actions |

### 3. Health check с live REST

`actions/integration-health.ts` — для Woo/Shopify при **Check health** вызывается реальный `testConnection`, не только статус строки.

### 4. Tenant API для staff

`lib/integrations/api-helpers.ts` — `requireConnectionOwner` использует `dataUserId` (workspace member видит owner connections).

### 5. Marketing BETA

- `lib/public-copy.ts` — статус «BETA — test shop certification required»
- `/integrations/woocommerce`, `/integrations/shopify` — явный BETA в eyebrow

### 6. CLI smoke

```bash
npm run smoke:woo-shopify -- --owner-email workspace.moroz@gmail.com
```

Документация: `docs/WOO_SHOPIFY_TEST_SHOP_SETUP.md`, обновлён `docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md`.

### 7. Тесты

`tests/unit/channel-certification.test.ts` — 4 теста.

---

## Что остаётся (ops — test shop)

| Шаг | Действие |
|-----|----------|
| 1 | Поднять Woo **или** Shopify dev store (HTTPS) |
| 2 | Сохранить credentials в KitchenOS dashboard |
| 3 | Настроить webhooks (URL + secret из dashboard) |
| 4 | Тестовый заказ → проверить webhook log |
| 5 | **Run certification checks** → цель `PASS` или `PARTIAL` |
| 6 | 7 дней pilot без SEV-1 → три sign-off в UI |
| 7 | Marketing: до sign-off только **BETA**; после — «Pilot certified», не App Store approved |

---

## Следующий шаг (приоритет)

**Подключить test shop и получить первый `PASS` certification run.**

Команда для вашего staging owner:

```bash
cd /Users/dmytro/Desktop/2026/KitchenOS
npm run smoke:woo-shopify -- --owner-email workspace.moroz@gmail.com
```

Если connection ещё нет — сначала dashboard → Integrations → WooCommerce → Save credentials.

---

## Статус «signed или BETA»

| Состояние | Когда |
|-----------|--------|
| **BETA** | По умолчанию; capability matrix + UI |
| **PARTIAL** | Предупреждения (нет webhooks 7d, async queue off) |
| **PILOT_SIGNED** | Все automated checks не FAIL + 3 sign-off в dashboard |
| **Production certified** | Не заявляется — отдельное product decision + capability matrix promotion |
