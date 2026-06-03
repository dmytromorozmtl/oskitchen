import { beforeEach, describe, expect, it, vi } from "vitest";

const persistNormalizedExternalOrder = vi.hoisted(() => vi.fn());
const markWebhookProcessed = vi.hoisted(() => vi.fn());

vi.mock("@/lib/integrations/persist-external-order", () => ({
  persistNormalizedExternalOrder,
}));

vi.mock("@/lib/webhooks/webhook-event-store", () => ({
  createWebhookEvent: vi.fn(),
  markWebhookProcessed,
}));

import {
  DELIVERY_ORDER_INGEST_E2E_MIN_SAMPLES,
  DELIVERY_ORDER_INGEST_LATENCY_E2E_POLICY_ID,
  DELIVERY_ORDER_INGEST_P50_MS,
  isWithinDeliveryOrderIngestLatencySlo,
} from "@/lib/integrations/delivery-order-ingest-latency-e2e-policy";
import {
  deliveryIngestLatencyBatchWithinSlo,
  measureAsyncDeliveryIngestLatency,
  recordDeliveryOrderIngestLatencySample,
  summarizeDeliveryOrderIngestLatencyMetrics,
} from "@/lib/integrations/delivery-order-ingest-latency-metrics";
import { processDoorDashInboundOrder } from "@/services/integrations/doordash/inbound-order.service";
import { processGrubhubInboundOrder } from "@/services/integrations/grubhub/inbound-order.service";
import { processUberEatsInboundOrder } from "@/services/integrations/uber-eats/inbound-order.service";

describe("delivery order ingest latency E2E policy (QA-34)", () => {
  it("exports webhook ingest ACK p50 target", () => {
    expect(DELIVERY_ORDER_INGEST_LATENCY_E2E_POLICY_ID).toBe(
      "delivery-order-ingest-latency-e2e-v1",
    );
    expect(DELIVERY_ORDER_INGEST_P50_MS).toBe(500);
    expect(isWithinDeliveryOrderIngestLatencySlo(499, "p50")).toBe(true);
  });
});

describe("delivery inbound order ingest latency batch (QA-34)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistNormalizedExternalOrder.mockResolvedValue(undefined);
    markWebhookProcessed.mockResolvedValue(undefined);
  });

  it("processDoorDashInboundOrder batch stays within ingest ACK SLO", async () => {
    let samples: number[] = [];

    for (let index = 0; index < DELIVERY_ORDER_INGEST_E2E_MIN_SAMPLES; index += 1) {
      const latencyMs = await measureAsyncDeliveryIngestLatency(async () => {
        const result = await processDoorDashInboundOrder({
          userId: "owner-qa34",
          connectionId: "00000000-0000-4000-8000-000000000001",
          externalEventId: `dd-evt-${index}`,
          webhookEventId: `webhook-${index}`,
          payload: {
            order: {
              id: `dd-order-${index}`,
              total: 2500,
              customer: { name: "Guest" },
              delivery: { address: "1 Main" },
              items: [{ name: "Item", quantity: 1, price: 2500 }],
            },
          },
        });
        expect(result.ok).toBe(true);
      });
      samples = recordDeliveryOrderIngestLatencySample(samples, latencyMs);
    }

    const summary = summarizeDeliveryOrderIngestLatencyMetrics(samples);
    expect(summary.sampleCount).toBe(DELIVERY_ORDER_INGEST_E2E_MIN_SAMPLES);
    expect(deliveryIngestLatencyBatchWithinSlo(samples)).toBe(true);
    expect(persistNormalizedExternalOrder).toHaveBeenCalledTimes(DELIVERY_ORDER_INGEST_E2E_MIN_SAMPLES);
  });

  it("Grubhub and Uber Eats inbound processors stay within ingest ACK SLO", async () => {
    const processors = [
      () =>
        processGrubhubInboundOrder({
          userId: "owner-qa34",
          connectionId: "00000000-0000-4000-8000-000000000002",
          externalEventId: "gh-evt-1",
          webhookEventId: "webhook-gh-1",
          payload: {
            order_id: "gh-order-1",
            total: 1800,
            customer: { name: "Guest" },
            delivery_address: { formatted: "2 Oak" },
            line_items: [{ name: "Wrap", quantity: 1, price: 1800 }],
          },
        }),
      () =>
        processUberEatsInboundOrder({
          userId: "owner-qa34",
          connectionId: "00000000-0000-4000-8000-000000000003",
          externalEventId: "ue-evt-1",
          webhookEventId: "webhook-ue-1",
          payload: {
            meta: { resource_id: "ue-order-1" },
            order: {
              id: "ue-order-1",
              payment: { charges: { total: { amount: 2200 } } },
              eater: { first_name: "Uber", last_name: "Guest" },
              deliveries: [{ location: { address: "3 Pine" } }],
              cart: { items: [{ title: "Bowl", quantity: 1, price: 2200 }] },
            },
          },
        }),
    ];

    for (const runProcessor of processors) {
      const latencyMs = await measureAsyncDeliveryIngestLatency(runProcessor);
      expect(isWithinDeliveryOrderIngestLatencySlo(latencyMs, "p50")).toBe(true);
      expect(isWithinDeliveryOrderIngestLatencySlo(latencyMs, "p95")).toBe(true);
      expect(isWithinDeliveryOrderIngestLatencySlo(latencyMs, "p99")).toBe(true);
    }
  });
});
