export type LabelFormat = "FDA" | "EU";

export type NutritionLabelInput = {
  productName: string;
  servingSize?: string;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  sodium?: number | null;
  ingredientsText?: string;
  allergens?: string[];
};

export function renderNutritionLabelText(format: LabelFormat, input: NutritionLabelInput): string {
  const lines: string[] = [];
  if (format === "FDA") {
    lines.push("Nutrition Facts");
    lines.push(`Product: ${input.productName}`);
    if (input.servingSize) lines.push(`Serving size: ${input.servingSize}`);
    lines.push("---");
    if (input.calories != null) lines.push(`Calories ${input.calories}`);
    if (input.protein != null) lines.push(`Protein ${input.protein}g`);
    if (input.carbs != null) lines.push(`Total Carbohydrate ${input.carbs}g`);
    if (input.fat != null) lines.push(`Total Fat ${input.fat}g`);
    if (input.fiber != null) lines.push(`Dietary Fiber ${input.fiber}g`);
    if (input.sodium != null) lines.push(`Sodium ${input.sodium}mg`);
  } else {
    lines.push("Nutrition declaration (EU Reg. 1169/2011)");
    lines.push(`Product: ${input.productName}`);
    if (input.calories != null) lines.push(`Energy: ${input.calories} kcal`);
    if (input.protein != null) lines.push(`Protein: ${input.protein} g`);
    if (input.carbs != null) lines.push(`Carbohydrate: ${input.carbs} g`);
    if (input.fat != null) lines.push(`Fat: ${input.fat} g`);
  }
  if (input.ingredientsText) {
    lines.push("");
    lines.push(`Ingredients: ${input.ingredientsText}`);
  }
  if (input.allergens?.length) {
    lines.push(`Allergens: ${input.allergens.join(", ")}`);
  }
  return lines.join("\n");
}

export function renderNutritionLabelPdfPlaceholder(format: LabelFormat, input: NutritionLabelInput): string {
  return `%PDF-1.4 placeholder\n${renderNutritionLabelText(format, input)}`;
}
