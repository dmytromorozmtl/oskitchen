import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export type DoorDashCredentials = {
  apiKey?: string | null;
  merchantId?: string | null;
};

export type DoorDashCapabilitySnapshot = {
  hasCredentials: boolean;
  liveQuoteReady: false;
  liveDeliveryReady: false;
  liveImportReady: false;
  placeholderMode: true;
};

function credsFromEnv(): DoorDashCredentials {
  return {
    apiKey: process.env.DOORDASH_API_KEY ?? null,
    merchantId: process.env.DOORDASH_MERCHANT_ID ?? null,
  };
}

export function getDoorDashCapabilitySnapshot(
  env: NodeJS.ProcessEnv = process.env,
): DoorDashCapabilitySnapshot {
  return {
    hasCredentials: Boolean(env.DOORDASH_API_KEY?.trim() && env.DOORDASH_MERCHANT_ID?.trim()),
    liveQuoteReady: false,
    liveDeliveryReady: false,
    liveImportReady: false,
    placeholderMode: true,
  };
}

export function isDoorDashConfigured(creds: DoorDashCredentials = credsFromEnv()): boolean {
  return Boolean(creds.apiKey?.trim() && creds.merchantId?.trim());
}

export function getDoorDashPlaceholderMessage(hasCredentials = getDoorDashCapabilitySnapshot().hasCredentials): string {
  return hasCredentials
    ? "DoorDash credentials are present, but KitchenOS still keeps DoorDash in placeholder mode. Live quotes, deliveries, menu sync, and order import are not production-ready."
    : "DoorDash is still placeholder-only. Credentials can be prepared, but KitchenOS does not run live DoorDash flows yet.";
}

export async function getDoorDashQuote(
  pickupAddress: string,
  deliveryAddress: string,
  creds: DoorDashCredentials = credsFromEnv(),
) {
  return {
    ok: false as const,
    message: getDoorDashPlaceholderMessage(isDoorDashConfigured(creds)),
    fee: null,
    etaMinutes: null,
  };
}

export async function createDoorDashDelivery(
  orderId: string | null,
  userId: string,
  input: { pickupAddress: string; deliveryAddress: string },
  creds: DoorDashCredentials = credsFromEnv(),
) {
  return {
    ok: false as const,
    message: getDoorDashPlaceholderMessage(isDoorDashConfigured(creds)),
    delivery: null,
    trackingUrl: null,
    orderId,
    input,
    userId,
  };
}

export async function trackDoorDashDelivery(deliveryId: string, userId: string) {
  const row = await prisma.doorDashDelivery.findFirst({
    where: { id: deliveryId, userId },
  });
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    trackingUrl: row.trackingUrl,
    externalDeliveryId: row.externalDeliveryId,
    updatedAt: row.updatedAt,
  };
}

export async function listDoorDashDeliveries(userId: string, take = 25) {
  const scope = await resolveOwnerScopedWhere(userId);
  return prisma.doorDashDelivery.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    take,
    include: { order: { select: { id: true, customerName: true } } },
  });
}

/**
 * Sync menu to DoorDash Marketplace.
 */
export async function syncMenuToDoorDash(userId: string, _menuId?: string) {
  throw new Error(`DoorDash menu sync disabled for ${userId}: ${getDoorDashPlaceholderMessage()}`);
}

/**
 * Fetch DoorDash orders and import them into KitchenOS.
 */
export async function fetchDoorDashOrders(userId: string) {
  throw new Error(`DoorDash order import disabled for ${userId}: ${getDoorDashPlaceholderMessage()}`);
}
