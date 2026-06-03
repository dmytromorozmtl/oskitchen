import { IntegrationProvider } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import type { UberEatsCredentials } from "@/services/integrations/uber-eats";
import { UberEatsMenuSyncService } from "@/services/integrations/uber-eats/menu-sync.service";
import { importUberEatsOrdersForUser } from "@/services/integrations/uber-eats/order-import.service";
import { testConnection } from "@/services/integrations/uber-eats";

export type UberEatsCapabilitySnapshot = {
  hasCredentials: boolean;
  liveImportReady: boolean;
  liveMenuReady: boolean;
  liveStatusReady: boolean;
  placeholderMode: boolean;
};

function credsFromEnv(): UberEatsCredentials {
  return {
    clientId: process.env.UBER_EATS_CLIENT_ID ?? null,
    clientSecret: process.env.UBER_EATS_CLIENT_SECRET ?? null,
    storeId: process.env.UBER_EATS_STORE_ID ?? null,
  };
}

export function getUberEatsCapabilitySnapshot(
  env: NodeJS.ProcessEnv = process.env,
): UberEatsCapabilitySnapshot {
  const hasCredentials = Boolean(
    env.UBER_EATS_CLIENT_ID?.trim() &&
      env.UBER_EATS_CLIENT_SECRET?.trim() &&
      env.UBER_EATS_STORE_ID?.trim(),
  );
  return {
    hasCredentials,
    liveImportReady: hasCredentials,
    liveMenuReady: hasCredentials,
    liveStatusReady: hasCredentials,
    placeholderMode: !hasCredentials,
  };
}

export function isUberEatsConfigured(creds: UberEatsCredentials = credsFromEnv()): boolean {
  return Boolean(creds.clientId?.trim() && creds.clientSecret?.trim() && creds.storeId?.trim());
}

export function getUberEatsBetaMessage(
  hasCredentials = getUberEatsCapabilitySnapshot().hasCredentials,
): string {
  return hasCredentials
    ? "Uber Eats BETA is enabled. Live API traffic requires Uber partner approval and correct OAuth scopes."
    : "Configure UBER_EATS_CLIENT_ID, UBER_EATS_CLIENT_SECRET, and UBER_EATS_STORE_ID for BETA order ingest and menu sync.";
}

export async function getUberEatsCredentialsForUser(
  userId: string,
): Promise<UberEatsCredentials | null> {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.UBER_EATS,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (conn) {
    const clientId =
      decryptOptional(conn.consumerKeyEncrypted) ?? process.env.UBER_EATS_CLIENT_ID?.trim() ?? null;
    const clientSecret =
      decryptOptional(conn.consumerSecretEncrypted) ??
      process.env.UBER_EATS_CLIENT_SECRET?.trim() ??
      null;
    const storeId =
      conn.externalStoreId?.trim() ?? process.env.UBER_EATS_STORE_ID?.trim() ?? null;
    if (clientId && clientSecret && storeId) {
      return { clientId, clientSecret, storeId };
    }
  }
  const env = credsFromEnv();
  return isUberEatsConfigured(env) ? env : null;
}

export async function fetchUberEatsOrders(userId: string) {
  const capability = getUberEatsCapabilitySnapshot();
  if (capability.placeholderMode) {
    throw new Error(
      `Uber Eats order import disabled for ${userId}: ${getUberEatsBetaMessage(false)}`,
    );
  }
  return importUberEatsOrdersForUser(userId);
}

export async function syncMenuToUberEats(
  userId: string,
  options?: { menuId?: string | null; locationId?: string | null },
) {
  const creds = await getUberEatsCredentialsForUser(userId);
  if (!creds || !creds.clientId?.trim() || !creds.clientSecret?.trim() || !creds.storeId?.trim()) {
    throw new Error(getUberEatsBetaMessage(false));
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(
      userId,
      IntegrationProvider.UBER_EATS,
    ),
    select: { id: true, externalStoreId: true },
  });
  const storeId = conn?.externalStoreId?.trim() || creds.storeId.trim();

  const svc = new UberEatsMenuSyncService(creds);
  const result = await svc.pushMenu(userId, storeId, options, conn?.id ?? null);
  if (!result.ok) {
    throw new Error(result.message ?? "Uber Eats menu sync failed");
  }
  return result;
}

export async function testUberEatsConnection(userId: string) {
  const creds = await getUberEatsCredentialsForUser(userId);
  if (!creds) {
    return { ok: false as const, message: getUberEatsBetaMessage(false) };
  }
  return testConnection(creds);
}
