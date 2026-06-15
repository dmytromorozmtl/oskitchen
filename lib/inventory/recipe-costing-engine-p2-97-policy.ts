/**
 * Blueprint P2-97 — Recipe costing engine (ingredient cost, yield, waste, portion cost, margin).
 *
 * @see docs/recipe-costing-engine.md
 * @see app/dashboard/costing/recipe-engine/page.tsx
 */

export const RECIPE_COSTING_ENGINE_P2_97_POLICY_ID = "recipe-costing-engine-p2-97-v1" as const;

export const RECIPE_COSTING_ENGINE_P2_97_DOC = "docs/recipe-costing-engine.md" as const;

export const RECIPE_COSTING_ENGINE_P2_97_LEGACY_POLICY = "lib/costing/costing-calculations.ts" as const;

export const RECIPE_COSTING_ENGINE_P2_97_CONTENT_PATH =
  "lib/inventory/recipe-costing-engine-p2-97-content.ts" as const;

export const RECIPE_COSTING_ENGINE_P2_97_OPERATIONS_PATH =
  "lib/inventory/recipe-costing-engine-p2-97-operations.ts" as const;

export const RECIPE_COSTING_ENGINE_P2_97_SERVICE_PATH =
  "services/inventory/recipe-costing-engine-p2-97-service.ts" as const;

export const RECIPE_COSTING_ENGINE_P2_97_COMPONENT =
  "components/inventory/recipe-costing-engine-panel.tsx" as const;

export const RECIPE_COSTING_ENGINE_P2_97_PAGE = "app/dashboard/costing/recipe-engine/page.tsx" as const;

export const RECIPE_COSTING_ENGINE_P2_97_ROUTE = "/dashboard/costing/recipe-engine" as const;

export const RECIPE_COSTING_ENGINE_P2_97_COSTING_ROUTE = "/dashboard/costing" as const;

export const RECIPE_COSTING_ENGINE_P2_97_CAPABILITY_COUNT = 5 as const;

export const RECIPE_COSTING_ENGINE_P2_97_TEST_IDS = [
  "recipe-costing-engine",
  "recipe-costing-ingredient-cost",
  "recipe-costing-yield",
  "recipe-costing-waste",
  "recipe-costing-portion-cost",
  "recipe-costing-margin-by-item",
] as const;

export const RECIPE_COSTING_ENGINE_P2_97_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "operational estimate",
] as const;

export const RECIPE_COSTING_ENGINE_P2_97_AUDIT_SCRIPT =
  "scripts/audit-recipe-costing-engine-p2-97.ts" as const;

export const RECIPE_COSTING_ENGINE_P2_97_NPM_SCRIPT = "audit:recipe-costing-engine-p2-97" as const;

export const RECIPE_COSTING_ENGINE_P2_97_UNIT_TEST =
  "tests/unit/recipe-costing-engine-p2-97.test.ts" as const;

export const RECIPE_COSTING_ENGINE_P2_97_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const RECIPE_COSTING_ENGINE_P2_97_WIRING_PATHS = [
  RECIPE_COSTING_ENGINE_P2_97_DOC,
  RECIPE_COSTING_ENGINE_P2_97_CONTENT_PATH,
  RECIPE_COSTING_ENGINE_P2_97_OPERATIONS_PATH,
  RECIPE_COSTING_ENGINE_P2_97_SERVICE_PATH,
  RECIPE_COSTING_ENGINE_P2_97_COMPONENT,
  RECIPE_COSTING_ENGINE_P2_97_PAGE,
  "lib/inventory/recipe-costing-engine-p2-97-policy.ts",
  "lib/inventory/recipe-costing-engine-p2-97-audit.ts",
  "lib/costing/costing-calculations.ts",
  "services/costing/costing-service.ts",
  RECIPE_COSTING_ENGINE_P2_97_UNIT_TEST,
  RECIPE_COSTING_ENGINE_P2_97_LEGACY_POLICY,
] as const;
