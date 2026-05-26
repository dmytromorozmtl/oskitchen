# Backup & disaster recovery — one pager

**Версия:** 1.0  
**Дата:** 2026-05-15

## Assumptions (verify with your providers)

| Asset | Typical provider | Backup responsibility |
|-------|------------------|------------------------|
| PostgreSQL | Supabase / RDS | Автоматические снапшоты провайдера — **проверить retention** |
| Object storage | Supabase Storage / S3 | Политика версионирования |
| Secrets | Vercel / vault | Не в git |

## RPO / RTO (fill with real numbers)

| Metric | Target (placeholder) | Notes |
|--------|------------------------|-------|
| RPO | **≤ 24h** unless proven tighter | Зависит от частоты снапшотов |
| RTO | **≤ 4h** for DB restore decision | Коммуникация + runbook |

## Who can initiate restore

- Только **platform owner** + согласованный DBA; зафиксировать в PagerDuty policy.

## Restore checklist (high level)

1. Зафиксировать инцидент и время.  
2. Остановить трафик (maintenance page) если риск split-brain.  
3. Восстановить БД из снапшота в **новый** инстанс при сомнении.  
4. Проверить миграции `prisma migrate status`.  
5. **Webhook replay:** после большого rewind времени — оценить дубликаты; см. webhook architecture doc.  
6. Export integrity: пересчитать checksum выборочно.

## Migration rollback

- Предпочтительно **forward fix** миграции; `migrate resolve` только по процедуре DBA.

## Test restore schedule

- [ ] Квартальный drill на **staging** clone — пока **не заявлено как выполненное** в этом репозитории.

## What is not automated

- Полный cross-region DR без явной инфраструктуры не заявляется.
