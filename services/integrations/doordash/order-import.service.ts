import { IntegrationProvider } from "@prisma/client";

import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  fetchDoorDashMarketplaceOrders,
  normalizeDoorDashOrder,
} from "@/services/integrations/doordash/doordash-marketplace";
import { getDoorDashCredentialsForUser } from "@/services/integrations/doordash/doordash-credentials";
import { importDoorDashOrderToKitchen } from "@/services/integrations/doordash/kitchen-import.service";

export async function importDoorDashOrdersForUser(userId: string): Promise<{
  imported: number;
  total: number;
}> {
  const creds = await getDoorDashCredentialsForUser(userId);
  if (!creds?.apiKey?.trim() || !creds.merchantId?.trim()) {
    throw new Error("DoorDash credentials are not configured.");
  }

  const where = await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.DOORDASH);
  const connection =
    (await prisma.integrationConnection.findFirst({ where })) ??
    (await prisma.integrationConnection.create({
      data: {
        userId,
        provider: IntegrationProvider.DOORDASH,
        name: "DoorDash",
        status: "CONNECTED",
        externalStoreId: creds.merchantId,
      },
    }));

  const rawOrders = await fetchDoorDashMarketplaceOrders(creds);
  let imported = 0;

  for (const raw of rawOrders) {
    const normalized = normalizeDoorDashOrder(raw);
    const existing = await prisma.externalOrder.findFirst({
      where: {
        connectionId: connection.id,
        externalOrderId: normalized.externalOrderId,
      },
      select: { id: true, importedOrderId: true },
    });

    if (existing?.importedOrderId) continue;

    const external = await persistNormalizedExternalOrder({
      userId,
      connectionId: connection.id,
      normalized,
    });

    const kitchen = await importDoorDashOrderToKitchen({
      userId,
      workspaceId: connection.workspaceId,
      connectionId: connection.id,
      normalized,
      externalOrderRecordId: external.id,
    });

    if (kitchen.imported) imported += 1;
  }

  return { imported, total: rawOrders.length };
}
