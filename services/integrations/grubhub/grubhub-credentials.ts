import { IntegrationProvider } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import type { GrubhubLiveConnectionSettings } from "@/lib/integrations/grubhub-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import type { GrubhubCredentials } from "@/services/integrations/grubhub/grubhub-service";
import { isGrubhubConfigured } from "@/services/integrations/grubhub/grubhub-service";

function credsFromEnv(): GrubhubCredentials {
  return {
    apiKey: process.env.GRUBHUB_API_KEY ?? null,
    merchantId: process.env.GRUBHUB_MERCHANT_ID ?? null,
  };
}

function parseSettings(settingsJson: unknown): GrubhubLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as GrubhubLiveConnectionSettings;
}

/** Resolve Grubhub API credentials from connection (OAuth token or API key) with env fallback. */
export async function getGrubhubCredentialsForUser(
  userId: string,
): Promise<GrubhubCredentials | null> {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.GRUBHUB,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (conn) {
    const settings = parseSettings(conn.settingsJson);
    const oauthToken = settings.liveOAuth?.accessTokenEnc
      ? decryptOptional(settings.liveOAuth.accessTokenEnc)
      : null;
    const apiKey =
      oauthToken ?? decryptOptional(conn.consumerKeyEncrypted) ?? process.env.GRUBHUB_API_KEY?.trim();
    const merchantId = conn.externalStoreId?.trim() ?? process.env.GRUBHUB_MERCHANT_ID?.trim();
    if (apiKey && merchantId) {
      return { apiKey, merchantId };
    }
  }
  const env = credsFromEnv();
  return isGrubhubConfigured(env) ? env : null;
}
