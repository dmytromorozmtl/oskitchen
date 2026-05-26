# Плейбук приоритетов после аудита KitchenOS

**Версия:** 1.0  
**Дата:** 2026-05-15  
**Аудитория:** основатель, продакт, техлид, безопасность, SRE  
**Связанные артефакты:** `docs/FULL_SYSTEM_AUDIT_FINAL_REPORT.md`, `docs/KITCHENOS_FULL_SYSTEM_ANALYSIS_AND_ROADMAP.md`, `docs/SECURITY_RBAC_TENANCY_AUDIT.md`, [`docs/COMMERCIAL_RELEASE_HARDENING_AUDIT.md`](./COMMERCIAL_RELEASE_HARDENING_AUDIT.md), [`docs/ENGINEERING_READINESS_INDEX.md`](./ENGINEERING_READINESS_INDEX.md)

Этот документ **детализирует и профессионализирует** рекомендации из пост-аудитного списка: для каждого направления заданы **цель**, **объём работ**, **критерии приёмки**, **метрики**, **риски** и **порядок внедрения**. Документ можно использовать как **epic-описание** в трекере задач.

---

## Оглавление

1. [Принципы и зависимости](#1-принципы-и-зависимости)  
2. [Фаза A — 1–4 недели (критический контур)](#2-фаза-a--14-недели-критический-контур)  
   - [A1. Мультиарендность и защита от IDOR](#a1-мультиарендность-и-защита-от-idor)  
   - [A2. Наблюдаемость вебхуков и cron](#a2-наблюдаемость-вебхуков-и-cron)  
   - [A3. Support: клиент vs внутренняя заметка](#a3-support-клиент-vs-внутренняя-заметка)  
   - [A4. Паритет правил checkout витрины](#a4-паритет-правил-checkout-витрины)  
3. [Фаза B — 1–3 месяца (масштаб и UX)](#3-фаза-b--13-месяца-масштаб-и-ux)  
4. [Фаза C — продукт и позиционирование](#4-фаза-c--продукт-и-позиционирование)  
5. [Сводная матрица: приоритет × эффорт × риск](#5-сводная-матрица-приоритет--эффорт--риск)  
6. [Что уже сделано в коде в рамках этого плейбука](#6-что-уже-сделано-в-коде-в-рамках-этого-плейбука)

---

## 1. Принципы и зависимости

| Принцип | Смысл |
|---------|--------|
| **Сервер — источник истины** | Любое правило, влияющее на деньги, доступ или данные клиента, дублируется или усиливается на сервере; клиент только UX. |
| **Защита по умолчанию** | Идентификаторы с клиента (`workspaceId`, `orderId`, `ticketId`) **никогда** не доверяются без проверки членства / видимости. |
| **Наблюдаемость до фич** | Интеграции без метрик и алертов = хрупкий прод; новые каналы не «go live» без минимального SLO. |
| **Честность в GTM** | Enterprise и compliance продаются только с опорой на **факт** или явный roadmap; иначе — репутационный и юридический долг. |

**Зависимости:** staging с реальными env (`CRON_SECRET`, Stripe test, webhook secrets), доступ к Vercel/hosting метрикам или внешнему uptime-checker.

---

## 2. Фаза A — 1–4 недели (критический контур)

### A1. Мультиарендность и защита от IDOR

**Бизнес-цель:** исключить сценарий «пользователь workspace A увидел/изменил данные workspace B», что при платных пилотах ведёт к инциденту уровня **P0** и потере доверия.

**Техническая цель:** единообразные **предикаты доступа** для всех server actions и API route handlers, которые принимают идентификаторы ресурсов.

**Детальная программа (угрозы, DoD, шаблоны Prisma, RACI):** [`docs/TENANT_SCOPE_IDOR_PROGRAM_RU.md`](./TENANT_SCOPE_IDOR_PROGRAM_RU.md).  
**Канонический helper для `workspaceId`:** `lib/scope/assert-user-workspace-access.ts` (обёртка над `userWorkspaceIds`).

#### Объём работ

1. **Инвентаризация поверхности**  
   - Каталог: `actions/**/*.ts`, `app/api/**/*.ts` (исключая публичные контракты с отдельной моделью auth).  
   - Таблица (шаблон для трекера): `файл | функция | входные id | есть ли workspaceId в where | проверка membership | статус`.

2. **Паттерн запросов к БД**  
   - Предпочтительно:  
     `where: { id: resourceId, workspaceId: { in: allowedWorkspaceIds } }`  
     или эквивалент через `organizationId` / `userId` владельца, если модель не хранит `workspaceId` напрямую — тогда **join-проверка** в одном запросе или явная проверка после `findFirst` с fail-closed.

3. **Fail-closed**  
   - При сомнении — **403/404**, не «пустой список» без лога (для отладки — структурированный лог без PII).

4. **Регрессия**  
   - Для 3–5 критичных action добавить **integration-тесты** с фикстурой «два workspace, два пользователя».

#### Критерии приёмки

- [ ] Нет публичных/сессионных путей обновления заказа, тикета, настроек по **одному** `id` без привязки к доступным workspace.  
- [ ] Чеклист инвентаризации закрыт на 100% **P1**-маршрутов (заказы, биллинг, экспорт, support, product mapping approve, demo reset).  
- [ ] Code review guideline: **1 строка в PR template** — «проверен tenant scope».

#### Метрики

- Количество закрытых finding’ов по инвентаризации / неделя.  
- После релиза: **0** обращений в support вида «вижу чужой заказ» (целевой SLA).

#### Риски и смягчение

| Риск | Смягчение |
|------|-----------|
| Слом легаси-эндпоинтов | Поэтапно: сначала read-only пути, затем мутации; feature-flag не обязателен при жёстком 403. |
| Дублирование кода | Вынести `assertWorkspaceMember(userId, workspaceId)` в `lib/permissions/` (один модуль). |

---

### A2. Наблюдаемость вебхуков и cron

**Бизнес-цель:** интеграции (Shopify/Woo/Stripe) не «молча» отваливаются; команда узнаёт **до** клиента.

**Техническая опора:** маршрут `POST /api/cron/webhook-jobs` уже требует `Authorization: Bearer CRON_SECRET` (см. код cron). Очередь — `WebhookProcessingJob` (Prisma). В репозитории: [`docs/OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md`](./OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md), скрипт `scripts/check-webhook-cron-smoke.sh`, workflow **`.github/workflows/webhook-cron-synthetic.yml`**, SQL для алертов — `scripts/sql/webhook-jobs-alert-queries.sql`.

#### Объём работ

1. **SLI (индикаторы уровня сервиса)**  
   - **Cron availability:** HTTP 200 от `/api/cron/webhook-jobs` с валидным Bearer (synthetic check каждые 5–15 мин в проде).  
   - **Очередь:** глубина статусов `QUEUED` + `RETRYING`; возраст самой старой записи; количество `PROCESSING` старше N минут (застревание).  
   - **Ошибки:** рост `FAILED` / `SIGNATURE_FAILED` за окно.

2. **Алерты (минимальный набор)**  
   - 3 подряд не-200 от cron URL (или 401 при ротации секрета — отдельный runbook).  
   - Глубина очереди > порога (порог подобрать по пилоту, начать консервативно).  
   - `PROCESSING` > 15–30 мин (подобрать) — «возможный stuck worker».

3. **Дашборд**  
   - Одна страница (хватит internal Grafana / Vercel + SQL раз в день): «последний успешный cron», «обработано за 24ч», «топ ошибок по провайдеру».

4. **Runbook (1 страница)**  
   - Шаги: проверить `CRON_SECRET`, расписание cron, логи `webhook_job_cron_batch`, Prisma блокировки, ручной `dryRun=1`.

#### Критерии приёмки

- [ ] Synthetic monitor на cron с алертом в Slack/PagerDuty/email (внешний uptime **или** GitHub Actions по `webhook-cron-synthetic.yml` при включённых секретах).  
- [ ] SQL или внутренний виджет по глубине очереди + порог алерта задокументирован (готовые запросы: `scripts/sql/webhook-jobs-alert-queries.sql`).  
- [ ] Runbook привязан к `docs/OBSERVABILITY_RELEASE_OPS_AUDIT.md` или отдельный `docs/RUNBOOK_WEBHOOK_CRON.md`.

#### Метрики

- MTTD (mean time to detect) инцидента очереди < 15 мин (цель пилота).  
- Доля вебхуков, обработанных < 2 мин от ingress (после стабилизации).

---

### A3. Support: клиент vs внутренняя заметка

**Бизнес-цель:** пилот доверяет, что внутренние рассуждения **никогда** не уйдут клиенту по ошибке UI или API.

**Реализация в продукте:** комментарии с `visibility: INTERNAL | CUSTOMER | PARTNER`; сервер в `addSupportTicketComment` ограничивает INTERNAL саппорт-триажем.

#### Объём работ

1. **Политика в коде (testable)**  
   - Вынесена чистая функция `resolveSupportCommentPostPermission` в `lib/support/support-comment-guards.ts` (синхронизировать с action при изменении правил).  
   - Юнит-тесты: `tests/unit/support-comment-guards.test.ts` — матрица ролей × visibility.

2. **UI (рекомендации)**  
   - Радиокнопки / сегмент с **явными подписями**: «Видит клиент», «Только команде KitchenOS», «Партнёр (если применимо)».  
   - Цветовая дифференциация ленты: internal — нейтральный фон, customer — «исходящее письмо».  
   - Подтверждение при переключении с internal на customer (опционально, P2).

3. **API / email**  
   - Убедиться, что email-уведомления клиенту триггерятся **только** от `CUSTOMER` (если есть такой канал).

#### Критерии приёмки

- [ ] Юнит-тесты покрывают: triage → INTERNAL ok; workspace user → INTERNAL запрещён; workspace user → CUSTOMER ok.  
- [ ] В UI нет сырого enum `INTERNAL` без пояснения.  
- [ ] Документ для поддержки: 1 абзац «когда какой тип».

#### Метрики

- 0 инцидентов «утёк internal» за квартал.  
- Время ответа клиенту (CUSTOMER) — по полю `lastStaffReplyAt` (уже обновляется в action).

---

### A4. Паритет правил checkout витрины

**Бизнес-цель:** злоумышленник или сломанный клиент не обходит ограничения витрины.

**Текущее состояние (аудит кода):** `submitPublicStorefrontOrder` уже проверяет: включённость витрины, preorder, published, closure window (`isStorefrontInClosureWindow`), меню, pickup/delivery, terms, cutoff, лимит заказов в день, принадлежность строк корзины меню, количества, blackout, доставку, rule engine, минимальный чек, доступность online checkout (`isStorefrontOnlineCheckoutAvailable` — в т.ч. **`payLaterOnly`** и Stripe/currency). Это **хороший** уровень паритета.

#### Объём работ (доработка, не «с нуля»)

1. **Трассируемая матрица паритета** (таблица в Confluence/Notion или `docs/STOREFRONT_CHECKOUT_RULE_MATRIX.md`):  
   | Правило | Клиент (UX) | Сервер | Примечание |  
   Заполняется инженером один раз и обновляется при изменении checkout.

2. **Дополнительные тесты**  
   - Изолированные тесты для чистых функций (`validateStorefrontDelivery`, rule engine input/output) где возможно без БД.  
   - 1–2 integration-теста на «payLaterOnly + forced online в payload» → ожидаемая ошибка.

3. **Rate limit**  
   - Убедиться, что публичный POST заказа подключён к политике из `docs/PUBLIC_POST_RATE_LIMITING.md`.

#### Критерии приёмки

- [ ] Матрица паритета существует и подписана техлидом.  
- [ ] Негативный тест: обход минимальной суммы / неверный productId → стабильная ошибка с сервера.  
- [ ] Rate limit включён на action/маршруте.

---

## 3. Фаза B — 1–3 месяца (масштаб и UX)

### B1. Пагинация и лимиты

**Цель:** предсказуемое время ответа при росте данных.

**Работы:** дефолтный `take` (например 50–100), курсор или offset с жёстким max; для отчётов — обязательный диапазон дат.

**Приёмка:** ни один пользовательский список в P1-модулях не делает unbounded `findMany` без осознанного исключения (экспорт — отдельный job).

### B2. CI: Playwright smoke на релиз

**Цель:** регрессия критических путей ловится до продакшена.

**Минимальный набор:** уже есть `test:e2e:public-smoke`; добавить по возможности один сценарий «витрина → checkout (pay later)» на тестовом slug или mock, и smoke логина в дашборд (секреты CI — по `docs/E2E_CI_SECRETS_AND_FIXTURES.md`).

### B3. Блок «застрявший заказ» в Order Detail

**Цель:** снизить нагрузку на support и ускорить операционку.

**Контент блока (MVP):**  
- Текущий статус + **следующий шаг** (человеческий текст).  
- **Блокер:** маппинг / оплата / слот / интеграция / ручное подтверждение — по данным из существующих полей и флагов.  
- **Ссылки:** Product mapping, Payments, Integration health, Support.

**Приёмка:** для 5 типичных состояний заказа блок показывает корректный next step (таблица тест-кейсов в QA).

### B4. Integration Health: последний успех и последняя ошибка

**Цель:** не «зелёная галочка», а **операционная правда**.

**Работы:** в UI карточки интеграции вывести `lastSuccessAt` / `lastError` (данные частично уже собираются в `integration-health-service` — расширить UI и единообразие platform vs workspace).

**Приёмка:** пользователь за 5 секунд понимает «живо / сломано / когда последний раз работало».

---

## 4. Фаза C — продукт и позиционирование

**Фокус ICP:** preorder / production / packing / catering + Woo/Shopify + честная **матрица возможностей** (`docs/HONEST_CAPABILITY_MATRIX.md`, лендинг `features.tsx`).

**Enterprise (SOC2, SSO, SCIM):**  
- На `/trust` и в sales-deck — только **roadmap + текущий факт** (что есть сейчас: аудит-логи, роли, platform internal и т.д.).  
- Запрет формулировок «у нас SOC2», пока нет отчёта/сертификата или официального «in progress» с датой аудита.

**Приёмка:** юридический/маркетинговый review одного пакета материалов перед крупной кампанией.

---

## 5. Сводная матрица: приоритет × эффорт × риск

| ID | Инициатива | Срок | Бизнес-влияние | Инженерный эффорт | Риск если не делать |
|----|------------|------|----------------|-------------------|----------------------|
| A1 | Tenant scope / IDOR | 1–4 нед | Критично | Средний | Инцидент, churn, штрафы |
| A2 | Cron + queue observability | 1–4 нед | Критично | Низкий–средний | Потеря заказов, репутация |
| A3 | Support visibility + тесты | 1–4 нед | Высокий | Низкий | Доверие пилота |
| A4 | Checkout matrix + негативные тесты | 1–4 нед | Высокий | Низкий | Обход правил, фрод |
| B1 | Пагинация | 1–3 мес | Высокий | Средний | Деградация UX/стоимость БД |
| B2 | CI Playwright | 1–3 мес | Средний | Средний | Регрессии |
| B3 | Stuck order UX | 1–3 мес | Высокий | Средний | Support cost |
| B4 | Integration health деталь | 1–3 мес | Средний | Низкий–средний | Ложное спокойствие |
| C1 | GTM фокус + trust | постоянно | Высокий | Низкий (процесс) | Неверные ожидания |

---

## 6. Что уже сделано в коде в рамках этого плейбука

| Изменение | Файлы |
|-----------|--------|
| Вынесена **чистая политика** видимости комментария support + юнит-тесты | `lib/support/support-comment-guards.ts`, `tests/unit/support-comment-guards.test.ts` |
| `addSupportTicketComment` использует эту политику (поведение эквивалентно предыдущему порядку проверок) | `actions/support-tickets.ts` |
| Проверка `workspaceId` в форме тикета через **`userHasWorkspaceAccess`** + программа IDOR + тесты helper | `lib/scope/assert-user-workspace-access.ts`, `tests/unit/assert-user-workspace-access.test.ts`, `actions/support-tickets.ts`, `docs/TENANT_SCOPE_IDOR_PROGRAM_RU.md` |
| **Инвентаризация мутаций (живой документ)** | [`docs/IDOR_MUTATION_INVENTORY.md`](./IDOR_MUTATION_INVENTORY.md) |
| **Runbook наблюдаемости cron + SQL + скрипт synthetic** | [`docs/OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md`](./OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md), [`scripts/check-webhook-cron-smoke.sh`](../scripts/check-webhook-cron-smoke.sh) |
| **Матрица checkout + регрессионный тест pay-later / online** | [`docs/STOREFRONT_CHECKOUT_RULE_MATRIX.md`](./STOREFRONT_CHECKOUT_RULE_MATRIX.md), `tests/unit/storefront-payment-paylater.test.ts` |
| **Support UI:** подписи видимости комментариев (RU) | `lib/support/support-comment-visibility-labels.ts`, `components/support/support-ticket-detail-client.tsx` |
| **Order detail:** блок «Next step (all tabs)» + шорткаты | `components/orders/order-detail-header.tsx`, `app/dashboard/orders/[orderId]/page.tsx` |
| **Integration health:** таблица last sync / last error на главной health-странице + карточки каналов с last error | `app/dashboard/integration-health/page.tsx`, `components/channels/channel-card.tsx` |
| **Playwright / релизный контур (документ)** | [`docs/PLAYWRIGHT_RELEASE_CI_RU.md`](./PLAYWRIGHT_RELEASE_CI_RU.md) |

Остальные пункты плейбука — **организационные и инженерные** задачи на команду (закрытие всех строк **REVIEW** в инвентаризации, настройка внешних алертов, расширение E2E по мере секретов).

---

## Рекомендуемый порядок старта (первая неделя)

1. **A2** — быстрый выигрыш: synthetic check cron + один SQL/дашборд по очереди.  
2. **A1** — параллельно: начать инвентаризацию `actions/` с мутациями заказа и support.  
3. **A3** — UI-подписи + ссылка на этот плейбук для support-команды.  
4. **A4** — зафиксировать матрицу паритета (документ) + один негативный автотест.

---

*Конец плейбука v1.0.*
