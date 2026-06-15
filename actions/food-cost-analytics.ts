"use server";

import { recomputeMargin } from "@/lib/ai/food-cost-builders";

export async function foodCostWhatIfAction(input: {
  salePrice: number;
  ingredientCost: number;
  laborCost: number;
  packagingCost?: number;
  platformFee?: number;
}) {
  const packaging = input.packagingCost ?? 0;
  const platform = input.platformFee ?? 0;
  const totalCost = input.ingredientCost + input.laborCost + packaging + platform;

  return recomputeMargin({
    salePrice: input.salePrice,
    ingredientCost: input.ingredientCost,
    totalCost,
  });
}
