# Программа аудита мультиарендности и защиты от IDOR (KitchenOS)

**Версия:** 1.1  
**Дата:** 2026-05-15  
**Статус:** операционный стандарт (living document)  
**Связь:** этап **A1** в [`docs/POST_AUDIT_PRIORITY_PLAYBOOK_RU.md`](./POST_AUDIT_PRIORITY_PLAYBOOK_RU.md)

---

## 1. Цели и границы

### 1.1 Бизнес-цель

Исключить класс инцидентов **«пользователь workspace A получил доступ к данным workspace B»** (IDOR / broken access control), который при платных пилотах и сертификациях становится **P0**: репутация, регуляторика, расторжение договоров.

### 1.2 Техническая цель

- Единый **контракт проверки доступа** для server actions и API handlers.  
- **Fail-closed:** при сомнении — отказ (403/404 + структурированный лог без PII), а не «пустой результат».  
- **Проверяемость:** критичные правила покрыты автотестами (юнит на политику + интеграция на «два пользователя / два workspace»).

### 1.3 Вне объёма (явно)

- Публичные маршруты с **намеренно** иным контрактом (например, токен заказа `order/[token]`, витрина по `slug`) — отдельная модель угроз; здесь не смешиваем с dashboard/workspace API.  
- **Platform** (`/platform/*`) — отдельная матрица прав (`requirePlatformAccess`); программа ниже дополняет, но не заменяет platform-guards.  
- Изменение доменной модели (добавление `workspaceId` на `Order` и т.д.) — **не** требование этой программы v1.0; программа описывает проверки **в текущей модели данных**.

---

## 2. Модель угроз (кратко)

| Угроза | Пример | Защита |
|--------|--------|--------|
| **IDOR по UUID** | Подмена `ticketId` / `orderId` в FormData | Загрузка сущности только вместе с предикатом владельца / членства |
| **Cross-workspace через `workspaceId`** | Подмена скрытого поля формы | Проверка `user ∈ workspace` до любой записи |
| **Elevation через связанный id** | `productId` чужого меню при создании строки заказа | Проверка принадлежности продукта меню владельца операции |
| **Mass assignment** | Лишние поля в JSON | Zod + явный whitelist полей для update |

---

## 3. Реальность схемы данных KitchenOS (важно для аудиторов)

В кодовой базе **не все** бизнес-сущности имеют поле `workspaceId`.

**Пример — `Order`:** в Prisma заказ привязан к **`userId`** (владелец кухни / merchant user), а не напрямую к `workspaceId`. Значит проверка «мой ли этот заказ» часто формулируется как:

- `order.userId === sessionUser.id`, **или**  
- пользователь — **staff** workspace, чей владелец = `order.userId`, **или**  
- супер-обход platform (узкий, аудируемый).

**Вывод для чеклиста:** для каждой сущности в инвентаризации обязательно указывается **канонический ключ изоляции** (`workspaceId`, `userId`, `organizationId`, составной).

---

## 4. Методология аудита (пошагово)

### Этап 4.1 — Инвентаризация поверхности атаки

1. **Список входов:** все server actions (`actions/**/*.ts`) и route handlers (`app/api/**/route.ts`).  
2. **Исключения:** статические файлы, `GET` health, публичные контракты с токенами — помечаются отдельно.  
3. **Таблица трекера (обязательные колонки):**

| ID | Файл | Экспорт / handler | Входные идентификаторы | Ключ изоляции | Паттерн запроса (кратко) | Статус | Примечание |
|----|------|---------------------|------------------------|---------------|---------------------------|--------|------------|

**Статусы:** `OK` | `RISK` | `N/A (public)` | `FIXED`.

### Этап 4.2 — Статический паттерн-анализ (grep / semgrep)

Искать опасные комбинации:

- `findUnique({ where: { id:` **без** соседнего ключа владельца / workspace.  
- `update({ where: { id:` аналогично.  
- `formData.get("workspaceId")` / `body.workspaceId` без последующей проверки.  
- Prisma `connect` по id из клиента без проверки.

**Важно:** ложные срабатывания возможны; каждый finding проходит ручной triage.

### Этап 4.3 — Код-ревью по ролям

- **OWNER vs STAFF:** может ли staff выполнять мутацию? Если да — проверка роли + workspace.  
- **Billing / export / demo reset:** только OWNER или явный список ролей + аудит.

### Этап 4.4 — Негативные тесты (интеграция)

Минимальный набор:

1. Пользователь **U2** не читает/не обновляет ресурс workspace **W1**, созданный **U1**.  
2. Подмена `workspaceId` в форме — отклонение стабильным сообщением.

---

## 5. Стандартные шаблоны исправления

### 5.1 Сущности с `workspaceId`

**Правило:** любая мутация принимает `workspaceId` только после:

```ts
import { userHasWorkspaceAccess } from "@/lib/scope/assert-user-workspace-access";

if (!(await userHasWorkspaceAccess(session.id, workspaceId))) {
  return { error: "Invalid workspace selection." }; // или 403 в API
}
```

Для «жёсткого» стиля (внутренних сервисов):

```ts
import { assertUserCanAccessWorkspace, WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";
```

Канонический модуль: [`lib/scope/assert-user-workspace-access.ts`](../lib/scope/assert-user-workspace-access.ts) (обёртка над [`userWorkspaceIds`](../lib/support/support-permissions.ts) — **единый источник** списка workspace пользователя).

### 5.2 Запросы Prisma

Предпочтительно:

```ts
where: { id: resourceId, workspaceId }
```

Если у модели нет `workspaceId` — **join или двухшаговая** проверка: сначала загрузить владельца/brand/location, затем сверить с `userHasWorkspaceAccess` / membership.

### 5.3 Сообщения об ошибках

- Клиенту: **нейтрально** («Нет доступа» / «Неверный выбор workspace»), без «заказ не найден» vs «нет прав» (избегаем enumeration где критично).  
- В лог: `resourceType`, `action`, `outcome: denied`, **без** email/телефона.

---

## 5a. Живая инвентаризация (ведение в репозитории)

Таблица статусов по модулям: [`docs/IDOR_MUTATION_INVENTORY.md`](./IDOR_MUTATION_INVENTORY.md) — обновлять каждый спринт при закрытии **REVIEW** → **OK** / **FIXED**.

---

## 6. Критерии приёмки программы (Definition of Done)

- [ ] Заполнена инвентаризация **100%** server actions с мутациями и **100%** API routes с мутациями или отдачей чувствительных данных.  
- [ ] Все строки со статусом `RISK` имеют либо `FIXED`, либо задокументированное исключение с подписью владельца риска.  
- [ ] Добавлены негативные тесты для **топ-5** модулей (заказы, support, billing/export, product mapping, demo).  
- [ ] В **CONTRIBUTING** или PR template одна строка: «Tenant scope проверен».

---

## 7. Метрики и отчётность

| Метрика | Цель (пилот) |
|---------|----------------|
| Открытые `RISK` после спринта | 0 для P1-маршрутов |
| Время закрытия finding | ≤ 3 рабочих дня |
| Регрессии IDOR после релиза | 0 |

---

## 8. Роли (RACI, лёгкий вариант)

| Роль | Ответственность |
|------|------------------|
| **Tech lead** | Утверждает инвентаризацию, исключения, Definition of Done |
| **Исполнитель (backend)** | Патчи + тесты |
| **QA** | Негативные сценарии, регресс |
| **Founder / PM** | Приоритет P1-маршрутов для первой волны |

---

## 9. Связь с уже существующими механизмами

| Механизм | Назначение |
|----------|------------|
| `userWorkspaceIds` | Список workspace пользователя (owner + member) |
| `lib/scope/assert-user-workspace-access.ts` | Явная проверка доступа к `workspaceId` |
| `canViewSupportTicket` / `resolveSupportCommentPostPermission` | Row-level для support |
| `assertWorkspaceWebhookReplayAllowed` | Специализированный guard для replay |
| `requirePlatformAccess` | Изоляция `/platform` |

Программа **не дублирует** эти модули, а требует **системного** их применения везде, где есть client-supplied ids.

---

## 10. Эталон внедрения в коде (v1.0)

Форма создания тикета из дашборда: при непустом `workspaceId` вызывается `userHasWorkspaceAccess` (см. `actions/support-tickets.ts` — рефакторинг на канонический helper).

---

## 11. Дальнейшее развитие документа (v1.1+)

- Таблица «ключ изоляции» по основным моделям Prisma (автоген из schema + ручная правка).  
- Semgrep правила в репозитории.  
- `assertOrderAccessibleByActor` после явной модели доступа staff→order (если появится централизованный сервис).

---

## 12. Отчёты по закрытию программы (Commercial Release Hardening)

| Документ | Назначение |
|----------|------------|
| [`docs/COMMERCIAL_RELEASE_HARDENING_AUDIT.md`](./COMMERCIAL_RELEASE_HARDENING_AUDIT.md) | Сводный аудит готовности к коммерческому релизу по осям |
| [`docs/IDOR_TENANT_SCOPE_COMPLETION_REPORT.md`](./IDOR_TENANT_SCOPE_COMPLETION_REPORT.md) | Что реально ревьюнуто/исправлено по tenant scope; что остаётся |
| [`docs/IDOR_MUTATION_INVENTORY.md`](./IDOR_MUTATION_INVENTORY.md) | Живая инвентаризация мутаций (OK / FIXED / REVIEW / BLOCKED / RISK_ACCEPTED) |

---

*Конец документа v1.1.*
