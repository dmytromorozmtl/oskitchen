import type { IntegrationConnection } from "@prisma/client";
import { IntegrationProvider } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import type { HomebaseLiveConnectionSettings } from "@/lib/integrations/homebase-live-types";
import { prisma } from "@/lib/prisma";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type HomebaseCredentials = {
  accessToken: string;
  refreshToken?: string | null;
  locationId: string;
  settings: HomebaseLiveConnectionSettings;
};

export function parseHomebaseSettings(settingsJson: unknown): HomebaseLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as HomebaseLiveConnectionSettings;
}

export function getHomebaseCredentials(conn: IntegrationConnection): HomebaseCredentials | null {
  const accessToken =
    decryptOptional(conn.accessTokenEncrypted) ?? process.env.HOMEBASE_API_KEY?.trim() ?? null;
  const locationId =
    conn.externalStoreId?.trim() ?? process.env.HOMEBASE_LOCATION_ID?.trim() ?? null;
  if (!accessToken || !locationId) return null;
  return {
    accessToken,
    refreshToken: decryptOptional(conn.refreshTokenEncrypted),
    locationId,
    settings: parseHomebaseSettings(conn.settingsJson),
  };
}

export async function getHomebaseCredentialsForUser(
  userId: string,
): Promise<HomebaseCredentials | null> {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.HOMEBASE,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (!conn) return null;
  return getHomebaseCredentials(conn);
}
