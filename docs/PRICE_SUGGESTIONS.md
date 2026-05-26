# Price suggestions

`lib/costing/price-suggestions.ts` — `suggestPriceFromTargetMargin`:

- Inputs: stacked **fixed** costs, **target gross margin % (0–100)**, rounding style, minimum price, and **effective fee rate on revenue** (platform % + card %).  
- Output: rounded **list price estimate** or `null` if mathematically infeasible.

Rounding modes: none (ceil cents), nearest nickel, psychological `.99`.

This is **not** dynamic pricing, competitive pricing, or regulated menu advice.
