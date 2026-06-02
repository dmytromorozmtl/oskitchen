import { IntegrationProvider } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import type { DoorDashLiveConnectionSettings } from "@/lib/integrations/doordash-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import type { DoorDashCredentials } from "@/services/integrations/doordash/doordash-service";
import { isDoorDashConfigured } from "@/services/integrations/doordash/doordash-service";

function credsFromEnv(): DoorDashCredentials {
  return {
    apiKey: process.env.DOORDASH_API_KEY ?? null,
    merchantId: process.env.DOORDASH_MERCHANT_ID ?? null,
  };
}

function parseSettings(settingsJson: unknown): DoorDashLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as DoorDashLiveConnectionSettings;
}

/** Resolve DoorDash API credentials from connection (OAuth token or API key) with env fallback. */
export async function getDoorDashCredentialsForUser(
  userId: string,
): Promise<DoorDashCredentials | null> {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.DOORDASH,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (conn) {
    const settings = parseSettings(conn.settingsJson);
    const oauthToken = settings.liveOAuth?.accessTokenEnc
      ? decryptOptional(settings.liveOAuth.accessTokenEnc)
      : null;
    const apiKey =
      oauthToken ?? decryptOptional(conn.consumerKeyEncrypted) ?? process.env.DOORDASH_API_KEY?.trim();
    const merchantId = conn.externalStoreId?.trim() ?? process.env.DOORDASH_MERCHANT_ID?.trim();
    if (apiKey && merchantId) {
      return { apiKey, merchantId };
    }
  }
  const env = credsFromEnv();
  return isDoorDashConfigured(env) ? env : null;
}
