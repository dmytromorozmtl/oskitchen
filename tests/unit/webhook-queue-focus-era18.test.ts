import { describe, expect, it } from "vitest";

import {
  WEBHOOK_QUEUE_FOCUS_ERA18_BACKLOG_ID,
  WEBHOOK_QUEUE_FOCUS_ERA18_POLICY_ID,
  WEBHOOK_QUEUE_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/integrations/webhook-queue-focus-era18-policy";
import {
  buildWebhookQueueFocusSnapshot,
  pickWebhookQueueAttentionItems,
  resolveWebhookQueueRowNextAction,
} from "@/lib/integrations/webhook-queue-focus-era18";

describe("webhook-queue-focus-era18 policy", () => {
  it("registers era18 webhook queue focus proof", () => {
    expect(WEBHOOK_QUEUE_FOCUS_ERA18_POLICY_ID).toBe("era18-webhook-queue-focus-v1");
    expect(WEBHOOK_QUEUE_FOCUS_ERA18_PROOF_STATUS).toBe("webhook_queue_focus_attention_wired");
    expect(WEBHOOK_QUEUE_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-037");
  });
});

describe("pickWebhookQueueAttentionItems", () => {
  it("prioritizes invalid signatures before backlog", () => {
    const items = pickWebhookQueueAttentionItems(
      buildWebhookQueueFocusSnapshot({
        unprocessedCount: 12,
        invalidSignatureCount: 2,
        processingErrorCount: 1,
      }),
    );

    expect(items[0]?.id).toBe("invalid-signatures");
    expect(items.some((item) => item.id === "processing-errors")).toBe(true);
  });

  it("returns empty when webhook queue is clear", () => {
    expect(
      pickWebhookQueueAttentionItems(
        buildWebhookQueueFocusSnapshot({
          unprocessedCount: 0,
          invalidSignatureCount: 0,
          processingErrorCount: 0,
        }),
      ),
    ).toEqual([]);
  });
});

describe("resolveWebhookQueueRowNextAction", () => {
  it("routes invalid signatures to provider webhook setup", () => {
    expect(
      resolveWebhookQueueRowNextAction({
        id: "ev-1",
        provider: "SHOPIFY",
        signatureValid: false,
        processed: false,
        processingError: null,
      }),
    ).toEqual({
      label: "Fix webhook secret",
      href: "/dashboard/integrations/shopify#channel-pilot-webhooks",
      tone: "urgent",
    });
  });

  it("returns replay anchor for valid unprocessed events", () => {
    expect(
      resolveWebhookQueueRowNextAction({
        id: "ev-2",
        provider: "WOOCOMMERCE",
        signatureValid: true,
        processed: false,
        processingError: null,
      }),
    ).toEqual({
      label: "Replay webhook",
      href: "/dashboard/sales-channels/webhooks#webhook-event-ev-2",
      tone: "normal",
    });
  });

  it("returns null for processed events", () => {
    expect(
      resolveWebhookQueueRowNextAction({
        id: "ev-3",
        provider: "SHOPIFY",
        signatureValid: true,
        processed: true,
        processingError: null,
      }),
    ).toBeNull();
  });
});
