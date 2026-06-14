import type { IntegrationConnection } from "@prisma/client";
import { IntegrationProvider } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import type { XeroLiveConnectionSettings } from "@/lib/integrations/xero-live-types";
import { prisma } from "@/lib/prisma";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type XeroCredentials = {
  accessToken: string;
  refreshToken?: string | null;
  tenantId: string;
  settings: XeroLiveConnectionSettings;
};

export function parseXeroSettings(settingsJson: unknown): XeroLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as XeroLiveConnectionSettings;
}

export function getXeroCredentials(conn: IntegrationConnection): XeroCredentials | null {
  const accessToken = decryptOptional(conn.accessTokenEncrypted);
  const tenantId =
    conn.externalStoreId?.trim() || parseXeroSettings(conn.settingsJson).tenantId?.trim();
  if (!accessToken || !tenantId) return null;
  return {
    accessToken,
    refreshToken: decryptOptional(conn.refreshTokenEncrypted),
    tenantId,
    settings: parseXeroSettings(conn.settingsJson),
  };
}

export async function getXeroCredentialsForUser(userId: string): Promise<XeroCredentials | null> {
  const where = await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.XERO);
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (!conn) return null;
  return getXeroCredentials(conn);
}
