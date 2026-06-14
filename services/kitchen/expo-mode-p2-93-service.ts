import { buildExpoModeReport, type ExpoModeReport } from "@/lib/kitchen/expo-mode-p2-93-operations";
import { EXPO_MODE_POLICY_ID } from "@/lib/kitchen/expo-mode-p2-93-policy";
import { isKdsTicketReady } from "@/lib/kitchen/kds-queue-clarity-era18";
import { productionWorkItemListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";

export type ExpoModeSnapshot = ExpoModeReport & {
  policyId: typeof EXPO_MODE_POLICY_ID;
  readyTicketCount: number;
};

export async function loadExpoModeSnapshot(userId: string): Promise<ExpoModeSnapshot> {
  const orders = await getDailyKdsOrders(userId);
  const expoQueue = orders.filter(
    (order) => isKdsTicketReady(order.status) || order.status === "PREPARING",
  );

  const orderIds = expoQueue.map((order) => order.id);
  const workItemScope = await productionWorkItemListWhereForOwner(userId);
  const workItems =
    orderIds.length === 0
      ? []
      : await prisma.productionWorkItem.findMany({
          where: {
            AND: [
              workItemScope,
              { orderId: { in: orderIds } },
              { status: { notIn: ["DONE", "CANCELLED"] } },
            ],
          },
          select: {
            orderId: true,
            title: true,
            status: true,
            station: true,
          },
          take: 500,
        });

  const report = buildExpoModeReport(expoQueue, workItems);

  return {
    policyId: EXPO_MODE_POLICY_ID,
    readyTicketCount: expoQueue.filter((order) => isKdsTicketReady(order.status)).length,
    ...report,
  };
}
