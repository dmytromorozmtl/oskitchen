# Pricing scenarios

`PriceScenario` stores `scenarioJson` (inputs) and optional `resultJson` (outputs).

`lib/costing/scenarios.ts` implements `evaluatePricingScenario` for numeric what-if:

- Cost deltas (% on ingredient, labor, packaging).  
- Discount % on sale.  
- Optional target margin → suggested price (algebraic solve with fee stack).

**Limitation:** Saved scenarios in the UI currently record JSON; wiring “replay against latest baseline line” is the next increment.
