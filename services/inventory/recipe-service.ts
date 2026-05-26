import { prisma } from "@/lib/prisma";
import { recipeListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function listRecipesForUser(userId: string, take = 100) {
  return prisma.recipe.findMany({
    where: { AND: [await recipeListWhereForOwner(userId), { active: true }] },
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      name: true,
      yieldQuantity: true,
      yieldUnit: true,
      productId: true,
      updatedAt: true,
    },
  });
}
