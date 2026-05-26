# Performance & load — baseline plan

**Версия:** 1.0  
**Дата:** 2026-05-15

## Method

1. Выбрать окружение staging с prod-like data volume (или anonymized clone).  
2. Инструмент: k6 / Artillery / Grafana k6 cloud — **без** секретов в скриптах.  
3. Зафиксировать p50/p95/p99 для маршрутов ниже.

## Surfaces to measure

| Surface | Typical heavy query | Notes |
|---------|---------------------|-------|
| Dashboard home | Aggregates | Pagination |
| Today command | `today-command-center-service` | Cache snapshots |
| Order Hub | Order lists + filters | Index review |
| Platform rollups | Platform analytics | Strict limits |
| Webhook jobs | `webhook_processing_jobs` | Already SQL alerts |
| Audit logs | Append-only reads | Time-range cap |
| Support inbox | Ticket lists | Cursor pagination |
| Storefront public | SSR + menu | CDN, image lazy-load |
| Export / import | Full table scans | Streaming, limits |
| POS reports | Aggregations | Precompute |
| Executive reports | Heavy JOINs | Materialized views (future) |

## Initial SLO targets (proposal — не контракт)

| SLO | Target p95 |
|-----|------------|
| Public storefront document | < 800ms TTFB (CDN edge) |
| Authenticated dashboard shell | < 1.2s |
| Webhook ingress response (ack) | < 300ms before async handoff |
| Webhook processing lag (queued → processed) | бизнес-порог из очереди |
| POS checkout mutation | < 1.5s |
| Order Hub list first page | < 900ms |

## Safe improvements (already partially in codebase ethos)

- `take` / `cursor` на списках  
- `select` вместо тяжёлых `include`  
- Индексы Prisma: ревью `@@index` при новых фильтрах
