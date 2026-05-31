import { describe, expect, it } from "vitest";

import {
  buildOutboundWebhookSignature,
  verifyOutboundWebhookSignature,
} from "@/lib/webhooks/outbound-webhook-signing";
import { serializeOutboundWebhookEnvelope } from "@/services/webhooks/outbound-webhook-payload-builders";
import { buildOrderCreatedPayload } from "@/services/webhooks/outbound-webhook-payload-builders";
import { validateOutboundWebhookEventTypes } from "@/lib/webhooks/outbound-webhook-events";

describe("outbound-webhook-signing", () => {
  it("signs and verifies payload", () => {
    const secret = "test-secret";
    const timestamp = 1_700_000_000;
    const body = JSON.stringify({ hello: "world" });
    const signature = buildOutboundWebhookSignature(secret, timestamp, body);

    expect(
      verifyOutboundWebhookSignature({
        secret,
        timestampSeconds: timestamp,
        rawBody: body,
        signatureHeader: signature,
        nowSeconds: timestamp,
      }).ok,
    ).toBe(true);
  });

  it("rejects tampered body", () => {
    const secret = "test-secret";
    const timestamp = 1_700_000_000;
    const body = JSON.stringify({ hello: "world" });
    const signature = buildOutboundWebhookSignature(secret, timestamp, body);

    expect(
      verifyOutboundWebhookSignature({
        secret,
        timestampSeconds: timestamp,
        rawBody: JSON.stringify({ hello: "tampered" }),
        signatureHeader: signature,
        nowSeconds: timestamp,
      }).ok,
    ).toBe(false);
  });
});

describe("outbound-webhook payloads", () => {
  it("builds order.created envelope without email", () => {
    const envelope = buildOrderCreatedPayload({
      deliveryId: "del-1",
      workspaceId: "ws-1",
      orderId: "ord-1",
      status: "CONFIRMED",
      total: 42.5,
      fulfillmentType: "PICKUP",
      lineCount: 3,
      creationSource: "STOREFRONT",
    });
    const raw = serializeOutboundWebhookEnvelope(envelope);
    expect(raw).toContain("order.created");
    expect(raw).toContain("ord-1");
    expect(raw).not.toContain("@");
  });
});

describe("outbound-webhook-events", () => {
  it("validates known event types", () => {
    expect(validateOutboundWebhookEventTypes(["order.created", "inventory.updated"])).toEqual([]);
    expect(validateOutboundWebhookEventTypes([])).toHaveLength(1);
    expect(validateOutboundWebhookEventTypes(["unknown.event"])).toHaveLength(1);
  });
});
