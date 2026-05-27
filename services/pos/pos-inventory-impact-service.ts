import { prisma } from "@/lib/prisma";
import { applyRecipeDepletionForPosLine } from "@/services/inventory/pos-recipe-depletion";

export async function recordPendingInventoryImpactsForPosOrder(
  userId: string,
  workspaceId: string,
  orderId: string,
) {
  const items = await prisma.orderItem.findMany({
    where: { orderId, order: { userId } },
    select: { id: true, productId: true, quantity: true },
  });
  for (const li of items) {
    if (!li.productId) continue;
    const impact = await prisma.posInventoryImpactEvent.create({
      data: {
        userId,
        workspaceId,
        orderId,
        productId: li.productId,
        quantity: li.quantity,
        status: "PENDING_CONFIGURATION",
        note: "POS sale — recipe depletion runs when product has an active recipe.",
      },
    });
    await applyRecipeDepletionForPosLine(
      userId,
      workspaceId,
      impact.id,
      li.productId,
      Number(li.quantity),
    );
  }
}
