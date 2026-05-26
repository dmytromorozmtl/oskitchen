# Packing mode architecture

Canonical definitions live in:

- `lib/packing/packing-modes.ts` — enum list, default mode per `BusinessType`, empty-state copy, default label requirement heuristic.
- `lib/packing/packing-terminology.ts` — page title by business type.
- `lib/packing/packing-status.ts` — human-readable task statuses.
- `lib/packing/packing-grouping.ts` — order grouping helpers.
- `lib/packing/label-types.ts` — logical label type constants (non-DB).
- `lib/packing/packing-validation.ts` — allergen / nutrition requirement hints.

## Modes (`PackingCommandMode`)

| Mode | Intent |
|------|--------|
| `MEAL_PREP_PACKING` | Customer × prepared date × route; nutrition likely |
| `TAKEOUT_PACKING` | Speed, order-centric |
| `DELIVERY_PACKING` | Route + manifest |
| `PICKUP_PACKING` | Counter / shelf |
| `CATERING_PACKING` | Event / tray / manifest |
| `EVENT_LOADOUT` | Bar / venue supplies (no alcohol legal claims) |
| `BAKERY_PICKUP` | Slots + allergen labels |
| `CAFE_PICKUP` | Pickup + specials |
| `GHOST_KITCHEN_PACKING` | Brand / channel |
| `ROUTE_HANDOFF` | Driver manifest |

**Note:** Modes influence **defaults** (e.g. label flags) in the generator; the UI allows overriding mode via query `?mode=`.

## Exports per mode

All modes retain the same **Exports** tab (PDF/CSV). Future: gate export types by mode in `generate-packing-queue` metadata.
