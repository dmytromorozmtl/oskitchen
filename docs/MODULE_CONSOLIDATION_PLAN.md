# Module consolidation plan (no deletions)

**Rule:** Preserve routes and data paths; reduce sidebar and mental duplication via merged entry points, tabs, or clearer labels.

| Pair / cluster | Issue | Safe UI direction | Route handling |
| --- | --- | --- | --- |
| Orders vs Order hub | Two queues confuse new users | Single **Orders** nav item with sub-nav or tabs: *List* / *Hub* | Keep both URLs |
| Weekly menus vs Menu planner | Overlap in planning vs publishing | One **Menus** group: *Weekly* / *Planner* | Keep both URLs |
| Packing & labels vs Packing verify | Similar names | Label as **Packing** (labels) and **Packing verify** (scan); doc in help | No change |
| Analytics vs Reports vs Executive | Three “insights” surfaces | **Insights** group order: Analytics → Reports → Executive (executive last) | Keep URLs |
| Notifications vs Alert rules | Parent vs child | Keep **Notifications** primary; rules as sub-route only | Already nested |
| Implementation vs Go-live vs Training | Lifecycle cluster | **Operations** group: Implementation → Go-live → Training in sequence | Keep URLs |
| Growth vs Beta applications | Internal noise | Keep under **Internal**; beta only for program admins | Keep URLs |
| Developer vs Platform admin | Different audiences | Developer = customer API; Platform = staff-only | Superadmin bypass unchanged |

Review quarterly after usage analytics exist.
