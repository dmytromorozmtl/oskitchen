# Observability — production ops report

**Версия:** 1.0  
**Дата:** 2026-05-15

## Code changes (this pass)

| Изменение | Файл |
|-----------|------|
| Расширены health checks | `services/developer/platform-health-service.ts` |

### Новые индикаторы

| ID | Описание |
|----|----------|
| `sentry` | operational если `SENTRY_DSN` + backend SENTRY; иначе degraded с пояснением |
| `webhook_job_queue` | COUNT статусов QUEUED+RETRYING; degraded если null или >5000 |
| `rate_limiting` | operational если нет `rateLimitProductionWarning()`; иначе degraded (in-memory в prod и т.д.) |

## captureErrorSafe

- Реализация остаётся **тонкой обёрткой**: без DSN / без клиента — no-op.  
- Тесты: `tests/unit/sentry-capture-safe.test.ts`.

## Что остаётся вне кода

- Slack/PagerDuty маршрутизация алертов  
- Дашборд Grafana/Datadog  
- Регулярный game day

## Honest limitations

- «Storefront» health как отдельный ping **не** добавлен в этот сервис (слишком много вариантов host/slug) — используйте synthetic на публичный URL.
