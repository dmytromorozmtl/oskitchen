# Ingredient demand architecture

## Layers

1. **Sources** (`lib/ingredient-demand/demand-sources.ts`) — catalog of demand sources, labels, default confidence, business-type hints.
2. **Settings** (`lib/ingredient-demand/settings.ts`) — JSON merge, defaults, DB load from `kitchen_settings.ingredient_demand_settings_json`.
3. **Contributions** (`lib/ingredient-demand/demand-calculation.ts`) — normalize orders + production work into `{ productId, quantity, dateKey, source, … }`.
4. **Rollup** (`rollupDemandFromContributions`) — recipes × yield × line waste × global/per-ingredient buffer × unit conversion.
5. **Presentation** (`services/ingredient-demand/demand-service.ts`) — Prisma IO, stock map, brand discovery, warnings for stub sources.
6. **UI** (`components/dashboard/ingredient-demand-command-center.tsx`) — tabs, KPIs, CSV, run workflow.
7. **Persistence** (`persistIngredientDemandRun`) — `IngredientDemandRun` + lines for audit / compare / purchasing handoff.

## Key files

| Path | Role |
|------|------|
| `lib/ingredient-demand/demand-calculation.ts` | Math + contribution builders |
| `lib/ingredient-demand/unit-conversion.ts` | Safe conversions, explicit JSON ratios |
| `lib/ingredient-demand/waste-buffer.ts` | Buffer + batch rounding |
| `lib/ingredient-demand/demand-grouping.ts` | Supplier + shortage views |
| `services/ingredient-demand/demand-service.ts` | Orchestration + Prisma |
| `app/dashboard/inventory/demand/actions.ts` | Server actions (save settings, run) |

## Non-goals (this iteration)

- Automated PO creation.
- Density-based mass↔volume without explicit ingredient JSON.
- Full workspace RBAC matrix (superadmin bypass remains in platform libs).
