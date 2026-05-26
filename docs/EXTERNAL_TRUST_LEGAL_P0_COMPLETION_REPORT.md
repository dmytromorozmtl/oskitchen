# External trust & legal P0 — completion report

**Версия:** 1.0  
**Дата:** 2026-05-15

## Scope

Проверка **выборочная** (grep по маркетинговым формулировкам + ключевые страницы), **не** юридическое заключение.

## Pages / components verified (sampling)

| Область | Файл | Наблюдение |
|---------|------|------------|
| Trust center | `app/trust/page.tsx` | Явный disclaimer: нет SOC2/HIPAA/PCI/GDPR claims; roadmap SSO |
| Legal security | `app/legal/security/page.tsx` | «Not a SOC 2 report» |
| Pricing FAQ | `components/marketing/pricing-page.tsx` | SOC2/SSO/SMS — roadmap, не включено |

## Claims downgraded in this pass

- **Нет массовых правок копирайта** — существующий копирайт уже консервативен в выборке выше.

## Remaining legal review tasks (real blockers)

| Task | Owner |
|------|-------|
| Юрист: `/legal/terms`, `/legal/privacy`, `/legal/dpa`, `/legal/data-rights` | Legal |
| Маркетинг: каждая интеграционная страница — «не marketplace approval» (см. `EXTERNAL_READINESS_AUDIT.md`) | PM |
| DPA / subprocessors: заполнить реальными субпроцессорами или оставить явный draft banner | Legal + Eng |

## Launch blockers (trust)

1. Юридическое ревью шаблонов **перед** публичным платным пилотом.  
2. Явный баннер **Draft — not lawyer reviewed** если политики не подписаны (реализация UI — отдельный PR по согласованию).

## LEGAL_POLICIES_PUBLISHED gate

- **Не внедрялся в коде в этом проходе** — зафиксировано как follow-up: env `LEGAL_POLICIES_PUBLISHED=true` + UI только после подписания политик.
