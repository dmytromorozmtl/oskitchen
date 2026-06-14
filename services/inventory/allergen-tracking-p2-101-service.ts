import {
  buildAllergenTrackingDemoReport,
  buildAllergenTrackingReport,
  linkInventoryIngredientAllergens,
  rollUpRecipeAllergens,
  type AllergenTrackingReport,
} from "@/lib/inventory/allergen-tracking-p2-101-operations";
import { ALLERGEN_TRACKING_P2_101_POLICY_ID } from "@/lib/inventory/allergen-tracking-p2-101-policy";
import { listMenuAllergenSummary } from "@/services/allergen/allergen-service";

export type AllergenTrackingSnapshot = AllergenTrackingReport & {
  policyId: typeof ALLERGEN_TRACKING_P2_101_POLICY_ID;
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadAllergenTrackingSnapshot(
  userId: string,
): Promise<AllergenTrackingSnapshot> {
  try {
    const menuSummary = await listMenuAllergenSummary(userId);

    if (menuSummary.length > 0) {
      const recipeRollups = menuSummary
        .filter((row) => row.recipeId)
        .map((row) =>
          rollUpRecipeAllergens({
            recipeId: row.recipeId!,
            recipeName: row.productName,
            productId: row.productId,
            productName: row.productName,
            ingredientAllergens: [row.allergens],
            profileAllergens: row.allergens,
            verificationStatus: row.verificationStatus,
          }),
        );

      const inventoryLinks = linkInventoryIngredientAllergens(
        menuSummary.flatMap((row) =>
          row.allergens.map((allergen) => ({
            ingredientId: `${row.productId}-${allergen}`,
            ingredientName: `${row.productName} (${allergen})`,
            category: "Menu-derived",
            allergenKeys: [allergen],
            linkedRecipes: [row.productName],
          })),
        ),
      );

      const report = buildAllergenTrackingReport({ recipeRollups, inventoryLinks });

      return {
        policyId: ALLERGEN_TRACKING_P2_101_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
        ...report,
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildAllergenTrackingDemoReport();

  return {
    policyId: ALLERGEN_TRACKING_P2_101_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
    ...report,
  };
}
