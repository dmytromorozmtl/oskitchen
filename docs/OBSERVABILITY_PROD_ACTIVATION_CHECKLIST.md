# Observability — production activation checklist

**Версия:** 1.0  
**Дата:** 2026-05-15  
**Связь:** `docs/OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md`, `scripts/check-webhook-cron-smoke.sh`, `.github/workflows/webhook-cron-synthetic.yml`

## Sentry

- [ ] `SENTRY_DSN` задан на production  
- [ ] Source maps / release version настроены (Vercel integration или CI)  
- [ ] Sampling согласован (не 100% транзакций при высокой нагрузке)  
- [ ] PII redaction политика в `lib/observability/redaction` проверена

## Cron webhook worker

- [ ] `CRON_SECRET` на хосте  
- [ ] Реальный cron (Vercel или внешний) с Bearer  
- [ ] Synthetic: внешний **каждые 5–15 мин** ИЛИ GitHub + секреты (см. runbook §7)  
- [ ] SQL алерты: `scripts/sql/webhook-jobs-alert-queries.sql`

## Application health (in-app)

- [ ] Developer / platform snapshot: `getPlatformHealthChecks` показывает Sentry / queue / rate limit честно (код обновлён в этом проходе)

## Error recovery

- [ ] `/dashboard/error-recovery` и `/platform/error-recovery` в ротации on-call  
- [ ] Runbook: `docs/FAILED_WEBHOOK_TO_ERROR_RECOVERY.md` (если есть)

## Email / Stripe

- [ ] Resend bounce/complaint handling (Resend dashboard)  
- [ ] Stripe webhook signing secret rotation procedure

## Runbooks (ссылки)

| Тема | Документ |
|------|----------|
| Webhook cron + queue | `docs/OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md` |
| Import rollback | `docs/IMPORT_CENTER_ROLLBACK.md` |
| POS | `docs/POS_WORKFLOW_COMPLETION_FINAL.md` (и support runbook при инциденте) |
| Storefront outage | Статус-страница + коммуникации (`docs/STATUS_PAGE_PLAN.md` если актуален) |
| Support escalation | `docs/PLATFORM_SUPPORT_CENTER.md` / внутренние процессы |
