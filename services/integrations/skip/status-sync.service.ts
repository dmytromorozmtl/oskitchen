import type { OrderStatus } from "@prisma/client";

import { getSkipCredentialsForUser } from "@/services/integrations/skip/skip-credentials";
import { updateSkipMarketplaceOrderStatus } from "@/services/integrations/skip/skip-marketplace";

export function mapKitchenStatusToSkip(
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

export async function syncSkipStatusFromKitchenOrder(input: {
  userId: string;
  channelProvider: string | null | undefined;
  externalOrderId: string | null | undefined;
  status: OrderStatus;
}): Promise<{ ok: boolean; skipped: boolean; message: string }> {
  if (input.channelProvider !== "SKIP") {
    return { ok: true, skipped: true, message: "Not a Skip channel order." };
  }
  if (!input.externalOrderId?.trim()) {
    return { ok: false, skipped: true, message: "Missing external order id." };
  }

  const skipStatus = mapKitchenStatusToSkip(input.status);
  if (!skipStatus) {
    return { ok: true, skipped: true, message: `No Skip status mapping for ${input.status}.` };
  }

  const creds = await getSkipCredentialsForUser(input.userId);
  if (!creds) {
    return { ok: false, skipped: false, message: "Skip credentials not configured." };
  }

  const result = await updateSkipMarketplaceOrderStatus(
    creds,
    input.externalOrderId.trim(),
    skipStatus,
  );
  return { ok: result.ok, skipped: false, message: result.message };
}
