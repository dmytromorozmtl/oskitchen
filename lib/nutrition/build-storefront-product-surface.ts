import type { LabelVerificationStatus } from "@prisma/client";

import { displayAllergenKey } from "@/lib/nutrition/allergen-registry";
import {
  allowPublicIngredients,
  allowPublicNutrition,
  allowPublicStructuredAllergens,
  type StorefrontLabelVisibility,
} from "@/lib/nutrition/label-public-display";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function formatAllergenProfile(contains: unknown, mayContain: unknown): string | null {
  const c = asStringArray(contains).map(displayAllergenKey);
  const m = asStringArray(mayContain).map(displayAllergenKey);
  const parts: string[] = [];
  if (c.length) parts.push(`Contains: ${c.join(", ")}`);
  if (m.length) parts.push(`May contain: ${m.join(", ")}`);
  return parts.length ? parts.join(" · ") : null;
}

export function buildStorefrontProductSurface(input: {
  product: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    preparedDate: string;
    image: string | null;
    allergens: string | null;
    ingredients: string | null;
    reheatingInstructions: string | null;
    nutritionProfile: {
      calories: number | null;
      protein: unknown;
      carbs: unknown;
      fat: unknown;
      sodium: unknown;
      servingSize: string | null;
      verificationStatus: LabelVerificationStatus;
    } | null;
    allergenProfile: {
      containsJson: unknown;
      mayContainJson: unknown;
      verificationStatus: LabelVerificationStatus;
    } | null;
    ingredientDeclaration: {
      ingredientsText: string;
      verificationStatus: LabelVerificationStatus;
    } | null;
  };
  visibility: StorefrontLabelVisibility;
}): {
  allergens: string | null;
  ingredients: string | null;
  nutrition: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    sodium: number | null;
    servingSize: string | null;
  } | null;
  labelDisclaimer: string | null;
} {
  const { product: p, visibility } = input;

  let allergens: string | null = null;
  if (p.allergenProfile) {
    if (allowPublicStructuredAllergens(visibility, p.allergenProfile.verificationStatus)) {
      allergens = formatAllergenProfile(p.allergenProfile.containsJson, p.allergenProfile.mayContainJson);
    }
  } else if (p.allergens?.trim() && visibility.publicShowAllergensWhenUnverified) {
    allergens = p.allergens;
  }

  let ingredients: string | null = null;
  if (p.ingredientDeclaration) {
    if (allowPublicIngredients(visibility, p.ingredientDeclaration.verificationStatus)) {
      ingredients = p.ingredientDeclaration.ingredientsText;
    }
  } else if (p.ingredients?.trim() && visibility.publicShowIngredientsWhenUnverified) {
    ingredients = p.ingredients;
  }

  let nutrition: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    sodium: number | null;
    servingSize: string | null;
  } | null = null;

  if (p.nutritionProfile && allowPublicNutrition(visibility, p.nutritionProfile.verificationStatus)) {
    const np = p.nutritionProfile;
    nutrition = {
      calories: np.calories,
      protein: np.protein != null ? Number(np.protein as never) : null,
      carbs: np.carbs != null ? Number(np.carbs as never) : null,
      fat: np.fat != null ? Number(np.fat as never) : null,
      sodium: np.sodium != null ? Number(np.sodium as never) : null,
      servingSize: np.servingSize,
    };
  }

  const hiddenPieces: string[] = [];
  if (p.nutritionProfile && !nutrition) hiddenPieces.push("nutrition");
  if (p.allergenProfile && !allergens) hiddenPieces.push("structured allergens");
  if (p.ingredientDeclaration && !ingredients) hiddenPieces.push("verified ingredient list");
  if (!p.allergenProfile && p.allergens?.trim() && !visibility.publicShowAllergensWhenUnverified) {
    hiddenPieces.push("allergens (unverified)");
  }
  if (!p.ingredientDeclaration && p.ingredients?.trim() && !visibility.publicShowIngredientsWhenUnverified) {
    hiddenPieces.push("ingredients (unverified)");
  }

  const labelDisclaimer =
    hiddenPieces.length > 0
      ? "Some label details are hidden until your team verifies them in KitchenOS or enables public display for unverified data in storefront settings."
      : null;

  return { allergens, ingredients, nutrition, labelDisclaimer };
}
