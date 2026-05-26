# Storefront: план готовности к релизу

**Версия:** 1.0  
**Дата:** 2026-05-17  
**Аудитория:** Engineering, Product, Ops  
**Область:** публичный storefront `/s/[storeSlug]/*`, checkout, admin `/dashboard/storefront/*`, ops (env, crons, CI)

Документ сверен с кодом и актуальными артефактами: `vercel.json` (126 cron paths), `.github/workflows/ci.yml`, `docs/STOREFRONT_QA_CHECKLIST.md`, `docs/STOREFRONT_COMPLETION_AUDIT.md`, `services/storefront/storefront-stripe-checkout-service.ts`.

> **Важно:** часть старых отчётов (`STOREFRONT_100_PERCENT_READY_REPORT.md`, `STOREFRONT_LIMITATIONS.md`) описывает Stripe как «не реализован». **Факт в коде (2026):** Stripe Checkout для storefront включён при keys + `onlinePaymentEnabled` — см. `docs/STOREFRONT_ONLINE_PAYMENTS.md`. Этот план опирается на актуальное поведение.

---

## Executive summary

| Сценарий | Оценка | Интерпретация |
|----------|--------|---------------|
| **MVP: pay-later + админка** | **78–82%** | Гостевой заказ, серверная валидация, admin tabs, SEO/sitemap — рабочие; релиз без карты возможен |
| **MVP + оплата картой** | **70–75%** | Webhook + `purpose=storefront_order` в коде; нужны keys, Dashboard, smoke оплаты |
| **«Полноценный» продукт** (builder, домены, analytics, CI E2E) | **55–60%** | Много P1 в статусе Partial; см. матрицу ниже |

**Главный вывод:** commerce-ядро сильное; узкие места — **процесс QA**, **production env**, **cron-шум (126 paths)**, **CI gate без storefront E2E в default pipeline**, а не отсутствие маршрута `/s/{slug}`.

**Рекомендуемый scope первого релиза:** pay-later (или Stripe после P0-3) + полный P0 smoke + честные ограничения delivery + урезанные prod crons.

**Не позиционировать как «готово» в day-1:** visual builder end-to-end, автоматические custom domains, 126 experiment/compliance crons в prod, gift cards / subscriptions.

---

## Сводная матрица приоритетов

### P0 — блокеры релиза

| ID | Задача | Почему P0 | Источник истины |
|----|--------|-----------|-----------------|
| P0-1 | Полный smoke по `STOREFRONT_QA_CHECKLIST.md` | E2E не в default `ci.yml`; ручной gate — единственная проверка «как у пользователя» | `.github/workflows/ci.yml` (Playwright закомментирован) |
| P0-2 | Production environment | Без секретов ломаются host rewrite, crons, preview, email | `middleware.ts`, `scripts/check-env.ts` |
| P0-3 | Stripe (если нужна карта) | `paid` только через webhook `checkout.session.completed` + `purpose=storefront_order` | `storefront-stripe-checkout-service.ts`, `STOREFRONT_COMPLETION_AUDIT.md` |
| P0-4 | Delivery zones — честная коммуникация | `deliveryRadiusKm` не enforced; postal/region — да | `STOREFRONT_DELIVERY_ZONES_RADIUS.md` |
| P0-5 | Аудит Vercel crons | 126 paths → лимиты плана, лишняя DB/API нагрузка | `vercel.json` |
| P0-6 | Зелёный `npm test` | `ci.yml` гоняет unit на каждый PR | `theme-experiment-*.test.ts` |

### P1 — до «полноценного» продукта

| Область | Статус | Доработка | Документ |
|---------|--------|-----------|----------|
| Builder | Partial | Media upload, nav/footer из JSON, slider, mobile preview, quality checker | `STOREFRONT_BUILDER_QA_MATRIX.md` |
| Redirects | Partial | `StorefrontRedirect` — edge execution не завершён | `STOREFRONT_REDIRECT_*` |
| Forms | Partial | Builder UI, file uploads, anti-spam beyond honeypot | `STOREFRONT_FORMS_BUILDER_FINAL.md` |
| Domains | Manual | DNS/SSL polling | `STOREFRONT_DOMAIN_VERIFICATION.md` |
| Advanced admin | Partial | CRUD redirects, fulfillment rules UI, blackouts в UI | `STOREFRONT_COMPLETION_AUDIT.md` |
| Analytics | Partial | `order_tracking_view`, funnel dashboard | `STOREFRONT_ANALYTICS_*` |
| Rate limiting | Placeholder | Turnstile prod + distributed limits | `STOREFRONT_LIMITATIONS.md` |
| E2E в CI | Off (default) | `playwright-storefront.yml` / `lighthouse-storefront.yml` на staging | `STOREFRONT_E2E_SMOKE_TESTS.md` |

### P2 — после launch

| # | Инициатива | Зависимости |
|---|------------|-------------|
| 1 | Sold-out / `ProductAvailability` на menu + cart | Единый источник с kitchen |
| 2 | Deposit payment mode | Enum есть, flow нет |
| 3 | Theme versioning / automated rollback | Draft/publish theme |
| 4 | Multi-brand per workspace | `STOREFRONT_MULTI_BRAND_STRATEGY_FINAL.md` |
| 5 | Gift cards, subscriptions | `STOREFRONT_COMMERCE_EVOLUTION.md` |

---

## P0 — детальная спецификация

### P0-1. Ручной smoke (обязательный gate)

**Почему:** в `ci.yml` блок Storefront Playwright **закомментирован** (строки 61–68). Отдельный workflow `playwright-storefront.yml` срабатывает при `workflow_dispatch`, `repository_dispatch`, push в `main` с path filter — но **не блокирует merge**, если `PLAYWRIGHT_BASE_URL` не настроен.

**Чеклист (каждый релиз, 45–90 мин):**

| # | Сценарий | Критерий «зелёный» |
|---|----------|-------------------|
| 1 | Публикация | `/s/{slug}` → 200 при `enabled` + `published` |
| 2 | Draft | Неопубликованный виден только владельцу / preview cookie |
| 3 | Каталог | Только `storefrontVisible` продукты |
| 4 | URL продукта | UUID и `publicSlug` |
| 5 | Pay-later | cart → checkout → submit → confirmation |
| 6 | Notes | Текст заметок на confirmation |
| 7 | 404 | Disabled / unpublished (guest) |
| 8 | Policies | `/policies/privacy`, `/policies/terms` |
| 9 | Sitemap | `/s/{slug}/sitemap.xml` 200, product URLs |
| 10 | Promo | Валидный код снижает total; невалидный — ошибка |
| 11 | Blackout | Дата в blackout блокирует checkout |
| 12 | Honeypot | `companyUrl` не создаёт submission |

**В том же прогоне:** `npm run typecheck`, `npm run build`, `npm test`.

**Артефакт релиза:** заполнить `docs/templates/STOREFRONT_RELEASE_QA_ARTIFACT.md` (slug, дата, подпись, скрин confirmation).

**Риск при пропуске:** регрессии middleware, blackout, promo без автоматического отлова.

---

### P0-2. Production environment

| Переменная | Назначение | Проверка |
|------------|------------|----------|
| `DATABASE_URL` | Postgres runtime (pooler **:6543** для serverless) | `npm run check-env` — без вывода секретов |
| `DIRECT_URL` | Prisma migrations (session pooler **:5432**) | `check-env` + `docs/SUPABASE_POOLER_SETUP.md` |
| `NEXT_PUBLIC_APP_URL` | Абсолютные URL, metadata, Stripe return | Совпадает с prod-доменом, **без** trailing `/` |
| `STOREFRONT_MIDDLEWARE_SECRET` | `resolve-host`, redirects, experiment internal API | ≥32 случайных символов; один secret на prod |
| `CRON_SECRET` | Все `/api/cron/*` | `Authorization: Bearer $CRON_SECRET` |
| `AUTH_SECRET` | Сессии dashboard | Login на prod |
| **Email (опционально)** | Resend | `RESEND_API_KEY`, verified sender domain |
| **Preview (опционально)** | Signed preview | `STOREFRONT_PREVIEW_SECRET` или длинный `AUTH_SECRET` |
| **Stripe (если P0-3)** | Checkout + webhook | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |

**Middleware:** в `middleware.ts` задан `runtime: "nodejs"`. На Vercel убедиться, что Node middleware поддерживается на вашем плане (Next 15.5+).

**Acceptance:** Launch tab без критических предупреждений; тестовый заказ; (если email) письмо получено.

> `check-env` сегодня валидирует в основном DB shape + `prisma validate`. Storefront-specific secrets — отдельный чеклист в Launch tab / этот документ.

---

### P0-3. Stripe (если нужна оплата картой)

**Код (реализовано):**

- `createStorefrontStripeCheckoutSession` — metadata `purpose: "storefront_order"`, `storefrontOrderId`
- `app/api/webhooks/stripe/route.ts` → `applyStorefrontOrderCheckoutCompleted`
- Guard: admin не включит online без keys (`storefront-pillar-settings`)

**P0-правило:** не помечать заказ `paid` до webhook `checkout.session.completed` с `purpose=storefront_order` и `payment_status=paid` + сверка `amount_total` (см. `STOREFRONT_ONLINE_PAYMENTS.md`).

**Настройка Stripe Dashboard:**

1. Keys в Vercel (см. таблицу P0-2)
2. Webhook: `https://<prod>/api/webhooks/stripe`, событие `checkout.session.completed`
3. Ordering: online payments только при настроенных keys

**Smoke (5 шагов):**

1. Checkout → online → redirect Stripe
2. Test card → success
3. Stripe Logs → webhook 200
4. Order Hub: `paid`, promo usage не дублируется до webhook
5. Повтор webhook → idempotent

**Если Stripe не на launch:** явно **pay-later only** в Ordering и в коммуникации с клиентом; `onlinePaymentEnabled=false`.

---

### P0-4. Delivery zones — честная коммуникация

**Работает** (`lib/storefront/delivery-validation.ts`, `submitPublicStorefrontOrder`):

- Postal/region matching по JSON zones
- `minimumOrder` по зоне (pre-discount subtotal)
- Pickup без zone checks

**Не работает (не обещать):**

- `deliveryRadiusKm` — **diagnostic only**, без geocoding адрес не отклоняется

**P0-действия:**

1. Fulfillment admin: копия «radius не enforced» (проверить UI vs `STOREFRONT_DELIVERY_ZONES_RADIUS.md`)
2. FAQ для операторов: настраивать `postalCodes` / `regions`
3. Support script: «доставка по индексу/региону, не по GPS»

**Acceptance:** ни один customer-facing текст не обещает «доставку в радиусе X км».

---

### P0-5. Аудит Vercel crons

**Факт:** `vercel.json` содержит **126** cron paths (проверка: `jq '.crons | length' vercel.json`).

**Разбивка (ориентир):**

| Категория | ~Кол-во | Риск в prod |
|-----------|---------|-------------|
| `storefront-experiment-*` | 24 | Запись в `themeExperimentJson`, Edge sync, DB без флагов |
| Compliance / organoid / hypergraph / DTN / multiverse | ~90+ | Шум, 401 без `CRON_SECRET`, лимит плана |
| Storefront ops (критичные) | ≤5 | Retention, edge-sync, GA4 parity — по необходимости |
| Platform (`reminders`, `webhook-jobs`) | 2 | Обычно оставить |

**Рекомендуемая tier-стратегия:**

```
Tier A (prod MVP, ≤10–15 paths):
  /api/cron/reminders
  /api/cron/webhook-jobs
  /api/cron/storefront-webhook-retention
  /api/cron/storefront-edge-sync          # если Edge Config для storefront
  /api/cron/dna-audit-trail-archive       # только если THEME_EXPERIMENT_DNA_* включён

Tier B (staging only):
  все storefront-experiment-*
  tier-2 game-day chain (scripts/tier-2-staging-game-day.ts)

Tier C (отключить в prod):
  hypergraph-*, multiverse-*, organoid-*, planetary-dtn-*, compliance-seed-* без явного бизнес-требования
```

**Практические шаги:**

1. Инвентаризация: `jq -r '.crons[].path' vercel.json | sort`
2. Сверка с env: cron не пишет в DB при выключенном feature flag
3. Prod: отдельный deploy profile / урезанный `vercel.json` **или** conditional build script
4. Staging: полный набор + `npm run ops:tier-2-staging-game-day`

**Acceptance:** prod deploy без превышения лимита crons; в логах нет массовых 401 (нет `CRON_SECRET`).

---

### P0-6. Unit-тесты CI

| Файл | Проблема | Решение |
|------|----------|---------|
| `theme-experiment-analytics.test.ts` | `control` должен давать `null` для arm parser | Контракт: только `"draft"` \| `"published"` в `parseExperimentArmFromMetadata` |
| `theme-experiment-auto-conclude.test.ts` | Мок `ExperimentProdDecision` без `bayesianPassed` и др. | Дополнить мок обязательными gates |

**Acceptance:** `npm test` зелёный локально и в CI.

---

## P1 — спецификация доработок

### Builder

По `STOREFRONT_BUILDER_QA_MATRIX.md` — приоритеты:

| Область | Сейчас | Цель | Приоритет |
|---------|--------|------|-----------|
| Media upload | HTTPS URL only | Bucket upload + `assertStorefrontThemeUrlsSafe` | Высокий |
| Nav/footer JSON | TODO (#7–8) | Header + footer на `/s/{slug}` | Высокий |
| Slider | TODO (#9–10) | Секция + a11y | Средний |
| Mobile preview | TODO (#19) | Breakpoint preview в admin | Средний |
| Quality checker | TODO (#18) | Блокеры publish | Средний |

**DoD (builder P1):** пункты 1–4 и 18–19 матрицы → «Существует»; 20–23 → smoke P0-1.

### Redirects, Forms, Domains, Advanced admin, Analytics, Rate limit, E2E

См. `STOREFRONT_COMPLETION_AUDIT.md` — таблицы admin/public routes с приоритетами P1/P2.

**E2E в CI (P1):**

1. Staging deploy → `repository_dispatch` / required check на `playwright-storefront.yml`
2. Secrets: `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD`, `E2E_STORE_SLUG`
3. Variable: `PLAYWRIGHT_BASE_URL`
4. Optional: `lighthouse-storefront.yml` после E2E

---

## Матрица рисков

| Риск | Вероятность | Импакт | Митигация |
|------|-------------|--------|-----------|
| Релиз без smoke | Средняя | Высокий | P0-1 + QA artifact |
| Paid без webhook | Низкая (код ок) | Критический | P0-3 smoke + Stripe monitoring |
| Обещание radius delivery | Средняя | Средний | P0-4 копирайт |
| Cron лимит / нагрузка | Высокая при 126 paths | Высокий | P0-5 tiering |
| Красный CI | Средняя | Средний | P0-6 |
| Builder vs ожидания sales | Высокая | Средний | Честный MVP scope в коммерции |

---

## Дорожная карта

### Неделя 0 — Release blockers (3–5 дней)

| День | Задача | Выход |
|------|--------|-------|
| D1 | P0-6: зелёный `npm test` | CI green |
| D1 | P0-2: prod env checklist | Таблица secrets (1Password/Vercel) |
| D2 | P0-5: prod crons → MVP tier | Deploy OK, ≤15 paths |
| D2–D3 | P0-1: полный smoke staging | Подписанный QA artifact |
| D3 | P0-4: fulfillment/support тексты | Нет ложных обещаний radius |
| D4 | P0-3 (если Stripe): keys + webhook + 1 оплата | Order Hub `paid` |
| D5 | Tag release, мониторинг 24h | `docs/runbooks/STOREFRONT_OUTAGE_RUNBOOK.md` |

### Недели 1–2 — Launch hardening

1. `playwright-storefront` required на staging  
2. Turnstile + rate limits (`STOREFRONT_LIMITATIONS.md`)  
3. Redirect CRUD + 10 smoke URLs  
4. Domain verification MVP (manual recheck button)

### Недели 3–6 — Product completeness

1. Builder: media + nav/footer + slider  
2. Forms builder E2E  
3. Analytics funnel dashboard  
4. Blackouts / fulfillment rules в UI  

### Квартал+ — P2

Sold-out sync → deposit → theme versioning → multi-brand.

---

## Связанные документы

| Документ | Назначение |
|----------|------------|
| `STOREFRONT_QA_CHECKLIST.md` | Smoke сценарии |
| `templates/STOREFRONT_RELEASE_QA_ARTIFACT.md` | Шаблон артефакта релиза |
| `STOREFRONT_LAUNCH_GUIDE.md` | Пошаговый launch для оператора |
| `STOREFRONT_COMPLETION_AUDIT.md` | Gaps по admin/public routes |
| `STOREFRONT_ONLINE_PAYMENTS.md` | Stripe flow |
| `STOREFRONT_BUILDER_QA_MATRIX.md` | Builder DoD |
| `runbooks/STOREFRONT_OUTAGE_RUNBOOK.md` | Инциденты |

---

## Операционные runbook'и (выполнение чеклиста)

| Период | Документ |
|--------|----------|
| Сегодня–завтра (релиз) | [`docs/runbooks/STOREFRONT_RELEASE_DAY_RUNBOOK.md`](runbooks/STOREFRONT_RELEASE_DAY_RUNBOOK.md) |
| Неделя 1 | [`docs/STOREFRONT_WEEK1_HARDENING.md`](STOREFRONT_WEEK1_HARDENING.md) |
| Недели 2–4 | [`docs/STOREFRONT_PHASE_C_ROADMAP.md`](STOREFRONT_PHASE_C_ROADMAP.md) |
| Prod env template | [`.env.storefront.production.example`](../.env.storefront.production.example) |

**Команды:**

```bash
npm run storefront:release-preflight      # local pre-deploy
npm run storefront:qa-artifact            # staging HTTP smoke → QA markdown
npm run github:storefront-gates           # gh variables + branch protection helper
```

---

## Реализовано в репозитории (2026-05-17)

| ID | Артефакт |
|----|----------|
| A1 | `npm run smoke:storefront-release`, шаблон `docs/templates/STOREFRONT_RELEASE_QA_ARTIFACT.md`, CI artifact |
| A2 | `npm run check-env:storefront`, Launch tab → **Production & ops readiness** |
| A3 | `docs/STOREFRONT_STRIPE_LAUNCH_DECISION.md`, Ordering readiness card |
| A4 | `config/vercel/crons-production.json` (6 paths), `npm run vercel:crons:*` |
| A5 | Unit-тесты theme-experiment исправлены |
| B1 | `.github/workflows/storefront-staging-gate.yml` |
| B2 | Rate limits + Turnstile (см. `STOREFRONT_LIMITATIONS.md`) |
| B3 | `/dashboard/storefront/redirects`, `npm run smoke:storefront-redirects` |
| B4 | Domains → Verify DNS / Refresh (уже в `DomainVerificationCard`) |
| C (partial) | Nav/footer в layout; blackouts UI в Fulfillment |

---

## Топ-5 действий «сейчас»

1. Прогнать `STOREFRONT_QA_CHECKLIST.md` на staging → заполнить QA artifact.  
2. Заполнить prod secrets (таблица P0-2).  
3. Решить Stripe: да → P0-3; нет → pay-later only.  
4. Урезать prod `vercel.json` crons до Tier A.  
5. Убедиться, что `npm test` зелёный (P0-6).
