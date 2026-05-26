# Module consolidation — final plan

**Principle:** Reduce *cognitive* duplication without deleting routes or breaking bookmarks.

| Pair | Relationship | Plan |
| --- | --- | --- |
| Orders vs Order hub | List vs operational queue | Keep both URLs. Sidebar: adjacent under **Orders & sales**. Empty states on each page: one line explaining when to use the other. |
| Weekly menus vs Menu planner | Published windows vs planning drafts | Keep both. Planner stays in **Menus**; doc cross-link only (no merge). |
| Packing & labels vs Packing verify | Workbench vs QC scan | Keep both; **Kitchen** group lists packing then verify. Registry label already says “Packing & labels”. |
| Analytics vs Forecast vs Reports vs Executive | Trend vs forward vs exports vs portfolio | Keep all; **Insights** order: Analytics → Forecast → Reports → Executive → Copilot. |
| Notifications vs Alert rules | Parent vs configuration | Keep nested URL `/dashboard/notifications/rules`; single nav entry for rules under **Admin**. |
| Implementation vs Go-live vs Training | Enterprise vs tenant launch vs enablement | Grouped under **Setup & rollout**; no tab merge until telemetry shows confusion. |
| Growth vs Beta applications | GTM vs inbound beta | Stay **Internal**, owner-only. |
| Developer vs Platform admin | Tenant integrations vs platform console | Keep separate: Developer under **Internal**; Platform remains `/platform` (super-admin extra). |

## Safe future enhancements (only after usage data)

1. **Tabbed shell** on `/dashboard/orders` with sub-tabs “List” / “Hub” — requires careful mobile layout; defer.
2. **Canonical redirects** (302) only for deprecated slugs if any are introduced — none now.

## Sidebar simplification (done)

- Calendar sits with **Today** (day rhythm).
- Staff moved to **Admin** (people governance vs logistics).
- Rollout tools sit in **Setup & rollout** between Insights and Admin.
