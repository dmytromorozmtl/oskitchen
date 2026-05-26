# Playwright и CI для релизного контура (KitchenOS)

**Версия:** 1.1  
**Дата:** 2026-05-15

---

## 1. Что уже есть в репозитории

| Артефакт | Назначение |
|----------|------------|
| [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | На каждый PR/push в `main`: `npm ci` → Prisma generate → verify scripts → **typecheck**, **lint**, **vitest**, **build** (Node **22**). |
| [`.github/workflows/e2e-remote-smoke.yml`](../.github/workflows/e2e-remote-smoke.yml) | **Ручной** workflow (`workflow_dispatch`) против **уже развёрнутого** URL: публичный smoke + опции dashboard/storefront через переменные и secrets. |
| `package.json` | `test:e2e:public-smoke`, `test:e2e:dashboard`, `test:e2e:storefront` — локальные сценарии. |
| `docs/TESTING.md` | Ожидается описание секретов `E2E_*` (см. также `docs/E2E_CI_SECRETS_AND_FIXTURES.md` при наличии). |

---

## 2. Рекомендуемая политика на релизную ветку

### 2.1 Минимум (без поднятия БД в CI)

1. **Обязательно:** зелёный `ci.yml` (уже включает unit + build).  
2. **Перед merge в main / перед prod deploy:** в GitHub: **Actions** → **E2E remote smoke** → **Run workflow** → в поле **`target_url`** указать **staging** (тот же базовый URL, что пойдёт в прод после promote). Один полный прогон public smoke обязателен; dashboard/storefront — по переменным из шапки workflow.  
3. Опционально включить в том же run переменные:
   - `PLAYWRIGHT_INCLUDE_DASHBOARD=true` + secrets логина,
   - `PLAYWRIGHT_INCLUDE_STOREFRONT=true` + `E2E_STOREFRONT_SLUG`.

### 2.2 Цель «релизный гейт»

- Для **каждого** production deploy: минимум **public smoke** с удалённого workflow.  
- Для **major** release: + dashboard сценарий (хотя бы логин + одна критичная страница).

---

## 3. Как не дублировать работу

- Не обязательно добавлять второй CI-файл, пока нет стабильного **self-hosted preview** с секретами: `e2e-remote-smoke` **специально** избегает запуска Next+Postgres в GitHub runner.  
- Если позже появится полноценный preview на PR — можно добавить job в `ci.yml` по образцу закомментированных шагов (см. комментарии в `ci.yml`).

---

## 4. Контрольный чеклист перед продакшеном

- [ ] `ci.yml` зелёный на коммите тега/релизной ветки.  
- [ ] `E2E remote smoke` выполнен на **том же** билде/URL, что уйдёт в prod.  
- [ ] Synthetic cron check (см. [`docs/OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md`](./OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md)) настроен на prod host.

---

## 5. Связанные документы

- `docs/E2E_CI_CRITICAL_PATHS_PLAN.md` (если есть в дереве)  
- `docs/STOREFRONT_E2E_SMOKE_TESTS.md` (если есть)
