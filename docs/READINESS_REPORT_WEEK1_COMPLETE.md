# KitchenOS — отчёт Week 1 + roadmap до 100/100

**Дата:** 2026-05-17 · **Typecheck:** 0 ошибок · **Tests:** 491 passed

---

## 1. Что сделано (код, 100% Week 1)

### Tenancy batch — весь dashboard

Применён паттерн **workspace member → owner `dataUserId`**:

| Модуль | Статус |
|--------|--------|
| products | pages + `actions/products.ts` |
| menu-planner | page |
| routes | pages + `actions/delivery-route.ts` |
| sales-channels | все 22 страницы |
| **Остальной dashboard** | **361** `page.tsx` мигрированы |
| **Server actions** | **84** файла мигрированы |

Инфраструктура:

- `lib/scope/require-tenant-actor.ts` — для actions
- `lib/scope/cached-tenant.ts` — `getTenantActor()` с React `cache` для RSC
- `app/dashboard/layout.tsx` — module prefs, workspace brands, search scope → `dataUserId`
- Layouts: storefront, locations, pos, product-mapping, settings (RBAC остаётся на `session.id`)

Скрипты для повторного аудита:

```bash
node scripts/verify-tenant-scope-coverage.mjs
```

### CI / E2E Staging

- Workflow: `.github/workflows/e2e-staging.yml` (cron 06:00 UTC + manual)
- Документация: `docs/GITHUB_E2E_STAGING_SECRETS.md`

### Observability (уже было + доки)

- `docs/SENTRY_ALERT_RULES.md` — правила для `cron_failure`, `webhook_signature_invalid`

### Качество

- `npm run typecheck` — OK
- `npm test` — 491 passed

---

## 2. Week 2–4 — что остаётся (честно)

| Пункт | Тип | Статус |
|-------|-----|--------|
| IDOR long-tail | Код + ревью | Инвентарь `IDOR_MUTATION_INVENTORY.md`, ~20 файлов/релиз |
| Woo/Shopify certification | Ops + test shop | Чеклист есть, прогон на реальном магазине — **не выполнен** |
| Sentry alerts | Ops (Sentry UI) | Код эмитит теги; правила в Sentry — **настроить вручную** |
| E2E daily green | Ops | Нужны GitHub secrets + первый зелёный run |
| 3 pilot без SEV-1 | Бизнес/ops | Вне кода |
| Marketing BETA | Контент | Dashboard badges есть; публичный marketing — отдельный проход |

---

## 3. Ваши действия (следующие 24–72 часа)

### A. GitHub secrets (15 мин)

1. Repo → Settings → Secrets → Actions
2. Добавить: `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_PASSWORD`
3. Variables → `E2E_STOREFRONT_SLUG` = `hello`
4. Actions → **E2E Staging** → Run workflow

### B. Staging smoke (без скобок в терминале)

```bash
cd /Users/dmytro/Desktop/2026/KitchenOS
npm run smoke:staging
```

Для invites (уже проверяли):

```bash
npx tsx scripts/smoke-storefront-team-invites.ts --owner-email workspace.moroz@gmail.com
```

### C. Manual UI smoke

`docs/MANUAL_UI_SMOKE_CHECKLIST.md` — секции A–F под ваш slug `hello`.

### D. Sentry

Создать 2 alert rules по `docs/SENTRY_ALERT_RULES.md`.

### E. Production deploy

`docs/PRODUCTION_DEPLOY_CHECKLIST.md` — migrate deploy + smoke после релиза.

---

## 4. Следующий шаг (приоритет)

**№1 — включить E2E Staging secrets и получить первый зелёный daily run.**  
Без этого пункт «Staging E2E green ежедневно» в 100/100 остаётся открытым, хотя workflow уже в репозитории.

**№2 — один релиз IDOR long-tail** (5–8 action files из инвентаря + cross-tenant test).

**№3 — Woo/Shopify half-day на test shop** по чеклисту; до sign-off marketing остаётся BETA.

---

## 5. Оценка готовности

| Веха | Оценка |
|------|--------|
| Closed beta (код tenancy) | **~92/100** |
| Paid pilot (после manual smoke + secrets) | **готов к старту** |
| Public launch 100/100 | **~88/100 код**, **~75/100 ops** (secrets, Sentry UI, certification, pilots) |

---

## 6. Файлы для навигации

| Документ | Назначение |
|----------|------------|
| `PUBLIC_LAUNCH_30_DAY_TRACKER.md` | Чеклист 30 дней |
| `GITHUB_E2E_STAGING_SECRETS.md` | Secrets |
| `SENTRY_ALERT_RULES.md` | Alerts |
| `WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md` | Certification |
| `MANUAL_UI_SMOKE_CHECKLIST.md` | Ручной smoke |
| `INCIDENT_RESPONSE_RUNBOOK.md` | Инциденты |
