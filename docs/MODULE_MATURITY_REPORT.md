# Module maturity report (snapshot)

This document complements `docs/FOODOPS_FULL_MODULE_AUDIT.md` with a **maturity tier** per major surface. Tiers are descriptive, not a promise of SLA.

| Tier | Meaning |
| --- | --- |
| **Shipped** | End-to-end flows usable in production with real data; some polish gaps acceptable. |
| **Operational beta** | Core workflows exist; edge cases, performance, or UX still active. |
| **Foundational** | Data model + UI shell; needs deeper workflows for vertical completeness. |

## Snapshot

| Area | Tier | Note |
| --- | --- | --- |
| Auth / onboarding | Shipped | Business type captured early; settings can adjust. |
| Dashboard home | Operational beta | Mode summary + signals; more mode-specific widgets planned. |
| Orders / Order hub | Operational beta | Strong for preorder/meal-prep; restaurant/bar order taxonomy evolving. |
| Menus / products | Shipped | Weekly menu workflow mature; multi-menu-type enum still roadmap. |
| Storefront | Operational beta | Commerce layer expanded; template-per-mode roadmap. |
| Integrations | Operational beta | Real test/sync paths where APIs exist; honest placeholders elsewhere. |
| Production / packing | Operational beta | Touch + batch workflows usable; station/timer depth growing. |
| Purchasing / costing / demand | Foundational | Useful for modeling; par-level automation and bar pour-cost depth TBD. |
| CRM / catering / meal plans | Foundational | CRM solid start; quote→event→invoice depth TBD. |
| Analytics / reports / executive | Foundational | Charts and exports exist; vertical-specific KPI packs TBD. |
| Growth / platform admin | Operational beta | Internal tooling; workspace table now shows business type. |
