# UX + Navigation Polish — Final (MVP)

## Principles

- One OS: **Today** leads execution; **Commerce** vs **Kitchen** vs **Fulfillment** buckets stay stable.  
- Remove duplicate “Menus” links; weekly menus stay under **Menus** group (`lib/nav-config.ts`).  
- Business-mode labels: adjust “Preorder” language when workspace is restaurant/POS-heavy.

## Taxonomy (target)

1. **Today** — Today, Dashboard, Calendar  
2. **Commerce** — POS Terminal, Orders, Order Hub, Storefront, Sales channels  
3. **Menus** — Weekly menus, Meals & items, Menu planner, Brands  
4. **Kitchen** — Production, Kitchen screen, Packing, Verify, Nutrition  
5. **Inventory & cost** — Demand, Purchasing, Costing  
6. **Fulfillment** — Routes, Tasks, Locations  
7. **Customers & events** — CRM, Meal plans, Catering quotes  
8. **Insights** — Analytics, Forecast, Reports, Executive, AI copilot  
9. **Setup & rollout** — Implementation, Imports, Mapping, Go-live, Training, Playbooks  
10. **Admin** — Staff, Billing, Notifications, Alert rules, Error recovery, Data integrity, Settings, Audit logs  
11. **Platform** — Only for platform roles

## Known alias fixes (P1)

- `/dashboard/integration-health` → **redirects** to `/dashboard/sales-channels/health` (legacy bookmarks).
- `/dashboard/customer-crm` → `/dashboard/customers` / CRM subroutes  
- `/dashboard/ai` → `/dashboard/copilot`
