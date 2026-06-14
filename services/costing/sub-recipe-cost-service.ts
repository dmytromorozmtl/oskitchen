import { prisma } from "@/lib/prisma";

export async function calculateRecipeCostRecursive(
  userId: string,
  recipeId: string,
  visited = new Set<string>(),
): Promise<number> {
  if (visited.has(recipeId)) return 0;
  visited.add(recipeId);

  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, userId },
    include: {
      ingredients: {
        include: { ingredient: { select: { costPerUnit: true } } },
      },
      subRecipes: { select: { subRecipeId: true, quantity: true } },
    },
  });
  if (!recipe) return 0;

  let total = Number(recipe.packagingCost);
  for (const ri of recipe.ingredients) {
    const yieldFactor = 1 + Number(ri.wastePercent) / 100;
    const unitCost = Number(ri.ingredient.costPerUnit ?? 0);
    total += Number(ri.quantity) * unitCost * yieldFactor;
  }
  for (const sr of recipe.subRecipes) {
    const subCost = await calculateRecipeCostRecursive(userId, sr.subRecipeId, visited);
    total += subCost * Number(sr.quantity);
  }
  return Math.round(total * 100) / 100;
}

export async function listRecipeSubRecipes(userId: string, recipeId: string) {
  return prisma.recipeSubRecipe.findMany({
    where: { recipe: { id: recipeId, userId } },
    include: { subRecipe: { select: { id: true, name: true, product: { select: { title: true } } } } },
  });
}
