import type { LabelVerificationStatus } from "@prisma/client";

export type StorefrontLabelVisibility = {
  publicShowNutritionWhenUnverified: boolean;
  publicShowAllergensWhenUnverified: boolean;
  publicShowIngredientsWhenUnverified: boolean;
};

export function isVerified(status: LabelVerificationStatus | null | undefined): boolean {
  return status === "VERIFIED";
}

export function allowPublicNutrition(
  visibility: StorefrontLabelVisibility,
  nutritionVerification: LabelVerificationStatus | null | undefined,
): boolean {
  if (isVerified(nutritionVerification)) return true;
  return visibility.publicShowNutritionWhenUnverified;
}

export function allowPublicStructuredAllergens(
  visibility: StorefrontLabelVisibility,
  allergenVerification: LabelVerificationStatus | null | undefined,
): boolean {
  if (isVerified(allergenVerification)) return true;
  return visibility.publicShowAllergensWhenUnverified;
}

export function allowPublicIngredients(
  visibility: StorefrontLabelVisibility,
  ingredientVerification: LabelVerificationStatus | null | undefined,
): boolean {
  if (isVerified(ingredientVerification)) return true;
  return visibility.publicShowIngredientsWhenUnverified;
}
