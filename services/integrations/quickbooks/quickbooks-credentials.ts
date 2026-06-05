import type { IntegrationConnection } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import type { QuickBooksLiveConnectionSettings } from "@/lib/integrations/quickbooks-live-types";
import { prisma } from "@/lib/prisma";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { IntegrationProvider } from "@prisma/client";

export type QuickBooksCredentials = {
  accessToken: string;
  refreshToken?: string | null;
  realmId: string;
  settings: QuickBooksLiveConnectionSettings;
};

export function parseQuickBooksSettings(settingsJson: unknown): QuickBooksLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as QuickBooksLiveConnectionSettings;
}

export function getQuickBooksCredentials(conn: IntegrationConnection): QuickBooksCredentials | null {
  const accessToken = decryptOptional(conn.accessTokenEncrypted);
  const realmId = conn.externalStoreId?.trim() || parseQuickBooksSettings(conn.settingsJson).realmId?.trim();
  if (!accessToken || !realmId) return null;
  return {
    accessToken,
    refreshToken: decryptOptional(conn.refreshTokenEncrypted),
    realmId,
    settings: parseQuickBooksSettings(conn.settingsJson),
  };
}

export async function getQuickBooksCredentialsForUser(
  userId: string,
): Promise<QuickBooksCredentials | null> {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.QUICKBOOKS,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (!conn) return null;
  return getQuickBooksCredentials(conn);
}
