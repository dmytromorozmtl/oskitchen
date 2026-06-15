/**
 * Pure helpers for allergen tracking (Blueprint P2-101).
 */

import {
  displayAllergenKey,
  STANDARD_ALLERGEN_KEYS,
  type StandardAllergenKey,
} from "@/lib/nutrition/allergen-registry";

export type RegulatoryAllergenRow = {
  key: StandardAllergenKey;
  label: string;
  regulatoryNote: string;
};

export type RecipeAllergenRollup = {
  recipeId: string;
  recipeName: string;
  productId: string;
  productName: string;
  ingredientCount: number;
  rolledUpAllergens: string[];
  verificationStatus: string;
  containsStatement: string;
};

export type InventoryAllergenLink = {
  ingredientId: string;
  ingredientName: string;
  category: string | null;
  allergenKeys: string[];
  linkedRecipes: string[];
};

export type AllergenTrackingReport = {
  registryCount: number;
  recipeRollupCount: number;
  inventoryLinkCount: number;
  unverifiedRecipeCount: number;
  regulatoryRegistry: RegulatoryAllergenRow[];
  recipeRollups: RecipeAllergenRollup[];
  inventoryLinks: InventoryAllergenLink[];
};

const REGULATORY_NOTES: Partial<Record<StandardAllergenKey, string>> = {
  milk: "Major allergen — FDA Big 9 / EU Annex II",
  eggs: "Major allergen — FDA Big 9 / EU Annex II",
  fish: "Major allergen — FDA Big 9 / EU Annex II",
  shellfish: "Major allergen — FDA Big 9 / EU Annex II",
  tree_nuts: "Major allergen — FDA Big 9 / EU Annex II",
  peanuts: "Major allergen — FDA Big 9 / EU Annex II",
  wheat: "Major allergen — FDA Big 9 / EU Annex II",
  soy: "Major allergen — FDA Big 9 / EU Annex II",
  sesame: "Major allergen — FDA FASTER Act / EU Annex II",
  gluten: "Celiac / gluten-free labeling — verify jurisdiction",
};

export function buildRegulatoryAllergenRegistry(): RegulatoryAllergenRow[] {
  return STANDARD_ALLERGEN_KEYS.map((key) => ({
    key,
    label: displayAllergenKey(key),
    regulatoryNote: REGULATORY_NOTES[key] ?? "Verify local declaration requirements",
  }));
}

export function rollUpRecipeAllergens(input: {
  recipeId: string;
  recipeName: string;
  productId: string;
  productName: string;
  ingredientAllergens: ReadonlyArray<readonly string[]>;
  profileAllergens?: readonly string[];
  verificationStatus?: string;
}): RecipeAllergenRollup {
  const fromIngredients = input.ingredientAllergens.flat();
  const fromProfile = input.profileAllergens ?? [];
  const rolledUpAllergens = [...new Set([...fromIngredients, ...fromProfile])].sort();

  return {
    recipeId: input.recipeId,
    recipeName: input.recipeName,
    productId: input.productId,
    productName: input.productName,
    ingredientCount: input.ingredientAllergens.length,
    rolledUpAllergens,
    verificationStatus: input.verificationStatus ?? "NOT_STARTED",
    containsStatement:
      rolledUpAllergens.length > 0
        ? `Contains: ${rolledUpAllergens.map(displayAllergenKey).join(", ")}`
        : "No declared allergens",
  };
}

export function linkInventoryIngredientAllergens(
  ingredients: Array<{
    ingredientId: string;
    ingredientName: string;
    category: string | null;
    allergenKeys: readonly string[];
    linkedRecipes: readonly string[];
  }>,
): InventoryAllergenLink[] {
  return ingredients
    .map((row) => ({
      ingredientId: row.ingredientId,
      ingredientName: row.ingredientName,
      category: row.category,
      allergenKeys: [...row.allergenKeys].sort(),
      linkedRecipes: [...row.linkedRecipes],
    }))
    .sort((a, b) => b.allergenKeys.length - a.allergenKeys.length);
}

export function buildAllergenTrackingReport(input: {
  recipeRollups: RecipeAllergenRollup[];
  inventoryLinks: InventoryAllergenLink[];
}): AllergenTrackingReport {
  const regulatoryRegistry = buildRegulatoryAllergenRegistry();
  const unverifiedRecipeCount = input.recipeRollups.filter(
    (row) => row.verificationStatus !== "VERIFIED",
  ).length;

  return {
    registryCount: regulatoryRegistry.length,
    recipeRollupCount: input.recipeRollups.length,
    inventoryLinkCount: input.inventoryLinks.length,
    unverifiedRecipeCount,
    regulatoryRegistry,
    recipeRollups: input.recipeRollups,
    inventoryLinks: input.inventoryLinks,
  };
}

/** Demo fixture — deterministic allergen tracking without DB. */
export const ALLERGEN_TRACKING_DEMO_INVENTORY = [
  {
    ingredientId: "ing-flour",
    ingredientName: "All-purpose flour",
    category: "Dry goods",
    allergenKeys: ["wheat", "gluten"],
    linkedRecipes: ["Margherita flatbread", "House burger bun"],
  },
  {
    ingredientId: "ing-mozzarella",
    ingredientName: "Mozzarella",
    category: "Dairy",
    allergenKeys: ["milk"],
    linkedRecipes: ["Margherita flatbread"],
  },
  {
    ingredientId: "ing-peanut-oil",
    ingredientName: "Peanut oil",
    category: "Oils",
    allergenKeys: ["peanuts"],
    linkedRecipes: ["Thai peanut bowl"],
  },
  {
    ingredientId: "ing-shrimp",
    ingredientName: "Shrimp",
    category: "Protein",
    allergenKeys: ["shellfish"],
    linkedRecipes: ["Garlic shrimp pasta"],
  },
] as const;

export const ALLERGEN_TRACKING_DEMO_RECIPES = [
  {
    recipeId: "recipe-margherita",
    recipeName: "Margherita flatbread",
    productId: "prod-margherita",
    productName: "Margherita flatbread",
    ingredientAllergens: [["wheat", "gluten"], ["milk"]],
    profileAllergens: ["wheat", "milk"],
    verificationStatus: "NEEDS_REVIEW",
  },
  {
    recipeId: "recipe-thai",
    recipeName: "Thai peanut bowl",
    productId: "prod-thai",
    productName: "Thai peanut bowl",
    ingredientAllergens: [["peanuts"], ["soy"]],
    verificationStatus: "NOT_STARTED",
  },
] as const;

export function buildAllergenTrackingDemoReport(): AllergenTrackingReport {
  const inventoryLinks = linkInventoryIngredientAllergens([...ALLERGEN_TRACKING_DEMO_INVENTORY]);
  const recipeRollups = ALLERGEN_TRACKING_DEMO_RECIPES.map((recipe) =>
    rollUpRecipeAllergens(recipe),
  );

  return buildAllergenTrackingReport({ recipeRollups, inventoryLinks });
}
