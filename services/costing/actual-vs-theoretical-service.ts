import { prisma } from "@/lib/prisma";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import {
  purchaseOrderListWhereForOwner,
  recipeListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export type AvtConfidence = "HIGH" | "MEDIUM" | "LOW";

export type ActualVsTheoreticalSummary = {
  confidence: AvtConfidence;
  recipeCount: number;
  receivingEventCount: number;
  completedOrderLinesApprox: number;
  explanation: string;
};

/**
 * Honest Actual vs Theoretical signal — does not invent inventory precision.
 * HIGH only when both recipe coverage and receiving history exist for the workspace.
 */
export async function summarizeActualVsTheoretical(userId: string): Promise<ActualVsTheoreticalSummary> {
  const [recipeScope, purchaseOrderScope, orderScope] = await Promise.all([
    recipeListWhereForOwner(userId),
    purchaseOrderListWhereForOwner(userId),
    orderListWhereForOwner(userId),
  ]);
  const [recipeCount, receivingEventCount, lineCount] = await Promise.all([
    prisma.recipe.count({ where: { AND: [recipeScope, { active: true }] } }),
    prisma.receivingEvent.count({ where: { purchaseOrder: purchaseOrderScope } }),
    prisma.orderItem.count({
      where: { order: { AND: [orderScope, { status: { in: ["COMPLETED", "READY"] } }] } },
    }),
  ]);

  let confidence: AvtConfidence = "LOW";
  if (recipeCount > 0 && receivingEventCount > 0) confidence = "HIGH";
  else if (recipeCount > 0) confidence = "MEDIUM";

  const explanation =
    confidence === "HIGH"
      ? "Recipes and receiving events both exist — variance reports can start to mean something once periods align."
      : confidence === "MEDIUM"
        ? "Recipes exist but receiving history is thin — theoretical usage is credible; actual depletion precision needs receiving discipline."
        : "Add active recipes and (optionally) receiving to unlock food-cost variance — without recipes, margin views stay directional only.";

  return {
    confidence,
    recipeCount,
    receivingEventCount,
    completedOrderLinesApprox: lineCount,
    explanation,
  };
}
