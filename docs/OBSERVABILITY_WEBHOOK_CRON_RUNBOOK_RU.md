# Наблюдаемость: cron вебхуков и очередь WebhookProcessingJob

**Версия:** 1.2  
**Дата:** 2026-05-15  
**Связь:** этап **A2** в [`docs/POST_AUDIT_PRIORITY_PLAYBOOK_RU.md`](./POST_AUDIT_PRIORITY_PLAYBOOK_RU.md)  
**Код маршрута:** `app/api/cron/webhook-jobs/route.ts`

---

## 1. Цели SLO

| SLI | Описание | Целевое состояние (пилот) |
|-----|-----------|-----------------------------|
| **Cron availability** | HTTP 200 от endpoint с валидным `Authorization: Bearer` | 100% за окно 24ч (кроме плановых деплоев) |
| **Queue depth** | Количество строк `QUEUED` + `RETRYING` | Стабильный baseline; всплеск → расследование |
| **Stuck processing** | `PROCESSING` старше N минут | 0 или известные долгие задачи |

---

## 2. Synthetic check (uptime / Better Stack / Cronitor / GitHub Actions)

**Endpoint:** `https://<PROD_HOST>/api/cron/webhook-jobs?dryRun=1`  
**Скрипт в репозитории:** [`scripts/check-webhook-cron-smoke.sh`](../scripts/check-webhook-cron-smoke.sh) (переменные `APP_URL`, `CRON_SECRET`).  
**Метод:** `GET` или `POST` (оба делегируют в один обработчик).

**Заголовок:**

```http
Authorization: Bearer <CRON_SECRET>
```

**Ожидаемый ответ:** HTTP **200**, JSON с `"ok": true`, `"dryRun": true` (или эквивалент из реализации).

**Ошибки:**

| HTTP | Причина | Действие |
|------|---------|----------|
| 401 | Неверный или отсутствующий Bearer | Проверить секрет в Vercel/hosting vs мониторе |
| 503 | `CRON_SECRET` не задан в окружении | Задать секрет или отключить алерт до конфигурации staging |

**Частота проверки:** каждые **5–15 минут** в проде.

### 2.1 GitHub Actions (опционально)

В репозитории добавлен workflow **[`.github/workflows/webhook-cron-synthetic.yml`](../.github/workflows/webhook-cron-synthetic.yml)**:

- **`workflow_dispatch`** — ручной прогон (удобно перед релизом): требуются секреты `WEBHOOK_CRON_SYNTHETIC_APP_URL` и `WEBHOOK_CRON_SYNTHETIC_CRON_SECRET` (значение `CRON_SECRET` на целевом хосте).
- **`schedule`** (каждые **6 часов**) — выполняется только если в настройках репозитория включена переменная **`WEBHOOK_CRON_SYNTHETIC_SCHEDULE_ENABLED`** = `true`; иначе job пропускается (чтобы не ломать форки без секретов).

Job вызывает тот же скрипт [`scripts/check-webhook-cron-smoke.sh`](../scripts/check-webhook-cron-smoke.sh). Для **внешнего** мониторинга (Better Stack, UptimeRobot, Cronitor) достаточно того же URL и заголовка — не обязательно дублировать GitHub. Пошаговая инструкция (секреты, переменные, ротация): **§7** ниже.

---

## 3. SQL — глубина очереди (PostgreSQL)

> Подставьте реальные имена enum Prisma после миграций. Ниже — логические статусы из модели `WebhookProcessingJob`.

### 3.1 Глубина по статусам

```sql
SELECT status::text, COUNT(*) AS cnt
FROM webhook_processing_jobs
GROUP BY status
ORDER BY cnt DESC;
```

### 3.2 Самые старые «живые» задачи

```sql
SELECT id, status::text, created_at, updated_at
FROM webhook_processing_jobs
WHERE status::text IN ('QUEUED', 'RETRYING', 'PROCESSING')
ORDER BY created_at ASC
LIMIT 50;
```

### 3.3 Застрявшие PROCESSING

```sql
SELECT id, status::text, created_at, updated_at,
       EXTRACT(EPOCH FROM (NOW() - updated_at))/60 AS idle_minutes
FROM webhook_processing_jobs
WHERE status::text = 'PROCESSING'
  AND updated_at < NOW() - INTERVAL '30 minutes'
ORDER BY updated_at ASC;
```

Порог **30 минут** — стартовый; подстроить под p95 времени обработки.

---

## 4. Алерты (рекомендуемый минимум)

1. **Synthetic:** 3 последовательных не-200 от synthetic check.  
2. **Queue depth:** `COUNT(*) WHERE status IN ('QUEUED','RETRYING')` > порога (например 500 — подобрать).  
3. **Stuck:** результат запроса §3.3 не пустой.

Интеграция: PagerDuty / Slack webhook / email on-call — на выбор команды.

Готовые запросы для мониторов (скопировать в Datadog «metric from query», Grafana alert rule и т.п.): [`scripts/sql/webhook-jobs-alert-queries.sql`](../scripts/sql/webhook-jobs-alert-queries.sql). Пошаговая настройка двух алертов и калибровка порогов: **§8**.

---

## 5. Runbook при инциденте

1. Проверить **расписание cron** (Vercel Cron / external scheduler) — совпадает ли URL и метод.  
2. Проверить **логи** приложения по строке `webhook_job_cron_batch` (см. код после `drainWebhookJobs`).  
3. Проверить **БД**: рост `FAILED`, ошибки подписи, блокировки.  
4. При необходимости — **временно** увеличить batch size только после анализа нагрузки (env `WEBHOOK_JOB_BATCH` если поддерживается конфигом).  
5. Зафиксировать постмортем: причина, время восстановления, follow-up issue.

---

## 7. Пошаговое включение synthetic в production

Цель: получить **автоматический сигнал**, если маршрут `/api/cron/webhook-jobs` перестаёт отвечать **200** с валидным Bearer при `dryRun=1` (см. реализацию в `app/api/cron/webhook-jobs/route.ts`: при `dryRun` очередь **не** дренируется, только проверяются `CRON_SECRET` и доступность обработчика).

### 7.1 Предпосылки (обязательно до любого мониторинга)

| # | Проверка | Как |
|---|----------|-----|
| 1 | На **production** задан `CRON_SECRET` | Панель хостинга (например Vercel → Project → Settings → Environment Variables). Без него endpoint вернёт **503** с телом про «Cron not configured». |
| 2 | Реальный cron дрейна (не synthetic) вызывается с **тем же** секретом | В `vercel.json` или внешнем scheduler заголовок `Authorization: Bearer <CRON_SECRET>` совпадает с приложением. |
| 3 | Базовый URL продакшена известен | Например `https://app.example.com` — **без** завершающего `/`. |
| 4 | (Опционально) IP-allowlist / WAF | Synthetic и GitHub Actions идут с **динамических** egress IP GitHub / мониторинга; если у вас WAF по IP — добавьте диапазоны [документации GitHub](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#ip-addresses-of-github-hosted-runners) или используйте только внешний монитор с фиксированным egress. |

### 7.2 Локальная проверка «как у монитора»

С рабочей машины (секрет не коммитить, не вставлять в скриншоты):

```bash
export APP_URL="https://<PROD_HOST>"   # без слэша в конце
export CRON_SECRET="<значение CRON_SECRET из прод-окружения>"
bash scripts/check-webhook-cron-smoke.sh
```

Ожидание: в stdout строка `check-webhook-cron-smoke: OK` и JSON с `"ok": true`, `"dryRun": true`.  
Эквивалент вручную:

```bash
curl -sS -o /tmp/cron-smoke.json -w "%{http_code}" \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$APP_URL/api/cron/webhook-jobs?dryRun=1"
```

Должно быть `200`; в `/tmp/cron-smoke.json` — `"ok": true`.

### 7.3 GitHub Actions — куда нажимать и что завести

Используется workflow **[`.github/workflows/webhook-cron-synthetic.yml`](../.github/workflows/webhook-cron-synthetic.yml)**.

1. Откройте репозиторий на GitHub → **Settings** → **Secrets and variables** → **Actions**.  
2. В блоке **Repository secrets** (или **Organization secrets**, если политика компании так требует) создайте:

| Имя секрета | Значение | Замечание |
|-------------|----------|-----------|
| `WEBHOOK_CRON_SYNTHETIC_APP_URL` | `https://<PROD_HOST>` | Тот же хост, куда уходит прод-приложение. Без `/` в конце. |
| `WEBHOOK_CRON_SYNTHETIC_CRON_SECRET` | Точная копия `CRON_SECRET` с production | Символ в символ; лишний пробел в конце даст **401**. |

3. Перейдите **Settings** → **Secrets and variables** → **Actions** → вкладка **Variables** → **New repository variable**:

| Имя | Значение | Назначение |
|-----|----------|------------|
| `WEBHOOK_CRON_SYNTHETIC_SCHEDULE_ENABLED` | `true` | Без этого scheduled-запуски workflow **не выполнят job** (условие `if` в YAML). `workflow_dispatch` от этого **не** зависит. |

4. **Важно про расписание GitHub:** `schedule` в Actions выполняется только для **default branch** (обычно `main`) и с **разбросом по времени** (GitHub не гарантирует точную минуту). Интервал в workflow — **каждые 6 часов**; это **слабее**, чем целевые 5–15 минут из §1, если вам нужен MTTD по cron &lt; 15 минут — см. §7.5.

### 7.4 Первый прогон в CI

1. **Actions** → слева выберите workflow **«Webhook cron synthetic»**.  
2. **Run workflow** → ветка `main` (или ваша default) → **Run workflow**.  
3. Откройте последний run → шаг **GET /api/cron/webhook-jobs?dryRun=1** должен быть зелёным.  
4. При ошибке читайте лог: сообщения вида `expected HTTP 200, got 401` → секрет или URL; `503` → на хосте не задан `CRON_SECRET`.

### 7.5 Частота: GitHub vs внешний synthetic vs SLO

| Механизм | Типичная частота в репозитории | Когда достаточно |
|----------|-------------------------------|------------------|
| **GitHub Actions** (`webhook-cron-synthetic.yml`) | Каждые **6 ч** (cron `25 */6 * * *`) | «Сторожок», что конфигурация и маршрут живы; не тратит минуты на каждые 5 мин. |
| **Внешний uptime** (Better Stack, Cronitor, UptimeRobot, …) | **5–15 мин** | Когда нужно соответствовать §1 (обнаружение за минуты). Тот же URL и заголовок, что в §2. |
| **Оба** | Дублирование | Имеет смысл: внешний — быстрый алерт, GitHub — проверка из «чужой» сети + история в Actions. |

Рекомендация для **production**: минимум **один** внешний check на 5–15 мин **плюс** при желании GitHub по расписанию.

### 7.6 Алерт на падение synthetic

- **Правило:** например «**3 подряд** проверки не HTTP 200» (или 2 из 3 за 15 минут — под вашу культуру on-call).  
- **Отдельно:** кратковременный **401** после деплоя часто означает рассинхрон секрета между хостингом и монитором — завести подтип алерта или runbook-шаг «сверить CRON_SECRET».  
- **Уведомления:** Slack incoming webhook, PagerDuty, email группы дежурства — как у вас принято.

### 7.7 Ротация `CRON_SECRET` и отключение

**Ротация:** одновременно обновите значение в хостинге (Vercel и т.д.), в **реальном** cron, который дергает дрейн, и в секретах мониторинга / `WEBHOOK_CRON_SYNTHETIC_CRON_SECRET`. Порядок «сначала хостинг, потом мониторы» даёт короткое окно ложных алертов; наоборот — ложные **401** на synthetic.

**Отключить GitHub schedule:** установите `WEBHOOK_CRON_SYNTHETIC_SCHEDULE_ENABLED` в `false` или удалите переменную. Секреты можно оставить для ручных `workflow_dispatch`.

---

## 8. Пошаговое включение двух SQL-алертов (очередь + застревание)

Используйте запросы из [`scripts/sql/webhook-jobs-alert-queries.sql`](../scripts/sql/webhook-jobs-alert-queries.sql). Таблица в БД: **`webhook_processing_jobs`** (`@@map` в Prisma). Статусы enum: `QUEUED`, `PROCESSING`, `PROCESSED`, `FAILED`, `RETRYING`, и др. — в SQL ниже используется `status::text` для совместимости с большинством драйверов.

### 8.1 Общие требования

- Подключение к PostgreSQL **read-only** пользователем (роль `SELECT` на `webhook_processing_jobs` достаточно для этих запросов).  
- Интервал опроса: **1–5 минут** для глубины очереди; для «stuck» достаточно **5–15 минут** (застревание на 30+ минут редко требует секундной точности).  
- Пороги подбираются по **baseline** после недели стабильной работы (см. §8.4).

### 8.2 Алерт 1 — глубина очереди (`QUEUED` + `RETRYING`)

**Смысл:** воркер не успевает; растёт хвост ожидающих задач.

**Запрос-метрика (одно число):**

```sql
SELECT COUNT(*)::bigint AS queued_and_retrying
FROM webhook_processing_jobs
WHERE status::text IN ('QUEUED', 'RETRYING');
```

**Порог (стартовый):** `queued_and_retrying > 500` — из §4; для малого трафика начните с **50–100** и поднимайте после ложных срабатываний.

**Grafana (концепция):** datasource PostgreSQL → Explore → вставьте запрос → **Alert rule** → условие «last value > threshold» → папка алертов «Integrations / Webhooks» → contact point Slack/PagerDuty.

### 8.3 Алерт 2 — застрявшие `PROCESSING`

**Смысл:** задача взята в работу, но долго не обновляется (подвисший воркер, deadlock, необработанное исключение до смены статуса).

**Запрос-метрика (одно число, удобно для порога «> 0»):**

```sql
SELECT COUNT(*)::bigint AS stuck_processing_count
FROM webhook_processing_jobs
WHERE status::text = 'PROCESSING'
  AND updated_at < NOW() - INTERVAL '30 minutes';
```

**Порог:** `stuck_processing_count > 0`. Интервал **30 minutes** согласован с §3.3; при долгих вебхуках увеличьте до **60** и задокументируйте исключение.

**Диагностический запрос** (список id для runbook): тот же, что в §3.3 или в SQL-файле — выполняйте вручную при инциденте.

### 8.4 Калибровка и ложные срабатывания

1. Неделю собирайте результат §3.1 вручную или в дашборде (без алерта или с очень высоким порогом).  
2. Зафиксируйте p95 глубины очереди в «нормальный» день.  
3. Порог алерта 1 = примерно **3× p95** или фиксированный бизнес-порог (известный максимум ожидаемой очереди).  
4. Алерт 2 редко даёт шум; если да — проверьте, не считаются ли долгие обработки нормой (увеличьте интервал).

### 8.5 Другие платформы

- **Datadog:** Database Monitoring или custom check с SQL; условие по агрегату, аналогично Grafana.  
- **AWS RDS + EventBridge:** периодический Lambda с тем же SQL → метрика CloudWatch → alarm.  
- **pg_cron + NOTIFY:** только если у вас уже принят такой паттерн; не дублируйте логику приложения внутри БД без согласования с DBA.

---

## 9. Матрица: симптом → куда смотреть

| Симптом | Synthetic | SQL / БД | Приложение |
|---------|-----------|----------|------------|
| 401 на dry run | Неверный Bearer в мониторе / GitHub secret | — | Сверить `CRON_SECRET` на хосте |
| 503 на dry run | — | — | Не задан `CRON_SECRET` в env приложения |
| 200, но очередь растёт | OK | Глубина `QUEUED`+`RETRYING` | Логи `webhook_job_cron_batch`, реальный cron, batch size |
| Stuck в PROCESSING | Может быть OK | §3.3 / Alert 2 | Воркер, блокировки, ошибки до смены статуса |

После стабилизации релиза не забудьте **E2E remote smoke** на staging перед prod: [`docs/PLAYWRIGHT_RELEASE_CI_RU.md`](./PLAYWRIGHT_RELEASE_CI_RU.md).

---

## 10. Связанные документы

- `docs/WEBHOOK_CRON_ROUTE_HARDENING.md`  
- `docs/WEBHOOK_QUEUE_RETRY_ARCHITECTURE.md`  
- `docs/FAILED_WEBHOOK_TO_ERROR_RECOVERY.md`
