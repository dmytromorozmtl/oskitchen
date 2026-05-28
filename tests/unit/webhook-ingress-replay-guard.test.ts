import { describe, expect, it } from "vitest";

import {
  extractSlackInteractiveExternalEventId,
  extractUberDirectExternalEventId,
  hashWebhookIngressBody,
} from "@/lib/webhooks/webhook-ingress-replay-guard";

describe("webhook ingress replay guard", () => {
  it("extracts uber direct event_id when present", () => {
    const body = JSON.stringify({ event_id: "evt-123", status: "pending" });
    expect(extractUberDirectExternalEventId(JSON.parse(body), body)).toBe("evt-123");
  });

  it("falls back to body hash when uber direct event id is missing", () => {
    const body = JSON.stringify({ status: "pending" });
    const id = extractUberDirectExternalEventId(JSON.parse(body), body);
    expect(id).toBe(`body:${hashWebhookIngressBody(body)}`);
  });

  it("extracts slack trigger_id for replay dedupe", () => {
    expect(
      extractSlackInteractiveExternalEventId({
        trigger_id: "133452.123456.abc",
        actions: [{ action_id: "approve", value: "exp-1" }],
        user: { id: "U123" },
      }),
    ).toBe("133452.123456.abc");
  });

  it("builds slack fallback key from user and action when trigger_id missing", () => {
    expect(
      extractSlackInteractiveExternalEventId({
        actions: [{ action_id: "approve", value: "exp-1" }],
        user: { id: "U123" },
      }),
    ).toBe("U123:approve:exp-1");
  });
});
