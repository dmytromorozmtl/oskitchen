# Packing queue generation

## Service

`services/packing/generate-packing-queue.ts`

## Inputs

- `userId`
- `packingDate` (`Date` @ startOfDay)
- `mode` (`PackingCommandMode`)

## Sources (phase 1)

- **Orders** in `CONFIRMED`, `PREPARING`, `READY` for the workspace user.

## Line construction

- One `PackingTask` per **non-duplicate** `OrderItem`.
- Title: `{product.title} · {order.customerName}`.
- `fulfillmentType`, `brandId`, `locationId` copied from order.
- `requiresAllergenCheck` if product allergens string non-empty.
- `requiresNutritionLabel` if product has linked `NutritionProfile`.
- `requiresLabel` if mode default says so **or** nutrition/allergen needs it.

## Future modes (documented intent)

| Mode | Planned extra sources |
|------|-------------------------|
| By production batch | `ProductionBatch` / `ProductionWorkItem` handoff |
| By event | Catering event loadout |
| By selected orders | POST list of order IDs |
| By brand/location | Filter on order |

## Actions

`actions/packing.ts` → `generatePackingQueueAction` revalidates `/dashboard/packing`.
