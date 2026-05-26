/** Heuristics for packing safety flags — business must still verify data. */

export function shouldRequireAllergenCheck(allergens: string | null | undefined): boolean {
  return Boolean(allergens?.trim());
}

export function shouldRequireNutritionLabel(_productHasNutritionProfile: boolean): boolean {
  // Conservative default: only when nutrition profile exists (caller passes flag).
  return _productHasNutritionProfile;
}
