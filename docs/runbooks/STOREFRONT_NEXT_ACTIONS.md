# Storefront — план действий (детальный)

**Обновлено:** 2026-05-17  
**Трекер:** [`STOREFRONT_RELEASE_CLOSURE_STATUS.md`](../artifacts/STOREFRONT_RELEASE_CLOSURE_STATUS.md) (авто: `npm run storefront:release-status`)

---

## Что уже закрыто в репозитории

| Область | Статус |
|---------|--------|
| Скрипты preflight, QA artifact, post-deploy, week1-verify | ✅ |
| Edge-safe middleware (Groth16 / quantum stubs) | ✅ |
| `npm run dev:safe` | ✅ |
| Stripe Option A — engineering sign-off | ✅ |
| Week 1 redirect seed в коде | ✅ |
| Manual QA runbook + promo/blackout/checkout в QA artifact | ✅ |

---

## Блок 0 — если smoke 404 / DEPLOYMENT_NOT_FOUND

**Причина:** URL `xn---production-…` / `xn---preview--staging-…` **больше не существуют** на Vercel.

```bash
npm run storefront:diagnose-deploy
```

Дальше: [`DEPLOY_404_PLAYBOOK.md`](../artifacts/DEPLOY_404_PLAYBOOK.md) — скопировать **реальный** домен из Vercel → Deployments.

```bash
export STOREFRONT_KNOWN_PRODUCTION_URL="https://ВАШ-РЕАЛЬНЫЙ.vercel.app"
npm run storefront:apply-deploy-urls
npm run storefront:diagnose-deploy
```

**Не используйте** `source .env.production.local` в zsh — ломает `DATABASE_URL`. Только `npm run …`.

---

## Блок A — следующие 2 часа (вы, по порядку)

### A1. Локальная подготовка (15 мин)

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22
cd /Users/dmytro/Desktop/2026/OS Kitchen

npm run storefront:apply-deploy-urls
npm run storefront:env:sync-local
npm run storefront:secrets:generate
npm run storefront:vercel-manifest
npm run storefront:release-preflight
npm run storefront:release-status
```

**Критерий выхода:** preflight PASS; manifest **9/9** P0; `NEXT_PUBLIC_APP_URL` без `yourdomain.com`.

### A2. Product — Stripe Option A (15 мин)

1. Открыть [`PRODUCT_STRIPE_SIGNOFF_GUIDE.md`](../artifacts/PRODUCT_STRIPE_SIGNOFF_GUIDE.md).
2. Admin → **Ordering**: Pay later ON, Online payments OFF.
3. Подписать [`STOREFRONT_STRIPE_SIGNOFF_RECORD.md`](../artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md) (имя, дата, ☑ Product).

**Критерий:** в записи нет `_pending_`.

### A3. Vercel — Production secrets (20 мин)

1. [`VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md`](../artifacts/VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md).
2. Каждая строка **✓ SET** → Vercel → Environment Variables → **Production**.
3. **Не загружать** Stripe keys (Option A).
4. **Redeploy** Production.

**Критерий:** колонка Verified отмечена; redeploy завершён.

### A4. Staging deploy + HTTP smoke (25 мин)

1. Vercel: deploy preview/staging branch.
2. Убедиться, что slug `hello` **published** (`npm run storefront:list-slugs` при доступной БД).
3. Запуск:

```bash
npm run storefront:staging-qa
```

**Критерий:** `docs/artifacts/storefront-qa-release-*.md` — **Automated smoke (staging) PASS**.

Если **404 на все маршруты:**

| Причина | Действие |
|---------|----------|
| Неверный URL | Только ASCII host; сверить с Vercel → Domains |
| Slug не опубликован | Admin → Launch → Published ON |
| Deploy не тот | Открыть URL в браузере вручную |

### A5. Manual QA — checkout / promo / blackout (45–60 мин)

Документ: [`STOREFRONT_MANUAL_QA_RUNBOOK.md`](../artifacts/STOREFRONT_MANUAL_QA_RUNBOOK.md)  
Таблицы в QA artifact: секции **Manual deep-dive**.

| Сценарий | Мин. время | Блокер релиза |
|----------|------------|---------------|
| Pay-later E2E | 15 мин | Да |
| Promo valid/invalid | 10 мин | Да |
| Blackout date | 10 мин | Да |
| Draft / 404 / honeypot | 20 мин | Да |

Заполнить колонку **Tester notes** и ☑ в QA artifact.

### A6. Production deploy + post-deploy (20 мин)

```bash
export STOREFRONT_SMOKE_BASE_URL="https://xn---production-xijza32a.vercel.app"
export STOREFRONT_SMOKE_SLUG=hello
export STOREFRONT_SMOKE_ENV=production
npm run storefront:post-deploy
```

**Критерий:** `storefront-smoke-production-latest.md` — все checks ✓.

### A7. Финальный sign-off (5 мин)

В QA artifact:

- Engineering ☑ + имя + дата  
- Product / Ops ☑  
- **Ship decision:** ☑ Ship  

```bash
npm run storefront:release-status
```

---

## Блок B — Неделя 1 (после стабильного prod)

Детально: [`STOREFRONT_WEEK1_EXECUTION.md`](../artifacts/STOREFRONT_WEEK1_EXECUTION.md)

| День | Задача | Команда / место |
|------|--------|-----------------|
| D1 | Cloudflare Turnstile keys → Vercel Production + Preview | Dashboard |
| D1 | Redeploy prod | Vercel |
| D2 | `STOREFRONT_REDIRECTS_ENABLED=true` в Vercel | Production |
| D2 | Redirect smoke | `npm run smoke:storefront-redirects` |
| D3 | Lighthouse menu + checkout | `npm run lighthouse:storefront` → заполнить appendix |
| D4 | `npm run storefront:week1-verify` | должен PASS |

---

## Блок C — Недели 2–4

Детально: [`STOREFRONT_WEEKS_2_4_BACKLOG.md`](../artifacts/STOREFRONT_WEEKS_2_4_BACKLOG.md)

| Неделя | Deliverable | Owner |
|--------|-------------|-------|
| 2 | Supabase bucket `storefront-media` + env | Engineering |
| 2 | Media pilot на `hello` (1 hero + 1 product) | Eng + Product |
| 3 | Slider block в builder | Engineering |
| 4 | Forms file-upload — **отдельный sprint** | Backlog |

---

## Чеклист «можно ли жать Ship»

- [ ] G1 Preflight PASS  
- [ ] G2 Staging HTTP smoke PASS  
- [ ] G3 Production HTTP smoke PASS  
- [ ] G4 Manual 9 scenarios + checkout/promo/blackout deep-dive  
- [ ] G5 Vercel P0 9/9 uploaded + redeployed  
- [ ] G6 Product Stripe sign-off  
- [ ] G7 QA artifact Ship ☑  

---

## Команды-шпаргалка (без `#` — безопасно для zsh)

```bash
npm run storefront:apply-deploy-urls
npm run storefront:staging-qa
npm run storefront:post-deploy
npm run storefront:release-status
npm run storefront:close-release
```
