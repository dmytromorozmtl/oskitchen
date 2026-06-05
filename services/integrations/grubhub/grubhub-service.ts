import { IntegrationProvider } from "@prisma/client";

import {
  grubhubDeliveryListWhereForOwner,
  integrationConnectionByProviderWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

import { getGrubhubCredentialsForUser } from "@/services/integrations/grubhub/grubhub-credentials";
import { GrubhubMenuSyncService } from "@/services/integrations/grubhub/menu-sync.service";
import { importGrubhubOrdersForUser } from "@/services/integrations/grubhub/order-import.service";

export type GrubhubCredentials = {
  apiKey?: string | null;
  merchantId?: string | null;
};

export type GrubhubCapabilitySnapshot = {
  hasCredentials: boolean;
  liveOrderReady: boolean;
  liveMenuReady: boolean;
  placeholderMode: boolean;
};

function credsFromEnv(): GrubhubCredentials {
  return {
    apiKey: process.env.GRUBHUB_API_KEY ?? null,
    merchantId: process.env.GRUBHUB_MERCHANT_ID ?? null,
  };
}

export function isGrubhubConfigured(creds: GrubhubCredentials = credsFromEnv()): boolean {
  return Boolean(creds.apiKey?.trim() && creds.merchantId?.trim());
}

export function getGrubhubCapabilitySnapshot(
  env: NodeJS.ProcessEnv = process.env,
): GrubhubCapabilitySnapshot {
  const hasCredentials = Boolean(env.GRUBHUB_API_KEY?.trim() && env.GRUBHUB_MERCHANT_ID?.trim());
  return {
    hasCredentials,
    liveOrderReady: hasCredentials,
    liveMenuReady: hasCredentials,
    placeholderMode: !hasCredentials,
  };
}

export function getGrubhubLiveMessage(
  hasCredentials = getGrubhubCapabilitySnapshot().hasCredentials,
): string {
  return hasCredentials
    ? "Grubhub LIVE is enabled. OAuth, webhooks, KDS import, menu sync, and status push are active."
    : "Configure GRUBHUB_API_KEY and GRUBHUB_MERCHANT_ID to enable Grubhub LIVE (OAuth, webhooks, KDS, menu sync).";
}

/** @deprecated use getGrubhubLiveMessage */
export function getGrubhubBetaMessage(hasCredentials?: boolean): string {
  return getGrubhubLiveMessage(hasCredentials);
}

/** @deprecated use getGrubhubLiveMessage */
export function getGrubhubPlaceholderMessage(hasCredentials?: boolean): string {
  return getGrubhubLiveMessage(hasCredentials);
}

export async function createGrubhubOrder(
  userId: string,
  orderData: { externalOrderId?: string },
  creds: GrubhubCredentials = credsFromEnv(),
) {
  if (!isGrubhubConfigured(creds)) {
    return {
      ok: false as const,
      delivery: null,
      message: getGrubhubBetaMessage(false),
      userId,
      externalOrderId: orderData.externalOrderId ?? null,
    };
  }

  const delivery = await prisma.grubhubDelivery.create({
    data: {
      userId,
      externalOrderId: orderData.externalOrderId ?? undefined,
      status: "PENDING",
    },
  });

  return {
    ok: true as const,
    delivery,
    message: "Grubhub delivery record created (BETA).",
    userId,
    externalOrderId: orderData.externalOrderId ?? null,
  };
}

export async function getGrubhubMenu(userId: string) {
  const creds = credsFromEnv();
  if (!isGrubhubConfigured(creds)) {
    return {
      ok: false as const,
      items: [] as Array<{ id: string; name: string }>,
      message: getGrubhubBetaMessage(false),
    };
  }

  const svc = new GrubhubMenuSyncService(creds);
  const result = await svc.pushMenu(userId, creds.merchantId!.trim());
  return {
    ok: result.ok,
    items: [],
    message: result.message,
  };
}

export async function syncMenuToGrubhub(userId: string, menuId?: string) {
  const creds = (await getGrubhubCredentialsForUser(userId)) ?? credsFromEnv();
  if (!isGrubhubConfigured(creds)) {
    throw new Error(getGrubhubBetaMessage(false));
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.GRUBHUB),
    select: { id: true, externalStoreId: true },
  });
  const merchantId = conn?.externalStoreId?.trim() || creds.merchantId!.trim();

  const svc = new GrubhubMenuSyncService(creds);
  const result = await svc.pushMenu(
    userId,
    merchantId,
    menuId ? { menuId } : undefined,
    conn?.id ?? null,
  );
  if (!result.ok) {
    throw new Error(result.message ?? "Grubhub menu sync failed");
  }
  return result;
}

export async function fetchGrubhubOrders(userId: string) {
  const capability = getGrubhubCapabilitySnapshot();
  if (capability.placeholderMode) {
    throw new Error(`Grubhub order import disabled for ${userId}: ${getGrubhubBetaMessage(false)}`);
  }
  return importGrubhubOrdersForUser(userId);
}

export async function listGrubhubDeliveries(userId: string) {
  const scope = await grubhubDeliveryListWhereForOwner(userId);
  return prisma.grubhubDelivery.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
