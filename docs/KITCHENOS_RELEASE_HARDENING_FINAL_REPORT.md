# KitchenOS — release hardening final report

**Версия:** 1.0  
**Дата:** 2026-05-15  
**Audience:** Founder, Tech lead, GTM

## Readiness estimate (qualitative)

| Axis | Before pass | After pass |
|------|-------------|------------|
| Doc navigation | ~40% | **~75%** (главный индекс + карта модулей) |
| Public API / key security evidence | ~50% | **~70%** (ревью + unit tests) |
| Observability story | ~60% | **~75%** (checklist + in-app health rows) |
| Full IDOR closure | ~45% | **~48%** (честно: большой объём остаётся REVIEW) |
| E2E release discipline | ~55% | **~60%** (документы; код гейта без стабильного preview не меняли) |
| Legal sign-off | Unknown | **Unchanged** — требует внешнего юриста |

## P0 addressed in repo (this pass)

- Документирован полный **commercial hardening** контур.  
- **Public API** stack ревьюнут; добавлены **unit tests** на auth path.  
- **Webhook replay** workspace guard покрыт тестами.  
- **Platform health** расширен: Sentry, webhook queue depth signal, rate-limit adapter honesty.  
- **Dependabot** weekly.  
- SQL + runbook уже существовали — **связаны** в чеклистах.

## P0 still outside repo / human

- Юридическое подписание политик.  
- Включение Sentry DSN + synthetic + SQL alerts в **реальной** инфраструктуре.  
- Полный аудит каждого webhook route.

## P1 backlog (repo)

- Idempotency-Key на public POST orders.  
- E2E: platform denial spec.  
- Webhook signature integration tests per provider.  
- Pagination на `/api/public/v1/customers` heavy path.

## P2 / P3

- Fine-grained API scopes (P2).  
- Materialized KPI snapshots (P3).

## IDOR inventory status

- Добавлены статусы **BLOCKED** / **RISK_ACCEPTED** в легенду.  
- `/api/public/v1/*` переведён в **OK** после целевого ревью.  
- Остальное — см. `IDOR_TENANT_SCOPE_COMPLETION_REPORT.md`.

## Recommendation

| Stage | Fit? |
|-------|------|
| Internal demo | **Yes** |
| Closed beta (limited tenants) | **Yes**, с активным мониторингом и юридическим draft banner |
| Paid pilot | **Conditional** — закрыть P0 human items + webhook audit slice |
| Public launch | **No** until performance baseline + broader IDOR closure |

## First ICP recommendation

- Meal prep / ghost kitchen **single-brand** с Woo или Shopify — минимизировать матрицу интеграций.

## Modules to hide / mark beta for first release

- Uber Direct / Uber Eats если нет подписанных партнёрских соглашений — только «connection optional».  
- AI Copilot — assistance only (уже в trust copy).

## Modules safe to sell (typical)

- Core orders + kitchen production + packing baseline  
- Storefront preorder (после checkout hardening sign-off)  
- Stripe billing (test→live процедура)

---

*Не коммитилось автоматически; при merge приложите ссылку на PR к этому отчёту.*
