import { expect, test } from "@playwright/test";

import {
  DELIVERY_INGEST_PROVIDERS,
  DELIVERY_ORDER_INGEST_E2E_MIN_SAMPLES,
  DELIVERY_ORDER_INGEST_LATENCY_E2E_POLICY_ID,
  DELIVERY_ORDER_INGEST_LATENCY_SLI_ID,
  DELIVERY_ORDER_INGEST_P50_MS,
  DELIVERY_ORDER_INGEST_P95_MS,
  DELIVERY_ORDER_INGEST_P99_MS,
  DOORDASH_ORDERS_WEBHOOK_PATH,
  GRUBHUB_ORDERS_WEBHOOK_PATH,
  UBER_EATS_ORDERS_WEBHOOK_PATH,
  allDeliveryIngestProvidersCovered,
  deliveryWebhookUrl,
  getDeliveryOrderIngestLatencySloTargets,
  isWithinDeliveryOrderIngestLatencySlo,
} from "@/lib/integrations/delivery-order-ingest-latency-e2e-policy";
import {
  deliveryIngestLatencyBatchWithinSlo,
  measureSyncDeliveryIngestLatency,
  recordDeliveryOrderIngestLatencySample,
  summarizeDeliveryOrderIngestLatencyMetrics,
} from "@/lib/integrations/delivery-order-ingest-latency-metrics";
import { normalizeDoorDashOrder } from "@/services/integrations/doordash/doordash-marketplace";
import { normalizeGrubhubOrder } from "@/services/integrations/grubhub/grubhub-marketplace";
import { normalizeUberEatsOrder } from "@/services/integrations/uber-eats";

import { runDeliveryIngestOrderHubProbe } from "./helpers/delivery-order-ingest-latency-flow";
import {
  sampleDoorDashDeliveryPayload,
  sampleGrubhubDeliveryPayload,
  sampleUberEatsDeliveryPayload,
  skipDeliveryOrderIngestLatencyIfNotAuthed,
} from "./helpers/delivery-order-ingest-latency-ready";

/**
 * Delivery order ingest latency E2E (QA-34).
 *
 * @see docs/audit1712may.md
 * @see app/api/webhooks/doordash/orders/route.ts
 */

test.describe("delivery order ingest latency policy", () => {
  test("exports webhook ingest ACK SLO targets for delivery providers", () => {
    expect(DELIVERY_ORDER_INGEST_LATENCY_E2E_POLICY_ID).toBe(
      "delivery-order-ingest-latency-e2e-v1",
    );
    expect(DELIVERY_ORDER_INGEST_LATENCY_SLI_ID).toBe("delivery.webhook_ingest_ack_ms");
    expect(DELIVERY_ORDER_INGEST_P50_MS).toBe(500);
    expect(DELIVERY_ORDER_INGEST_P95_MS).toBe(2_000);
    expect(DELIVERY_ORDER_INGEST_P99_MS).toBe(5_000);
    expect(getDeliveryOrderIngestLatencySloTargets()).toEqual({
      p50Ms: 500,
      p95Ms: 2_000,
      p99Ms: 5_000,
    });
    expect(allDeliveryIngestProvidersCovered(DELIVERY_INGEST_PROVIDERS)).toBe(true);
    expect(deliveryWebhookUrl(DOORDASH_ORDERS_WEBHOOK_PATH, "conn-1")).toContain("cid=conn-1");
    expect(GRUBHUB_ORDERS_WEBHOOK_PATH).toBe("/api/webhooks/grubhub/orders");
    expect(UBER_EATS_ORDERS_WEBHOOK_PATH).toBe("/api/webhooks/uber-eats/orders");
  });

  test("evaluates percentile SLO gates", () => {
    expect(isWithinDeliveryOrderIngestLatencySlo(450, "p50")).toBe(true);
    expect(isWithinDeliveryOrderIngestLatencySlo(550, "p50")).toBe(false);
    expect(isWithinDeliveryOrderIngestLatencySlo(1_900, "p95")).toBe(true);
    expect(isWithinDeliveryOrderIngestLatencySlo(4_900, "p99")).toBe(true);
  });
});

test.describe("delivery order normalize ingest latency", () => {
  test("DoorDash normalize batch stays within ingest ACK p50 SLO", () => {
    let samples: number[] = [];
    for (let index = 0; index < DELIVERY_ORDER_INGEST_E2E_MIN_SAMPLES; index += 1) {
      const payload = sampleDoorDashDeliveryPayload(String(index));
      const latencyMs = measureSyncDeliveryIngestLatency(() => normalizeDoorDashOrder(payload));
      samples = recordDeliveryOrderIngestLatencySample(samples, latencyMs);
      expect(normalizeDoorDashOrder(payload).fulfillment.type).toBe("DELIVERY");
    }

    const summary = summarizeDeliveryOrderIngestLatencyMetrics(samples);
    expect(summary.sampleCount).toBe(DELIVERY_ORDER_INGEST_E2E_MIN_SAMPLES);
    expect(summary.withinSlo?.p50).toBe(true);
    expect(deliveryIngestLatencyBatchWithinSlo(samples)).toBe(true);
  });

  test("Grubhub and Uber Eats normalize batches within ingest SLO", () => {
    const grubhubSamples = Array.from({ length: DELIVERY_ORDER_INGEST_E2E_MIN_SAMPLES }, (_, index) =>
      measureSyncDeliveryIngestLatency(() =>
        normalizeGrubhubOrder(sampleGrubhubDeliveryPayload(String(index))),
      ),
    );
    const uberSamples = Array.from({ length: DELIVERY_ORDER_INGEST_E2E_MIN_SAMPLES }, (_, index) =>
      measureSyncDeliveryIngestLatency(() =>
        normalizeUberEatsOrder(sampleUberEatsDeliveryPayload(String(index))),
      ),
    );

    expect(deliveryIngestLatencyBatchWithinSlo(grubhubSamples)).toBe(true);
    expect(deliveryIngestLatencyBatchWithinSlo(uberSamples)).toBe(true);
  });
});

test.describe("delivery order ingest order hub UI (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Delivery ingest order hub UI runs in chromium-authed project only",
    );
    skipDeliveryOrderIngestLatencyIfNotAuthed();
  });

  test("order hub reachable for delivery ingest latency probe", async ({ page }) => {
    await runDeliveryIngestOrderHubProbe(page);
  });
});
