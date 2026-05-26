import { describe, expect, it } from "vitest";

import {
  decodeWebhookDeliveryCursor,
  encodeWebhookDeliveryCursor,
  parseWebhookDeliveryMetadata,
} from "@/lib/storefront/webhook-delivery-metadata";

describe("parseWebhookDeliveryMetadata", () => {
  it("parses valid metadata", () => {
    const meta = parseWebhookDeliveryMetadata({
      deliveryId: "abc123",
      pageId: "page-1",
      pageSlug: "about",
      urlHost: "hooks.zapier.com",
      pageTitle: "About",
      publishedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(meta?.deliveryId).toBe("abc123");
    expect(meta?.urlHost).toBe("hooks.zapier.com");
  });

  it("rejects missing host", () => {
    expect(
      parseWebhookDeliveryMetadata({
        deliveryId: "x",
        pageId: "p",
        pageSlug: "s",
      }),
    ).toBeNull();
  });
});

describe("webhook delivery cursor", () => {
  it("round-trips createdAt and id", () => {
    const createdAt = new Date("2026-05-10T12:00:00.000Z");
    const id = "evt-uuid";
    const cursor = encodeWebhookDeliveryCursor(createdAt, id);
    const decoded = decodeWebhookDeliveryCursor(cursor);
    expect(decoded?.id).toBe(id);
    expect(decoded?.createdAt.toISOString()).toBe(createdAt.toISOString());
  });
});
