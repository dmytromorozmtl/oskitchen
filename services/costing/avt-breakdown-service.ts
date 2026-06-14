import { prisma } from "@/lib/prisma";
import { ownerScopedAnd, recipeListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

async function ingredientIdsForProduct(userId: string, productId: string): Promise<string[]> {
  const recipe = await prisma.recipe.findFirst({
    where: { AND: [await recipeListWhereForOwner(userId), { productId }] },
    select: {
      ingredients: { select: { ingredientId: true } },
      subRecipes: {
        select: {
          subRecipe: {
            select: { ingredients: { select: { ingredientId: true } } },
          },
        },
      },
    },
  });
  if (!recipe) return [];
  const ids = new Set<string>();
  for (const ri of recipe.ingredients) ids.add(ri.ingredientId);
  for (const sr of recipe.subRecipes) {
    for (const ri of sr.subRecipe.ingredients) ids.add(ri.ingredientId);
  }
  return Array.from(ids);
}

export async function getAvtBreakdown(userId: string, productId: string) {
  const ingredientIds = await ingredientIdsForProduct(userId, productId);
  if (ingredientIds.length === 0) {
    return { productId, breakdown: [] as Array<{ reason: string; cost: number }> };
  }

  const wasteByReason = await prisma.wasteEvent.groupBy({
    by: ["reason"],
    where: await ownerScopedAnd(userId, { ingredientId: { in: ingredientIds } }),
    _sum: { cost: true },
  });

  return {
    productId,
    breakdown: wasteByReason.map((w) => ({
      reason: w.reason,
      cost: Number(w._sum.cost ?? 0),
    })),
  };
}
