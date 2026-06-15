import {
  RECIPE_COSTING_ENGINE_P2_97_CAPABILITY_COUNT,
  RECIPE_COSTING_ENGINE_P2_97_COSTING_ROUTE,
  RECIPE_COSTING_ENGINE_P2_97_ROUTE,
} from "@/lib/inventory/recipe-costing-engine-p2-97-policy";

export const RECIPE_COSTING_ENGINE_P2_97_EYEBROW =
  "Recipe costing engine · yield & margin" as const;

export const RECIPE_COSTING_ENGINE_P2_97_HEADLINE =
  "Ingredient cost, yield, waste, portion cost, and margin by item" as const;

export const RECIPE_COSTING_ENGINE_P2_97_SUBLINE =
  "Five costing dimensions per recipe — rolls ingredient cards through yield and waste factors to portion cost and menu margin. BETA: verify with invoices — typical operational estimate, not certified financial audit." as const;

export const RECIPE_COSTING_ENGINE_P2_97_CAPABILITIES = [
  {
    id: "ingredient-cost",
    label: "Ingredient cost",
    description: "Per-line ingredient cost from card or supplier price history, rolled to output unit.",
    module: "lib/inventory/recipe-costing-engine-p2-97-operations.ts",
    route: RECIPE_COSTING_ENGINE_P2_97_ROUTE,
  },
  {
    id: "yield",
    label: "Yield",
    description: "Recipe yield quantity divides batch cost into per-portion ingredient and labor cost.",
    module: "lib/costing/costing-calculations.ts",
    route: RECIPE_COSTING_ENGINE_P2_97_ROUTE,
  },
  {
    id: "waste",
    label: "Waste",
    description: "Waste % per ingredient line inflates usable quantity — trim, spoilage, prep loss.",
    module: "lib/inventory/recipe-costing-engine-p2-97-operations.ts",
    route: RECIPE_COSTING_ENGINE_P2_97_ROUTE,
  },
  {
    id: "portion-cost",
    label: "Portion cost",
    description: "Prime cost per portion — ingredients + labor + packaging after yield allocation.",
    module: "lib/inventory/recipe-costing-engine-p2-97-operations.ts",
    route: RECIPE_COSTING_ENGINE_P2_97_ROUTE,
  },
  {
    id: "margin-by-item",
    label: "Margin by item",
    description: "Gross margin % per menu item — sale price minus total cost from latest costing run.",
    module: "services/costing/costing-service.ts",
    route: RECIPE_COSTING_ENGINE_P2_97_COSTING_ROUTE,
  },
] as const;

export const RECIPE_COSTING_ENGINE_P2_97_OPERATOR_LINKS = [
  { label: "Costing overview", href: RECIPE_COSTING_ENGINE_P2_97_COSTING_ROUTE },
  { label: "Missing recipes", href: "/dashboard/costing/recipes-missing" },
  { label: "Profit dashboard", href: "/dashboard/today/profit" },
] as const;

export { RECIPE_COSTING_ENGINE_P2_97_CAPABILITY_COUNT, RECIPE_COSTING_ENGINE_P2_97_ROUTE };
