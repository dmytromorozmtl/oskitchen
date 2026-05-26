# Final module consolidation report

**Rule:** No routes removed — reduce confusion via grouping, honest labels, and optional redirects later.

| Area | Current state | Recommendation |
| --- | --- | --- |
| Orders vs Order hub | Two entry points | Keep both URLs; Order hub remains queue lens. Sidebar: **Orders & calendar** group lists both. |
| Weekly menus vs Menu planner | Similar mental model | Keep both; planner stays rollout group. Doc cross-links only. |
| Packing vs Packing verify | Name collision risk | Single **Kitchen ops** group; verify remains explicit link. |
| Analytics / Reports / Executive | Three insights | Single **Insights** group; ordering: Analytics → Forecast → Reports → Executive → Copilot (beta). |
| Notifications vs Rules | Parent/child | Stay nested under `/dashboard/notifications/rules`. |
| Implementation / Go-live / Training | Long rollout tail | Grouped under **Rollout & playbooks** with templates. |
| Growth vs Beta | Internal noise | **Internal** group; owner-only where flagged. |
| Developer vs Platform | Different audiences | Developer stays tenant; Platform remains separate `/platform` app. |

Future (optional): primary tabbed shell on Orders and Menus — only after usage telemetry.
