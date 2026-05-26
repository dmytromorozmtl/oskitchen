import { prisma } from "@/lib/prisma";
import { grubhubDeliveryListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type GrubhubCredentials = {
  apiKey?: string | null;
  merchantId?: string | null;
};

export type GrubhubCapabilitySnapshot = {
  hasCredentials: boolean;
  liveOrderReady: false;
  liveMenuReady: false;
  placeholderMode: true;
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
  return {
    hasCredentials: Boolean(env.GRUBHUB_API_KEY?.trim() && env.GRUBHUB_MERCHANT_ID?.trim()),
    liveOrderReady: false,
    liveMenuReady: false,
    placeholderMode: true,
  };
}

export function getGrubhubPlaceholderMessage(hasCredentials = getGrubhubCapabilitySnapshot().hasCredentials): string {
  return hasCredentials
    ? "Grubhub credentials are present, but KitchenOS still keeps Grubhub in placeholder mode. Live sync and order ingestion are not production-ready."
    : "Grubhub is still placeholder-only. Credentials can be prepared, but KitchenOS does not run live Grubhub flows yet.";
}

export async function createGrubhubOrder(
  userId: string,
  orderData: { externalOrderId?: string },
  creds: GrubhubCredentials = credsFromEnv(),
) {
  return {
    ok: false as const,
    delivery: null,
    message: getGrubhubPlaceholderMessage(isGrubhubConfigured(creds)),
    userId,
    externalOrderId: orderData.externalOrderId ?? null,
  };
}

export async function getGrubhubMenu(_userId: string) {
  return {
    ok: false as const,
    items: [] as Array<{ id: string; name: string }>,
    message: getGrubhubPlaceholderMessage(),
  };
}

export async function listGrubhubDeliveries(userId: string) {
  const scope = await grubhubDeliveryListWhereForOwner(userId);
  return prisma.grubhubDelivery.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
