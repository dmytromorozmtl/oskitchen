import { prisma } from "@/lib/prisma";
import {
  ingredientDemandRunListWhereForOwner,
  inventoryStockListWhereForOwner,
  recipeListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import type { ShortageReadinessLevel } from "@/lib/inventory/shortage-confidence";
import { describeShortageReadiness } from "@/lib/inventory/shortage-confidence";

export type InventoryShortageReadiness = {
  level: ShortageReadinessLevel;
  summary: string;
  recipeCount: number;
  ingredientsWithStockRows: number;
  demandRuns: number;
};

/**
 * Readiness only — never emits order blockers. Used by Today / integrity messaging.
 */
export async function evaluateInventoryShortageReadiness(userId: string): Promise<InventoryShortageReadiness> {
  const [recipeScope, stockScope, demandScope] = await Promise.all([
    recipeListWhereForOwner(userId),
    inventoryStockListWhereForOwner(userId),
    ingredientDemandRunListWhereForOwner(userId),
  ]);
  const [recipeCount, stockRows, demandRuns] = await Promise.all([
    prisma.recipe.count({ where: { AND: [recipeScope, { active: true }] } }),
    prisma.inventoryStock.count({ where: stockScope }),
    prisma.ingredientDemandRun.count({ where: demandScope }),
  ]);

  let level: ShortageReadinessLevel = "NOT_CONFIGURED";
  if (recipeCount > 0 && stockRows > 0 && demandRuns > 0) level = "READY";
  else if (recipeCount > 0 || stockRows > 0 || demandRuns > 0) level = "PARTIAL";

  return {
    level,
    summary: describeShortageReadiness(level),
    recipeCount,
    ingredientsWithStockRows: stockRows,
    demandRuns,
  };
}
