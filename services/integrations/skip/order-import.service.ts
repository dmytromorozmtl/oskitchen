import { IntegrationProvider } from "@prisma/client";

import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { getSkipCredentialsForUser } from "@/services/integrations/skip/skip-credentials";
import { importSkipOrderToKitchen } from "@/services/integrations/skip/kitchen-import.service";
import {
  fetchSkipMarketplaceOrders,
  normalizeSkipOrder,
} from "@/services/integrations/skip/skip-marketplace";

export async function importSkipOrdersForUser(userId: string): Promise<{
  imported: number;
  total: number;
}> {
  const creds = await getSkipCredentialsForUser(userId);
  if (!creds?.clientId?.trim() || !creds.clientSecret?.trim() || !creds.restaurantId?.trim()) {
    throw new Error("Skip credentials are not configured.");
  }

  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.SKIP,
  );
  const connection =
    (await prisma.integrationConnection.findFirst({ where })) ??
    (await prisma.integrationConnection.create({
      data: {
        userId,
        provider: IntegrationProvider.SKIP,
        name: "Skip / Just Eat",
        status: "CONNECTED",
        externalStoreId: creds.restaurantId,
      },
    }));

  const rawOrders = await fetchSkipMarketplaceOrders(creds);
  let imported = 0;

  for (const raw of rawOrders) {
    const normalized = normalizeSkipOrder(raw);
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

    const kitchen = await importSkipOrderToKitchen({
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
