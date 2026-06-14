import { recordAuditLog } from "@/lib/audit-log";
import { computeRecipeIngredientDepletion } from "@/lib/inventory/recipe-depletion-math";
import { prisma } from "@/lib/prisma";
import {
  ingredientListWhereForOwner,
  recipeListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export type PosRecipeDepletionLine = {
  ingredientId: string;
  quantity: number;
};

/** Apply recipe-based stock decrement for one POS line when a recipe is configured. */
export async function applyRecipeDepletionForPosLine(
  userId: string,
  workspaceId: string | null,
  impactEventId: string,
  productId: string,
  soldQuantity: number,
): Promise<"applied" | "pending"> {
  const recipe = await prisma.recipe.findFirst({
    where: {
      AND: [await recipeListWhereForOwner(userId), { productId, active: true }],
    },
    include: {
      ingredients: {
        select: {
          ingredientId: true,
          quantity: true,
          wastePercent: true,
        },
      },
    },
  });

  if (!recipe || recipe.ingredients.length === 0) {
    return "pending";
  }

  const yieldQty = Number(recipe.yieldQuantity);
  const lines: PosRecipeDepletionLine[] = recipe.ingredients.map((row) => ({
    ingredientId: row.ingredientId,
    quantity: computeRecipeIngredientDepletion({
      soldQuantity: Number(soldQuantity),
      recipeYieldQuantity: yieldQty,
      ingredientQuantity: Number(row.quantity),
      wastePercent: Number(row.wastePercent),
    }),
  }));

  const ingredientScope = await ingredientListWhereForOwner(userId);
  const appliedLines: PosRecipeDepletionLine[] = [];

  await prisma.$transaction(async (tx) => {
    for (const line of lines) {
      if (line.quantity <= 0) continue;
      const updated = await tx.ingredient.updateMany({
        where: { AND: [ingredientScope, { id: line.ingredientId }] },
        data: { currentStock: { decrement: line.quantity } },
      });
      if (updated.count > 0) {
        appliedLines.push(line);
      }
    }

    await tx.posInventoryImpactEvent.update({
      where: { id: impactEventId },
      data: {
        status: appliedLines.length > 0 ? "APPLIED" : "PENDING_CONFIGURATION",
        note:
          appliedLines.length > 0
            ? `Recipe "${recipe.name}" depletion applied for ${Number(soldQuantity)} sold unit(s).`
            : "Recipe exists but no ingredient stock rows were updated (check ingredient scope).",
      },
    });
  });

  if (appliedLines.length === 0) {
    return "pending";
  }

  await recordAuditLog({
    userId,
    workspaceId,
    action: "inventory.pos_depletion_applied",
    entityType: "PosInventoryImpactEvent",
    entityId: impactEventId,
    metadata: {
      productId,
      recipeId: recipe.id,
      soldQuantity: Number(soldQuantity),
      lines: appliedLines,
    },
  });

  return "applied";
}
