import { DeliveryStatus as DS, type DeliveryStatus } from "@prisma/client";

import type {
  UberDirectQuoteInput,
  UberDirectWebhookPayload,
} from "@/lib/delivery/uber-direct-types";
import { prisma } from "@/lib/prisma";

export type UberDirectCredentials = {
  customerId?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
};

export type UberDirectCapabilitySnapshot = {
  hasClientCredentials: boolean;
  hasCustomerId: boolean;
  hasWebhookSecret: boolean;
  liveQuoteCreateReady: boolean;
  liveWebhookReady: boolean;
  placeholderMode: boolean;
};

const TOKEN_URL = process.env.UBER_DIRECT_TOKEN_URL ?? "https://login.uber.com/oauth/v2/token";
const API_BASE = process.env.UBER_DIRECT_API_BASE ?? "https://api.uber.com/v1";

function resolvedCredentials(creds: UberDirectCredentials, env: NodeJS.ProcessEnv = process.env) {
  return {
    customerId: creds.customerId?.trim() || env.UBER_DIRECT_CUSTOMER_ID?.trim() || "",
    clientId: creds.clientId?.trim() || env.UBER_DIRECT_CLIENT_ID?.trim() || "",
    clientSecret: creds.clientSecret?.trim() || env.UBER_DIRECT_CLIENT_SECRET?.trim() || "",
  };
}

export function isUberDirectLiveReady(
  creds: UberDirectCredentials = {},
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const { customerId, clientId, clientSecret } = resolvedCredentials(creds, env);
  return Boolean(customerId && clientId && clientSecret);
}

export function getUberDirectCapabilitySnapshot(
  env: NodeJS.ProcessEnv = process.env,
): UberDirectCapabilitySnapshot {
  const hasClientCredentials = Boolean(
    env.UBER_DIRECT_CLIENT_ID?.trim() && env.UBER_DIRECT_CLIENT_SECRET?.trim(),
  );
  const hasCustomerId = Boolean(env.UBER_DIRECT_CUSTOMER_ID?.trim());
  const hasWebhookSecret = Boolean(env.UBER_DIRECT_WEBHOOK_SECRET?.trim());
  const liveReady = hasClientCredentials && hasCustomerId;

  return {
    hasClientCredentials,
    hasCustomerId,
    hasWebhookSecret,
    liveQuoteCreateReady: liveReady,
    liveWebhookReady: liveReady && hasWebhookSecret,
    placeholderMode: !liveReady,
  };
}

export function getUberDirectBetaMessage(liveReady = !getUberDirectCapabilitySnapshot().placeholderMode): string {
  return liveReady
    ? "Uber Direct BETA is enabled. Sandbox/production API hosts require Uber Direct partner approval."
    : "Configure UBER_DIRECT_CUSTOMER_ID, UBER_DIRECT_CLIENT_ID, and UBER_DIRECT_CLIENT_SECRET for Uber Direct BETA dispatch.";
}

/** @deprecated use getUberDirectBetaMessage */
export function getUberDirectWebhookPlaceholderMessage(): string {
  return getUberDirectBetaMessage(false);
}

export async function fetchUberDirectAccessToken(
  creds: UberDirectCredentials,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const { clientId, clientSecret } = resolvedCredentials(creds);
  if (!clientId || !clientSecret) {
    return { ok: false, error: "Uber Direct client credentials missing" };
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "eats.deliveries",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `OAuth ${res.status}` };
  }

  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token?.trim()) {
    return { ok: false, error: "Missing access token" };
  }
  return { ok: true, token: json.access_token.trim() };
}

function buildAddressBlock(address?: UberDirectQuoteInput["pickup"]) {
  if (!address) return undefined;
  return {
    address: address.address ? { street_address: [address.address] } : undefined,
    location: address.latitude != null && address.longitude != null
      ? { latitude: address.latitude, longitude: address.longitude }
      : undefined,
    contact: address.contact,
  };
}

export function buildUberDirectQuoteBody(input: UberDirectQuoteInput) {
  return {
    pickup: buildAddressBlock(input.pickup),
    dropoff: buildAddressBlock(input.dropoff),
    external_store_id: input.orderId ?? undefined,
  };
}

export function normalizeDeliveryStatus(raw: Record<string, unknown>): DeliveryStatus {
  const value = String(raw.status ?? raw.state ?? raw.event_type ?? "").toLowerCase();
  if (value.includes("cancel")) return DS.CANCELLED;
  if (value.includes("fail")) return DS.FAILED;
  if (value.includes("complete") || value.includes("delivered")) return DS.COMPLETED;
  if (value.includes("dropoff") || value.includes("drop_off")) return DS.DROPOFF;
  if (value.includes("pickup") || value.includes("pick_up")) return DS.PICKUP;
  if (value.includes("schedule") || value.includes("accepted")) return DS.SCHEDULED;
  if (value.includes("quote")) return DS.QUOTED;
  return DS.SCHEDULED;
}

export function extractUberDirectDeliveryId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const row = payload as UberDirectWebhookPayload & Record<string, unknown>;
  const id = row.delivery_id ?? row.id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

export async function applyUberDirectWebhookStatus(
  payload: unknown,
): Promise<{ ok: boolean; updated: boolean; dispatchId?: string; message: string }> {
  const deliveryId = extractUberDirectDeliveryId(payload);
  if (!deliveryId) {
    return { ok: false, updated: false, message: "Missing delivery_id in webhook payload" };
  }

  const dispatch = await prisma.deliveryDispatch.findFirst({
    where: { externalDeliveryId: deliveryId, provider: "UBER_DIRECT" },
    select: { id: true, status: true },
  });

  if (!dispatch) {
    return {
      ok: true,
      updated: false,
      message: `No dispatch row for delivery_id ${deliveryId}`,
    };
  }

  const nextStatus = normalizeDeliveryStatus(payload as Record<string, unknown>);
  if (dispatch.status === nextStatus) {
    return { ok: true, updated: false, dispatchId: dispatch.id, message: "Status unchanged" };
  }

  await prisma.deliveryDispatch.update({
    where: { id: dispatch.id },
    data: {
      status: nextStatus,
      rawPayloadJson: payload as object,
    },
  });

  return {
    ok: true,
    updated: true,
    dispatchId: dispatch.id,
    message: `Updated dispatch to ${nextStatus}`,
  };
}

export async function createDeliveryQuote(
  creds: UberDirectCredentials,
  input: unknown,
) {
  if (!isUberDirectLiveReady(creds)) {
    return {
      ok: false as const,
      message: getUberDirectBetaMessage(false),
      quoteId: null as string | null,
      fee: null as number | null,
      currency: null as string | null,
    };
  }

  const quoteInput = (input && typeof input === "object" ? input : {}) as UberDirectQuoteInput;
  const { customerId } = resolvedCredentials(creds);
  const token = await fetchUberDirectAccessToken(creds);
  if (!token.ok) {
    return {
      ok: false as const,
      message: token.error,
      quoteId: null,
      fee: null,
      currency: null,
    };
  }

  const res = await fetch(
    `${API_BASE}/customers/${encodeURIComponent(customerId)}/delivery_quotes`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(buildUberDirectQuoteBody(quoteInput)),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false as const,
      message: text || `Uber Direct quote ${res.status}`,
      quoteId: null,
      fee: null,
      currency: null,
    };
  }

  const json = (await res.json()) as Record<string, unknown>;
  const quoteId =
    (typeof json.id === "string" && json.id) ||
    (typeof json.quote_id === "string" && json.quote_id) ||
    null;
  const feeValue = json.fee ?? json.total_fee;
  const fee = typeof feeValue === "number" ? feeValue : Number(feeValue ?? NaN);
  const currency = typeof json.currency === "string" ? json.currency : "USD";

  return {
    ok: Boolean(quoteId),
    message: quoteId ? "Quote created" : "Quote response missing id",
    quoteId,
    fee: Number.isFinite(fee) ? fee : null,
    currency,
  };
}

export async function createDelivery(creds: UberDirectCredentials, quoteId: string) {
  if (!isUberDirectLiveReady(creds)) {
    return {
      ok: false as const,
      message: getUberDirectBetaMessage(false),
      externalDeliveryId: null as string | null,
      trackingUrl: null as string | null,
    };
  }

  const { customerId } = resolvedCredentials(creds);
  const token = await fetchUberDirectAccessToken(creds);
  if (!token.ok) {
    return {
      ok: false as const,
      message: token.error,
      externalDeliveryId: null,
      trackingUrl: null,
    };
  }

  const res = await fetch(
    `${API_BASE}/customers/${encodeURIComponent(customerId)}/deliveries`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ quote_id: quoteId }),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false as const,
      message: text || `Uber Direct create ${res.status}`,
      externalDeliveryId: null,
      trackingUrl: null,
    };
  }

  const json = (await res.json()) as Record<string, unknown>;
  const externalDeliveryId =
    (typeof json.id === "string" && json.id) ||
    (typeof json.delivery_id === "string" && json.delivery_id) ||
    null;
  const trackingUrl =
    (typeof json.tracking_url === "string" && json.tracking_url) ||
    (typeof json.trackingUrl === "string" && json.trackingUrl) ||
    null;

  return {
    ok: Boolean(externalDeliveryId),
    message: externalDeliveryId ? "Delivery created" : "Delivery response missing id",
    externalDeliveryId,
    trackingUrl,
  };
}

export async function getDeliveryStatus(
  creds: UberDirectCredentials,
  externalDeliveryId: string,
) {
  if (!isUberDirectLiveReady(creds)) {
    return { status: DS.QUOTE as DeliveryStatus, raw: null as unknown };
  }

  const { customerId } = resolvedCredentials(creds);
  const token = await fetchUberDirectAccessToken(creds);
  if (!token.ok) {
    return { status: DS.FAILED as DeliveryStatus, raw: { error: token.error } };
  }

  const res = await fetch(
    `${API_BASE}/customers/${encodeURIComponent(customerId)}/deliveries/${encodeURIComponent(externalDeliveryId)}`,
    {
      headers: {
        Authorization: `Bearer ${token.token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return { status: DS.FAILED as DeliveryStatus, raw: { status: res.status } };
  }

  const json = (await res.json()) as Record<string, unknown>;
  return { status: normalizeDeliveryStatus(json), raw: json };
}

export async function cancelDelivery(
  creds: UberDirectCredentials,
  externalDeliveryId: string,
) {
  if (!isUberDirectLiveReady(creds)) {
    return { ok: false as const, message: getUberDirectBetaMessage(false) };
  }

  const { customerId } = resolvedCredentials(creds);
  const token = await fetchUberDirectAccessToken(creds);
  if (!token.ok) {
    return { ok: false as const, message: token.error };
  }

  const res = await fetch(
    `${API_BASE}/customers/${encodeURIComponent(customerId)}/deliveries/${encodeURIComponent(externalDeliveryId)}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.token}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false as const, message: text || `Uber Direct cancel ${res.status}` };
  }

  return { ok: true as const, message: "Delivery cancelled" };
}
