import type { IntegrationConnection } from "@prisma/client";
import { IntegrationProvider } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import type { SevenShiftsLiveConnectionSettings } from "@/lib/integrations/seven-shifts-live-types";
import { prisma } from "@/lib/prisma";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type SevenShiftsCredentials = {
  accessToken: string;
  refreshToken?: string | null;
  companyId: string;
  settings: SevenShiftsLiveConnectionSettings;
};

export function parseSevenShiftsSettings(settingsJson: unknown): SevenShiftsLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as SevenShiftsLiveConnectionSettings;
}

export function getSevenShiftsCredentials(conn: IntegrationConnection): SevenShiftsCredentials | null {
  const accessToken =
    decryptOptional(conn.accessTokenEncrypted) ?? process.env.SEVENSHIFTS_API_KEY?.trim() ?? null;
  const companyId =
    conn.externalStoreId?.trim() ?? process.env.SEVENSHIFTS_COMPANY_ID?.trim() ?? null;
  if (!accessToken || !companyId) return null;
  return {
    accessToken,
    refreshToken: decryptOptional(conn.refreshTokenEncrypted),
    companyId,
    settings: parseSevenShiftsSettings(conn.settingsJson),
  };
}

export async function getSevenShiftsCredentialsForUser(
  userId: string,
): Promise<SevenShiftsCredentials | null> {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.SEVEN_SHIFTS,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (!conn) return null;
  return getSevenShiftsCredentials(conn);
}
