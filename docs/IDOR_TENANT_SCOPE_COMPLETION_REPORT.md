# IDOR / Tenant scope — completion report (honest scope)

**Версия:** 1.0  
**Дата:** 2026-05-15  
**Политика:** статус **OK** в инвентаризации выставляется только после **реального** статического ревью кода (или исправления + ревью). Полный охват всех `actions/**/*.ts` и `app/api/**` в одном PR **не выполнялся**.

---

## 1. Executive summary

| Категория | Количество |
|-----------|------------|
| Файлы **ревьюнуты** в этом проходе (целенаправленно) | 6+ (public API stack, webhook replay guard, platform health touch) |
| Файлы **исправлены** в коде в этом проходе | 1 (`services/developer/platform-health-service.ts` — индикаторы Sentry / webhook queue / rate limit) |
| Новые **автотесты** | 2 (`tests/unit/public-api-auth.test.ts`, `tests/unit/webhook-replay-workspace-guard.test.ts`) |
| Строки инвентаризации массово переведённые в OK без ревью | **0** (исключение: `/api/public/v1/*` после ревью трёх route + auth lib) |

---

## 2. Reviewed files (this pass)

| Путь | Вывод |
|------|--------|
| `lib/api-public/auth.ts` | Ключи только `kos_*`, SHA-256 `keyHash`, lookup по hash; `lastUsedAt` update |
| `lib/api-public/resolve-enterprise-api.ts` | Платёжный gate `api_access` + paid subscription / bypass paths явно документированы |
| `app/api/public/v1/orders/route.ts` | `userId` из ключа; GET/POST scoped; POST rate limit 429 |
| `app/api/public/v1/products/route.ts` | `menu.userId` scope |
| `app/api/public/v1/customers/route.ts` | Агрегация по `order.userId` (⚠ perf: до 5000 orders — см. performance plan) |
| `lib/webhooks/webhook-replay-permissions.ts` | Workspace OWNER/ADMIN для чужого owner workspace |
| `services/webhooks/webhook-replay-service.ts` | Audit перед replay; signature gate; platform override отдельным флагом |

---

## 3. Fixed files (code)

| Путь | Изменение |
|------|-----------|
| `services/developer/platform-health-service.ts` | Добавлены честные проверки: Sentry (`SENTRY_DSN` + backend), глубина очереди webhook jobs (QUEUED+RETRYING), distributed rate limit предупреждение |

---

## 4. Remaining risks (highest first)

1. **`app/api/webhooks/*`** (Stripe, Shopify, Woo, Uber…) — **REVIEW**: подписи, idempotency, async queue; не проходились построчно в этом PR.  
2. **`app/api/checkout`** — **REVIEW**: публичный платёжный контур.  
3. **`app/api/public/v1/*`** — scoped **workspace = userId** owner model; нет fine-grained OAuth-style scopes на ключ.  
4. **Platform `/platform/*`** — **REVIEW**: убедиться что каждый route вызывает `requirePlatformAccess` / аналог (grep + ручной аудит).  
5. **`actions/*` оставшиеся REVIEW** в `IDOR_MUTATION_INVENTORY.md` — см. §1 сводку.

---

## 5. Highest-risk endpoints (для следующей волны)

| Маршрут | Почему |
|---------|--------|
| `/api/checkout` | Деньги |
| `/api/webhooks/stripe` | Деньги + состояние подписки |
| `/api/webhooks/shopify/*`, `/api/webhooks/woocommerce` | Побочные эффекты заказов |
| `/api/public/v1/*` POST | Создание сущностей с API key |
| `/api/storefront/analytics` | Публичная поверхность + rate limit |

---

## 6. Required follow-up PRs (рекомендуемая нарезка)

1. **Webhooks:** единый чеклист подписи + тесты на invalid signature → 4xx без побочных эффектов.  
2. **Checkout:** тесты на безопасные состояния без Stripe + без паники при missing Resend (см. E2E doc).  
3. **Platform:** grep `requirePlatformAccess` coverage + один E2E «client denied».  
4. **IDOR inventory sweep:** пакетами по 10 `actions` за PR с владельцем.

---

## 7. BLOCKED / RISK_ACCEPTED

В этом проходе **нет** новых записей RISK_ACCEPTED/BLOCKED без владельца. Используйте колонки в `IDOR_MUTATION_INVENTORY.md` при явном решении продукта.
