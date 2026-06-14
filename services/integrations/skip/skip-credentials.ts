import { IntegrationProvider } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import type { SkipMarketplaceCredentials } from "@/services/integrations/skip/skip-marketplace";

export async function getSkipCredentialsForUser(
  userId: string,
): Promise<SkipMarketplaceCredentials | null> {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.SKIP,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (conn) {
    const clientId =
      decryptOptional(conn.consumerKeyEncrypted) ?? process.env.SKIP_CLIENT_ID?.trim() ?? null;
    const clientSecret =
      decryptOptional(conn.consumerSecretEncrypted) ??
      process.env.SKIP_CLIENT_SECRET?.trim() ??
      null;
    const restaurantId =
      conn.externalStoreId?.trim() ?? process.env.SKIP_RESTAURANT_ID?.trim() ?? null;
    if (clientId && clientSecret && restaurantId) {
      return { clientId, clientSecret, restaurantId };
    }
  }
  const clientId = process.env.SKIP_CLIENT_ID?.trim();
  const clientSecret = process.env.SKIP_CLIENT_SECRET?.trim();
  const restaurantId = process.env.SKIP_RESTAURANT_ID?.trim();
  if (clientId && clientSecret && restaurantId) {
    return { clientId, clientSecret, restaurantId };
  }
  return null;
}
