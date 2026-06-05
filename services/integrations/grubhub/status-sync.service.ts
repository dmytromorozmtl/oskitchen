import type { OrderStatus } from "@prisma/client";

import { updateGrubhubMarketplaceOrderStatus } from "@/services/integrations/grubhub/grubhub-marketplace";
import { getGrubhubCredentialsForUser } from "@/services/integrations/grubhub/grubhub-credentials";

/** Map OS Kitchen order status → Grubhub Marketplace API status. */
export function mapKitchenStatusToGrubhub(
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

export async function syncGrubhubStatusFromKitchenOrder(input: {
  userId: string;
  channelProvider: string | null | undefined;
  externalOrderId: string | null | undefined;
  status: OrderStatus;
}): Promise<{ ok: boolean; skipped: boolean; message: string }> {
  if (input.channelProvider !== "GRUBHUB") {
    return { ok: true, skipped: true, message: "Not a Grubhub channel order." };
  }
  if (!input.externalOrderId?.trim()) {
    return { ok: false, skipped: true, message: "Missing external order id." };
  }

  const ghStatus = mapKitchenStatusToGrubhub(input.status);
  if (!ghStatus) {
    return { ok: true, skipped: true, message: `No Grubhub status mapping for ${input.status}.` };
  }

  const creds = await getGrubhubCredentialsForUser(input.userId);
  if (!creds?.apiKey?.trim() || !creds.merchantId?.trim()) {
    return { ok: false, skipped: false, message: "Grubhub credentials not configured." };
  }

  const result = await updateGrubhubMarketplaceOrderStatus(
    creds,
    input.externalOrderId.trim(),
    ghStatus,
  );
  return { ok: result.ok, skipped: false, message: result.message };
}
