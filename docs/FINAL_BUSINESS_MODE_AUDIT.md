# Final business mode audit

**Source of truth (typed):** `lib/business-mode-registry.ts` — each `BusinessType` defines default/recommended/advanced module keys, hidden-by-default keys, dashboard/today widget ids, menu strategy, storefront template id, demo vertical, fulfillment defaults, production mode, and an honest **maturityScore** (0–100).

**Module metadata:** `lib/modules/module-registry.ts` — labels, descriptions, routes, tiers, beta/placeholder/internal flags, and optional per-mode hints.

**Navigation & focus:** `lib/business-modes.ts` + `lib/nav-config.ts` — focused sidebar hides routes derived from `hiddenByDefaultModuleKeys` until the user enables “Show all modules (advanced)”.

## Maturity scores (from registry)

| Mode | Score band | Notes |
| --- | ---: | --- |
| Meal prep | 72 | Strong weekly + packing + routes story. |
| Restaurant | 70 | Core service + costing path solid. |
| Catering | 68 | Quote → calendar → production coherent. |
| Bakery | 68 | Preorder + labels + production alignment. |
| Café | 64 | Specials + CRM + light production. |
| Ghost kitchen | 66 | Brands + hub + integrations emphasis. |
| Cloud kitchen | 64 | Locations + throughput narrative. |
| Multi-brand | 58 | Executive layer still maturing vs data depth. |
| Bar | 60 | Events + costing; compliance remains operator-owned. |
| Other | 48 | Intentionally generic until mode sharpened. |

## Per-mode narrative (abbrev.)

For each mode the registry encodes: **ICP** (`idealFor`), **defaultModuleKeys** (daily spine), **recommendedModuleKeys**, **advancedModuleKeys**, **hiddenByDefaultModuleKeys**, **defaultTodayWidgets**, **defaultPlaybookSlugs**, **defaultMenuStrategy**, **defaultStorefrontTemplate**, **defaultDemoVertical**.

Supporting engines:

- **KPIs:** `lib/business-kpis.ts`
- **Workflows (onboarding picklist):** `lib/business-workflows.ts`
- **Quick-start cards:** `lib/business-templates.ts`
- **Menu strategies:** `lib/menu-strategies.ts`
- **Storefront templates (copy/behavior spec):** `lib/storefront-templates.ts`
- **Playbooks:** `lib/operations-playbooks.ts` + `playbooksForBusinessType()`

## Gaps (honest)

- Playbook → **task generation** is not persisted yet (UI states “planned”).
- **Storefront template apply** is metadata-first; builder wiring remains incremental.
- **MenuStrategy** is registry + copy — Prisma column not added (stability).
- **Rich org roles** (`OrganizationMemberRole`) not yet mapped to auth; `lib/role-navigation.ts` maps `UserRole` only.

## Super-admin

Platform bypass remains in `lib/billing/access.ts` + `lib/platform-super-bypass.ts` (canonical email in `lib/platform-owner.ts`). Full nav + module gates bypass for support.
