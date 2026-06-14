import { IntegrationProvider } from "@prisma/client";

import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  fetchGrubhubMarketplaceOrders,
  normalizeGrubhubOrder,
} from "@/services/integrations/grubhub/grubhub-marketplace";
import { getGrubhubCredentialsForUser } from "@/services/integrations/grubhub/grubhub-credentials";
import { importGrubhubOrderToKitchen } from "@/services/integrations/grubhub/kitchen-import.service";

export async function importGrubhubOrdersForUser(userId: string): Promise<{
  imported: number;
  total: number;
}> {
  const creds = await getGrubhubCredentialsForUser(userId);
  if (!creds?.apiKey?.trim() || !creds.merchantId?.trim()) {
    throw new Error("Grubhub credentials are not configured.");
  }

  const where = await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.GRUBHUB);
  const connection =
    (await prisma.integrationConnection.findFirst({ where })) ??
    (await prisma.integrationConnection.create({
      data: {
        userId,
        provider: IntegrationProvider.GRUBHUB,
        name: "Grubhub",
        status: "CONNECTED",
        externalStoreId: creds.merchantId,
      },
    }));

  const rawOrders = await fetchGrubhubMarketplaceOrders(creds);
  let imported = 0;

  for (const raw of rawOrders) {
    const normalized = normalizeGrubhubOrder(raw);
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

    const kitchen = await importGrubhubOrderToKitchen({
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
