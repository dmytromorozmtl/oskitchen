import {
  ALLERGEN_TRACKING_P2_101_CAPABILITY_COUNT,
  ALLERGEN_TRACKING_P2_101_PROFILES_ROUTE,
  ALLERGEN_TRACKING_P2_101_ROUTE,
} from "@/lib/inventory/allergen-tracking-p2-101-policy";

export const ALLERGEN_TRACKING_P2_101_EYEBROW =
  "Allergen tracking · regulatory + recipe + inventory" as const;

export const ALLERGEN_TRACKING_P2_101_HEADLINE =
  "Regulatory allergen registry, recipe rollup, and inventory ingredient linkage" as const;

export const ALLERGEN_TRACKING_P2_101_SUBLINE =
  "Three allergen dimensions — canonical registry keys, recipe ingredient rollup to menu items, and inventory ingredient allergen tags. BETA: verify declarations with local jurisdiction — operators must confirm legal labels, not certified regulatory audit." as const;

export const ALLERGEN_TRACKING_P2_101_CAPABILITIES = [
  {
    id: "regulatory-registry",
    label: "Regulatory registry",
    description: "14 canonical allergen keys — milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soy, sesame, and more.",
    module: "lib/nutrition/allergen-registry.ts",
    route: ALLERGEN_TRACKING_P2_101_ROUTE,
  },
  {
    id: "recipe-rollup",
    label: "Recipe rollup",
    description: "Roll up ingredient allergen tags through recipe lines to product allergen profiles.",
    module: "services/allergen/allergen-service.ts",
    route: ALLERGEN_TRACKING_P2_101_PROFILES_ROUTE,
  },
  {
    id: "inventory-linkage",
    label: "Inventory linkage",
    description: "Map inventory ingredients to allergen keys for prep, receiving, and KDS warnings.",
    module: "lib/inventory/allergen-tracking-p2-101-operations.ts",
    route: ALLERGEN_TRACKING_P2_101_ROUTE,
  },
] as const;

export const ALLERGEN_TRACKING_P2_101_OPERATOR_LINKS = [
  { label: "Menu allergen profiles", href: ALLERGEN_TRACKING_P2_101_PROFILES_ROUTE },
  { label: "Packing verification", href: "/dashboard/kitchen/packing-verification" },
  { label: "Nutrition docs", href: "/docs/ALLERGEN_REGISTRY.md" },
] as const;

export { ALLERGEN_TRACKING_P2_101_CAPABILITY_COUNT, ALLERGEN_TRACKING_P2_101_ROUTE };
