import type { IntegrationConnection } from "@prisma/client";
import { IntegrationProvider } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import type { ResyLiveConnectionSettings } from "@/lib/integrations/resy-live-types";
import { prisma } from "@/lib/prisma";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type ResyCredentials = {
  accessToken: string;
  refreshToken?: string | null;
  venueId: string;
  webhookSecret?: string | null;
  settings: ResyLiveConnectionSettings;
};

export function parseResySettings(settingsJson: unknown): ResyLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as ResyLiveConnectionSettings;
}

export function getResyCredentials(conn: IntegrationConnection): ResyCredentials | null {
  const accessToken =
    decryptOptional(conn.accessTokenEncrypted) ?? process.env.RESY_API_KEY?.trim() ?? null;
  const venueId = conn.externalStoreId?.trim() ?? process.env.RESY_VENUE_ID?.trim() ?? null;
  if (!accessToken || !venueId) return null;
  return {
    accessToken,
    refreshToken: decryptOptional(conn.refreshTokenEncrypted),
    venueId,
    webhookSecret: decryptOptional(conn.webhookSecretEncrypted),
    settings: parseResySettings(conn.settingsJson),
  };
}

export async function getResyCredentialsForUser(userId: string): Promise<ResyCredentials | null> {
  const where = await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.RESY);
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (!conn) return null;
  return getResyCredentials(conn);
}
