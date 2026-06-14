import type { PrismaClient } from "@prisma/client";

import { isPlaceholderUberEatsStoreId } from "@/lib/integrations/uber-eats-live-smoke-summary";

export { isPlaceholderUberEatsStoreId };

export async function waitForKitchenImport(input: {
  prisma: PrismaClient;
  connectionId: string;
  externalOrderId: string;
  timeoutMs?: number;
}): Promise<{ ok: boolean; orderId: string | null }> {
  const timeoutMs = input.timeoutMs ?? 20_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const row = await input.prisma.externalOrder.findUnique({
      where: {
        connectionId_externalOrderId: {
          connectionId: input.connectionId,
          externalOrderId: input.externalOrderId,
        },
      },
      select: { importedOrderId: true, syncStatus: true },
    });
    if (row?.importedOrderId) {
      return { ok: true, orderId: row.importedOrderId };
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return { ok: false, orderId: null };
}

export async function waitForKdsTicket(input: {
  prisma: PrismaClient;
  orderId: string;
  timeoutMs?: number;
}): Promise<{ ok: boolean; status: string | null }> {
  const timeoutMs = input.timeoutMs ?? 15_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const order = await input.prisma.order.findUnique({
      where: { id: input.orderId },
      select: { status: true, orderType: true },
    });
    if (order && ["CONFIRMED", "PREPARING", "READY"].includes(order.status)) {
      return { ok: true, status: order.status };
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return { ok: false, status: null };
}

export function statusSyncTopicForSmoke(): "orders" {
  return "orders";
}
