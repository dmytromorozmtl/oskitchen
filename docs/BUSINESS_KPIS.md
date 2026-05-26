# Business KPI registry (roadmap)

Central registry (proposed `lib/business-kpis.ts`) keyed by `BusinessType`:

| Mode | Primary KPIs |
| --- | --- |
| Restaurant | Orders today, top items, prep completion, shortages, margin |
| Café | Specials sold, pickup orders, low stock, repeat customers |
| Bar | Drink margin, top drinks, event inquiries, beverage stock, staff tasks |
| Bakery | Preorder volume, pickup slots, batch completion, custom orders |
| Catering | Quote pipeline, event revenue, guest count, readiness score |
| Meal prep | Weekly orders, meals to pack, route readiness, retention, forecast error |
| Ghost / cloud | Brand mix, channel SLA, shared ingredient stress |

**Surfaces:** Dashboard widgets, Today, Reports intro, Executive (subset only).

Implementation note: start read-only from existing aggregates; do not invent metrics without data.
