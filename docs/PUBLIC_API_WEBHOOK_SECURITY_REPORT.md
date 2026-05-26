# Public API & webhook security — technical report

**Версия:** 1.0  
**Дата:** 2026-05-15

---

## 1. Enterprise public API (`/api/public/v1/*`)

### 1.1 Authentication

- Заголовок: `Authorization: Bearer kos_...`  
- Реализация: `resolvePublicApiUserId` → SHA-256 (`hashApiKey`) → `prisma.apiKey.findUnique({ where: { keyHash } })`  
- Raw key **никогда** не хранится в БД; отображается только **prefix** в UI (`listApiKeysForDeveloper`).

### 1.2 Workspace binding

- Текущая модель: `ApiKey.userId` = владелец workspace (kitchen account). Нет отдельного «workspace id» в публичном API — это **ограничение продукта**, не скрытая изоляция.

### 1.3 Entitlements

- `resolveEnterpriseApiUserId`: после валидации ключа проверяется `canUseFeature(..., "api_access")` и платный биллинг (`getBillingAccess`), кроме dev bypass / platform super — см. код.

### 1.4 Rate limiting

- `POST /api/public/v1/orders`: `consumeRateLimitToken` → 429 + `Retry-After`.  
- GET маршруты: лимиты можно усилить по политике (roadmap).

### 1.5 Idempotency

- POST заказа через public API **не** заявляет идемпотентность-ключ клиента — **gap** для P1 (добавить optional `Idempotency-Key` header + уникальный индекс при согласовании продукта).

### 1.6 Тесты

- `tests/unit/public-api-auth.test.ts` — отклонение невалидных ключей, активность, `lastUsedAt` path.

---

## 2. Webhooks (ingress)

### 2.1 Signature verification

- Поведение **по провайдеру**; детали в `services/webhooks/*` и route handlers. Этот отчёт **не** утверждает 100% покрытие без построчного аудита каждого route.

### 2.2 Payload storage

- События в `WebhookEvent`; не хранить сырые Authorization заголовки в JSON (проверить при аудите провайдеров).

### 2.3 Replay

- `requestWebhookReplay`: обязательный **auditLog** до изменения состояния; workspace guard — `assertWorkspaceWebhookReplayAllowed`; platform surface — отдельные audit actions.  
- Тест: `tests/unit/webhook-replay-workspace-guard.test.ts`.

### 2.4 Invalid signature

- Отклонение на ingress должно отдавать 4xx без постановки в очередь — верифицировать per-route в волне 2.

---

## 3. Gaps (не называть «готово»)

| Gap | Priority |
|-----|----------|
| Fine-grained API scopes на ключ | P2 |
| Idempotency-Key на public POST orders | P1 |
| Единый интеграционный тест матрицы webhook signature | P0 |
