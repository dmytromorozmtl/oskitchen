import type { OrderStatus } from "@prisma/client";

import { updateDoorDashMarketplaceOrderStatus } from "@/services/integrations/doordash/doordash-marketplace";
import { getDoorDashCredentialsForUser } from "@/services/integrations/doordash/doordash-credentials";

/** Map OS Kitchen order status → DoorDash Marketplace API status. */
export function mapKitchenStatusToDoorDash(
  status: OrderStatus,
): "confirmed" | "ready_for_pickup" | "picked_up" | "delivered" | "cancelled" | null {
  switch (status) {
    case "CONFIRMED":
    case "PREPARING":
      return "confirmed";
    case "READY":
      return "ready_for_pickup";
    case "COMPLETED":
      return "delivered";
    case "CANCELLED":
      return "cancelled";
    default:
      return null;
  }
}

export async function syncDoorDashStatusFromKitchenOrder(input: {
  userId: string;
  channelProvider: string | null | undefined;
  externalOrderId: string | null | undefined;
  status: OrderStatus;
}): Promise<{ ok: boolean; skipped: boolean; message: string }> {
  if (input.channelProvider !== "DOORDASH") {
    return { ok: true, skipped: true, message: "Not a DoorDash channel order." };
  }
  if (!input.externalOrderId?.trim()) {
    return { ok: false, skipped: true, message: "Missing external order id." };
  }

  const ddStatus = mapKitchenStatusToDoorDash(input.status);
  if (!ddStatus) {
    return { ok: true, skipped: true, message: `No DoorDash status mapping for ${input.status}.` };
  }

  const creds = await getDoorDashCredentialsForUser(input.userId);
  if (!creds?.apiKey?.trim() || !creds.merchantId?.trim()) {
    return { ok: false, skipped: false, message: "DoorDash credentials not configured." };
  }

  const result = await updateDoorDashMarketplaceOrderStatus(
    creds,
    input.externalOrderId.trim(),
    ddStatus,
  );
  return { ok: result.ok, skipped: false, message: result.message };
}
