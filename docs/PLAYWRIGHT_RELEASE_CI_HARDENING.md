# Playwright — release CI hardening

**Версия:** 1.0  
**Дата:** 2026-05-15

## Goals

1. Не ломать текущий PR CI (нет полного поднятия Postgres в `ci.yml`).  
2. Обязать **release** прогон против **staging** URL.  
3. Явные **skip** условия без ложного зелёного.

## Workflows

| Файл | Назначение |
|------|------------|
| `.github/workflows/ci.yml` | Unit + lint + build |
| `.github/workflows/e2e-remote-smoke.yml` | `workflow_dispatch` + `target_url` |
| `.github/workflows/webhook-cron-synthetic.yml` | Synthetic cron (см. observability checklist) |

## Recommended scenarios (mapped to user stories)

| # | Сценарий | Где в коде | Secrets / vars |
|---|----------|------------|----------------|
| 1 | signup → onboarding → first menu | Playwright specs TBD / расширить `e2e/` | `E2E_*` по `docs/TESTING.md` |
| 2 | POS sale | `e2e/pos-checkout-flow.spec.ts` | Dashboard vars |
| 3 | Storefront order | `e2e/storefront.spec.ts` | `E2E_STOREFRONT_SLUG` |
| 4 | Woo webhook → job → cron | **Fixture-based** integration test или staging script `verify-staging-webhook-readiness` | Staging only |
| 5 | platform access denied | Новый spec: залогинен обычный user → `GET /platform` → redirect/403 | Seed user без platform |
| 6 | Support thread | Опционально; нужен seed ticket | DB seed vars |
| 7 | Billing без Stripe | Assert UI/endpoint safe message | Env без Stripe |
| 8 | Resend missing | Assert no crash на отправке в dev-safe path | — |
| 9 | Storefront draft | Preview token only checkout | Preview route tests |

## Test DB isolation

- Использовать **отдельный** `E2E_DATABASE_URL` на staging; `db:seed:e2e-pos` перед dashboard тестами; `db:prune` после (опционально).  
- Никогда не указывать production DATABASE_URL в GitHub vars.

## CI env documentation

- Источник правды: `docs/TESTING.md`, `docs/PLAYWRIGHT_RELEASE_CI_RU.md`, этот файл.

## Anti-patterns

- Помечать job success если `target_url` пустой.  
- Запускать destructive prune против prod.
