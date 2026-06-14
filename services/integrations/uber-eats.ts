import { createHmac, timingSafeEqual } from "crypto";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import { normalizeUberEatsMarketplaceOrder } from "@/services/integrations/uber-eats/uber-eats-marketplace";

export type UberEatsCredentials = {
  clientId?: string | null;
  clientSecret?: string | null;
  storeId?: string | null;
};

/** OAuth health check — verifies token endpoint when credentials are saved. */
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
  const tokenUrl = process.env.UBER_EATS_TOKEN_URL ?? "https://login.uber.com/oauth/v2/token";
  try {
    const body = new URLSearchParams({
      client_id: creds.clientId.trim(),
      client_secret: creds.clientSecret.trim(),
      grant_type: "client_credentials",
      scope: "eats.store eats.order",
    });
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (res.ok) {
      return {
        ok: true,
        message: "OAuth token exchange succeeded (LIVE). Confirm store UUID and webhook signing in Uber developer portal.",
      };
    }
    return {
      ok: false,
      message: `OAuth token exchange failed (${res.status}). Verify Uber partner credentials and scopes.`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Uber Eats connection test failed",
    };
  }
}

export async function fetchStore(_creds: UberEatsCredentials, _storeId: string) {
  return null as Record<string, unknown> | null;
}

export async function fetchOrders(_creds: UberEatsCredentials, _storeId: string) {
  return [] as unknown[];
}

export function normalizeUberEatsOrder(raw: Record<string, unknown>): NormalizedKitchenOrder {
  return normalizeUberEatsMarketplaceOrder(raw);
}

export async function updateOrderStatus(
  creds: UberEatsCredentials,
  orderId: string,
  status: string,
) {
  if (!creds.clientId?.trim() || !creds.clientSecret?.trim() || !creds.storeId?.trim()) {
    return { ok: false as const, message: "Uber Eats credentials or store ID missing." };
  }
  const tokenUrl = process.env.UBER_EATS_TOKEN_URL ?? "https://login.uber.com/oauth/v2/token";
  const body = new URLSearchParams({
    client_id: creds.clientId.trim(),
    client_secret: creds.clientSecret.trim(),
    grant_type: "client_credentials",
    scope: "eats.order",
  });
  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!tokenRes.ok) {
    return { ok: false as const, message: `OAuth failed (${tokenRes.status})` };
  }
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  const token = tokenJson.access_token;
  if (!token) return { ok: false as const, message: "Missing access token" };

  const base =
    process.env.UBER_EATS_ORDERS_API_BASE ?? "https://api.uber.com/v2/eats/stores";
  const res = await fetch(
    `${base}/${encodeURIComponent(creds.storeId.trim())}/orders/${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
      cache: "no-store",
    },
  );
  return {
    ok: res.ok,
    message: res.ok ? `Status updated to ${status}` : `Uber status update failed (${res.status})`,
  };
}

export async function menuSyncPlaceholder(creds: UberEatsCredentials, storeId: string) {
  if (!creds.clientId?.trim() || !creds.clientSecret?.trim()) {
    return {
      ok: false as const,
      message: "Menu sync requires Uber Eats OAuth credentials.",
    };
  }
  const { UberEatsMenuSyncService } = await import(
    "@/services/integrations/uber-eats/menu-sync.service"
  );
  const svc = new UberEatsMenuSyncService(creds);
  const result = await svc.pushMenu("system", storeId || creds.storeId || "");
  return {
    ok: result.ok,
    message: result.message ?? "Menu sync complete",
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
