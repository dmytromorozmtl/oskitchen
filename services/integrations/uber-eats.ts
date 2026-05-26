import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, NormalizedOrderStatus } from "@prisma/client";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";

export type UberEatsCredentials = {
  clientId?: string | null;
  clientSecret?: string | null;
  storeId?: string | null;
};

/**
 * Adapter skeleton for Uber Eats Marketplace.
 * Live calls require Uber partner-approved credentials and base URLs from Uber documentation.
 */
export async function testConnection(creds: UberEatsCredentials): Promise<{
  ok: boolean;
  message: string;
}> {
  if (!creds.clientId?.trim() || !creds.clientSecret?.trim()) {
    return {
      ok: false,
      message:
        "Uber Eats Marketplace APIs require partner-approved credentials. Save client ID and secret when your integration is provisioned.",
    };
  }
  return {
    ok: false,
    message:
      "Credentials stored. Live health check is disabled until partner API host and OAuth flow are configured for your account.",
  };
}

export async function fetchStore(_creds: UberEatsCredentials, _storeId: string) {
  return null as Record<string, unknown> | null;
}

export async function fetchOrders(_creds: UberEatsCredentials, _storeId: string) {
  return [] as unknown[];
}

export function normalizeUberEatsOrder(raw: Record<string, unknown>): NormalizedKitchenOrder {
  const id = String(raw.id ?? raw.uuid ?? "unknown");
  return {
    provider: IntegrationProvider.UBER_EATS,
    externalOrderId: id,
    externalOrderNumber: raw.display_id != null ? String(raw.display_id) : id,
    sourceStatus: raw.state != null ? String(raw.state) : null,
    normalizedStatus: NormalizedOrderStatus.OPEN,
    customer: {},
    lineItems: [],
    fulfillment: { type: "PICKUP", pickupTime: null, deliveryTime: null, deliveryAddress: null },
    totals: {},
    raw,
  };
}

export async function updateOrderStatus(
  _creds: UberEatsCredentials,
  _orderId: string,
  _status: string,
) {
  return { ok: false as const, message: "Placeholder until partner API is configured." };
}

export async function menuSyncPlaceholder(_creds: UberEatsCredentials, _storeId: string) {
  return {
    ok: false as const,
    message: "Menu sync requires Uber Eats menu APIs and partner approval.",
  };
}

/** Verify Uber Eats webhook HMAC (hex or base64) against raw body. */
export function verifyUberEatsWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
  const secretTrim = secret.trim();
  const sigTrim = signatureHeader.trim().replace(/^sha256=/i, "");
  if (!secretTrim || !sigTrim) return false;

  const digest = createHmac("sha256", secretTrim).update(rawBody, "utf8").digest();
  const digestHex = digest.toString("hex");

  if (sigTrim.length === digestHex.length) {
    try {
      if (timingSafeEqual(Buffer.from(sigTrim, "utf8"), Buffer.from(digestHex, "utf8"))) {
        return true;
      }
    } catch {
      /* fall through */
    }
  }

  try {
    const sigHex = Buffer.from(sigTrim, "hex");
    if (sigHex.length === digest.length && timingSafeEqual(sigHex, digest)) {
      return true;
    }
  } catch {
    /* fall through */
  }

  try {
    const sigB64 = Buffer.from(sigTrim, "base64");
    if (sigB64.length === digest.length && timingSafeEqual(sigB64, digest)) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
