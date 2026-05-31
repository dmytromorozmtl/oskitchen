import { DeliveryStatus as DS, type DeliveryStatus } from "@prisma/client";

export type UberDirectCredentials = {
  customerId?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
};

export type UberDirectCapabilitySnapshot = {
  hasClientCredentials: boolean;
  hasWebhookSecret: boolean;
  liveQuoteCreateReady: false;
  liveWebhookReady: false;
  placeholderMode: true;
};

export function getUberDirectCapabilitySnapshot(env: NodeJS.ProcessEnv = process.env): UberDirectCapabilitySnapshot {
  return {
    hasClientCredentials: Boolean(
      env.UBER_DIRECT_CLIENT_ID?.trim() && env.UBER_DIRECT_CLIENT_SECRET?.trim(),
    ),
    hasWebhookSecret: Boolean(env.UBER_DIRECT_WEBHOOK_SECRET?.trim()),
    liveQuoteCreateReady: false,
    liveWebhookReady: false,
    placeholderMode: true,
  };
}

export function getUberDirectWebhookPlaceholderMessage(): string {
  return "Uber Direct webhook is authenticated but not implemented yet. OS Kitchen is still in honest placeholder mode for live Uber Direct dispatch.";
}

export async function createDeliveryQuote(_creds: UberDirectCredentials, _input: unknown) {
  return {
    ok: false as const,
    message:
      "Uber Direct quotes require live API credentials and pickup/dropoff payloads. Wire your Uber Direct customer account first.",
    quoteId: null as string | null,
    fee: null as number | null,
    currency: null as string | null,
  };
}

export async function createDelivery(_creds: UberDirectCredentials, _quoteId: string) {
  return {
    ok: false as const,
    message: "Delivery creation placeholder — configure Uber Direct API host and auth.",
    externalDeliveryId: null as string | null,
    trackingUrl: null as string | null,
  };
}

export async function getDeliveryStatus(
  _creds: UberDirectCredentials,
  _externalDeliveryId: string,
) {
  return { status: DS.QUOTE as DeliveryStatus, raw: null as unknown };
}

export async function cancelDelivery(
  _creds: UberDirectCredentials,
  _externalDeliveryId: string,
) {
  return { ok: false as const, message: "Cancel placeholder." };
}

export function normalizeDeliveryStatus(_raw: Record<string, unknown>): DeliveryStatus {
  return DS.SCHEDULED;
}
