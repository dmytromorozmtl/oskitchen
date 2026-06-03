/**
 * Delivery marketplace order ingest latency E2E policy (QA-34).
 *
 * Webhook receive → normalize → persist external order (ACK path).
 *
 * @see e2e/delivery-order-ingest-latency.spec.ts
 * @see docs/audit1712may.md — webhook ingest ACK < 500ms
 */

export const DELIVERY_ORDER_INGEST_LATENCY_E2E_POLICY_ID =
  "delivery-order-ingest-latency-e2e-v1" as const;

export const DELIVERY_ORDER_INGEST_LATENCY_SLI_ID =
  "delivery.webhook_ingest_ack_ms" as const;

/** Webhook ingest ACK targets (audit1712may + kds-slo-proof alignment). */
export const DELIVERY_ORDER_INGEST_P50_MS = 500 as const;
export const DELIVERY_ORDER_INGEST_P95_MS = 2_000 as const;
export const DELIVERY_ORDER_INGEST_P99_MS = 5_000 as const;

export const DELIVERY_ORDER_INGEST_E2E_MIN_SAMPLES = 10 as const;
export const DELIVERY_ORDER_INGEST_MAX_SAMPLES = 200 as const;

export const DELIVERY_INGEST_PROVIDERS = ["DOORDASH", "GRUBHUB", "UBER_EATS"] as const;

export type DeliveryIngestProvider = (typeof DELIVERY_INGEST_PROVIDERS)[number];

export const DOORDASH_ORDERS_WEBHOOK_PATH = "/api/webhooks/doordash/orders" as const;
export const GRUBHUB_ORDERS_WEBHOOK_PATH = "/api/webhooks/grubhub/orders" as const;
export const UBER_EATS_ORDERS_WEBHOOK_PATH = "/api/webhooks/uber-eats/orders" as const;

export const ORDER_HUB_PATH = "/dashboard/order-hub" as const;
export const ORDER_HUB_INCOMING_CHANNELS_HEADING = "Incoming channel orders" as const;

export const DELIVERY_WEBHOOK_PATH_BY_PROVIDER: Record<DeliveryIngestProvider, string> = {
  DOORDASH: DOORDASH_ORDERS_WEBHOOK_PATH,
  GRUBHUB: GRUBHUB_ORDERS_WEBHOOK_PATH,
  UBER_EATS: UBER_EATS_ORDERS_WEBHOOK_PATH,
};

export type DeliveryOrderIngestLatencyTargets = {
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
};

export function getDeliveryOrderIngestLatencySloTargets(): DeliveryOrderIngestLatencyTargets {
  return {
    p50Ms: DELIVERY_ORDER_INGEST_P50_MS,
    p95Ms: DELIVERY_ORDER_INGEST_P95_MS,
    p99Ms: DELIVERY_ORDER_INGEST_P99_MS,
  };
}

export function deliveryWebhookUrl(path: string, connectionId: string): string {
  return `${path}?cid=${encodeURIComponent(connectionId)}`;
}

export function isWithinDeliveryOrderIngestLatencySlo(
  latencyMs: number,
  percentile: "p50" | "p95" | "p99",
): boolean {
  const targets = getDeliveryOrderIngestLatencySloTargets();
  switch (percentile) {
    case "p50":
      return latencyMs < targets.p50Ms;
    case "p95":
      return latencyMs < targets.p95Ms;
    case "p99":
      return latencyMs < targets.p99Ms;
  }
}

export function hasEnoughDeliveryIngestLatencySamples(sampleCount: number): boolean {
  return sampleCount >= DELIVERY_ORDER_INGEST_E2E_MIN_SAMPLES;
}

export function allDeliveryIngestProvidersCovered(providers: readonly string[]): boolean {
  return DELIVERY_INGEST_PROVIDERS.every((provider) => providers.includes(provider));
}
