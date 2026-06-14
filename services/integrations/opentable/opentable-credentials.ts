import type { IntegrationConnection } from "@prisma/client";
import { IntegrationProvider } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import type { OpenTableLiveConnectionSettings } from "@/lib/integrations/opentable-live-types";
import { prisma } from "@/lib/prisma";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type OpenTableCredentials = {
  accessToken: string;
  refreshToken?: string | null;
  restaurantId: string;
  webhookSecret?: string | null;
  settings: OpenTableLiveConnectionSettings;
};

export function parseOpenTableSettings(settingsJson: unknown): OpenTableLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as OpenTableLiveConnectionSettings;
}

export function getOpenTableCredentials(conn: IntegrationConnection): OpenTableCredentials | null {
  const accessToken =
    decryptOptional(conn.accessTokenEncrypted) ?? process.env.OPENTABLE_API_KEY?.trim() ?? null;
  const restaurantId =
    conn.externalStoreId?.trim() ?? process.env.OPENTABLE_RID?.trim() ?? null;
  if (!accessToken || !restaurantId) return null;
  return {
    accessToken,
    refreshToken: decryptOptional(conn.refreshTokenEncrypted),
    restaurantId,
    webhookSecret: decryptOptional(conn.webhookSecretEncrypted),
    settings: parseOpenTableSettings(conn.settingsJson),
  };
}

export async function getOpenTableCredentialsForUser(
  userId: string,
): Promise<OpenTableCredentials | null> {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.OPENTABLE,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (!conn) return null;
  return getOpenTableCredentials(conn);
}
