import { IntegrationProvider } from "@prisma/client";

import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  fetchUberEatsMarketplaceOrders,
  normalizeUberEatsMarketplaceOrder,
} from "@/services/integrations/uber-eats/uber-eats-marketplace";
import { getUberEatsCredentialsForUser } from "@/services/integrations/uber-eats/uber-eats-service";
import { importUberEatsOrderToKitchen } from "@/services/integrations/uber-eats/kitchen-import.service";

export async function importUberEatsOrdersForUser(userId: string): Promise<{
  imported: number;
  total: number;
}> {
  const creds = await getUberEatsCredentialsForUser(userId);
  if (!creds?.clientId?.trim() || !creds.clientSecret?.trim() || !creds.storeId?.trim()) {
    throw new Error("Uber Eats credentials are not configured.");
  }

  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.UBER_EATS,
  );
  const connection =
    (await prisma.integrationConnection.findFirst({ where })) ??
    (await prisma.integrationConnection.create({
      data: {
        userId,
        provider: IntegrationProvider.UBER_EATS,
        name: "Uber Eats",
        status: "CONNECTED",
        externalStoreId: creds.storeId,
      },
    }));

  const rawOrders = await fetchUberEatsMarketplaceOrders(creds, creds.storeId);
  let imported = 0;

  for (const raw of rawOrders) {
    const normalized = normalizeUberEatsMarketplaceOrder(raw);
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

    const kitchen = await importUberEatsOrderToKitchen({
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
