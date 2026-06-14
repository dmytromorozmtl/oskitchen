import type { OrderStatus } from "@prisma/client";

import { updateOrderStatus as pushUberEatsStatus } from "@/services/integrations/uber-eats";
import { getUberEatsCredentialsForUser } from "@/services/integrations/uber-eats/uber-eats-service";

/** Map OS Kitchen order status → Uber Eats Marketplace API status. */
export function mapKitchenStatusToUberEats(status: OrderStatus): string | null {
  switch (status) {
    case "CONFIRMED":
    case "PREPARING":
      return "ACCEPTED";
    case "READY":
      return "READY_FOR_PICKUP";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return null;
  }
}

export async function syncUberEatsStatusFromKitchenOrder(input: {
  userId: string;
  channelProvider: string | null | undefined;
  externalOrderId: string | null | undefined;
  status: OrderStatus;
}): Promise<{ ok: boolean; skipped: boolean; message: string }> {
  if (input.channelProvider !== "UBER_EATS") {
    return { ok: true, skipped: true, message: "Not an Uber Eats channel order." };
  }
  if (!input.externalOrderId?.trim()) {
    return { ok: false, skipped: true, message: "Missing external order id." };
  }

  const uberStatus = mapKitchenStatusToUberEats(input.status);
  if (!uberStatus) {
    return { ok: true, skipped: true, message: `No Uber status mapping for ${input.status}.` };
  }

  const creds = await getUberEatsCredentialsForUser(input.userId);
  if (!creds) {
    return { ok: false, skipped: false, message: "Uber Eats credentials not configured." };
  }

  const result = await pushUberEatsStatus(creds, input.externalOrderId.trim(), uberStatus);
  return {
    ok: result.ok,
    skipped: false,
    message: result.message,
  };
}
