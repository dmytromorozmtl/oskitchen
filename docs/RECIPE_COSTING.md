# Recipe costing & margin

## What it does

Links **Recipes** and **Ingredients** to menu items, computes ingredient cost per portion (with waste %), allocates labor minutes at a default labor rate, spreads packaging cost across yield, compares to `Product.price`, stores **`CostSnapshot`** history, and surfaces sub-60% margin warnings on `/dashboard/costing`.

## Setup

1. Create `Ingredient` rows (via Prisma Studio or future bulk UI) with believable `costPerUnit` and `currentStock`.
2. Attach a `Recipe` per product with yield, minutes, packaging, and ingredient lines.
3. Dashboard → **Costing** → **Recalculate from recipes**.

## Limitations

- Labor rate is a **fixed default constant** in code — replace with hourly settings later.
- Snapshots append unconstrained; archive pruning is manual.

## Future improvements

- Price sensitivity sliders (“tomatoes +10%”).
- CSV costing workbook export.
- Target margin auto-pricing suggestions.
