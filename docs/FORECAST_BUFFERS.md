# Forecast buffers

Buffers convert a forecast quantity into a **recommended production
quantity** by adding safety units. Buffers are deterministic and
operator-facing.

## Resolution order

1. Run-level `bufferPercent` (set in the wizard).
2. Business-mode default (`lib/forecast/forecast-buffers.ts:bufferDefaultForMode`).
3. Global `DEFAULT_BUFFER_PERCENT = 10`.

## Defaults per mode

| Mode | Default |
|------|---------|
| Bakery | 12% |
| Bar | 8% |
| Catering | 15% |
| Meal Prep | 10% |
| Restaurant / Café | 8% |
| Ghost / Multi-Brand | 12% |
| Other | 10% |

## Formula

`bufferQuantity = ceil(quantity × bufferPercent / 100)`. We always
round **up** so the recommended quantity is at least the projected
demand. `recommendedQuantity = forecastQuantity + bufferQuantity`.

## Future buffer rules

`BufferRule` type in `lib/forecast/forecast-buffers.ts` is designed to
support `scope ∈ {"global","category","product","high_risk","catering","bakery","bar"}`.
The data model already carries everything needed (run-level percent +
per-line source summary), so layering per-product overrides will not
require schema changes.

## Bakery batch rounding

`roundUpUnit(quantity, unitSize)` exists so bakery flows can round up
to batch sizes once preorder-driven planning is wired in.
