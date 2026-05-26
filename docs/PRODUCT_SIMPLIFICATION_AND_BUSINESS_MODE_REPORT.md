# Product simplification and business mode report

**Date:** 2026-05-10  
**Scope:** Continuation of the FoodOps professionalization program — navigation, demos, module gating, documentation alignment, and QA.

## What was simplified or clarified

- **Navigation:** Playbooks and Templates surfaced under **Operations** with i18n keys; command palette includes Today, Playbooks, and Quick-start templates.
- **Module registry:** `playbooks` and `templates` keys added so they participate in enable/disable and route gating like other ops modules.
- **Demos:** Seven vertical slugs (`restaurant`, `cafe`, `bar`, plus existing four) with presets in `lib/demo-verticals.ts`; static generation covers all `/demo/[slug]` pages.
- **Documentation:** Canonical Phase 1–18 docs added or stubbed under `docs/` with pointers to code (`lib/business-modes.ts`, `lib/module-visibility.ts`, `components/dashboard/*`).

## Business modes supported

`BusinessType` enum and experience maps: `lib/business-modes.ts` (with per-mode defaults, hidden modules, terminology hooks). Vertical-specific markdown also lives in `docs/*_MODE.md`.

## Navigation improvements

Grouped nav in `lib/nav-config.ts`; filtering in `lib/business-modes.ts`; disabled keys from preferences in dashboard layout and `ModuleRouteGate`.

## Onboarding

Spec in [ONBOARDING_2_0.md](./ONBOARDING_2_0.md); incremental implementation on `/onboarding` without breaking existing signup.

## Storefront templates & menu strategies

Specs in [STOREFRONT_BUSINESS_TEMPLATES.md](./STOREFRONT_BUSINESS_TEMPLATES.md) and [MENU_STRATEGIES.md](./MENU_STRATEGIES.md) — configuration-first, no fake integrations.

## Operational playbooks

Static library + page; DB-backed playbooks deferred — [OPERATIONS_PLAYBOOKS.md](./OPERATIONS_PLAYBOOKS.md).

## Demo data

Seven launch paths on `/demo` — [BUSINESS_DEMOS.md](./BUSINESS_DEMOS.md).

## QA

- `npm run typecheck` — pass  
- `npm run build` — pass (existing ESLint warnings in storefront cart/checkout hooks only)

## Remaining risks

- Rich onboarding 10-step wizard and KPI registry need schema/UI time.  
- Playbook → task generation not built.  
- Storefront template application needs persisted `storefrontTemplateId`.  
- Role-based default routes need auth profile fields.

## Next 30-day sprint (suggested)

1. Persist playbook + template application metadata in Prisma.  
2. Implement `MenuStrategy` column + label pass on weekly menus.  
3. Role default landing + filtered nav.  
4. Today board: wire real aggregates per mode (orders + production minimum).  
5. Onboarding: steps 1–4 using existing settings APIs + progress save.  
6. Performance: dynamic import heavy dashboard widgets; verify no duplicate Prisma client.  

## Related docs

- [PRODUCT_COMPLEXITY_AUDIT.md](./PRODUCT_COMPLEXITY_AUDIT.md)  
- [FOODOPS_FULL_MODULE_AUDIT.md](./FOODOPS_FULL_MODULE_AUDIT.md)  
- [BUSINESS_MODES.md](./BUSINESS_MODES.md)  
- [MODULE_VISIBILITY.md](./MODULE_VISIBILITY.md)  
- [ADAPTIVE_NAVIGATION.md](./ADAPTIVE_NAVIGATION.md)  
- [MODULE_CONSOLIDATION_PLAN.md](./MODULE_CONSOLIDATION_PLAN.md)
