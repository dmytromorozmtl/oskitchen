import { describe, expect, it } from "vitest";

import {
  buildStablePayoutId,
  marketplacePaymentCaptureKey,
  marketplacePaymentIntentKey,
  posRefundIdempotencyKey,
  posCheckoutIdempotencyKey,
  posVoidIdempotencyKey,
  posTerminalPaymentIntentKey,
  stripeIdempotencyRequestOptions,
  vendorInstantPayoutDebitKey,
  vendorInstantPayoutTransferKey,
  vendorPayoutTransferKey,
  webhookProcessingKey,
} from "@/lib/idempotency/idempotency-keys";
import {
  IDEMPOTENCY_KEY_REGISTRY,
  IDEMPOTENCY_KEYS_POLICY_ID,
  auditAllIdempotencyKeys,
  auditIdempotencyEntry,
} from "@/lib/idempotency/idempotency-keys-policy";

describe("idempotency keys (P1-32)", () => {
  it("locks policy id", () => {
    expect(IDEMPOTENCY_KEYS_POLICY_ID).toBe("idempotency-keys-p1-32-v1");
  });

  it("builds stable webhook keys", () => {
    expect(
      webhookProcessingKey({
        provider: "SHOPIFY",
        connectionId: "conn-1",
        externalEventId: "evt-9",
      }),
    ).toBe("webhook:SHOPIFY:conn-1:evt-9");
  });

  it("builds stable payout ids from transaction scope", () => {
    const a = buildStablePayoutId("PAYOUT", "vendor-1", ["tx-b", "tx-a"]);
    const b = buildStablePayoutId("PAYOUT", "vendor-1", ["tx-a", "tx-b"]);
    expect(a).toBe(b);
    expect(a.startsWith("PAYOUT-")).toBe(true);
  });

  it("caps stripe idempotency keys at 255 chars", () => {
    const key = "x".repeat(300);
    expect(stripeIdempotencyRequestOptions(key).idempotencyKey.length).toBe(255);
  });

  it("covers payment capture and payout key builders", () => {
    expect(marketplacePaymentIntentKey("order-1")).toContain("order-1");
    expect(marketplacePaymentCaptureKey("pi_123")).toContain("pi_123");
    expect(posTerminalPaymentIntentKey("order-2")).toContain("order-2");
    expect(posRefundIdempotencyKey("tx-1", 12.5)).toContain("partial_1250");
    expect(posCheckoutIdempotencyKey("offline-sale-1")).toBe("pos_checkout:offline-sale-1");
    expect(posVoidIdempotencyKey("tx-void-1")).toBe("pos_void:tx-void-1");
    expect(vendorPayoutTransferKey("v1", "PAYOUT-ABC")).toContain("PAYOUT-ABC");
    expect(vendorInstantPayoutTransferKey("v1", "INSTANT-ABC")).toContain("INSTANT-ABC");
    expect(vendorInstantPayoutDebitKey("v1", "INSTANT-ABC")).toContain("INSTANT-ABC");
  });

  it.each(IDEMPOTENCY_KEY_REGISTRY.map((entry) => [entry.surface, entry.servicePath, entry] as const))(
    "%s wired in %s",
    (_surface, _path, entry) => {
      const report = auditIdempotencyEntry(entry);
      expect(report.servicePresent, entry.servicePath).toBe(true);
      expect(report.wired, entry.servicePath).toBe(true);
    },
  );

  it("passes full registry audit", () => {
    const summary = auditAllIdempotencyKeys();
    expect(summary.passed).toBe(true);
  });
});
