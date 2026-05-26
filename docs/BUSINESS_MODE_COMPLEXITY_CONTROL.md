# Business Mode Complexity Control

## Goal

Prevent the “museum of features” problem by **defaulting navigation** to what matters for the selected **Prisma `BusinessType`**, while allowing **Show all modules** (`navScopeAll` in `getFilteredNavGroups`).

## Code map

| File | Role |
|------|------|
| `lib/business-mode-registry.ts` | Per-mode default/recommended/hidden module keys + maturity score. |
| `lib/business-modes.ts` | Filters `NAV_GROUPS` using registry hidden sets + role strip. |
| `lib/business-mode/business-mode-config.ts` | Strategic aliases (`COMMISSARY`→`CLOUD_KITCHEN`, `MANUAL_ONLY`→`OTHER`) + `getBusinessModeModulePlan`. |
| `lib/navigation/business-mode-navigation.ts` | Re-exports for product/engineering discoverability. |
| `lib/module-visibility.ts` | Module gate prefixes for disabled modules. |
| `services/modules/module-recommendation-service.ts` | “Next modules” onboarding helper. |
| `lib/terminology.ts` | **Orders** label overrides (Preorders, Channel orders, Preorders & pickup, …). |

## Orders label policy (implemented in terminology)

- Meal prep → **Preorders**  
- Café / restaurant (default nav) → **Orders** (Café explicitly set)  
- Catering → **Events & orders**  
- Bakery → **Preorders & pickup**  
- Ghost kitchen → **Channel orders**  

## Strategic modes without DB enum

Until `COMMISSARY` / `MANUAL_ONLY` exist in Prisma, map them via `STRATEGIC_BUSINESS_MODE_ALIASES` in `business-mode-config.ts` **without migrations**.

## P1 follow-ups

- Per-role default nav scopes (packer sees packing-first landing).  
- Deeper “recommended KPIs” wiring on Today per `getBusinessModeModulePlan().primaryKpis`.
