# Demand calculation engine

## Formula

For each contribution (order line or production work item quantity, already scaled by source confidence):

\[
\text{portions} = \frac{\text{qty}}{\text{recipe.yieldQuantity}}
\]

For each recipe ingredient line:

\[
\text{base} = \text{ri.quantity} \times \text{portions} \times (1 + \text{ri.waste%}/100) \times (1 + \text{buffer%}/100)
\]

`buffer%` resolves from `ingredientWasteBufferPercentById[ingredient]` or `globalWasteBufferPercent`.

Then `convertIngredientQuantity(base, ri.unit, ingredient.unit, ingredient.conversionJson)`.

## Failure modes

- **Missing recipe / inactive / no lines** → `missingRecipes` signals.
- **Conversion failure** → warning `CONVERSION_REQUIRED`, row marked `conversionRequired`, requirement expressed in recipe unit, shortage not computed vs storage stock.
- **Mixed convertible + blocked lines for same ingredient-day** → warning `CONVERSION_ROLLUP_SPLIT`, rollup switches to recipe-unit safety path.

## Batch rounding

Applied after rollup via `waste-buffer.applyBatchRounding` (`none` | `ceil` | `floor`).
