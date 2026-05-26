# Product clarity audit

**Purpose:** Every module should answer “what is this for?” in one sentence, sit in the right **product class**, and avoid duplicate mental models where possible.

**Sources of truth**

- Module metadata: `lib/modules/module-registry.ts` (`MODULE_REGISTRY_ENTRIES`, `moduleModeHints`).
- Operating modes: `lib/business-mode-registry.ts` (`getBusinessModeExperience`).
- Focused sidebar hiding: `hiddenByDefaultModuleKeys` + user “Show all modules (advanced)”.
- Hard off (disabled) state: `KitchenModulePreference` + `lib/module-visibility.ts`.

**Per-module questions (template)**

1. **What does it do?** — Use registry `description`.
2. **Which business types need it?** — Default/recommended/advanced keys per mode in `business-mode-registry`; optional `moduleModeHints`.
3. **Product class** — One of: Core daily operations · Menu & sales · Kitchen operations · Inventory & costing · Fulfillment · Customers & events · Analytics & reports · Admin · Internal platform · Advanced / optional · Enterprise-oriented.
4. **Visible by default (focused nav)?** — Yes if default/recommended spine; hidden if in `hiddenByDefaultModuleKeys` until user expands scope.
5. **Duplicates?** — Called out in `docs/MODULE_CONSOLIDATION_FINAL_PLAN.md` (Orders vs Order hub, etc.).
6. **Terminology** — `lib/terminology.ts` + `navLabelForBusinessType` for nav; registry `label` for settings.
7. **Workflow completeness** — Operational flows exist in-app; playbook task generation remains incremental (honest in playbooks UI).
8. **Primary user action** — First meaningful action (create order, run production, publish menu, etc.) — each major route should surface one primary CTA above the fold.
9. **Empty state** — Should say what is missing and link to the single best setup step (not a wall of links).
10. **Next best action** — Prefer **Today** + **Playbooks** + **Settings** deep links over generic dashboard.

---

## Module matrix

| Module | Purpose | Business types | Default (focused) | Complexity risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Today | Daily ops home — orders, prep, fulfillment, alerts | All | On | Low | Keep as default landing after onboarding |
| Dashboard | Classic KPI / setup home | All | On | Low | Keep; link from Today |
| Orders | Order list and lifecycle | All | Mode spine | Medium | Primary “orders” mental model |
| Order hub | Unified queue / operational lens | Most | Often on | Medium | Keep; explain vs Orders in empty states |
| Calendar | Prep, events, windows | Catering, meal prep, many | Often on | Low | Keep in Today group |
| Weekly menus | Time-bound menus, cutoffs | Meal prep, bakery, catering… | Mode-dependent | High | Clear naming vs Menu planner |
| Brands | Ghost / multi-brand lanes | Ghost, cloud, multi | Mode-dependent | Medium | Hide when single-brand |
| Menu items | SKUs, pricing, visibility | All | On | High | Primary catalog surface |
| Menu planner | Drafts before publish | Ops-heavy tenants | Optional | Medium | Position as “plan then publish” |
| Storefront | Public site & checkout | Most | Mode-dependent | High | Template copy in `lib/storefront-templates.ts` |
| Sales channels | Integrations, health, webhooks | Channel-heavy | Recommended | High | One hub; health deep links |
| Kitchen production | Prep/cook progress | Kitchen modes | On | High | Link to Kitchen screen |
| Kitchen screen | Line / station view | Service & prep | Recommended | Low | Staff default route |
| Packing & labels | Lists, labels, verify | Fulfillment modes | On | High | Single module; verify is sub-route |
| Packing verify | Scan / QC | Packers | Route | Low | Keep; role-friendly |
| Nutrition labels | Panels & compliance data | Meal prep, bakery | Optional | Medium | Operator-owned compliance |
| Ingredient demand | Stress from menus | Cost-conscious | Recommended | Medium | Tie to purchasing CTA |
| Purchasing | Supplier orders | Most kitchens | Mode spine | Medium | Empty → connect demand |
| Costing & margin | Recipe economics | Full-service, bar | Recommended | High | Keep one margin story |
| Import / export | CSV / data movement | Migrations | Advanced | Medium | Rollout group |
| Routes | Delivery sequencing | Meal prep, catering… | Mode-dependent | Medium | Driver story |
| Tasks | Checklists / follow-ups | All | Recommended | Low | Today deep links |
| Locations | Sites / lanes | Cloud, multi | Optional | Medium | |
| Staff | Roster / roles | All | Admin | Low | Moved to Admin nav for clarity |
| Customer CRM | Guests & companies | Café, catering… | Mode-dependent | Medium | |
| Meal plans | Subscriptions | Meal prep | Often hidden for non–meal-prep | Medium | Hide by mode |
| Catering quotes | Quotes & events | Catering, bar | Mode-dependent | High | Terminology: “Event requests” (bar) |
| Analytics | Trends | All | Recommended | Medium | |
| Forecast | Forward demand | Meal prep, scale | Advanced | High | |
| Reports | Exports / schedules | Finance, GM | Recommended | Medium | vs Analytics: time vs snapshot |
| Executive | Portfolio rollups | Multi-brand | Hidden default often | High | One portfolio story |
| AI copilot | Assisted answers | Beta | Advanced | Medium | Honest beta labeling |
| Implementation | Enterprise rollout | Scale | Hidden default | High | Rollout group |
| Import center | Guided imports | Launch | Advanced | Medium | Rollout group |
| Product mapping | External SKU map | Integrations | Advanced | High | Rollout group |
| Go-live | Checklists / test runs | Launch | Advanced | Low | Rollout group |
| Training | Enablement | All | Optional | Low | Rollout group |
| Playbooks | Operational runbooks | All | Recommended | Medium | Link Today ↔ Playbooks |
| Quick-start templates | Safe starter packs | New tenants | Recommended | Medium | `/dashboard/templates` |
| Billing | Plan & payment | All | Always on | Low | Gate messaging only |
| Notifications | Customer comms | All | Admin | Medium | |
| Alert rules | Rule builder | Ops | Admin | Medium | Nested under notifications |
| Settings | Workspace prefs | All | Always on | Low | Business mode lives here |
| Audit logs | Security history | Compliance | Admin | Low | |
| Partner | Partner tools | Partners | Internal | Low | Internal-only flag |
| Support | Help | All | Internal | Low | |
| Growth | GTM / CS consoles | Owner | Internal | High | Owner-only |
| Developer | API keys / dev | Owner | Internal | Medium | Owner-only |
| Beta applications | Inbound beta | Owner | Internal | High | Owner-only |

---

## Classification buckets (count modules mentally toward roadmap)

| Class | Intent |
| --- | --- |
| Core daily operations | Today, Dashboard, Orders, Production, Packing |
| Menu & sales | Menus, Items, Planner, Brands, Storefront, Sales channels |
| Kitchen operations | Production, Kitchen screen, Packing, Verify, Nutrition |
| Inventory & costing | Demand, Purchasing, Costing, Import/export |
| Fulfillment | Routes, Tasks, Locations |
| Customers & events | CRM, Meal plans, Catering quotes |
| Analytics & reports | Analytics, Forecast, Reports, Executive, Copilot |
| Admin | Staff, Billing, Notifications, Rules, Settings, Audit |
| Internal platform | Growth, Developer, Beta apps, Partner (as applicable) |
| Advanced / optional | Implementation, Import center, Mapping, Executive (until needed) |
| Enterprise | Handoff / enterprise pages under implementation |

---

## Gaps (honest)

- Not every module page has a uniform **subtitle + primary CTA + empty state + help link**; highest-traffic routes should be prioritized first.
- **Role model** is still `OWNER | STAFF` in Prisma; richer roles are documented targets only.
- **Playbook → generated tasks** persistence is not shipped; UI should not imply full task sync until data model exists.
