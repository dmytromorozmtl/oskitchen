import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

import { DoorDashMenuSyncService } from "@/services/integrations/doordash/menu-sync.service";
import { importDoorDashOrdersForUser } from "@/services/integrations/doordash/order-import.service";
import { DoorDashSyncService } from "@/services/integrations/doordash/order-sync.service";

export type DoorDashCredentials = {
  apiKey?: string | null;
  merchantId?: string | null;
};

export type DoorDashCapabilitySnapshot = {
  hasCredentials: boolean;
  liveQuoteReady: boolean;
  liveDeliveryReady: boolean;
  liveImportReady: boolean;
  placeholderMode: boolean;
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
  const hasCredentials = Boolean(env.DOORDASH_API_KEY?.trim() && env.DOORDASH_MERCHANT_ID?.trim());
  return {
    hasCredentials,
    liveQuoteReady: hasCredentials,
    liveDeliveryReady: hasCredentials,
    liveImportReady: hasCredentials,
    placeholderMode: !hasCredentials,
  };
}

export function isDoorDashConfigured(creds: DoorDashCredentials = credsFromEnv()): boolean {
  return Boolean(creds.apiKey?.trim() && creds.merchantId?.trim());
}

export function getDoorDashPlaceholderMessage(hasCredentials = getDoorDashCapabilitySnapshot().hasCredentials): string {
  return hasCredentials
    ? "DoorDash BETA is enabled with credentials. Live API calls require DoorDash partner approval and correct API hosts for your merchant program."
    : "Configure DOORDASH_API_KEY and DOORDASH_MERCHANT_ID to enable DoorDash BETA (order webhooks, import, menu sync, Drive delivery).";
}

export async function getDoorDashQuote(
  pickupAddress: string,
  deliveryAddress: string,
  creds: DoorDashCredentials = credsFromEnv(),
) {
  if (!isDoorDashConfigured(creds)) {
    return {
      ok: false as const,
      message: getDoorDashPlaceholderMessage(false),
      fee: null,
      etaMinutes: null,
    };
  }

  const svc = new DoorDashSyncService(creds);
  const probe = await svc.createDelivery("quote-probe", "system", {
    pickupAddress,
    deliveryAddress,
  });

  return {
    ok: probe.ok,
    message: probe.ok
      ? "DoorDash Drive quote request accepted (BETA)."
      : probe.message,
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
  if (!isDoorDashConfigured(creds)) {
    return {
      ok: false as const,
      message: getDoorDashPlaceholderMessage(false),
      delivery: null,
      trackingUrl: null,
      orderId,
      input,
      userId,
    };
  }

  const svc = new DoorDashSyncService(creds);
  const externalId = orderId ?? `kitchenos-${userId.slice(0, 8)}-${Date.now()}`;
  const result = await svc.createDelivery(externalId, userId, input);

  if (!result.ok) {
    return {
      ok: false as const,
      message: result.message,
      delivery: null,
      trackingUrl: null,
      orderId,
      input,
      userId,
    };
  }

  const delivery = await prisma.doorDashDelivery.create({
    data: {
      userId,
      orderId: orderId ?? undefined,
      externalDeliveryId: result.externalId,
      status: "CONFIRMED",
      pickupAddress: input.pickupAddress,
      deliveryAddress: input.deliveryAddress,
    },
  });

  return {
    ok: true as const,
    message: result.message,
    delivery,
    trackingUrl: delivery.trackingUrl,
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

/** Push active menus to DoorDash Marketplace (BETA). */
export async function syncMenuToDoorDash(userId: string, menuId?: string) {
  const creds = credsFromEnv();
  if (!isDoorDashConfigured(creds)) {
    throw new Error(getDoorDashPlaceholderMessage(false));
  }

  const svc = new DoorDashMenuSyncService(creds);
  const result = await svc.pushMenu(userId, creds.merchantId!.trim(), menuId ?? null);
  if (!result.ok) {
    throw new Error(result.message ?? "DoorDash menu sync failed");
  }
  return result;
}

/** Poll DoorDash Marketplace and import orders into kitchen + external_orders. */
export async function fetchDoorDashOrders(userId: string) {
  const capability = getDoorDashCapabilitySnapshot();
  if (capability.placeholderMode) {
    throw new Error(`DoorDash order import disabled for ${userId}: ${getDoorDashPlaceholderMessage(false)}`);
  }
  return importDoorDashOrdersForUser(userId);
}
