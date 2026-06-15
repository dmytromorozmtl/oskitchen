import type { KitchenSettings, Product } from "@prisma/client";

export type PackingLabelReadiness = {
  ok: boolean;
  warnings: string[];
};

/**
 * Optional packing-station checks when kitchen settings require verified label data.
 * Does not mutate orders — callers show warnings or block UI if desired.
 */
export function evaluatePackingLabelReadiness(
  product: Pick<
    Product,
    "allergens" | "ingredients"
  > & {
    nutritionProfile?: {
      verificationStatus: string;
    } | null;
    allergenProfile?: { verificationStatus: string } | null;
    ingredientDeclaration?: { verificationStatus: string } | null;
  },
  kitchen: Pick<KitchenSettings, "blockPackingWithoutVerifiedAllergen" | "blockPackingWithoutVerifiedNutrition"> | null,
): PackingLabelReadiness {
  const warnings: string[] = [];
  if (!kitchen) return { ok: true, warnings };

  if (kitchen.blockPackingWithoutVerifiedNutrition) {
    const st = product.nutritionProfile?.verificationStatus;
    if (!product.nutritionProfile) warnings.push("Nutrition profile missing for this item.");
    else if (st !== "VERIFIED") warnings.push("Nutrition profile is not verified.");
  }

  if (kitchen.blockPackingWithoutVerifiedAllergen) {
    const st = product.allergenProfile?.verificationStatus;
    if (!product.allergenProfile && !product.allergens?.trim()) warnings.push("Allergen data missing for this item.");
    else if (product.allergenProfile && st !== "VERIFIED") warnings.push("Allergen profile is not verified.");
  }

  return { ok: warnings.length === 0, warnings };
}
