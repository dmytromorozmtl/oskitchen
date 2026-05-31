# Commercial Release Hardening — OS Kitchen (audit)

**Версия:** 1.0  
**Дата:** 2026-05-15  
**Аудитор:** Principal / multi-role pass (архитектура, security, QA, SRE, compliance narrative)  
**Контекст:** перевод с «ранний B2B» к **disciplined closed beta / paid pilot**. Без ложных compliance-claims.

Навигация: единая точка входа — [`docs/ENGINEERING_READINESS_INDEX.md`](./ENGINEERING_READINESS_INDEX.md). Итоговое решение о релизе — [`docs/OS Kitchen_RELEASE_HARDENING_FINAL_REPORT.md`](./OS Kitchen_RELEASE_HARDENING_FINAL_REPORT.md).

---

## Легенда приоритетов

| Тег | Значение |
|-----|----------|
| **P0** | До paid pilot (деньги / данные / доверие) |
| **P1** | До расширения closed beta |
| **P2** | До public launch |
| **P3** | Enterprise roadmap |

---

## 1. Product modules

| Состояние | Крупнейший риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|-----------------|-----------|--------------|-------|-----|
| Очень широкая поверхность (сотни dashboard routes, ~9.8k строк Prisma schema) | Пилот «включает всё» → поддержка и баги | `app/dashboard/**`, `prisma/schema.prisma` | ICP-фокус: список **safe to sell** vs **beta/roadmap** в финальном отчёте | PM + Eng TL | P1 |
| Go-live чеклист существует | Не все пункты автоматизированы | `docs/GO_LIVE_CHECKLIST.md`, `/dashboard/go-live` | Связать чеклист с E2E сценариями | PM | P1 |

---

## 2. Engineering maturity

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| TS strict, Next 15, разделение actions/services | Регрессии без тестов | `actions/`, `services/` | Расширить критические тесты (см. отчёт покрытия) | Eng | P0 |
| Версия 0.1.0 в package.json | Ожидания рынка vs semver | `package.json` | Явно маркировать pilot в UI/контракте | PM | P2 |

---

## 3. CI / build / test pipeline

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| CI: install → prisma → verify → typecheck → lint → unit → build | E2E не gate на PR | `.github/workflows/ci.yml` | Политика: remote smoke перед prod; опционально gate на `main` при стабильном preview | SRE | P1 |
| Dependabot добавлен | Авто-merge запрещён | `.github/dependabot.yml` | Weekly review + CI зелёный | Eng | P1 |

---

## 4. Unit / integration / E2E coverage

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| ~130 unit tests, плотность низкая относительно schema | Регресс IDOR/биллинга | `tests/unit/**`, `vitest.config.ts` | Приоритетные тесты: public API auth, webhook replay guard, billing gates (см. `CRITICAL_TEST_COVERAGE_EXPANSION_REPORT.md`) | QA + Eng | P0 |
| Playwright локально + `e2e-remote-smoke.yml` | Ложный зелёный без секретов | `e2e/`, `docs/PLAYWRIGHT_RELEASE_CI_HARDENING.md` | Документировать skip; не считать зелёным без URL | QA | P1 |

---

## 5. IDOR / tenant scope

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| Инвентаризация + программа; много **REVIEW** | Один забытый route = утечка | `docs/IDOR_MUTATION_INVENTORY.md`, `docs/TENANT_SCOPE_IDOR_PROGRAM_RU.md` | Закрывать только с ревью кода; см. `IDOR_TENANT_SCOPE_COMPLETION_REPORT.md` | Security champ | P0 |
| Public API v1 ревьюнут в этом проходе | Нет scoped permissions на уровне «read orders only» | `lib/api-public/auth.ts`, `resolve-enterprise-api.ts` | Roadmap: scopes на ключи (не вводить ложно «готово») | Eng | P2 |

---

## 6. Platform admin security

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| `/platform/*`, `requirePlatformAccess` | Клиент попадает на platform | `app/platform/**`, `middleware.ts` | Регресс-тест «client denied» в E2E; founder `workspace.moroz@gmail.com` сохранить (`lib/platform-owner.ts`) | Security | P0 |

---

## 7. Public API security

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| Ключи `kos_*`, SHA-256 в БД, prefix в UI | Утечка raw key в логах | `services/developer/api-key-service.ts`, `app/api/public/v1/**` | Не логировать Authorization; см. `PUBLIC_API_WEBHOOK_SECURITY_REPORT.md` | Eng | P0 |

---

## 8. Webhooks и async jobs

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| Очередь `WebhookProcessingJob`, cron dry-run | Застой очереди без алерта | `app/api/cron/webhook-jobs/route.ts`, `services/webhooks/**` | Synthetic + SQL алерты (см. `OBSERVABILITY_PROD_ACTIVATION_CHECKLIST.md`) | SRE | P0 |
| Replay с audit | Злоупотребление replay | `services/webhooks/webhook-replay-service.ts` | Тесты на workspace guard; platform override только с audit | Eng | P0 |

---

## 9. Storefront / public routes

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| Публичные страницы + checkout | Draft theme в проде | `app/s/[storeSlug]/**`, `app/api/checkout` | E2E «checkout protected»; rate limits на analytics | Eng | P1 |

---

## 10. Billing / Stripe

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| Stripe webhooks, Customer Portal | Путаница live vs test | `app/api/webhooks/stripe`, `docs/BILLING_*` | Копирайт и UI: честный статус (см. external trust отчёт) | PM + Eng | P0 |

---

## 11. Observability (Sentry, cron, SQL)

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| `captureErrorSafe` no-op без DSN | Слепые прод-ошибки | `services/observability/error-reporting-service.ts` | Активировать DSN; health честно показывает degraded | SRE | P0 |
| Platform health расширен | Нет единого дашборда вне приложения | `services/developer/platform-health-service.ts` | Внешние алерты по SQL + synthetic | SRE | P1 |

---

## 12. External readiness / legal / trust

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| Trust center уже без SOC2/HIPAA claims | Юридическое не ревью шаблонов | `app/trust/page.tsx`, `docs/EXTERNAL_READINESS_AUDIT.md` | Юрист review шаблонов `/legal/*`; отчёт `EXTERNAL_TRUST_LEGAL_P0_COMPLETION_REPORT.md` | Legal + PM | P0 |

---

## 13. Documentation navigation

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| >1000 md в `docs/` | Потеря инженера | `docs/**` | `ENGINEERING_READINESS_INDEX.md` + `MODULE_DOCUMENTATION_MAP.md` | TL | P1 |

---

## 14. Performance / load

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| Нет зафиксированного SLO | Неожиданные p95 на Today/Order Hub | `docs/PERFORMANCE_LOAD_BASELINE_PLAN.md` | Baseline + pagination audit | Eng | P1 |

---

## 15. Backup / DR / release ops

| Состояние | Риск | Артефакты | Рекомендация | Owner | Pri |
|-----------|------|-----------|--------------|-------|-----|
| Нет одностраничного DR | Долгий простой при инциденте БД | `docs/BACKUP_DISASTER_RECOVERY_PLAN.md` | RPO/RTO, restore drill (не заявлять «tested» без прогона) | SRE | P1 |

---

## Связанные отчёты (этот проход)

| Файл |
|------|
| [`IDOR_TENANT_SCOPE_COMPLETION_REPORT.md`](./IDOR_TENANT_SCOPE_COMPLETION_REPORT.md) |
| [`PUBLIC_API_WEBHOOK_SECURITY_REPORT.md`](./PUBLIC_API_WEBHOOK_SECURITY_REPORT.md) |
| [`CRITICAL_TEST_COVERAGE_EXPANSION_REPORT.md`](./CRITICAL_TEST_COVERAGE_EXPANSION_REPORT.md) |
| [`PLAYWRIGHT_RELEASE_CI_HARDENING.md`](./PLAYWRIGHT_RELEASE_CI_HARDENING.md) |
| [`E2E_RELEASE_CI_STATUS_REPORT.md`](./E2E_RELEASE_CI_STATUS_REPORT.md) |
| [`EXTERNAL_TRUST_LEGAL_P0_COMPLETION_REPORT.md`](./EXTERNAL_TRUST_LEGAL_P0_COMPLETION_REPORT.md) |
| [`OBSERVABILITY_PROD_ACTIVATION_CHECKLIST.md`](./OBSERVABILITY_PROD_ACTIVATION_CHECKLIST.md) |
| [`OBSERVABILITY_PROD_OPS_REPORT.md`](./OBSERVABILITY_PROD_OPS_REPORT.md) |
| [`PERFORMANCE_LOAD_BASELINE_PLAN.md`](./PERFORMANCE_LOAD_BASELINE_PLAN.md) |
| [`PERFORMANCE_OPTIMIZATION_REPORT.md`](./PERFORMANCE_OPTIMIZATION_REPORT.md) |
| [`DEPENDENCY_SECURITY_UPDATE_PROCESS.md`](./DEPENDENCY_SECURITY_UPDATE_PROCESS.md) |
| [`BACKUP_DISASTER_RECOVERY_PLAN.md`](./BACKUP_DISASTER_RECOVERY_PLAN.md) |
| [`OS Kitchen_RELEASE_HARDENING_FINAL_REPORT.md`](./OS Kitchen_RELEASE_HARDENING_FINAL_REPORT.md) |
